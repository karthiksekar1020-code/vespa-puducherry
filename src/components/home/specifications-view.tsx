"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MODEL_SPECS } from "@/data/model-specs";
import type { ShowroomModel } from "@/data/showroom";
import { ModelSpecPanel } from "./model-spec-panel";

/** Full specification sheet for one model at a time, with a model switcher. Opens on the model named in `initial`. */
export function SpecificationsView({ initial, models }: { initial?: string; models: ShowroomModel[] }) {
  const [slug, setSlug] = useState(models.find((m) => m.slug === initial)?.slug ?? models[0].slug);
  const model = models.find((m) => m.slug === slug) ?? models[0];
  const specs = MODEL_SPECS[model.slug];

  function pick(next: string) {
    setSlug(next);
    const url = new URL(window.location.href);
    url.searchParams.set("model", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div role="tablist" aria-label="Choose a model" className="flex flex-wrap gap-2">
        {models.map((m) => (
          <button
            key={m.slug} role="tab" aria-selected={m.slug === slug} onClick={() => pick(m.slug)}
            className={`rounded-full px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${m.slug === slug ? "bg-emerald-950 text-ivory shadow-md" : "bg-white text-charcoal ring-1 ring-silver hover:text-emerald-800 hover:ring-gold"}`}
          >
            {m.name.replace(/^Vespa /, "")}
          </button>
        ))}
      </div>

      <div key={model.slug} className="mt-8 grid animate-[photo-in_0.5s_ease-out] items-start gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(5,36,28,0.5)] ring-1 ring-silver/40">
          <div className="relative aspect-[4/3] bg-[radial-gradient(ellipse_at_50%_58%,#ffffff_0%,var(--ivory-dark)_85%)]">
            <Image src={model.image} alt={model.name} fill sizes="(min-width:1024px) 560px, 100vw" priority className="object-contain p-8 mix-blend-multiply" />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-silver/40 bg-ivory/60 px-5 py-4">
            <Link href={`/contact?related=${encodeURIComponent(model.name)}&category=Scooter+enquiry`} className="btn btn-emerald btn-sm !rounded-full">Enquire</Link>
            <Link href="/book-test-ride" className="btn btn-outline-dark btn-sm !rounded-full">Book a test ride</Link>
            <Link href="/compare" className="btn btn-outline-dark btn-sm !rounded-full">Compare bikes</Link>
          </div>
        </div>
        <div className="rounded-3xl bg-emerald-950 p-6 shadow-[0_18px_50px_-22px_rgba(5,36,28,0.75)] ring-1 ring-gold/30 md:p-8">
          {specs ? <ModelSpecPanel name={model.name} specs={specs} /> : <p className="text-ivory/70">Not officially confirmed.</p>}
        </div>
      </div>
    </div>
  );
}
