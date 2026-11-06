"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hexToHue, slugify } from "@/lib/format";
import { accessorySchema, categorySchema, scooterSchema, showroomModelSchema } from "@/lib/validation/schemas";
import { formToObject, zodState } from "@/lib/action-utils";
import { validateSlot } from "@/lib/booking-logic";
import { getSettings } from "@/lib/data/settings";
import type { ActionState } from "@/lib/types";

/** Every admin action re-checks the owner role on the server, then queries as the owner (so RLS also applies). */
async function ownerClient() {
  await assertOwner();
  return createClient();
}

function dbError(error: { code?: string; message: string }): ActionState {
  if (error.code === "23505") return { ok: false, message: "That slug is already in use. Choose a different one." };
  return { ok: false, message: `Database error: ${error.message}` };
}

// ------------------------------------------------------------------ scooters
export async function saveScooterAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const obj = formToObject(fd);
  if (!obj.slug && obj.name) obj.slug = slugify(obj.name);
  const parsed = scooterSchema.safeParse(obj);
  if (!parsed.success) return zodState(parsed.error);
  const d = parsed.data;
  const row = {
    ...d, variant: d.variant || null, tagline: d.tagline || null, description: d.description || null,
    category_id: d.category_id || null, updated_at: new Date().toISOString(),
  };
  const { error } = id ? await supabase.from("scooters").update(row).eq("id", id) : await supabase.from("scooters").insert(row);
  if (error) return dbError(error);
  revalidatePath("/", "layout");
  redirect("/admin/scooters");
}

