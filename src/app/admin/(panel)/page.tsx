import Link from "next/link";
import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import type { Booking, Order } from "@/lib/types";

const LOW_STOCK = 5;

export default async function Dashboard() {
  const supabase = await getOwnerClient();
  const countOf = async (table: string, status?: string) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count } = await q;
    return count ?? 0;
  };
  const [enquiries, pendingRides, confirmed, ordersCount, newEnquiries] = await Promise.all([
    countOf("enquiries"), countOf("bookings", "pending"), countOf("bookings", "confirmed"), countOf("orders"), countOf("enquiries", "new"),
  ]);
  const [{ data: paid }, { data: low }, { data: recentOrders }, { data: recentBookings }, { data: statuses }] = await Promise.all([
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("accessories").select("id, name, stock").lte("stock", LOW_STOCK).order("stock").limit(8),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("status"),
  ]);
  const revenue = (paid ?? []).reduce((s, o) => s + Number(o.total), 0);
  const byStatus = (statuses ?? []).reduce<Record<string, number>>((m, b) => ({ ...m, [b.status]: (m[b.status] ?? 0) + 1 }), {});

  const stats: [string, string | number, string?][] = [
    ["Total enquiries", enquiries, `${newEnquiries} new`], ["Pending test rides", pendingRides], ["Confirmed bookings", confirmed],
    ["Total orders", ordersCount], ["Verified revenue", formatINR(revenue), "Orders marked paid"], ["Low-stock accessories", (low ?? []).length, `≤ ${LOW_STOCK} units`],
  ];

  return (
    <>
      <AdminTitle title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, note]) => (
          <div key={label} className="bg-white p-6"><p className="label !mt-0">{label}</p><p className="mt-2 font-display text-4xl">{value}</p>{note && <p className="text-xs text-grey">{note}</p>}</div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section><h2 className="text-2xl">Recent orders</h2>
          {(recentOrders ?? []).length === 0 ? <Empty>No orders yet.</Empty> : (
            <ul className="mt-3 divide-y divide-silver/50 bg-white text-sm">
              {(recentOrders as Order[]).map((o) => <li key={o.id}><Link href="/admin/orders" className="flex justify-between gap-3 p-4 hover:bg-ivory-dark"><span>{o.reference} · {formatINR(Number(o.total))}</span><StatusPill status={o.status} /></Link></li>)}
            </ul>
          )}</section>
        <section><h2 className="text-2xl">Recent test ride requests</h2>
          {(recentBookings ?? []).length === 0 ? <Empty>No requests yet.</Empty> : (
            <ul className="mt-3 divide-y divide-silver/50 bg-white text-sm">
              {(recentBookings as Booking[]).map((b) => <li key={b.id}><Link href="/admin/bookings" className="flex justify-between gap-3 p-4 hover:bg-ivory-dark"><span>{b.name} · {formatDate(b.preferred_date)}</span><StatusPill status={b.status} /></Link></li>)}
            </ul>
          )}</section>
        <section><h2 className="text-2xl">Booking status overview</h2>
          {Object.keys(byStatus).length === 0 ? <Empty>No bookings yet.</Empty> : (
            <ul className="mt-3 grid grid-cols-2 gap-3 text-sm">{Object.entries(byStatus).map(([k, v]) => <li key={k} className="bg-white p-4"><StatusPill status={k} /><p className="mt-2 font-display text-2xl">{v}</p></li>)}</ul>
          )}</section>
        <section><h2 className="text-2xl">Low stock</h2>
          {(low ?? []).length === 0 ? <Empty>All accessories are above the low-stock threshold.</Empty> : (
            <ul className="mt-3 divide-y divide-silver/50 bg-white text-sm">{(low ?? []).map((a) => <li key={a.id} className="flex justify-between p-4"><Link href="/admin/inventory" className="hover:underline">{a.name}</Link><span className={a.stock === 0 ? "text-red-700" : ""}>{a.stock} left</span></li>)}</ul>
          )}</section>
      </div>
    </>
  );
}
