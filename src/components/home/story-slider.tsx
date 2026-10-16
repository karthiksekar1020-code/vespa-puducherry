"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const SLIDES = [
  { src: "/site/story/vespa-red.jpg", alt: "A red classic Vespa parked under a bridge", pan: -14 },
  { src: "/site/story/vespa-green-sprint.jpg", alt: "A green Vespa Sprint on paved stones", pan: 14 },
  { src: "/site/story/vespa-green-street.jpg", alt: "A green vintage Vespa in a sunlit street", pan: -10 },
];
const INTERVAL_MS = 3000;
const FADE_S = 1.6;
const DRIFT_S = 4.6;

/** Fills the story image frame; only the photos animate, anything layered above it stays put. */
export function StorySlider() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 bg-emerald-950">
      {SLIDES.map((s, i) => {
        const on = i === active;
        return (
          <motion.div
            key={s.src} aria-hidden={!on}
            className="absolute inset-0 will-change-[opacity,transform]"
            initial={false}
            animate={{ opacity: on ? 1 : 0, scale: reduce ? 1 : on ? 1.07 : 1, x: reduce ? 0 : on ? s.pan : 0 }}
            transition={{
              opacity: { duration: reduce ? 0.4 : FADE_S, ease: "easeInOut" },
              scale: { duration: on ? DRIFT_S : FADE_S, ease: on ? "linear" : "easeInOut" },
              x: { duration: on ? DRIFT_S : FADE_S, ease: on ? "linear" : "easeInOut" },
            }}
          >
            {/* Blurred copy fills the frame so the sharp, uncropped photo sits centred on top. */}
            <Image src={s.src} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="scale-110 object-cover blur-2xl brightness-75" priority={i === 0} />
            <Image src={s.src} alt={s.alt} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-contain" priority={i === 0} />
          </motion.div>
        );
      })}
    </div>
  );
}
