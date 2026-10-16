"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";
import { usePricedCart } from "./use-priced-cart";

export function CartView() {
  const { setQty, remove } = useCart();
  const { priced, loading } = usePricedCart();

  if (loading && !priced) return <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}</div>;
  if (priced?.error) return <p role="alert" className="text-red-700">{priced.error}</p>;
  if (!priced || priced.lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ShoppingBag size={44} className="text-silver" strokeWidth={1} />
        <p className="font-display text-2xl">Your cart is empty</p>
        <Link href="/accessories" className="btn btn-emerald">Browse accessories</Link>
      </div>
    );
  }
  const t = priced.totals;
  const hasUnavailable = priced.lines.some((l) => !l.available);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ul className="divide-y divide-silver/50 bg-white">
        {priced.lines.map((l) => (
          <li key={l.id} className="flex gap-5 p-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-ivory-dark">{l.image && <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />}</div>
            <div className="flex-1">
              <Link href={`/accessories/${l.slug}`} className="font-semibold hover:text-emerald-800">{l.name}</Link>
              <p className="text-sm text-grey">{formatINR(l.unit_price)} each</p>
              {!l.available && <p className="text-sm text-red-700">Out of stock. Remove it to continue.</p>}
              <div className="mt-3 flex items-center gap-3">
                <button aria-label="Decrease quantity" onClick={() => setQty(l.id, l.quantity - 1)} className="border border-silver p-1.5"><Minus size={14} /></button>
                <span className="w-6 text-center text-sm" aria-live="polite">{l.quantity}</span>
                <button aria-label="Increase quantity" disabled={l.quantity >= l.stock} onClick={() => setQty(l.id, l.quantity + 1)} className="border border-silver p-1.5 disabled:opacity-40"><Plus size={14} /></button>
                <button onClick={() => remove(l.id)} className="ml-4 text-xs uppercase tracking-widest text-grey hover:text-red-700">Remove</button>
              </div>
            </div>
            <p className="font-display text-xl">{formatINR(l.unit_price * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <aside className="h-fit bg-white p-7">
        <h2 className="text-2xl">Summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(t.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{t.shipping === 0 ? "Free / not charged" : formatINR(t.shipping)}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{formatINR(t.tax)}</dd></div>
          <div className="flex justify-between border-t border-silver/60 pt-3 text-base font-semibold"><dt>Total</dt><dd>{formatINR(t.total)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-grey">Totals are recalculated by the server when you place your order.</p>
        {hasUnavailable ? (
          <button disabled className="btn btn-emerald mt-6 w-full">Remove unavailable items</button>
        ) : (
          <Link href="/checkout" className="btn btn-emerald mt-6 w-full">Proceed to checkout</Link>
        )}
      </aside>
    </div>
  );
}
