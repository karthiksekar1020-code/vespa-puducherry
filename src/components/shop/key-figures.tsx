import Link from "next/link";
import { Fuel, Gauge } from "lucide-react";

export type Figure = { label: "Top speed" | "Mileage"; value?: string | null };

/** Top speed / mileage tiles. A missing value is shown as "Ask the showroom" (never guessed). */
export function KeyFigures({ figures, modelName, note }: { figures: Figure[]; modelName: string; note?: string }) {
  return (
    <>
    <ul className="grid grid-cols-2 gap-4">
      {figures.map((f, i) => {
        const Icon = f.label === "Top speed" ? Gauge : Fuel;
        const enquiry = `/contact?related=${encodeURIComponent(`${f.label} of ${modelName}`)}&category=Scooter+enquiry`;
        return (
          <li key={f.label} style={{ animationDelay: `${0.2 + i * 0.15}s` }} className="kf-tile rounded-2xl bg-emerald-950 p-5 text-ivory shadow-[0_14px_40px_-24px_rgba(5,36,28,0.7)] ring-1 ring-gold/30">
            <Icon className="kf-icon text-gold" size={22} strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold">{f.label}</p>
            {f.value ? (
              <p className="mt-1 font-display text-3xl">{f.value}</p>
            ) : (
              <>
                <p className="mt-1 font-display text-xl text-ivory/80">Ask the showroom</p>
                <Link href={enquiry} className="mt-2 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:text-gold-light">
                  Enquire →
                </Link>
              </>
            )}
          </li>
        );
      })}
    </ul>
    {note && figures.some((f) => f.value) && <p className="mt-2 text-xs text-grey">{note}</p>}
    </>
  );
}
