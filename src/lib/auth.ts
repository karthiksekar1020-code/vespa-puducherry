import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type Profile = { id: string; full_name: string; phone: string | null; role: "customer" | "owner" };

/** Verified identity: getUser() validates the JWT with Supabase (never trust getSession on the server). */
export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", user.id).single();
  return (data as Profile | null) ?? null;
}

export async function requireUser(next = "/account"): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/");
  return user;
}

/** Owner role comes from the database profile row, never from client state or JWT metadata. */
export async function requireOwner(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/");
  if (profile.role !== "owner") redirect("/");
  return profile;
}

/** For server actions: throws instead of redirecting. */
export async function assertOwner(): Promise<void> {
  const profile = await getProfile();
  if (!profile || profile.role !== "owner") throw new Error("FORBIDDEN");
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
