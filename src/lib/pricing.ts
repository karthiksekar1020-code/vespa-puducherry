import type { CommerceSettings } from "@/lib/types";

export type PricedLine = { unit_price: number; quantity: number };

/** Mirrors the SQL in place_order(). The database function is authoritative; this is for display and tests. */
export function computeTotals(lines: PricedLine[], cfg: CommerceSettings) {
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.quantity, 0);
  const shipping =
    lines.length === 0 ? 0 : cfg.free_shipping_over != null && subtotal >= cfg.free_shipping_over ? 0 : cfg.shipping_flat;
  const tax = Math.round(subtotal * cfg.tax_percent) / 100;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

/** Merge duplicate product ids and clamp quantities. */
export function normaliseCart(items: { id: string; quantity: number }[]): { id: string; quantity: number }[] {
  const map = new Map<string, number>();
  for (const i of items) {
    const q = Math.floor(i.quantity);
    if (!Number.isFinite(q) || q < 1) continue;
    map.set(i.id, Math.min(20, (map.get(i.id) ?? 0) + q));
  }
  return [...map].map(([id, quantity]) => ({ id, quantity }));
}
