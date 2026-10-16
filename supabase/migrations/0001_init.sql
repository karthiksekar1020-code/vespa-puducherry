-- Vespa Puducherry: initial schema, RLS and transactional order placement.
-- Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('customer', 'owner')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Role is ALWAYS 'customer' here. Owners are provisioned only via scripts/create-owner.ts.
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), nullif(new.raw_user_meta_data->>'phone', ''));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- End users (JWT present) can never change a role. Service role / SQL editor have auth.uid() = null.
create or replace function public.guard_role_change() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'role cannot be changed by end users';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_role_change();

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

-- -------------------------------------------------------------- catalogue
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('scooter', 'accessory')),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.scooters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  variant text,
  tagline text,
  description text,
  price_inr numeric(12,2) check (price_inr is null or price_inr >= 0),
  price_verified boolean not null default false,
  availability text not null default 'on_request'
    check (availability in ('available', 'coming_soon', 'unavailable', 'on_request')),
  category_id uuid references public.categories(id) on delete set null,
  colors jsonb not null default '[]',   -- [{name, hex, image?}]
  images jsonb not null default '[]',   -- [{url, alt}]
  specs jsonb not null default '[]',    -- [{label, value}]
  features text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accessories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_inr numeric(12,2) not null check (price_inr >= 0),
  stock int not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  images jsonb not null default '[]',
  compatibility text[] not null default '{}',  -- scooter slugs
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------ bookings / enquiries
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('TR-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  scooter_id uuid references public.scooters(id) on delete set null,
  scooter_label text,
  preferred_date date not null,
  preferred_time time not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected', 'rescheduled', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Database-level guarantee: two CONFIRMED appointments can never share a slot.
create unique index bookings_confirmed_slot on public.bookings (preferred_date, preferred_time)
  where status = 'confirmed';

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('EQ-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  category text not null,
  related text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- Fixed-window rate limiter usable from serverless (service role only).
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);

create or replace function public.rate_limit_hit(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare r public.rate_limits;
begin
  insert into public.rate_limits as t (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when t.window_start < now() - make_interval(secs => p_window_seconds) then now() else t.window_start end,
    hits = case when t.window_start < now() - make_interval(secs => p_window_seconds) then 1 else t.hits + 1 end
  returning * into r;
  return r.hits <= p_max;
end $$;

-- ------------------------------------------------------------------ orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('VP-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  payment_provider text,
  payment_reference text,
  subtotal numeric(12,2) not null,
  shipping numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  contact_name text not null,
  contact_phone text not null,
  shipping_address jsonb not null,
  notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  accessory_id uuid references public.accessories(id) on delete set null,
  name text not null,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0)
);

create table public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  accessory_id uuid not null references public.accessories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, accessory_id)
);

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value) values
  ('business', '{"name":"Vespa Puducherry","address":"#10-A, Vignesh Towers, ECR, Near Kokku Park, Puducherry","phone":"+91 90470 44191 | +91 90474 44927","email":"sales.vigneshmoteurx@piaggio2wstore.in","whatsapp":""}'),
  ('hours', '{"days":{"mon":["09:00","21:00"],"tue":["09:00","21:00"],"wed":["09:00","21:00"],"thu":["09:00","21:00"],"fri":["09:00","21:00"],"sat":["09:00","21:00"],"sun":["10:00","20:00"]},"slot_minutes":60}'),
  ('social', '{"instagram":"","facebook":"","youtube":""}'),
  ('commerce', '{"shipping_flat":0,"free_shipping_over":null,"tax_percent":0}')
on conflict do nothing;

