"use client";

import type React from "react";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { ScooterArt } from "@/components/ui/scooter-art";

const WORDS = ["ICONIC", "DESIGN.", "TIMELESS", "FREEDOM."];

export function Hero({ image, video }: { image?: string | null; video?: string | null }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const artY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 80]);
  const glowY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -60]);

  // Pointer effects: 3D tilt of the headline and a gold spotlight that follows the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [reduce ? 0 : 7, reduce ? 0 : -7]), { stiffness: 120, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [reduce ? 0 : -9, reduce ? 0 : 9]), { stiffness: 120, damping: 18 });
  const spot = useRef<HTMLDivElement>(null);
  function onMove(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    spot.current?.style.setProperty("--sx", `${e.clientX - r.left}px`);
    spot.current?.style.setProperty("--sy", `${e.clientY - r.top}px`);
    if (spot.current) spot.current.style.opacity = "1";
  }
  function onLeave() {
    mx.set(0); my.set(0);
    if (spot.current) spot.current.style.opacity = "0";
  }

  return (
    <section onMouseMove={reduce ? undefined : onMove} onMouseLeave={onLeave} className="relative flex min-h-[100svh] items-center overflow-hidden bg-emerald-950 text-ivory">
      <div
        ref={spot} aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500"
        style={{ background: "radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), rgba(212,179,110,0.22), transparent 65%)" }}
      />
      <motion.div style={{ y: glowY }} aria-hidden className="pointer-events-none absolute -right-40 top-1/4 h-[620px] w-[620px] rounded-full bg-emerald-700/40 blur-[140px]" />
      {video && !reduce && (
        <>
          {/* The video's own 16:9 box, sized and positioned exactly like object-cover, so the watermark softener below tracks it at any viewport. */}
          <div aria-hidden className="absolute inset-0 overflow-hidden [container-type:size] [--px:0.72] md:[--px:1]">
            <div
              className="absolute top-0"
              style={{ width: "max(100cqw, calc(100cqh * 16 / 9))", height: "max(100cqh, calc(100cqw * 9 / 16))", left: "calc((100cqw - max(100cqw, calc(100cqh * 16 / 9))) * var(--px))" }}
            >
              <video
                className="h-full w-full object-cover"
                src={video} poster={image ?? undefined} autoPlay muted loop playsInline preload="auto" tabIndex={-1}
              />
              {/* Soft, feathered blur over the fixed corner watermark only. */}
              <div
                className="pointer-events-none absolute left-[87%] top-[77%] h-[12.5%] w-[7.5%] backdrop-blur-[7px] [mask-image:radial-gradient(closest-side,#000_55%,transparent)]"
              />
            </div>
          </div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/55 to-emerald-950/10 md:from-emerald-950/95 md:via-emerald-950/60" />
        </>
      )}
      {image && !(video && !reduce) && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-[72%_center] md:object-right" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/60 to-emerald-950/10 md:from-emerald-950 md:via-emerald-950/80" />
        </>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(184,146,74,0.16),transparent_60%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-24 pt-32 lg:grid-cols-[1.05fr_1fr] lg:px-8">
        <div>
          <motion.h1
            style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 900, transformStyle: "preserve-3d" }}
            className="mt-5 text-[clamp(2.8rem,8vw,6.2rem)] leading-[0.95]" aria-label="Iconic design. Timeless freedom."
          >
            {(() => {
              let n = 0;
              return WORDS.map((w, wi) => (
                <span key={w} aria-hidden className="mr-[0.25em] inline-block whitespace-nowrap [perspective:600px]">
                  {[...w].map((ch, ci) => {
                    const idx = n++;
                    return (
                      <motion.span
                        key={ci}
                        className={`inline-block ${wi >= 2 ? "shine-gold" : ""}`}
                        style={wi >= 2 ? ({ "--d": `${idx * 0.12}s` } as React.CSSProperties) : undefined}
                        initial={reduce ? false : { opacity: 0, y: "0.7em", rotateX: -80, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                        whileHover={reduce ? undefined : { y: "-0.12em", scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 12 } }}
                        transition={{ duration: 0.85, delay: 0.35 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {ch}
                      </motion.span>
                    );
                  })}
                </span>
              ));
            })()}
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg"
          >
            Discover the world of Vespa with Vespa Puducherry. Explore iconic scooters, premium accessories, and a more personal way to ride.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="mt-10 flex flex-wrap gap-4">
            <Link href="/scooters" className="btn btn-gold group">Explore scooters <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/book-test-ride" className="btn btn-outline text-ivory">Book a test ride</Link>
          </motion.div>
        </div>

        {!image && !video && <motion.div style={{ y: artY }} initial={reduce ? false : { opacity: 0, x: 60, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <ScooterArt className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]" />
          </motion.div>
          <p className="mt-2 text-right text-[0.65rem] uppercase tracking-[0.2em] text-ivory/40">Illustration</p>
        </motion.div>}
      </div>
      <motion.a
        href="#showroom" aria-label="Scroll to showroom models"
        initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.8 }}
        className="group absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-gold"
      >
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-ivory/70 transition-colors group-hover:text-gold-light">Scroll</span>
        <span className="relative flex h-11 w-7 justify-center rounded-full border-2 border-gold/80 pt-2 transition-colors group-hover:border-gold-light">
          <span aria-hidden className="scroll-ring absolute -inset-1 rounded-full border border-gold/50" />
          <span aria-hidden className="scroll-dot block h-2 w-1 rounded-full bg-gold" />
        </span>
        <span aria-hidden className="-mt-1 flex flex-col items-center">
          <ChevronDown size={16} className="scroll-chev" style={{ animationDelay: "0s" }} />
          <ChevronDown size={16} className="scroll-chev -mt-2.5" style={{ animationDelay: "0.25s" }} />
        </span>
      </motion.a>
    </section>
  );
}
