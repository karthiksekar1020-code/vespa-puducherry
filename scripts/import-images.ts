/**
 * Copies product images you saved from your browser into this project, so they are served from YOUR site
 * (no links back to the original site).
 *
 *   npm run import-images -- "C:\path\to\folder-with-saved-images"
 *
 * Works with a "Save page as > Webpage, complete" folder or the console helper in docs/IMAGES.md
 * (files named "<folder>__<file>"). Subfolders are searched. Files are routed to a model by name/path;
 * anything unrecognised goes to public/scooters/_unsorted for you to move by hand.
 * Afterwards run `npm run seed-catalogue` to attach images to the catalogue.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

// First matching rule wins. Slugs match scripts/seed-catalogue.ts (each model has a -125 and -150).
const RULES: { test: RegExp; slugs: string[] }[] = [
  { test: /s[-_]?tech/, slugs: ["vespa-s-tech-125", "vespa-s-tech-150"] },
  { test: /tech/, slugs: ["vespa-tech-125", "vespa-tech-150"] },
  { test: /zx/, slugs: ["vespa-zx-125"] },
  { test: /qala/, slugs: ["vespa-qala-125", "vespa-qala-150"] },
  { test: /vespa[-_]?s\b|vespa_sports|vespa[-_]s[-_]|sports|sxl/, slugs: ["vespa-s-125", "vespa-s-150"] },
  { test: /vespa[-_]?classic|vespa_model|classic|vespa\//, slugs: ["vespa-125", "vespa-150"] },
];
const SKIP = /logo|icon|rotate|favicon|sprite|footer|banner_unit|arrow|\.svg$/i;
const IMAGE = /\.(webp|png|jpe?g|avif)$/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const src = process.argv[2];
if (!src || !existsSync(src)) {
  console.error('✖ Usage: npm run import-images -- "<folder with the saved images>"');
  process.exit(1);
}

const root = path.join(process.cwd(), "public", "scooters");
const counts = new Map<string, number>();
let unsorted = 0;

for (const file of walk(src)) {
  if (!IMAGE.test(file) || SKIP.test(path.basename(file))) continue;
  const key = file.replace(/\\/g, "/").toLowerCase();
  const rule = RULES.find((r) => r.test.test(key));
  const slugs = rule ? rule.slugs : ["_unsorted"];
  // Strip the "<folder>__" prefix added by the console helper but keep it unique per file.
  const name = path.basename(file);
  for (const slug of slugs) {
    const dir = path.join(root, slug);
    mkdirSync(dir, { recursive: true });
    copyFileSync(file, path.join(dir, name));
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  if (!rule) unsorted++;
}

if (counts.size === 0) {
  console.error("✖ No product images found in that folder.");
  process.exit(1);
}
for (const [slug, n] of counts) console.log(`✔ ${slug}: ${n} image(s)`);
if (unsorted) console.log(`• ${unsorted} file(s) could not be matched to a model; see public/scooters/_unsorted.`);
console.log("Next: npm run seed-catalogue");
