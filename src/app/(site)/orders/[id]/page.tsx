import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { ClearCart } from "@/components/shop/clear-cart";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/orders/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  // RLS already limits rows to the owner; the explicit filter is defence in depth.
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const a = o.shipping_address;

  return (
    <>
      {sp.placed && <ClearCart />}
      <PageHeader eyebrow="Order" title={o.reference} />
      <div className="mx-auto max-w-4xl space-y-8 px-5 py-14 lg:px-8">
        {sp.placed && <Notice>Your order request has been received. The showroom will contact you to arrange payment and delivery. It is <strong>not paid or confirmed yet</strong>.</Notice>}
        <div className="flex flex-wrap gap-4 text-sm">
          <div>Placed {formatDate(o.created_at)}</div>
          <div className="flex items-center gap-2">Status <StatusPill status={o.status} /></div>
          <div className="flex items-center gap-2">Payment <StatusPill status={o.payment_status} /></div>
        </div>
        <ul className="divide-y divide-silver/50 bg-white">
          {(o.order_items ?? []).map((i) => <li key={i.id} className="flex justify-between gap-4 p-5 text-sm"><span>{i.name} × {i.quantity}</span><span>{formatINR(Number(i.unit_price) * i.quantity)}</span></li>)}
        </ul>
        <dl className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(Number(o.subtotal))}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{formatINR(Number(o.shipping))}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{formatINR(Number(o.tax))}</dd></div>
          <div className="flex justify-between border-t border-silver/60 pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatINR(Number(o.total))}</dd></div>
        </dl>
        <section className="bg-white p-6 text-sm">
          <h2 className="text-xl">Delivery details</h2>
          <p className="mt-2">{o.contact_name} · {o.contact_phone}</p>
          <p className="text-grey">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
        </section>
        <Link href="/orders" className="text-xs uppercase tracking-widest underline">All orders</Link>
      </div>
    </>
  );
}
