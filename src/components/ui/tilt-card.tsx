"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/** Wraps a card with a 3D tilt toward the cursor and a moving light glare. No effect for reduced-motion users or touch. */
export function TiltCard({ children, max = 8, radius = "1.5rem", className = "" }: { children: ReactNode; max?: number; radius?: string; className?: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const hover = useSpring(useMotionValue(0), { stiffness: 140, damping: 20 });
  const rotY = useSpring(useTransform(x, [0, 1], reduce ? [0, 0] : [-max, max]), { stiffness: 180, damping: 16 });
  const rotX = useSpring(useTransform(y, [0, 1], reduce ? [0, 0] : [max, -max]), { stiffness: 180, damping: 16 });
  const gx = useTransform(x, (v) => `${v * 100}%`);
  const gy = useTransform(y, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(280px circle at ${gx} ${gy}, rgba(255,255,255,0.45), rgba(255,255,255,0) 65%)`;

  return (
    <motion.div
      className={`relative h-full ${className}`}
      style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      onMouseEnter={() => hover.set(1)}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width);
        y.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5); hover.set(0); }}
    >
      {children}
      {!reduce && (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light" style={{ background: glare, opacity: hover, borderRadius: radius }} />
      )}
    </motion.div>
  );
}
