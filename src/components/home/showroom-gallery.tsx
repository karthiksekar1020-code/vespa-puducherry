"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import type { ShowroomModel } from "@/data/showroom";

/** Product showcase: photo and model switcher on the left, title, blurb and colour boxes on the right. */
export function ShowroomGallery({ models }: { models: ShowroomModel[] }) {
  const [index, setIndex] = useState(0);
  const [colour, setColour] = useState(0);
  const model = models[index] ?? models[0];
  const colours = model.colours ?? [];
  const active = colours[colour] ?? colours[0];
  const rotate = active?.hue !== undefined && model.baseHue !== undefined ? (((active.hue - model.baseHue) % 360) + 360) % 360 : 0;
  const simulated = active?.hue !== undefined;

  function pickModel(i: number) { setIndex(i); setColour(0); }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
      {/* Left: large photo and model buttons */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(5,36,28,0.5)] ring-1 ring-silver/40">
        <div className="relative aspect-[4/3] w-full bg-[radial-gradient(ellipse_at_50%_58%,#ffffff_0%,var(--ivory-dark)_85%)]">
          <span aria-hidden className="absolute bottom-[9%] left-1/2 h-[9%] w-3/5 -translate-x-1/2 rounded-full bg-emerald-950/15 blur-2xl" />
          <Image
            key={model.slug} src={model.image} alt={simulated ? `${model.name} with a simulated ${active.name} colour preview` : model.name} fill
            sizes="(min-width:1024px) 700px, 100vw" priority
            className="animate-[photo-in_0.6s_ease-out] object-contain p-8 mix-blend-multiply md:p-12"
            style={{ filter: simulated ? `hue-rotate(${rotate}deg) saturate(1.15)` : undefined, transition: "filter 0.5s ease" }}
          />
        </div>
        <div role="tablist" aria-label="Choose a model" className="flex flex-wrap justify-center gap-2 border-t border-silver/40 bg-ivory/60 px-4 py-4">
          {models.map((m, i) => (
            <button
              key={m.slug} role="tab" aria-selected={index === i} onClick={() => pickModel(i)}
              className={`rounded-full px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 ${index === i ? "bg-emerald-950 text-ivory shadow-md" : "bg-white text-charcoal ring-1 ring-silver hover:ring-gold hover:text-emerald-800"}`}
            >
              {m.name.replace(/^Vespa /, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Right: title, description, colours */}
      <div className="flex flex-col justify-center rounded-3xl bg-ivory-dark/60 p-7 ring-1 ring-silver/30 md:p-10" aria-live="polite">
        <p className="eyebrow">At the showroom</p>
        <h3 key={model.slug} className="mt-3 animate-[photo-in_0.5s_ease-out] text-4xl leading-tight md:text-5xl">{model.name}</h3>
        <span aria-hidden className="mt-4 block h-px w-14 bg-gold" />
        <p className="mt-5 text-grey">{model.blurb ?? "Ask the team about availability, colours and the on-road price."}</p>

        {colours.length > 0 && (
          <div className="mt-8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-charcoal">Colour <span className="font-normal normal-case tracking-normal text-grey">· {active.name}</span></p>
            <div role="radiogroup" aria-label={`Colour options for ${model.name}`} className="mt-3 grid grid-cols-2 gap-3">
              {colours.map((c, i) => {
                const on = colour === i;
                return (
                  <button
                    key={c.name} role="radio" aria-checked={on} onClick={() => setColour(i)}
                    className={`group flex items-center gap-3 rounded-2xl bg-white p-3 text-left transition-all duration-300 ${on ? "shadow-[0_10px_26px_-14px_rgba(5,36,28,0.6)] ring-2 ring-gold" : "ring-1 ring-silver/60 hover:-translate-y-0.5 hover:ring-gold/70"}`}
                  >
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10" style={{ background: c.hex }}>
                      {on && <Check size={16} className="text-white drop-shadow" aria-hidden />}
                    </span>
                    <span className="min-w-0 text-sm font-semibold leading-tight">{c.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[0.7rem] leading-snug text-grey">
              {simulated ? `Simulated ${active.name} preview, not the actual paint. Ask us which colours are available.` : "Shown in the colour photographed at the showroom. Other colours are simulated previews."}
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href={`/contact?related=${encodeURIComponent(simulated ? `${model.name} (${active.name} preview)` : model.name)}&category=Scooter+enquiry`} className="btn btn-emerald !rounded-full">Enquire</Link>
          <Link href="/book-test-ride" className="btn btn-outline-dark !rounded-full">Book a test ride</Link>
        </div>
      </div>
    </div>
  );
}
