"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { TiltCard } from "@/components/ui/tilt-card";

const EASE = [0.22, 1, 0.36, 1] as const;

/** About-page photo: wipe-in reveal, slow cinematic zoom, a one-off gold sheen and a 3D tilt toward the cursor. */
export function AboutPhoto({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  // The scroll trigger sits on an outer layer that is never clipped (Chrome treats a fully clipped element as off-screen),
  // while the wipe-in clip is applied to the inner layer through variants.
  return (
    <motion.div
      className="mx-auto w-full max-w-md lg:max-w-none"
      initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: { opacity: 0, x: -70 }, show: { opacity: 1, x: 0, transition: { duration: 1.3, ease: EASE } } }}
    >
      <motion.div
        variants={{ hidden: { clipPath: "inset(0 100% 0 0 round 1.5rem)" }, show: { clipPath: "inset(0 0% 0 0 round 1.5rem)", transition: { duration: 1.3, ease: EASE } } }}
      >
      <TiltCard max={7} radius="1.5rem">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-[0_18px_50px_-22px_rgba(5,36,28,0.6)] ring-1 ring-gold/30">
          <motion.div
            className="absolute inset-0"
            animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src={src} alt={alt} fill priority sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
          </motion.div>
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-gold-light/50 to-transparent"
              initial={{ x: 0, skewX: -12, opacity: 0 }}
              whileInView={{ x: "520%", opacity: [0, 1, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 1.1, ease: "easeInOut" }}
            />
          )}
        </div>
      </TiltCard>
      </motion.div>
    </motion.div>
  );
}
