"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ScooterArt } from "@/components/ui/scooter-art";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Contact-page header: drifting gold light, word-by-word title reveal and a little scooter riding along a moving road line. */
export function ContactHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: string }) {
  const reduce = useReducedMotion();
  return (
    <header className="relative overflow-hidden bg-emerald-950 px-5 pb-20 pt-36 text-ivory lg:px-8">
      <motion.div
        aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold/25 blur-[90px]"
        animate={reduce ? undefined : { x: [0, 140, 0], y: [0, 40, 0], scale: [1, 1.25, 1] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden className="pointer-events-none absolute -right-20 -top-10 h-80 w-80 rounded-full bg-emerald-600/40 blur-[100px]"
        animate={reduce ? undefined : { x: [0, -120, 0], y: [0, 60, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.p className="eyebrow" initial={reduce ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EASE }}>{eyebrow}</motion.p>
        <h1 className="mt-3 text-5xl md:text-6xl" aria-label={title}>
          {title.split(" ").map((w, i) => (
            <span key={i} aria-hidden className="mr-[0.25em] inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                initial={reduce ? false : { y: "110%", rotate: 6 }} animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: EASE }}
              >{w}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p className="mt-4 max-w-2xl text-ivory/70" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }}>{children}</motion.p>
      </div>

      {/* Road with moving dashes and a scooter riding along it */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-8">
        <div className="road-line absolute inset-x-0 bottom-3 h-px" />
        {!reduce && (
          <div className="absolute bottom-[0.9rem] left-0 w-24 opacity-70 [animation:scooter-ride_16s_linear_infinite] md:w-32">
            <ScooterArt body="#d4b36e" className="w-full" />
          </div>
        )}
      </div>
    </header>
  );
}
