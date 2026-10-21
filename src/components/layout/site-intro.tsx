"use client";

import Image from "next/image";
import { preload } from "react-dom";
import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SCOOTER_SRC = "/brand/vespa-intro-scooter.webp";
const SCOOTER_W = 1022;
const SCOOTER_H = 1121;
const LOGO_RATIO = 291 / 800;

/** Stage timings in seconds. Total is roughly 5s; tune here. */
const T = {
  scooterIn: { delay: 0.1, duration: 2.3 },
  vespaReveal: { delay: 0.55, duration: 1.9 },
  subReveal: { delay: 1.35, duration: 1.4 },
  glow: { delay: 2.3, duration: 0.9 },
  heroScale: { delay: 2.6, duration: 0.9 },
  transitionAt: 3.6,
  transition: 1.15,
  bgFade: { after: 0.5, duration: 0.7 },
  maxWait: 9,
  imageWait: 1.5,
};

const EASE_IN_OUT = [0.45, 0, 0.2, 1] as const;
const EASE_FLOW = [0.22, 1, 0.36, 1] as const;
const EASE_MOVE = [0.65, 0, 0.35, 1] as const;

type Layout = {
  vw: number;
  sW: number; sH: number; sLeft: number; sTop: number;
  lW: number; lH: number; lLeft: number; lTop: number;
  subTop: number; subFont: number;
};

function computeLayout(): Layout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sH = Math.min(vh * 0.56, (vw * 0.86) * (SCOOTER_H / SCOOTER_W), 600);
  const sW = sH * (SCOOTER_W / SCOOTER_H);
  const sTop = vh * 0.5 - sH * 0.58;
  const lW = Math.min(vw * 0.9, 800);
  const lH = lW * LOGO_RATIO;
  return {
    vw,
    sW, sH, sLeft: (vw - sW) / 2, sTop,
    lW, lH, lLeft: (vw - lW) / 2, lTop: sTop + sH * 0.3 - lH / 2,
    subTop: sTop + sH + Math.max(14, vh * 0.025),
    subFont: Math.max(14, Math.min(lW * 0.036, 30)),
  };
}

/** Soft left-to-right reveal mask; `p` runs 0..1. */
function revealMask(p: number) {
  const edge = p * 118;
  return `linear-gradient(90deg, #000 ${edge - 18}%, transparent ${edge}%)`;
}

// Module scope survives client-side navigation, so the intro plays once per page load / refresh.
let introPlayed = false;

export function SiteIntro() {
  const [done, setDone] = useState(introPlayed);
  if (done) return null;
  return <IntroOverlay onDone={() => { introPlayed = true; setDone(true); }} />;
}

