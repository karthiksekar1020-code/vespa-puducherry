import { Fuel, Gauge, RotateCw, Zap } from "lucide-react";
import type { MileageBasis, ModelSpecs } from "@/data/model-specs";

export const NOT_CONFIRMED = "Not officially confirmed";
const BASIS_LABEL: Record<MileageBasis, string> = { claimed: "Claimed", tested: "Tested", "owner-reported": "Owner-reported" };

export const DETAIL_ROWS: [keyof ModelSpecs["details"], string][] = [
  ["tank", "Fuel tank"], ["transmission", "Transmission"], ["brakes", "Brakes"], ["frontSuspension", "Front suspension"],
  ["rearSuspension", "Rear suspension"], ["tyres", "Tyres"], ["kerbWeight", "Kerb weight"], ["seatHeight", "Seat height"],
  ["groundClearance", "Ground clearance"], ["dimensions", "Length × width × height"], ["wheelbase", "Wheelbase"], ["colours", "Official colours"],
];

function Tile({ icon, label, value, tag }: { icon: React.ReactNode; label: string; value?: string; tag?: string }) {
  return (
    <div className="rounded-xl bg-ivory/[0.06] p-2.5 ring-1 ring-ivory/10">
      <p className="flex items-center gap-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold-light">{icon}{label}</p>
      <p className={`mt-1 text-[0.8rem] leading-snug ${value ? "text-ivory" : "italic text-ivory/45"}`}>{value ?? NOT_CONFIRMED}</p>
      {tag && <p className="mt-0.5 text-[0.58rem] uppercase tracking-wider text-ivory/50">{tag}</p>}
    </div>
  );
}

/** Reverse side of a model card. Presentational only: every figure comes from the model's own entry in MODEL_SPECS. */
export function ModelSpecPanel({ name, specs }: { name: string; specs: ModelSpecs }) {
  const { key, details } = specs;
  return (
    <div className="space-y-3 text-ivory">
      <div>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-gold">Specifications</p>
        <h3 className="mt-1 text-xl leading-tight">{name}</h3>
        <p className="text-xs text-ivory/70">{specs.variant}</p>
        <p className="mt-2 rounded-lg bg-gold/15 px-2.5 py-1.5 text-[0.65rem] leading-snug text-gold-light ring-1 ring-gold/25">
          <strong className="font-semibold uppercase tracking-wider">{specs.status.label}.</strong> {specs.officialCheck} Figures below are from {specs.source.name}, not Vespa India.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Tile icon={<Gauge size={12} aria-hidden />} label="Engine" value={key.displacement} />
        <Tile icon={<Zap size={12} aria-hidden />} label="Power" value={key.power} />
        <Tile icon={<RotateCw size={12} aria-hidden />} label="Torque" value={key.torque} />
        <Tile icon={<Fuel size={12} aria-hidden />} label="Mileage" value={key.mileage?.value} tag={key.mileage ? BASIS_LABEL[key.mileage.basis] : undefined} />
      </div>

      <dl className="divide-y divide-ivory/10 border-y border-ivory/10 text-[0.72rem]">
        {DETAIL_ROWS.map(([k, label]) => {
          const v = details[k];
          return (
            <div key={k} className="grid grid-cols-[6.2rem_1fr] gap-2 py-1.5">
              <dt className="text-ivory/55">{label}</dt>
              <dd className={v ? "text-ivory" : "italic text-ivory/45"}>{v ?? NOT_CONFIRMED}</dd>
            </div>
          );
        })}
      </dl>

      {specs.features.length > 0 && (
        <div>
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-gold-light">Features</p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[0.72rem] text-ivory/85 marker:text-gold">
            {specs.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-1 border-t border-ivory/10 pt-2 text-[0.6rem] leading-snug text-ivory/55">
        {specs.sourceNotes.map((n) => <p key={n}>{n}</p>)}
        <p>
          Source: <a href={specs.source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-gold underline-offset-2 hover:text-gold-light">{specs.source.name}</a>, checked {specs.source.verifiedOn}. Confirm everything with the showroom.
        </p>
      </div>
    </div>
  );
}