-- Transactional order placement. Prices/stock are read from the DB, never from the client.
create or replace function public.place_order(
  p_user uuid, p_items jsonb, p_name text, p_phone text, p_address jsonb, p_notes text
) returns table (order_id uuid, reference text, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  item jsonb; acc public.accessories; qty int;
  v_sub numeric := 0; v_ship numeric; v_tax numeric; v_total numeric;
  cfg jsonb; v_order public.orders;
begin
  if jsonb_array_length(p_items) = 0 then raise exception 'EMPTY_CART'; end if;
  select value into cfg from public.site_settings where key = 'commerce';

  -- Lock rows in a stable order to avoid deadlocks.
  for item in select value from jsonb_array_elements(p_items) order by value->>'id' loop
    qty := (item->>'quantity')::int;
    if qty is null or qty < 1 or qty > 20 then raise exception 'BAD_QUANTITY'; end if;
    select * into acc from public.accessories where id = (item->>'id')::uuid for update;
    if not found or not acc.published then raise exception 'UNAVAILABLE:%', item->>'id'; end if;
    if acc.stock < qty then raise exception 'OUT_OF_STOCK:%', acc.name; end if;
    v_sub := v_sub + acc.price_inr * qty;
  end loop;

  v_ship := case
    when (cfg->>'free_shipping_over') is not null and v_sub >= (cfg->>'free_shipping_over')::numeric then 0
    else coalesce((cfg->>'shipping_flat')::numeric, 0) end;
  v_tax := round(v_sub * coalesce((cfg->>'tax_percent')::numeric, 0) / 100, 2);
  v_total := v_sub + v_ship + v_tax;

  insert into public.orders (user_id, subtotal, shipping, tax, total, contact_name, contact_phone, shipping_address, notes)
  values (p_user, v_sub, v_ship, v_tax, v_total, p_name, p_phone, p_address, p_notes)
  returning * into v_order;

  for item in select value from jsonb_array_elements(p_items) loop
    qty := (item->>'quantity')::int;
    select * into acc from public.accessories where id = (item->>'id')::uuid;
    insert into public.order_items (order_id, accessory_id, name, unit_price, quantity)
    values (v_order.id, acc.id, acc.name, acc.price_inr, qty);
    update public.accessories set stock = stock - qty where id = acc.id;
  end loop;

  return query select v_order.id, v_order.reference, v_order.total;
end $$;

revoke all on function public.place_order from public, anon, authenticated;
revoke all on function public.rate_limit_hit from public, anon, authenticated;
grant execute on function public.place_order to service_role;
grant execute on function public.rate_limit_hit to service_role;

-- --------------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.scooters enable row level security;
alter table public.accessories enable row level security;
alter table public.bookings enable row level security;
alter table public.enquiries enable row level security;
alter table public.rate_limits enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.site_settings enable row level security;

create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_owner());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy categories_read on public.categories for select using (true);
create policy categories_write on public.categories for all using (public.is_owner()) with check (public.is_owner());

create policy scooters_read on public.scooters for select using (published or public.is_owner());
create policy scooters_write on public.scooters for all using (public.is_owner()) with check (public.is_owner());

create policy accessories_read on public.accessories for select using (published or public.is_owner());
create policy accessories_write on public.accessories for all using (public.is_owner()) with check (public.is_owner());

create policy bookings_read on public.bookings for select using (user_id = auth.uid() or public.is_owner());
create policy bookings_owner_update on public.bookings for update using (public.is_owner()) with check (public.is_owner());
create policy bookings_owner_delete on public.bookings for delete using (public.is_owner());

create policy enquiries_owner_read on public.enquiries for select using (public.is_owner());
create policy enquiries_owner_update on public.enquiries for update using (public.is_owner()) with check (public.is_owner());
create policy enquiries_owner_delete on public.enquiries for delete using (public.is_owner());

create policy orders_read on public.orders for select using (user_id = auth.uid() or public.is_owner());
create policy orders_owner_update on public.orders for update using (public.is_owner()) with check (public.is_owner());

create policy order_items_read on public.order_items for select using (
  public.is_owner() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy wishlist_own on public.wishlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy settings_read on public.site_settings for select using (true);
create policy settings_write on public.site_settings for all using (public.is_owner()) with check (public.is_owner());

-- ----------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
create policy products_public_read on storage.objects for select using (bucket_id = 'products');
create policy products_owner_write on storage.objects for insert with check (bucket_id = 'products' and public.is_owner());
create policy products_owner_update on storage.objects for update using (bucket_id = 'products' and public.is_owner());
create policy products_owner_delete on storage.objects for delete using (bucket_id = 'products' and public.is_owner());