function IntroOverlay({ onDone }: { onDone: () => void }) {
  preload(SCOOTER_SRC, { as: "image", fetchPriority: "high" });

  const [layout, setLayout] = useState<Layout | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const doneRef = useRef(onDone);
  const logoRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const scooterRef = useRef<HTMLDivElement>(null);

  const scooterX = useMotionValue(0);
  const scooterY = useMotionValue(0);
  const scooterScale = useMotionValue(1);
  const scooterOpacity = useMotionValue(1);
  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);
  const logoScale = useMotionValue(1);
  const logoHero = useMotionValue(1);
  const logoReveal = useMotionValue(0);
  const subX = useMotionValue(0);
  const subY = useMotionValue(0);
  const subScale = useMotionValue(1);
  const subReveal = useMotionValue(0);
  const bgOpacity = useMotionValue(1);
  const glow = useMotionValue(0);
  const loader = useMotionValue(0);
  const chromeOpacity = useMotionValue(1);

  const skipOpacity = useTransform([loader, chromeOpacity], ([l, c]: number[]) => Math.min(l, c));
  const logoMask = useTransform(logoReveal, revealMask);
  const subMask = useTransform(subReveal, revealMask);
  const subOpacity = useTransform(subReveal, [0, 0.15], [0, 1]);

  useEffect(() => { doneRef.current = onDone; });

  // Lay out after mount (needs the viewport) and lock page scroll while the intro is up.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- measuring the viewport requires the DOM
    setLayout(computeLayout());
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, []);

  // Do not wait on the scooter photo forever on slow connections.
  useEffect(() => {
    const t = window.setTimeout(() => setImgReady(true), T.imageWait * 1000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!layout || !(imgReady || imgFailed)) return;
    const controls: AnimationPlaybackControls[] = [];
    const timers: number[] = [];
    const later = (fn: () => void, s: number) => { timers.push(window.setTimeout(fn, s * 1000)); };
    const run = (c: AnimationPlaybackControls) => { controls.push(c); };
    const finish = () => doneRef.current();

    later(finish, T.maxWait); // hard stop: never block the site

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Static composition, short hold, then a plain cross-fade into the site.
      scooterX.set(0); logoReveal.set(1); subReveal.set(1); glow.set(0.6);
      run(animate(loader, 1, { duration: 0.6, ease: "linear" }));
      later(() => {
        run(animate(bgOpacity, 0, { duration: 0.5 }));
        run(animate(chromeOpacity, 0, { duration: 0.5 }));
      }, 0.9);
      later(finish, 1.45);
    } else {
      const startX = -(layout.sLeft + layout.sW + 40);
      scooterX.set(startX);
      run(animate(scooterX, 0, { ...T.scooterIn, ease: EASE_IN_OUT }));
      run(animate(logoReveal, 1, { ...T.vespaReveal, ease: EASE_FLOW }));
      run(animate(subReveal, 1, { ...T.subReveal, ease: EASE_FLOW }));
      run(animate(glow, 1, { ...T.glow, ease: "easeOut" }));
      run(animate(logoHero, 1.07, { ...T.heroScale, ease: EASE_IN_OUT }));
      run(animate(loader, 1, { duration: T.transitionAt, ease: "linear" }));

      later(() => {
        const spec = { duration: T.transition, ease: EASE_MOVE };
        const fly = (el: HTMLElement | null, target: DOMRect, x: typeof logoX, y: typeof logoY, s: typeof logoScale) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          run(animate(x, x.get() + target.left - r.left, spec));
          run(animate(y, y.get() + target.top - r.top, spec));
          run(animate(s, s.get() * (target.width / r.width), spec));
        };
        const navLogo = document.querySelector<HTMLElement>("[data-intro-logo]")?.getBoundingClientRect();
        const navSub = document.querySelector<HTMLElement>("[data-intro-sub]")?.getBoundingClientRect();
        const logoFallback = new DOMRect(24, 20, 140, 140 * LOGO_RATIO);
        const subFallback = new DOMRect(24, 20 + 140 * LOGO_RATIO + 6, 100, 12);
        fly(logoRef.current, navLogo ?? logoFallback, logoX, logoY, logoScale);
        fly(subRef.current, navSub ?? subFallback, subX, subY, subScale);

        // The scooter shrinks toward the top-left, then dissolves before it can cover the navigation.
        const w = layout.vw < 640 ? 52 : 80;
        fly(scooterRef.current, new DOMRect(8, 0, w, w * (SCOOTER_H / SCOOTER_W)), scooterX, scooterY, scooterScale);
        run(animate(scooterOpacity, 0, { delay: T.transition * 0.55, duration: T.transition * 0.4, ease: "easeIn" }));
        run(animate(logoHero, 1, spec));
        run(animate(glow, 0, { duration: 0.6 }));
        run(animate(chromeOpacity, 0, { duration: 0.5 }));
        run(animate(bgOpacity, 0, { delay: T.bgFade.after, duration: T.bgFade.duration, ease: "easeInOut" }));
      }, T.transitionAt);
      later(finish, T.transitionAt + T.transition + 0.15);
    }

    return () => {
      controls.forEach((c) => c.stop());
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [layout, imgReady, imgFailed, scooterX, scooterY, scooterScale, scooterOpacity, logoX, logoY, logoScale, logoHero, logoReveal, subX, subY, subScale, subReveal, bgOpacity, glow, loader, chromeOpacity]);

  return (
    <div role="status" aria-live="polite" aria-label="Loading Vespa Puducherry" className="intro-root fixed inset-0 z-[300] overflow-hidden">
      {/* While the intro runs, the real header logo is hidden so the intro brand can land exactly on it. Failsafes restore it if scripts stall. */}
      <style>{`
        [data-intro-logo],[data-intro-sub]{opacity:0;animation:intro-nav-show .3s linear ${T.maxWait + 1}s forwards}
        @keyframes intro-nav-show{to{opacity:1}}
        .intro-root{animation:intro-failsafe .3s ease ${T.maxWait + 1}s forwards}
        @keyframes intro-failsafe{to{opacity:0;visibility:hidden}}
      `}</style>

      <motion.div
        aria-hidden style={{ opacity: bgOpacity, background: "radial-gradient(ellipse 80% 70% at 50% 45%, #0f4f3c 0%, #0a3a2c 40%, #05241c 80%)" }}
        className="absolute inset-0"
      />

      {layout && (
        <div className="absolute inset-0">
          {/* Hero-moment light behind the scooter */}
          <motion.div
            aria-hidden
            style={{ opacity: glow, left: layout.vw / 2 - layout.sW * 0.8, top: layout.sTop + layout.sH * 0.05, width: layout.sW * 1.6, height: layout.sH * 0.95, background: "radial-gradient(closest-side, rgba(212,179,110,0.28), transparent 75%)" }}
            className="absolute"
          />

          {/* VESPA wordmark, behind the scooter */}
          <motion.div
            ref={logoRef}
            style={{ left: layout.lLeft, top: layout.lTop, width: layout.lW, height: layout.lH, x: logoX, y: logoY, scale: logoScale, transformOrigin: "0 0" }}
            className="absolute"
          >
            <motion.div style={{ scale: logoHero, maskImage: logoMask, WebkitMaskImage: logoMask }} className="h-full w-full">
              <Image src="/brand/vespa-logo-red.png" alt="Vespa" width={800} height={291} priority className="h-full w-full" />
            </motion.div>
          </motion.div>

          {/* Scooter: always in front of the type */}
          <motion.div
            ref={scooterRef}
            style={{ left: layout.sLeft, top: layout.sTop, width: layout.sW, height: layout.sH, x: scooterX, y: scooterY, scale: scooterScale, opacity: scooterOpacity, transformOrigin: "0 0" }}
            className="absolute"
          >
            {!imgFailed && (
              <>
                <div aria-hidden className="absolute -bottom-[1.5%] left-[8%] h-[7%] w-[86%] rounded-[50%] bg-black/55 blur-xl" />
                <Image
                  src={SCOOTER_SRC} alt="" width={SCOOTER_W} height={SCOOTER_H} priority unoptimized
                  onLoad={() => setImgReady(true)} onError={() => setImgFailed(true)}
                  className="relative h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
                />
              </>
            )}
          </motion.div>

          <motion.button
            type="button" onClick={() => doneRef.current()} style={{ opacity: skipOpacity }}
            className="absolute bottom-6 right-5 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ivory/60 transition-colors hover:text-gold-light focus-visible:text-gold-light sm:right-8"
          >
            Skip intro
          </motion.button>
        </div>
      )}

      {/* Slim loading indicator */}
      <motion.div aria-hidden style={{ opacity: chromeOpacity }} className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden bg-ivory/10">
        <motion.div style={{ scaleX: loader, transformOrigin: "0 50%" }} className="h-full w-full bg-gradient-to-r from-gold via-gold-light to-gold" />
      </motion.div>
    </div>
  );
}
