"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { MODEL_SPECS } from "@/data/model-specs";
import type { ShowroomModel } from "@/data/showroom";
import { DETAIL_ROWS, NOT_CONFIRMED } from "./model-spec-panel";

type Row = { label: string; value: (slug: string) => string | undefined; note?: (slug: string) => string | undefined };

const ROWS: Row[] = [
  { label: "Variant", value: (s) => MODEL_SPECS[s]?.variant },
  { label: "Status", value: (s) => MODEL_SPECS[s]?.status.label },
  { label: "Engine", value: (s) => MODEL_SPECS[s]?.key.displacement },
  { label: "Max power", value: (s) => MODEL_SPECS[s]?.key.power },
  { label: "Max torque", value: (s) => MODEL_SPECS[s]?.key.torque },
  { label: "Mileage", value: (s) => MODEL_SPECS[s]?.key.mileage?.value, note: (s) => MODEL_SPECS[s]?.key.mileage?.basis },
  ...DETAIL_ROWS.map(([k, label]): Row => ({ label, value: (s) => MODEL_SPECS[s]?.details[k] })),
  { label: "Features", value: (s) => MODEL_SPECS[s]?.features.join(" · ") || undefined },
];

/** Side-by-side comparison of the showroom models, using each model's own entry in MODEL_SPECS. */
export function CompareTable({ models: all }: { models: ShowroomModel[] }) {
  const [picked, setPicked] = useState<string[]>(all.map((m) => m.slug));
  const [diffOnly, setDiffOnly] = useState(false);
  const models = all.filter((m) => picked.includes(m.slug));

  function toggle(slug: string) {
    setPicked((cur) => (cur.includes(slug) ? (cur.length > 2 ? cur.filter((s) => s !== slug) : cur) : [...cur, slug]));
  }

  const differs = (r: Row) => new Set(models.map((m) => r.value(m.slug) ?? NOT_CONFIRMED)).size > 1;
  const rows = diffOnly ? ROWS.filter(differs) : ROWS;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Choose bikes to compare" className="flex flex-wrap gap-2">
          {all.map((m) => {
            const on = picked.includes(m.slug);
            return (
              <button
                key={m.slug} type="button" aria-pressed={on} onClick={() => toggle(m.slug)}
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${on ? "bg-emerald-950 text-ivory shadow-md" : "bg-white text-charcoal ring-1 ring-silver hover:ring-gold"}`}
              >
                <span className="relative h-8 w-10 overflow-hidden rounded-full bg-ivory"><Image src={m.image} alt="" fill sizes="40px" className="object-contain p-0.5" /></span>
                {m.name.replace(/^Vespa /, "")}
                {on && <Check size={13} className="text-gold-light" aria-hidden />}
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs uppercase tracking-[0.14em] text-grey">
          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" /> Show differences only
        </label>
      </div>
      <p className="mt-2 text-xs text-grey">Pick two to four bikes.</p>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(5,36,28,0.5)] ring-1 ring-silver/40">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Specification comparison of the selected Vespa models</caption>
          <thead>
            <tr>
              <td className="sticky left-0 z-10 w-36 bg-white" />
              {models.map((m) => (
                <th key={m.slug} scope="col" className="min-w-[10.5rem] px-4 pb-4 pt-5 align-bottom font-normal">
                  <div className="relative aspect-[4/3] w-full max-w-[11rem] overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_60%,#ffffff_0%,var(--ivory-dark)_80%)]">
                    <Image src={m.image} alt="" fill sizes="176px" className="object-contain p-2 mix-blend-multiply" />
                  </div>
                  <p className="mt-3 font-display text-xl leading-tight">{m.name}</p>
                  <div className="mt-2 flex gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em]">
                    <Link href={`/scooters/${m.slug}`} className="text-emerald-800 underline decoration-gold underline-offset-2 hover:text-gold">Details</Link>
                    <Link href={`/contact?related=${encodeURIComponent(m.name)}&category=Scooter+enquiry`} className="text-emerald-800 underline decoration-gold underline-offset-2 hover:text-gold">Enquire</Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const diff = differs(r);
              return (
                <tr key={r.label} className="border-t border-silver/50 transition-colors hover:bg-ivory/60">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 align-top text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-grey">{r.label}</th>
                  {models.map((m) => {
                    const v = r.value(m.slug);
                    const n = r.note?.(m.slug);
                    return (
                      <td key={m.slug} className={`px-4 py-3 align-top ${v ? "" : "italic text-grey/70"} ${diff ? "bg-gold/[0.07]" : ""}`}>
                        {v ?? NOT_CONFIRMED}
                        {n && <span className="mt-0.5 block text-[0.62rem] uppercase tracking-wider text-grey">{n}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={models.length + 1} className="px-4 py-6 text-center text-grey">These bikes have identical figures.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
