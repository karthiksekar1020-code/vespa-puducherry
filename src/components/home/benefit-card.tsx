"use client";

import { CalendarCheck, HeartHandshake, MessageSquare, Package, Store } from "lucide-react";

const ICONS = { heart: HeartHandshake, calendar: CalendarCheck, package: Package, message: MessageSquare, store: Store } as const;
export type BenefitIcon = keyof typeof ICONS;

/** Benefit card: lifts on hover, gold line grows along the top, icon pops, and a glow follows the cursor. */
export function BenefitCard({ icon, title, text, index }: { icon: BenefitIcon; title: string; text: string; index: number }) {
  const Icon = ICONS[icon];
  return (
    <div
      className="benefit group relative h-full overflow-hidden rounded-2xl bg-ivory p-7 shadow-[0_8px_26px_-20px_rgba(5,36,28,0.5)] ring-1 ring-silver/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_50px_-26px_rgba(5,36,28,0.6)] hover:ring-gold/60"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--bx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--by", `${e.clientY - r.top}px`);
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-light transition-transform duration-500 group-hover:scale-x-100" />
      <span aria-hidden className="benefit-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span aria-hidden className="absolute right-5 top-4 font-display text-4xl leading-none text-gold/15 transition-colors duration-500 group-hover:text-gold/40">{String(index + 1).padStart(2, "0")}</span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-gold">
        <Icon className="text-gold transition-colors duration-500 group-hover:text-emerald-950" size={26} strokeWidth={1.4} />
      </span>
      <h3 className="relative mt-5 text-xl leading-snug">{title}</h3>
      <p className="relative mt-2 text-sm text-grey">{text}</p>
    </div>
  );
}
