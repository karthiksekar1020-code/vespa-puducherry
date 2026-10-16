/**
 * Seeds the scooter catalogue from the specifications published on vespaindia.com/vespa
 * (read 2026-10-15). Safe to re-run: upserts by slug.
 *
 *   npm run seed-catalogue              # inserts as DRAFTS (unpublished)
 *   npm run seed-catalogue -- --publish # publishes them immediately
 *
 * Prices are NOT on the source page, so they stay empty ("Price on request") until the owner verifies them in Admin.
 * Colours are not named on the source page, so none are set.
 * Images: put files in public/scooters/<slug>/ (e.g. public/scooters/vespa-125/1.webp); they are attached automatically.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

config({ path: ".env.local" });

type Engine = "125" | "150";
type Console = "Semi-digital" | "Digital TFT 5\"";

const ENGINES: Record<Engine, { cc: string; power: string; torque: string; bore: string; brake: string }> = {
  "125": { cc: "124.45 cc", power: "7.0 kW @ 7100 rpm", torque: "10.1 Nm @ 5600 rpm", bore: "52 x 58.6 mm", brake: "CBS disc" },
  "150": { cc: "149.5 cc", power: "8.4 kW @ 7500 rpm", torque: "11.66 Nm @ 6100 rpm", bore: "58 x 56.6 mm", brake: "ABS disc" },
};

type Model = {
  name: string; slug: string; console: Console; tagline: string;
  features?: string[]; colors?: { name: string; hex: string; match: RegExp }[]; startingPrice?: number; engines?: Engine[]; note?: string;
};

const TECH_FEATURES = [
  "New engine with better acceleration, gradability and mileage",
  "Full-colour 5-inch TFT Smart Dash with trip data and remaining range",
  "Turn-by-turn navigation", "Answer and make calls from the handlebar", "Music control", "Voice commands",
  "Keyless ignition", "Round LED front and rear lights",
  "Aircraft-inspired hydraulic single side arm front suspension", "Dual-effect hydraulic rear shock absorbers",
  "Monocoque full steel body", "Electric starter",
];

const MODELS: Model[] = [
  { name: "Vespa", slug: "vespa", console: "Semi-digital", tagline: "The classic Vespa silhouette." },
  { name: "Vespa S", slug: "vespa-s", console: "Semi-digital", tagline: "The sportier Vespa." },
  { name: "Vespa Qala", slug: "vespa-qala", console: "Digital TFT 5\"", tagline: "Special edition." },
  {
    name: "Vespa Tech", slug: "vespa-tech", console: "Digital TFT 5\"", tagline: "Classic design with a digital console.",
    features: TECH_FEATURES, startingPrice: 192335,
    // Hex values are approximate swatches (the source gives none); colour photos are matched by filename.
    colors: [
      { name: "Matt Deep Blue", hex: "#1f3a5f", match: /blue/i },
      { name: "Grigio Grey", hex: "#8b8f93", match: /grigio|grey/i },
    ],
  },
  {
    name: "Vespa ZX", slug: "vespa-zx", console: "Semi-digital", tagline: "Vespa ZX.", engines: ["125"],
    note: " Specifications shown are the manufacturer's general Vespa 125 table; the ZX page does not list its own, so please verify with the showroom.",
    features: ["Monocoque chassis with 372 precision robotic welds", "Aircraft-inspired anti-dive suspension", "Combined Braking System (CBS)", "i-get engine with CVT transmission", "Ample under-seat storage", "Automatic boot lamp", "Bag hook", "USB charging provision", "Lockable glove box"],
    colors: [{ name: "Azzure Provenza", hex: "#2f6fb0", match: /azzure|provenza|blue/i }],
  },
  { name: "Vespa S Tech", slug: "vespa-s-tech", console: "Digital TFT 5\"", tagline: "Sporty design with a digital console." },
];

const SHARED = [
  ["Engine", "Single-cylinder, 4-stroke, air-cooled, SOHC, 3 valves"],
  ["Fuel system", "Electronic fuel injection (throttle body, single injector)"],
  ["Starter", "Electric"],
  ["Rear brake", "Ø 140 mm drum"],
  ["Front suspension", "Hydraulic single side arm with anti-dive"],
  ["Rear suspension", "Dual-effect hydraulic shock absorber, 4-position adjustable"],
  ["Frame", "Monocoque full steel body"],
  ["Front tyre", "110/70-11 45L tubeless"],
  ["Rear tyre", "120/70-10 54L tubeless"],
  ["Length / width / wheelbase", "1770 / 690 / 1290 mm"],
  ["Seat height", "770 mm"],
  ["Fuel tank", "7.4 litres"],
  ["Emissions", "BS VI OBD2 Stage B"],
] as const;

function imagesFor(slug: string, title: string) {
  const dir = path.join(process.cwd(), "public", "scooters", slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(webp|png|jpe?g|avif)$/i.test(f))
    .sort()
    .map((f) => ({ url: `/scooters/${slug}/${f}`, alt: title }));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("✖ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first."); process.exit(1); }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const publish = process.argv.includes("--publish");

  for (const [i, name] of ["Classic Elegance", "Modern Style", "Sporty Design", "Premium Collections", "Urban Riding"].entries()) {
    await admin.from("categories").upsert({ kind: "scooter", name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sort_order: i }, { onConflict: "slug" });
  }

  let n = 0;
  for (const m of MODELS) {
    for (const eng of (m.engines ?? ["125", "150"]) as Engine[]) {
      const e = ENGINES[eng];
      const slug = `${m.slug}-${eng}`;
      const title = `${m.name} ${eng}`;
      const specs = [
        { label: "Displacement", value: e.cc }, { label: "Max power", value: e.power }, { label: "Max torque", value: e.torque },
        { label: "Bore x stroke", value: e.bore }, { label: "Front brake", value: `200 mm hydraulic disc, ${e.brake.split(" ")[0]}` }, { label: "Console", value: m.console },
        ...SHARED.map(([label, value]) => ({ label, value })),
      ];
      const images = imagesFor(slug, title);
      const { error } = await admin.from("scooters").upsert({
        slug, name: m.name, variant: eng, tagline: m.tagline,
        description: `Specifications are taken from the manufacturer's published ${eng} cc data. Please confirm the on-road price and availability with the showroom.${m.note ?? ""}`,
        // Starting price comes from the source page's structured data, is not tied to a variant, and stays UNVERIFIED (hidden publicly).
        price_inr: eng === "125" ? (m.startingPrice ?? null) : null, price_verified: false, availability: "on_request",
        specs, features: m.features ?? [`${m.console} console`, `${e.brake} front braking`, "Monocoque steel body"],
        colors: (m.colors ?? []).map((c) => ({ name: c.name, hex: c.hex, image: images.find((i) => c.match.test(i.url))?.url })),
        images, published: publish, updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
      if (error) { console.error(`✖ ${slug}: ${error.message}`); process.exit(1); }
      n++;
    }
  }
  console.log(`✔ ${n} scooters ${publish ? "published" : "saved as drafts (publish them in Admin or re-run with --publish)"}.`);
}
main();
