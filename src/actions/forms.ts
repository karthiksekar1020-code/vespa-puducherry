"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import { validateSlot } from "@/lib/booking-logic";
import { bookingSchema, enquirySchema } from "@/lib/validation/schemas";
import {
  NOT_CONFIGURED_STATE, RATE_LIMITED_STATE, formToObject, serviceReady, withinRateLimit, zodState,
} from "@/lib/action-utils";
import type { ActionState } from "@/lib/types";

const BOT_STATE: ActionState = { ok: false, message: "Submission rejected." };

export async function bookTestRideAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!serviceReady()) return NOT_CONFIGURED_STATE;
  const parsed = bookingSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const d = parsed.data;
  if (d.website) return BOT_STATE;
  if (!(await withinRateLimit("booking", 5, 3600))) return RATE_LIMITED_STATE;

  const settings = await getSettings();
  const slot = validateSlot(d.date, d.time, settings.hours);
  if (!slot.ok) return { ok: false, message: slot.reason, fieldErrors: { time: slot.reason } };

  const admin = createAdminClient();
  const { data: clash } = await admin
    .from("bookings").select("id").eq("preferred_date", d.date).eq("preferred_time", d.time).eq("status", "confirmed").limit(1);
  if (clash && clash.length > 0) {
    return { ok: false, message: "That slot is already taken. Please choose another time.", fieldErrors: { time: "Slot unavailable" } };
  }

  let scooterLabel: string | null = null;
  let scooterId: string | null = null;
  if (d.scooter_id) {
    const { data: s } = await admin.from("scooters").select("id, name, variant").eq("id", d.scooter_id).eq("published", true).maybeSingle();
    if (s) { scooterId = s.id; scooterLabel = [s.name, s.variant].filter(Boolean).join(" "); }
  }
  const user = await getUser();
  const { data, error } = await admin.from("bookings").insert({
    user_id: user?.id ?? null, name: d.name, email: d.email, phone: d.phone,
    scooter_id: scooterId, scooter_label: scooterLabel,
    preferred_date: d.date, preferred_time: d.time, message: d.message || null,
  }).select("reference").single();
  if (error) {
    if (error.code === "23505") return { ok: false, message: "That slot was just taken. Please choose another time." };
    return { ok: false, message: "We could not save your request. Please try again." };
  }
  return {
    ok: true,
    reference: data.reference,
    message: "Your test ride request has been received and is awaiting confirmation from the showroom. It is not confirmed yet.",
  };
}

export async function submitEnquiryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!serviceReady()) return NOT_CONFIGURED_STATE;
  const parsed = enquirySchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const d = parsed.data;
  if (d.website) return BOT_STATE;
  if (!(await withinRateLimit("enquiry", 5, 3600))) return RATE_LIMITED_STATE;
  const user = await getUser();
  const admin = createAdminClient();
  const { data, error } = await admin.from("enquiries").insert({
    user_id: user?.id ?? null, name: d.name, email: d.email, phone: d.phone || null,
    category: d.category, related: d.related || null, message: d.message,
  }).select("reference").single();
  if (error) return { ok: false, message: "We could not save your enquiry. Please try again." };
  return { ok: true, reference: data.reference, message: "Thank you. Your enquiry has been received and the showroom will reply to the email you provided." };
}

export async function toggleWishlistAction(accessoryId: string): Promise<{ ok: boolean; wished?: boolean; message?: string }> {
  const user = await getUser();
  if (!user) return { ok: false, message: "Sign in to save items to your wishlist." };
  const supabase = await createClient();
  const { data: existing } = await supabase.from("wishlist").select("accessory_id").eq("user_id", user.id).eq("accessory_id", accessoryId).maybeSingle();
  if (existing) {
    const { error } = await supabase.from("wishlist").delete().eq("user_id", user.id).eq("accessory_id", accessoryId);
    return error ? { ok: false, message: error.message } : { ok: true, wished: false };
  }
  const { error } = await supabase.from("wishlist").insert({ user_id: user.id, accessory_id: accessoryId });
  return error ? { ok: false, message: error.message } : { ok: true, wished: true };
}
