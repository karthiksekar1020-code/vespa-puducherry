"use client";

import { useEffect, useState } from "react";
import { priceCartAction, type PricedCart } from "@/actions/shop";
import { useCart } from "./cart-context";

/** Fetches server-verified prices for the current cart contents. */
export function usePricedCart() {
  const { items, ready } = useCart();
  const [priced, setPriced] = useState<PricedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(items);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start of an async fetch for server-verified prices
    setLoading(true);
    priceCartAction(items).then((p) => {
      if (!cancelled) { setPriced(p); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setPriced({ lines: [], totals: { subtotal: 0, shipping: 0, tax: 0, total: 0 }, error: "Could not load your cart." }); setLoading(false); }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return { priced, loading };
}
