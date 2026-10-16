import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  business: {
    name: "Vespa Puducherry",
    address: "#10-A, Vignesh Towers, ECR, Near Kokku Park, Puducherry",
    phone: "+91 90470 44191 | +91 90474 44927",
    email: "sales.vigneshmoteurx@piaggio2wstore.in",
    whatsapp: "",
  },
  hours: {
    days: {
      mon: ["09:00", "21:00"], tue: ["09:00", "21:00"], wed: ["09:00", "21:00"], thu: ["09:00", "21:00"],
      fri: ["09:00", "21:00"], sat: ["09:00", "21:00"], sun: ["10:00", "20:00"],
    },
    slot_minutes: 60,
  },
  social: { instagram: "", facebook: "", youtube: "" },
  commerce: { shipping_flat: 0, free_shipping_over: null, tax_percent: 0 },
};

/** Public settings (admin-editable). Falls back to defaults when the DB is unavailable. */
export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("key, value");
    const merged: SiteSettings = structuredClone(DEFAULT_SETTINGS);
    for (const row of data ?? []) {
      if (row.key in merged) {
        (merged as Record<string, unknown>)[row.key] = { ...(merged as Record<string, object>)[row.key], ...row.value };
      }
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
