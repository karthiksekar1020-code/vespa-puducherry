import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];
  return (
    <>
      <PageHeader eyebrow="Account" title="My orders" />
      <div className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
        {orders.length === 0 ? (
          <div className="py-10 text-center"><p className="font-display text-2xl">No orders yet</p><Link href="/accessories" className="btn btn-emerald mt-6">Browse accessories</Link></div>
        ) : (
          <ul className="divide-y divide-silver/50 bg-white">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 p-6 hover:bg-ivory-dark">
                  <div><p className="font-semibold">{o.reference}</p><p className="text-sm text-grey">{formatDate(o.created_at)}</p></div>
                  <div className="flex items-center gap-4"><span className="font-display text-xl">{formatINR(Number(o.total))}</span><StatusPill status={o.status} /></div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
