"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "./cart-context";

export function AddToCart({ id, stock, compact = false }: { id: string; stock: number; compact?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const soldOut = stock <= 0;
  const max = Math.min(20, stock);

  function onAdd() {
    add(id, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "flex-wrap"}`}>
      {!compact && !soldOut && (
        <div className="flex items-center border border-silver">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3"><Minus size={14} /></button>
          <span className="w-8 text-center text-sm" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(max, q + 1))} className="p-3"><Plus size={14} /></button>
        </div>
      )}
      <button type="button" onClick={onAdd} disabled={soldOut} className={`btn btn-emerald ${compact ? "btn-sm" : ""}`}>
        {done ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> {soldOut ? "Out of stock" : "Add to cart"}</>}
      </button>
    </div>
  );
}
