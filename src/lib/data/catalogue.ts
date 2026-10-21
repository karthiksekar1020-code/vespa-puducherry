import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Accessory, Category, Scooter } from "@/lib/types";

export type Result<T> = { data: T; error: string | null; configured: boolean };

const NOT_CONFIGURED = "The database is not configured yet. Add your Supabase credentials to .env.local.";

export type ScooterFilters = {
  q?: string;
  category?: string; // category slug
  color?: string;
  availability?: string;
  min?: number;
  max?: number;
  sort?: "name" | "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
};

export const PAGE_SIZE = 9;

async function categoryId(supabase: Awaited<ReturnType<typeof createClient>>, slug?: string) {
  if (!slug) return null;
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? "00000000-0000-0000-0000-000000000000"; // unknown slug => no results
}

export async function listScooters(f: ScooterFilters = {}): Promise<Result<{ items: Scooter[]; total: number }>> {
  if (!isSupabaseConfigured()) return { data: { items: [], total: 0 }, error: NOT_CONFIGURED, configured: false };
  try {
    const supabase = await createClient();
    const size = f.pageSize ?? PAGE_SIZE;
    const page = Math.max(1, f.page ?? 1);
    let q = supabase.from("scooters").select("*", { count: "exact" }).eq("published", true);
    if (f.q) q = q.ilike("name", `%${f.q.replace(/[%_,()]/g, " ")}%`);
    const cat = await categoryId(supabase, f.category);
    if (cat) q = q.eq("category_id", cat);
    if (f.color) q = q.contains("colors", JSON.stringify([{ name: f.color }]));
    if (f.availability) q = q.eq("availability", f.availability);
    if (f.min != null) q = q.gte("price_inr", f.min);
    if (f.max != null) q = q.lte("price_inr", f.max);
    switch (f.sort) {
      case "price_asc": q = q.order("price_inr", { ascending: true, nullsFirst: false }); break;
      case "price_desc": q = q.order("price_inr", { ascending: false, nullsFirst: false }); break;
      case "newest": q = q.order("created_at", { ascending: false }); break;
      default: q = q.order("name", { ascending: true });
    }
    const { data, count, error } = await q.range((page - 1) * size, page * size - 1);
    if (error) throw error;
    return { data: { items: (data ?? []) as Scooter[], total: count ?? 0 }, error: null, configured: true };
  } catch (e) {
    const err = e as { message?: string; code?: string; details?: string; hint?: string } | null;
    const message = e instanceof Error ? e.message : err?.message;
    console.error(`listScooters failed: ${message ?? "unknown"} (code ${err?.code ?? "n/a"}) ${err?.details ?? ""} ${err?.hint ?? ""}`);
    return { data: { items: [], total: 0 }, error: message ?? "Failed to load scooters", configured: true };
  }
}

export async function getScooter(slug: string): Promise<Scooter | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("scooters").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Scooter | null) ?? null;
}

export async function featuredScooters(limit = 3): Promise<Result<Scooter[]>> {
  if (!isSupabaseConfigured()) return { data: [], error: NOT_CONFIGURED, configured: false };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scooters").select("*").eq("published", true)
      .order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return { data: (data ?? []) as Scooter[], error: null, configured: true };
  } catch (e) {
    return { data: [], error: e instanceof Error ? e.message : "Failed to load", configured: true };
  }
}

export async function relatedScooters(excludeId: string, limit = 3): Promise<Scooter[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("scooters").select("*").eq("published", true).neq("id", excludeId).limit(limit);
  return (data ?? []) as Scooter[];
}

export async function listCategories(kind: "scooter" | "accessory"): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("kind", kind).order("sort_order").order("name");
  return (data ?? []) as Category[];
}

export type AccessoryFilters = {
  q?: string; category?: string; min?: number; max?: number; inStock?: boolean;
  sort?: "name" | "price_asc" | "price_desc" | "newest"; page?: number; pageSize?: number; scooter?: string;
};

export async function listAccessories(f: AccessoryFilters = {}): Promise<Result<{ items: Accessory[]; total: number }>> {
  if (!isSupabaseConfigured()) return { data: { items: [], total: 0 }, error: NOT_CONFIGURED, configured: false };
  try {
    const supabase = await createClient();
    const size = f.pageSize ?? 12;
    const page = Math.max(1, f.page ?? 1);
    let q = supabase.from("accessories").select("*", { count: "exact" }).eq("published", true);
    if (f.q) q = q.ilike("name", `%${f.q.replace(/[%_,()]/g, " ")}%`);
    const cat = await categoryId(supabase, f.category);
    if (cat) q = q.eq("category_id", cat);
    if (f.inStock) q = q.gt("stock", 0);
    if (f.scooter) q = q.contains("compatibility", [f.scooter]);
    if (f.min != null) q = q.gte("price_inr", f.min);
    if (f.max != null) q = q.lte("price_inr", f.max);
    switch (f.sort) {
      case "price_asc": q = q.order("price_inr", { ascending: true }); break;
      case "price_desc": q = q.order("price_inr", { ascending: false }); break;
      case "newest": q = q.order("created_at", { ascending: false }); break;
      default: q = q.order("name", { ascending: true });
    }
    const { data, count, error } = await q.range((page - 1) * size, page * size - 1);
    if (error) throw error;
    return { data: { items: (data ?? []) as Accessory[], total: count ?? 0 }, error: null, configured: true };
  } catch (e) {
    return { data: { items: [], total: 0 }, error: e instanceof Error ? e.message : "Failed to load accessories", configured: true };
  }
}

export async function getAccessory(slug: string): Promise<Accessory | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("accessories").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return (data as Accessory | null) ?? null;
}

export async function relatedAccessories(a: Accessory, limit = 4): Promise<Accessory[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let q = supabase.from("accessories").select("*").eq("published", true).neq("id", a.id).limit(limit);
  if (a.category_id) q = q.eq("category_id", a.category_id);
  const { data } = await q;
  return (data ?? []) as Accessory[];
}

/** Distinct colour names across published scooters, for the colour filter. */
export async function scooterColorOptions(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("scooters").select("colors").eq("published", true);
  const names = new Set<string>();
  for (const row of data ?? []) for (const c of (row.colors ?? []) as { name: string }[]) names.add(c.name);
  return [...names].sort();
}
