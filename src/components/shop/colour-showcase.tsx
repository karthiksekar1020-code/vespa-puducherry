"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ImageOff } from "lucide-react";

export type ShowcaseColour = {
  id: string;
  name: string;
  swatch: string;
  /** Resolved on the server: the image file exists, so it can be shown. */
  image: string | null;
  gallery: string[];
  verifiedOn: string;
};

/** Premium colour selector: stage photo, gallery thumbnails and colour cards. Only official photos are ever shown. */
export function ColourShowcase({ model, colours, initialId, sourceUrl }: { model: string; colours: ShowcaseColour[]; initialId?: string; sourceUrl: string }) {
  const reduce = useReducedMotion();
  const [id, setId] = useState(colours.find((c) => c.id === initialId)?.id ?? colours[0]?.id);
  const [view, setView] = useState(0);
  const current = colours.find((c) => c.id === id) ?? colours[0];
  if (!current) return null;
  const views = current.image ? [current.image, ...current.gallery] : [];
  const shown = views[Math.min(view, views.length - 1)];

  function pick(next: string) {
    setId(next);
    setView(0);
    // Keep the choice in the URL so it survives a refresh and can be shared, without a navigation.
    const url = new URL(window.location.href);
    url.searchParams.set("colour", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(5,36,28,0.5)] ring-1 ring-silver/40">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_58%,#ffffff_0%,var(--ivory-dark)_85%)]">
          <motion.span
            aria-hidden animate={{ backgroundColor: current.swatch }} transition={{ duration: 0.6 }}
            className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.13] blur-3xl"
          />
          <span aria-hidden className="absolute bottom-[9%] left-1/2 h-[8%] w-3/5 -translate-x-1/2 rounded-full bg-emerald-950/15 blur-2xl" />
          <AnimatePresence mode="wait">
            {shown ? (
              <motion.div
                key={shown} className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, x: 28, scale: 0.985 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, x: -28 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image src={shown} alt={`${model} in ${current.name}`} fill sizes="(min-width:1024px) 720px, 100vw" priority className="object-contain p-8 md:p-12" />
              </motion.div>
            ) : (
              <motion.div key={`na-${current.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                <span className="h-16 w-16 rounded-full ring-1 ring-black/10" style={{ background: current.swatch }} aria-hidden />
                <ImageOff size={18} className="text-grey" aria-hidden />
                <p className="font-display text-2xl">{current.name}</p>
                <p className="max-w-xs text-sm text-grey">The official photo for this colour is not on the site yet. Ask the showroom to show you the {model} in {current.name}.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="absolute left-5 top-4 font-display text-2xl text-emerald-950 md:text-3xl">{current.name}</p>
        </div>

        {views.length > 1 && (
          <div role="tablist" aria-label={`${current.name} photos`} className="flex flex-wrap justify-center gap-2 border-t border-silver/40 bg-ivory/60 px-4 py-3">
            {views.map((v, i) => (
              <button
                key={v} role="tab" aria-selected={view === i} aria-label={`View ${i + 1}`} onClick={() => setView(i)}
                className={`relative h-14 w-[4.5rem] overflow-hidden rounded-xl bg-white transition-all duration-300 ${view === i ? "ring-2 ring-gold" : "opacity-70 ring-1 ring-silver hover:opacity-100"}`}
              >
                <Image src={v} alt="" fill sizes="72px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center rounded-3xl bg-ivory-dark/60 p-7 ring-1 ring-silver/30 md:p-10">
        <p className="eyebrow">Official colours</p>
        <h2 className="mt-3 text-4xl leading-tight md:text-5xl">Choose your colour</h2>
        <span aria-hidden className="mt-4 block h-px w-14 bg-gold" />
        <p className="mt-5 text-sm text-grey" aria-live="polite">Selected: <strong className="text-charcoal">{current.name}</strong></p>

        <div role="radiogroup" aria-label={`${model} colours`} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {colours.map((c) => {
            const on = c.id === current.id;
            return (
              <button
                key={c.id} role="radio" aria-checked={on} onClick={() => pick(c.id)}
                className="group relative flex items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-silver/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(5,36,28,0.55)] hover:ring-gold/60"
              >
                {on && <motion.span layoutId="colour-active" aria-hidden className="absolute inset-0 rounded-2xl ring-2 ring-gold shadow-[0_12px_28px_-14px_rgba(5,36,28,0.6)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-110" style={{ background: c.swatch }}>
                  {on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}><Check size={16} className="text-white drop-shadow" aria-hidden /></motion.span>}
                </span>
                <span className="relative min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{c.name}</span>
                  {!c.image && <span className="mt-0.5 block text-[0.65rem] uppercase tracking-wider text-grey">Photo pending</span>}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-[0.7rem] leading-snug text-grey">
          Colour names and photos follow the official <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-gold underline-offset-2 hover:text-emerald-800">Vespa India page</a>, last checked {current.verifiedOn}. Chip shades are indicative; the photo is the true reference. Availability is confirmed by the showroom.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href={`/contact?related=${encodeURIComponent(`${model} (${current.name})`)}&category=Scooter+enquiry`} className="btn btn-emerald !rounded-full">Enquire</Link>
          <Link href="/book-test-ride" className="btn btn-outline-dark !rounded-full">Book a test ride</Link>
        </div>
      </div>
    </div>
  );
}
