import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SHOWROOM_MODELS, type ShowroomColour, type ShowroomModel } from "@/data/showroom";

export type ShowroomModelRow = {
  id: string; slug: string; name: string; image_url: string; base_hue: number | null; blurb: string | null;
  colours: ShowroomColour[]; top_speed: string | null; mileage: string | null; sort_order: number; active: boolean;
};

function fromRow(r: ShowroomModelRow): ShowroomModel {
  return {
    name: r.name, slug: r.slug, image: r.image_url, baseHue: r.base_hue ?? undefined, blurb: r.blurb ?? undefined,
    colours: r.colours?.length ? r.colours : undefined, topSpeed: r.top_speed ?? undefined, mileage: r.mileage ?? undefined,
  };
}

/** Rows saved from the admin. Empty (never throws) when the database is not configured or the table is missing. */
export async function listShowroomRows(): Promise<ShowroomModelRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("showroom_models").select("*").order("sort_order").order("created_at");
    if (error) return [];
    return (data ?? []) as ShowroomModelRow[];
  } catch {
    return [];
  }
}

/**
 * The models shown on the website: the built-in ones, with any saved row of the same slug replacing it (or hiding it
 * when inactive), followed by newly added models. Without a database this is exactly the built-in list.
 */
export const getShowroomModels = cache(async (): Promise<ShowroomModel[]> => {
  const saved = await listShowroomRows();
  const rows = saved.filter((r) => r.active);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const hidden = new Set(saved.filter((r) => !r.active).map((r) => r.slug));
  const builtIn = SHOWROOM_MODELS.filter((m) => !hidden.has(m.slug)).map((m) => {
    const o = bySlug.get(m.slug);
    return o ? fromRow(o) : m;
  });
  const builtInSlugs = new Set(SHOWROOM_MODELS.map((m) => m.slug));
  const added = rows.filter((r) => !builtInSlugs.has(r.slug)).map(fromRow);
  const all = [...builtIn, ...added];
  return all.length ? all : SHOWROOM_MODELS;
});
