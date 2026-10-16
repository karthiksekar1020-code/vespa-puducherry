import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { ColourShowcase, type ShowcaseColour } from "@/components/shop/colour-showcase";
import { VESPA_TECH } from "@/data/vespa-colours";

export const metadata: Metadata = {
  title: "Vespa Tech colours",
  description: "Explore the official Vespa Tech colours with photos, and ask Vespa Puducherry about availability.",
};

const onDisk = (p: string) => existsSync(path.join(process.cwd(), "public", p));

export default async function VespaTechPage({ searchParams }: { searchParams: Promise<{ colour?: string }> }) {
  const { colour } = await searchParams;
  const m = VESPA_TECH;
  // Only verified colours are shown, and an image is used only if the official photo file is actually present.
  const colours: ShowcaseColour[] = m.colours
    .filter((c) => c.status === "verified")
    .map((c) => ({
      id: c.id, name: c.name, swatch: c.swatch, verifiedOn: c.verifiedOn,
      image: onDisk(c.image) ? c.image : null,
      gallery: onDisk(c.image) ? (c.gallery ?? []).filter(onDisk) : [],
    }));

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-widest text-grey">
        <Link href="/scooters" className="hover:text-gold">Scooters</Link> / <span className="text-charcoal">{m.name}</span>
      </nav>
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">At the showroom</p>
        <h1 className="mt-2 text-5xl md:text-6xl">{m.name}</h1>
        <p className="mt-4 text-grey">Listed by Vespa India with {m.engines} engines. Price and availability for each colour are confirmed by the showroom.</p>
      </div>
      <ColourShowcase model={m.name} colours={colours} initialId={colour} sourceUrl={m.sourceUrl} />
    </div>
  );
}
