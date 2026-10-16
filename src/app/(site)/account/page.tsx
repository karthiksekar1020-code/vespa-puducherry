import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { ActionForm, Field } from "@/components/forms/action-form";
import { logoutAction, updateProfileAction } from "@/actions/auth";
import { getProfile, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import type { Booking, Order } from "@/lib/types";

export const metadata: Metadata = { title: "My account" };

type Wished = { id: string; slug: string; name: string; price_inr: number };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const user = await requireUser("/account");
  const sp = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();
  const [{ data: bookings }, { data: orders }, { data: wishlist }] = await Promise.all([
    supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("wishlist").select("accessories(id, slug, name, price_inr)").eq("user_id", user.id),
  ]);
  const wished = (wishlist ?? []).flatMap((w) =>
    Array.isArray(w.accessories) ? w.accessories : w.accessories ? [w.accessories] : [],
  ) as Wished[];
  const bookingRows = (bookings ?? []) as Booking[];
  const orderRows = (orders ?? []) as Order[];

  return (
    <>
      <PageHeader eyebrow="My account" title={profile?.full_name ? `Hello, ${profile.full_name.split(" ")[0]}` : "My account"}>{user.email}</PageHeader>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <div className="space-y-6">
          {sp.reset && <Notice>Your password has been updated.</Notice>}
          {!user.email_confirmed_at && <Notice tone="warn">Your email address is not verified yet.</Notice>}
          <section className="bg-white p-7">
            <h2 className="text-2xl">Profile</h2>
            <ActionForm action={updateProfileAction} submitLabel="Save profile" submitClassName="btn btn-emerald btn-sm">
              <Field name="full_name" label="Full name" defaultValue={profile?.full_name ?? ""} required />
              <Field name="phone" label="Phone" type="tel" defaultValue={profile?.phone ?? ""} />
            </ActionForm>
          </section>
          <form action={logoutAction}><button className="btn btn-outline-dark">Sign out</button></form>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl">Test ride requests</h2>
            {bookingRows.length ? (
              <ul className="mt-4 divide-y divide-silver/50 bg-white">
                {bookingRows.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 p-5 text-sm">
                    <div><p className="font-semibold">{b.scooter_label ?? "Any scooter"}</p><p className="text-grey">{formatDate(b.preferred_date)} at {formatTime(b.preferred_time)} · Ref {b.reference}</p></div>
                    <StatusPill status={b.status} />
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-grey">No requests yet. <Link href="/book-test-ride" className="underline">Book a test ride</Link>.</p>}
          </section>
          <section>
            <div className="flex items-end justify-between"><h2 className="text-2xl">Recent orders</h2><Link href="/orders" className="text-xs uppercase tracking-widest underline">All orders</Link></div>
            {orderRows.length ? (
              <ul className="mt-4 divide-y divide-silver/50 bg-white">
                {orderRows.map((o) => (
                  <li key={o.id}>
                    <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 p-5 text-sm hover:bg-ivory-dark">
                      <div><p className="font-semibold">{o.reference}</p><p className="text-grey">{formatDate(o.created_at)} · {formatINR(Number(o.total))}</p></div>
                      <StatusPill status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-grey">No orders yet.</p>}
          </section>
          <section>
            <h2 className="text-2xl">Wishlist</h2>
            {wished.length ? (
              <ul className="mt-4 divide-y divide-silver/50 bg-white">
                {wished.map((w) => <li key={w.id}><Link href={`/accessories/${w.slug}`} className="flex justify-between p-5 text-sm hover:bg-ivory-dark"><span>{w.name}</span><span>{formatINR(Number(w.price_inr))}</span></Link></li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-grey">Nothing saved yet.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
