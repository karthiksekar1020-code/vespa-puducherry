"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, SITE_URL } from "@/lib/env";
import { safeNext } from "@/lib/auth";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "@/lib/validation/schemas";
import { NOT_CONFIGURED_STATE, formToObject, zodState } from "@/lib/action-utils";
import type { ActionState } from "@/lib/types";

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const parsed = loginSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, message: error.message.toLowerCase().includes("confirm") ? "Please verify your email before signing in." : "Incorrect email or password." };
  }
  redirect(safeNext(String(fd.get("next") ?? "")));
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const parsed = registerSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const { email, password, full_name, phone } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name, phone: phone ?? "" }, emailRedirectTo: `${SITE_URL}/auth/callback?next=/account` },
  });
  if (error) return { ok: false, message: error.message };
  // Supabase returns a user with no identities when the email is already registered (no enumeration leak).
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { ok: true, message: "If this email is new, a verification link has been sent. If you already have an account, please sign in or reset your password." };
  }
  if (data.session) redirect("/account");
  return { ok: true, message: "Account created. Check your email for a verification link, then sign in." };
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const parsed = forgotSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });
  // Same message whether or not the account exists.
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const parsed = resetSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { ok: false, message: "Your reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: error.message };
  redirect("/account?reset=1");
}

export async function adminLoginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const parsed = loginSchema.safeParse(formToObject(fd));
  if (!parsed.success) return zodState(parsed.error);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, message: "Incorrect email or password." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  if (profile?.role !== "owner") {
    await supabase.auth.signOut();
    return { ok: false, message: "This account is not authorised for administration." };
  }
  redirect("/admin");
}

export async function updateProfileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED_STATE;
  const name = String(fd.get("full_name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "Enter your full name.", fieldErrors: { full_name: "Enter your full name" } };
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return { ok: false, message: "Please sign in again." };
  const { error } = await supabase.from("profiles").update({ full_name: name, phone: phone || null }).eq("id", u.user.id);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Profile updated." };
}
