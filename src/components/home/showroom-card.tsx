"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { MODEL_SPECS } from "@/data/model-specs";
import type { ShowroomModel } from "@/data/showroom";
import { ModelSpecPanel } from "./model-spec-panel";

// Target hues for the preview swatches. "Original" always shows the untouched photo.
const SWATCHES = [
  { name: "Red", hue: 355, hex: "#c0272d" },
  { name: "Orange", hue: 25, hex: "#e07a1f" },
  { name: "Yellow", hue: 48, hex: "#e3b61f" },
  { name: "Green", hue: 140, hex: "#2f7d4f" },
  { name: "Teal", hue: 180, hex: "#1f8a8a" },
  { name: "Blue", hue: 225, hex: "#2a4fa0" },
  { name: "Purple", hue: 280, hex: "#7a3d9a" },
  { name: "Pink", hue: 325, hex: "#d6579b" },
];

/** With `flip`, the card turns over (3D) to show that model's own specification sheet. The parent decides which card is open. */
export function ShowroomCard({ model: m, detail = false, index, flip }: { model: ShowroomModel; detail?: boolean; index?: number; flip?: { open: boolean; onToggle: () => void } }) {
  const [hue, setHue] = useState<number | null>(null);
  const specs = MODEL_SPECS[m.slug];
  const flippable = Boolean(flip && specs && !detail);
  const specBtn = useRef<HTMLButtonElement>(null);
  const backBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const open = flippable && flip!.open;

  // Move focus with the card: into the back when it opens, back to the trigger when it closes.
  useEffect(() => {
    if (open && !wasOpen.current) window.setTimeout(() => backBtn.current?.focus({ preventScroll: true }), 450);
    if (!open && wasOpen.current) specBtn.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  const rotate = hue !== null && m.baseHue !== undefined ? ((hue - m.baseHue) % 360 + 360) % 360 : 0;
  const active = SWATCHES.find((s) => s.hue === hue);

  const front = (
    <article
      onClick={flippable ? (e) => { if (!(e.target as HTMLElement).closest("a,button")) flip!.onToggle(); } : undefined}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-22px_rgba(5,36,28,0.5)] ring-1 ring-silver/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_34px_60px_-28px_rgba(5,36,28,0.65)] hover:ring-gold/60 ${flippable ? "cursor-pointer" : ""}`}
    >
      <Link
        href={`/scooters/${m.slug}`} aria-label={`View ${m.name}`}
        className="relative block aspect-[16/11] overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,#ffffff_0%,var(--ivory-dark)_75%)]"
      >
        {index !== undefined && (
          <span className="absolute left-4 top-3 z-10 font-display text-2xl leading-none text-gold/80">{String(index + 1).padStart(2, "0")}</span>
        )}
        <span aria-hidden className="absolute -bottom-10 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-emerald-900/10 blur-2xl transition-all duration-500 group-hover:w-[85%] group-hover:bg-emerald-900/20" />
        <Image
          src={m.image} alt={active ? `${m.name} with a simulated ${active.name} colour preview` : m.name} fill
          sizes="(min-width:1024px) 25vw, 50vw"
          className="object-contain p-4 mix-blend-multiply transition-[transform,filter] duration-500 group-hover:-translate-y-1 group-hover:scale-110"
          style={{ filter: hue === null ? undefined : `hue-rotate(${rotate}deg) saturate(1.15)` }}
        />
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-gold">At the showroom</p>
        {detail ? <p className="mt-1 font-display text-2xl leading-tight">{m.name}</p> : <h3 className="mt-1 text-2xl leading-tight"><Link href={`/scooters/${m.slug}`} className="hover:text-emerald-800">{m.name}</Link></h3>}
        <span aria-hidden className="mt-2.5 block h-px w-8 bg-gold transition-all duration-500 group-hover:w-24" />

        {m.baseHue !== undefined && (
          <div className="mt-3">
            <div role="radiogroup" aria-label={`Colour preview for ${m.name}`} className="flex flex-wrap items-center gap-1.5">
              <button
                role="radio" aria-checked={hue === null} aria-label="Original colour" title="Original" onClick={() => setHue(null)}
                className={`flex h-4 w-4 items-center justify-center rounded-full border text-[0.55rem] ${hue === null ? "border-gold bg-gold/20 text-emerald-950" : "border-silver text-grey"}`}
              >
                ↺
              </button>
              {SWATCHES.map((s) => (
                <button
                  key={s.name} role="radio" aria-checked={hue === s.hue} aria-label={s.name} title={s.name} onClick={() => setHue(s.hue)}
                  className={`h-4 w-4 rounded-full transition-transform duration-200 hover:scale-110 ${hue === s.hue ? "ring-2 ring-gold ring-offset-2 ring-offset-white" : "ring-1 ring-silver"}`}
                  style={{ background: s.hex }}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.62rem] leading-snug text-grey">
              {active ? `Simulated ${active.name} preview, not the actual paint. Ask us which colours are available.` : "Colour preview (simulated)"}
            </p>
          </div>
        )}

        {flippable && (
          <button
            ref={specBtn} type="button" onClick={flip!.onToggle} aria-expanded={flip!.open} aria-label={`View specifications for ${m.name}`}
            className="spec-hint mt-3 inline-flex items-center gap-1.5 self-start text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emerald-800 transition-colors hover:text-gold"
          >
            <RotateCw size={13} className="spec-hint-icon" aria-hidden /> View specifications
          </button>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link href={`/contact?related=${encodeURIComponent(active ? `${m.name} (${active.name} preview)` : m.name)}&category=Scooter+enquiry`} className="btn btn-emerald btn-sm !rounded-full !px-3 !py-2">Enquire</Link>
          <Link href="/book-test-ride" className="btn btn-outline-dark btn-sm !rounded-full !px-3 !py-2">Test ride</Link>
        </div>
      </div>
    </article>
  );

  if (!flippable || !specs) return front;
  return (
    <div className="flip-scene h-full">
      <div className="flip-inner h-full" data-open={open}>
        <div className="flip-face flip-front h-full" inert={open} aria-hidden={open}>{front}</div>
        <div
          className="flip-face flip-back" inert={!open} aria-hidden={!open}
          onKeyDown={(e) => { if (e.key === "Escape") flip!.onToggle(); }}
        >
          <div className="h-full overflow-y-auto overscroll-contain rounded-3xl bg-emerald-950 p-4 shadow-[0_34px_60px_-28px_rgba(5,36,28,0.65)] ring-1 ring-gold/40">
            <button
              ref={backBtn} type="button" onClick={flip!.onToggle}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/50 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold-light transition-colors hover:bg-gold hover:text-emerald-950"
            >
              <ArrowLeft size={12} aria-hidden /> Back to overview
            </button>
            <ModelSpecPanel name={m.name} specs={specs} />
          </div>
        </div>
      </div>
    </div>
  );
}