export async function deleteScooterAction(id: string) {
  const supabase = await ownerClient();
  await supabase.from("scooters").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function setScooterPublishedAction(id: string, published: boolean) {
  const supabase = await ownerClient();
  await supabase.from("scooters").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------- showroom models
export async function saveShowroomModelAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const obj = formToObject(fd);
  if (!obj.slug && obj.name) obj.slug = slugify(obj.name);
  const parsed = showroomModelSchema.safeParse(obj);
  if (!parsed.success) return zodState(parsed.error);
  const d = parsed.data;
  // The first colour is the photographed one (no hue shift); the others get their hue from the chosen swatch.
  const colours = d.colours.map((c: { name: string; hex: string }, i: number) => (i === 0 ? { name: c.name, hex: c.hex } : { name: c.name, hex: c.hex, hue: hexToHue(c.hex) }));
  const row = {
    slug: d.slug, name: d.name, image_url: d.image_url, blurb: d.blurb || null, colours,
    base_hue: colours.length ? hexToHue(colours[0].hex) : null, top_speed: d.top_speed || null, mileage: d.mileage || null,
    sort_order: d.sort_order, active: d.active, updated_at: new Date().toISOString(),
  };
  const { error } = id ? await supabase.from("showroom_models").update(row).eq("id", id) : await supabase.from("showroom_models").insert(row);
  if (error) return dbError(error);
  revalidatePath("/", "layout");
  redirect("/admin/showroom");
}

export async function deleteShowroomModelAction(id: string) {
  const supabase = await ownerClient();
  await supabase.from("showroom_models").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function setShowroomModelActiveAction(id: string, active: boolean) {
  const supabase = await ownerClient();
  await supabase.from("showroom_models").update({ active, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}

// --------------------------------------------------------------- accessories
export async function saveAccessoryAction(id: string | null, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const obj = formToObject(fd);
  if (!obj.slug && obj.name) obj.slug = slugify(obj.name);
  const parsed = accessorySchema.safeParse(obj);
  if (!parsed.success) return zodState(parsed.error);
  const d = parsed.data;
  const row = { ...d, description: d.description || null, category_id: d.category_id || null, updated_at: new Date().toISOString() };
  const { error } = id ? await supabase.from("accessories").update(row).eq("id", id) : await supabase.from("accessories").insert(row);
  if (error) return dbError(error);
  revalidatePath("/", "layout");
  redirect("/admin/accessories");
}

export async function deleteAccessoryAction(id: string) {
  const supabase = await ownerClient();
  await supabase.from("accessories").delete().eq("id", id);
  revalidatePath("/", "layout");
}

export async function setAccessoryPublishedAction(id: string, published: boolean) {
  const supabase = await ownerClient();
  await supabase.from("accessories").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}

export async function updateStockAction(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const stock = Number(fd.get("stock"));
  if (!Number.isInteger(stock) || stock < 0) return { ok: false, message: "Stock must be a whole number, 0 or more." };
  const { error } = await supabase.from("accessories").update({ stock, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/admin/inventory");
  return { ok: true, message: "Saved" };
}

// ---------------------------------------------------------------- categories
export async function createCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const parsed = categorySchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const { error } = await supabase.from("categories").insert({ ...parsed.data, slug: slugify(parsed.data.name) });
  if (error) return dbError(error);
  revalidatePath("/admin/categories");
  return { ok: true, message: "Category added" };
}

export async function deleteCategoryAction(id: string) {
  const supabase = await ownerClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

// ------------------------------------------------------------------ bookings
export async function updateBookingAction(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const status = String(fd.get("status"));
  const date = String(fd.get("date") ?? "");
  const time = String(fd.get("time") ?? "").slice(0, 5);
  const notes = String(fd.get("admin_notes") ?? "").slice(0, 2000);
  if (!["pending", "confirmed", "rejected", "rescheduled", "completed", "cancelled"].includes(status)) {
    return { ok: false, message: "Invalid status." };
  }
  if (status === "confirmed" || status === "rescheduled") {
    const settings = await getSettings();
    const slot = validateSlot(date, time, settings.hours);
    if (!slot.ok) return { ok: false, message: slot.reason };
  }
  const { error } = await supabase.from("bookings").update({
    status, preferred_date: date, preferred_time: time, admin_notes: notes || null, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Another confirmed booking already holds that slot." };
    return dbError(error);
  }
  revalidatePath("/admin/bookings");
  return { ok: true, message: "Booking updated" };
}

// ----------------------------------------------------------------- enquiries
export async function updateEnquiryAction(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const status = String(fd.get("status"));
  if (!["new", "in_progress", "resolved", "spam"].includes(status)) return { ok: false, message: "Invalid status." };
  const { error } = await supabase.from("enquiries").update({ status, admin_notes: String(fd.get("admin_notes") ?? "").slice(0, 2000) || null }).eq("id", id);
  if (error) return dbError(error);
  revalidatePath("/admin/enquiries");
  return { ok: true, message: "Enquiry updated" };
}

// -------------------------------------------------------------------- orders
export async function updateOrderAction(id: string, _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  const status = String(fd.get("status"));
  const payment_status = String(fd.get("payment_status"));
  if (!["requested", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(status)) return { ok: false, message: "Invalid status." };
  if (!["unpaid", "paid", "failed", "refunded"].includes(payment_status)) return { ok: false, message: "Invalid payment status." };
  const reference = String(fd.get("payment_reference") ?? "").trim().slice(0, 120);
  if (payment_status === "paid" && !reference) {
    return { ok: false, message: "Enter the payment reference you verified before marking an order as paid." };
  }

  const { data: before } = await supabase.from("orders").select("status, order_items(accessory_id, quantity)").eq("id", id).single();
  if (!before) return { ok: false, message: "Order not found." };
  const { error } = await supabase.from("orders").update({
    status, payment_status, payment_reference: reference || null,
    payment_provider: payment_status === "paid" ? "manual" : null,
    admin_notes: String(fd.get("admin_notes") ?? "").slice(0, 2000) || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return dbError(error);

  // Cancelling returns reserved stock exactly once.
  if (status === "cancelled" && before.status !== "cancelled") {
    const admin = createAdminClient();
    for (const it of (before.order_items ?? []) as { accessory_id: string | null; quantity: number }[]) {
      if (!it.accessory_id) continue;
      const { data: acc } = await admin.from("accessories").select("stock").eq("id", it.accessory_id).single();
      if (acc) await admin.from("accessories").update({ stock: acc.stock + it.quantity }).eq("id", it.accessory_id);
    }
  }
  revalidatePath("/admin/orders");
  return { ok: true, message: "Order updated" };
}

// ------------------------------------------------------------------ settings
export async function saveSettingsAction(key: "business" | "hours" | "social" | "commerce", _: ActionState, fd: FormData): Promise<ActionState> {
  const supabase = await ownerClient();
  let value: unknown;
  if (key === "business") {
    value = { name: String(fd.get("name") ?? "").trim() || "Vespa Puducherry", address: String(fd.get("address") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(), email: String(fd.get("email") ?? "").trim(), whatsapp: String(fd.get("whatsapp") ?? "").trim() };
  } else if (key === "social") {
    value = { instagram: String(fd.get("instagram") ?? "").trim(), facebook: String(fd.get("facebook") ?? "").trim(), youtube: String(fd.get("youtube") ?? "").trim(), x: String(fd.get("x") ?? "").trim(), linkedin: String(fd.get("linkedin") ?? "").trim() };
  } else if (key === "commerce") {
    const free = String(fd.get("free_shipping_over") ?? "").trim();
    const shipping = Number(fd.get("shipping_flat") ?? 0), tax = Number(fd.get("tax_percent") ?? 0);
    if (!(shipping >= 0) || !(tax >= 0 && tax <= 100)) return { ok: false, message: "Shipping must be 0 or more and tax between 0 and 100." };
    value = { shipping_flat: shipping, tax_percent: tax, free_shipping_over: free ? Number(free) : null };
  } else {
    const days: Record<string, [string, string] | null> = {};
    for (const d of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) {
      const open = String(fd.get(`${d}_open`) ?? ""), close = String(fd.get(`${d}_close`) ?? "");
      if (fd.get(`${d}_closed`) === "on" || !open || !close) days[d] = null;
      else if (open >= close) return { ok: false, message: `Opening time must be before closing time (${d}).` };
      else days[d] = [open, close];
    }
    const slot = Number(fd.get("slot_minutes"));
    if (![30, 45, 60, 90, 120].includes(slot)) return { ok: false, message: "Choose a valid slot length." };
    value = { days, slot_minutes: slot };
  }
  const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return dbError(error);
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved" };
}

// -------------------------------------------------------------------- images
const ALLOWED_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export async function uploadImageAction(fd: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await ownerClient();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image." };
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { ok: false, message: "Only JPEG, PNG, WebP or AVIF images are allowed." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, message: "Image must be under 5 MB." };
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("products").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, message: `Upload failed: ${error.message}` };
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
