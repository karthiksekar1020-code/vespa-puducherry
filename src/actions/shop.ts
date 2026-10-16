"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import { computeTotals, normaliseCart } from "@/lib/pricing";
import { cartItemsSchema, checkoutSchema } from "@/lib/validation/schemas";
import { NOT_CONFIGURED_STATE, formToObject, serviceReady, zodState } from "@/lib/action-utils";
import { isSupabaseConfigured } from "@/lib/env";
import type { ActionState } from "@/lib/types";

export type PricedCartLine = {
  id: string; slug: string; name: string; image: string | null; unit_price: number; quantity: number; stock: number; available: boolean;
};
export type PricedCart = {
  lines: PricedCartLine[];
  totals: { subtotal: number; shipping: number; tax: number; total: number };
  error?: string;
};

/** Authoritative cart pricing. The client only sends ids + quantities. */
export async function priceCartAction(raw: { id: string; quantity: number }[]): Promise<PricedCart> {
  const empty = { subtotal: 0, shipping: 0, tax: 0, total: 0 };
  const items = normaliseCart(Array.isArray(raw) ? raw.slice(0, 50) : []).filter((i) => /^[0-9a-f-]{36}$/i.test(i.id));
  if (items.length === 0) return { lines: [], totals: empty };
  if (!isSupabaseConfigured()) return { lines: [], totals: empty, error: "The store is not configured yet." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accessories").select("id, slug, name, images, price_inr, stock, published").in("id", items.map((i) => i.id));
  if (error) return { lines: [], totals: empty, error: "Could not load your cart." };
  const byId = new Map((data ?? []).map((a) => [a.id as string, a]));
  const lines: PricedCartLine[] = [];
  for (const item of items) {
    const a = byId.get(item.id);
    if (!a || !a.published) continue; // removed/unpublished products silently drop out of the cart
    const quantity = Math.min(item.quantity, Math.max(a.stock, 1));
    lines.push({
      id: a.id, slug: a.slug, name: a.name, image: (a.images as { url: string }[])[0]?.url ?? null,
      unit_price: Number(a.price_inr), quantity, stock: a.stock, available: a.stock > 0,
    });
  }
  const settings = await getSettings();
  const payable = lines.filter((l) => l.available);
  return { lines, totals: computeTotals(payable, settings.commerce) };
}

export async function placeOrderAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!serviceReady()) return NOT_CONFIGURED_STATE;
  const user = await getUser();
  if (!user) return { ok: false, message: "Please sign in to place an order." };

  let rawItems: unknown;
  try { rawItems = JSON.parse(String(fd.get("items") ?? "[]")); } catch { rawItems = []; }
  const items = cartItemsSchema.safeParse(rawItems);
  if (!items.success) return { ok: false, message: "Your cart is empty or invalid." };
  const form = checkoutSchema.safeParse(formToObject(fd));
  if (!form.success) return zodState(form.error);
  const f = form.data;

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("place_order", {
    p_user: user.id,
    p_items: normaliseCart(items.data),
    p_name: f.contact_name,
    p_phone: f.contact_phone,
    p_address: { line1: f.line1, city: f.city, state: f.state, pincode: f.pincode },
    p_notes: f.notes ?? null,
  });
  if (error) {
    const m = error.message;
    if (m.includes("OUT_OF_STOCK")) return { ok: false, message: `Not enough stock: ${m.split("OUT_OF_STOCK:")[1]?.trim() ?? "an item"}. Please update your cart.` };
    if (m.includes("UNAVAILABLE")) return { ok: false, message: "An item in your cart is no longer available. Please review your cart." };
    return { ok: false, message: "We could not place your order. Nothing was charged. Please try again." };
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.order_id) return { ok: false, message: "We could not place your order. Please try again." };
  redirect(`/orders/${row.order_id}?placed=1`);
}
