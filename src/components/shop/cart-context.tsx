"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = { id: string; quantity: number };
type CartCtx = {
  items: CartItem[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  ready: boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "vp-cart-v1";

/**
 * The cart stores ONLY product ids and quantities (never prices). Prices, stock and totals are
 * always recalculated on the server (priceCartAction / place_order).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(raw)) {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
        setItems(raw.filter((i) => typeof i?.id === "string" && Number.isInteger(i?.quantity) && i.quantity > 0).slice(0, 50));
      }
    } catch { /* corrupt or unavailable storage: start empty */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ }
  }, [items, ready]);

  const add = useCallback((id: string, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === id);
      if (found) return cur.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i));
      return [...cur, { id, quantity: Math.min(20, qty) }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) => (qty < 1 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, quantity: Math.min(20, qty) } : i))));
  }, []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.reduce((s, i) => s + i.quantity, 0), open, setOpen, add, setQty, remove, clear, ready }),
    [items, open, add, setQty, remove, clear, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
