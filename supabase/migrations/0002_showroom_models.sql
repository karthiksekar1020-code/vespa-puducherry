-- Editable "At the showroom" models (photo, blurb, colour boxes).
-- The four built-in models live in code (src/data/showroom.ts). A row here with the same slug overrides a built-in
-- model (or hides it when active = false); a row with a new slug adds a model. Run in the Supabase SQL editor.

create table public.showroom_models (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text not null,
  base_hue int check (base_hue is null or (base_hue >= 0 and base_hue < 360)),
  blurb text,
  colours jsonb not null default '[]',   -- [{name, hex, hue?}] first = the photographed colour
  top_speed text,
  mileage text,
  sort_order int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.showroom_models enable row level security;

-- Public site reads only active rows; the owner sees and edits everything.
create policy showroom_models_read on public.showroom_models for select using (active or public.is_owner());
create policy showroom_models_write on public.showroom_models for all using (public.is_owner()) with check (public.is_owner());
