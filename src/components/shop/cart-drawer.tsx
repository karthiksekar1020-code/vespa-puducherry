"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";
import { usePricedCart } from "./use-priced-cart";

export function CartDrawer() {
  const { open, setOpen, setQty, remove } = useCart();
  const { priced, loading } = usePricedCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim" className="fixed inset-0 z-[60] bg-emerald-950/50" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.aside
            key="panel" role="dialog" aria-modal="true" aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-silver/60 px-6 py-5">
              <h2 className="text-2xl">Your cart</h2>
              <button onClick={() => setOpen(false)} aria-label="Close cart" className="p-1"><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && !priced ? (
                <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="skeleton h-20" />)}</div>
              ) : priced?.error ? (
                <p className="py-10 text-center text-sm text-grey" role="alert">{priced.error}</p>
              ) : !priced || priced.lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <ShoppingBag size={36} className="text-silver" />
                  <p className="text-grey">Your cart is empty.</p>
                  <Link href="/accessories" onClick={() => setOpen(false)} className="btn btn-emerald">Browse accessories</Link>
                </div>
              ) : (
                <ul className="divide-y divide-silver/50">
                  {priced.lines.map((l) => (
                    <li key={l.id} className="flex gap-4 py-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ivory-dark">
                        {l.image && <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />}
                      </div>
                      <div className="flex-1">
                        <Link href={`/accessories/${l.slug}`} onClick={() => setOpen(false)} className="text-sm font-semibold hover:text-emerald-800">{l.name}</Link>
                        <p className="text-sm text-grey">{formatINR(l.unit_price)}</p>
                        {!l.available && <p className="text-xs text-red-700">Out of stock, excluded from total</p>}
                        <div className="mt-2 flex items-center gap-3">
                          <button aria-label="Decrease quantity" onClick={() => setQty(l.id, l.quantity - 1)} className="border border-silver p-1"><Minus size={14} /></button>
                          <span className="w-6 text-center text-sm" aria-live="polite">{l.quantity}</span>
                          <button aria-label="Increase quantity" disabled={l.quantity >= l.stock} onClick={() => setQty(l.id, l.quantity + 1)} className="border border-silver p-1 disabled:opacity-40"><Plus size={14} /></button>
                          <button onClick={() => remove(l.id)} className="ml-auto text-xs uppercase tracking-widest text-grey hover:text-red-700">Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {priced && priced.lines.length > 0 && (
              <div className="border-t border-silver/60 px-6 py-5">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatINR(priced.totals.subtotal)}</span></div>
                <p className="mt-1 text-xs text-grey">Shipping and tax are calculated at checkout from the showroom&apos;s settings.</p>
                <Link href="/cart" onClick={() => setOpen(false)} className="btn btn-emerald mt-4 w-full">View cart &amp; checkout</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
