import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { OrderAdminForm } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export default async function AdminOrders() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200);
  const rows = (data ?? []) as Order[];
  return (
    <>
      <AdminTitle title="Orders" />
      <p className="mb-6 max-w-2xl text-sm text-grey">Online payments are not integrated. An order only counts toward revenue once you mark it <strong>paid</strong> and record the reference of a payment you have verified yourself.</p>
      {rows.length === 0 ? <Empty>No orders yet.</Empty> : (
        <ul className="space-y-4">
          {rows.map((o) => (
            <li key={o.id} className="bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{o.reference} <span className="font-sans text-xs text-grey">· {formatDate(o.created_at)}</span></p>
                  <p className="text-sm">{o.contact_name} · <a href={`tel:${o.contact_phone}`} className="underline">{o.contact_phone}</a></p>
                  <p className="text-sm text-grey">{o.shipping_address.line1}, {o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.pincode}</p>
                  <ul className="mt-3 text-sm">{(o.order_items ?? []).map((i) => <li key={i.id}>{i.name} × {i.quantity} — {formatINR(Number(i.unit_price) * i.quantity)}</li>)}</ul>
                  <p className="mt-2 text-sm font-semibold">Total {formatINR(Number(o.total))} <span className="font-normal text-grey">(subtotal {formatINR(Number(o.subtotal))}, shipping {formatINR(Number(o.shipping))}, tax {formatINR(Number(o.tax))})</span></p>
                  {o.notes && <p className="mt-1 text-sm italic">Customer note: {o.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2"><StatusPill status={o.status} /><StatusPill status={o.payment_status} /></div>
              </div>
              <div className="mt-4 border-t border-silver/50 pt-2"><OrderAdminForm o={o} /></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
