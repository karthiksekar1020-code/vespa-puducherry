"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/tilt-card";

const EASE = [0.22, 1, 0.36, 1] as const;

/** One accessory card. Must sit inside <Stagger>, whose "hidden"/"show" variants drive the entrance. */
export function AccessoryTile({ name, image }: { name: string; image: string }) {
  return (
    <motion.div
      style={{ transformPerspective: 900 }}
      variants={{
        hidden: { opacity: 0, y: 70, scale: 0.86, rotateX: -16, filter: "blur(8px)" },
        show: { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)", transition: { duration: 0.95, ease: EASE } },
      }}
    >
      <TiltCard max={10} radius="1rem">
        <Link
          href={`/contact?related=${encodeURIComponent(name)}&category=Accessories`}
          className="group relative block h-full overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-20px_rgba(5,36,28,0.5)] ring-1 ring-silver/40 transition-[box-shadow,transform] duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_55px_-24px_rgba(5,36,28,0.65)] hover:ring-gold/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <div className="relative aspect-square overflow-hidden">
            <motion.div
              className="absolute inset-0"
              variants={{ hidden: { scale: 1.35 }, show: { scale: 1, transition: { duration: 1.5, ease: EASE } } }}
            >
              <Image src={image} alt={name} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:transition-none" />
            </motion.div>
            {/* Light sweep across the photo on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:animate-[tile-sheen_0.9s_ease-out] motion-reduce:hidden"
            />
          </div>
          <motion.p
            className="relative p-4 text-sm font-semibold"
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.3, ease: EASE } } }}
          >
            {name}
            <span aria-hidden className="absolute bottom-0 left-4 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-[calc(100%-2rem)] motion-reduce:transition-none" />
          </motion.p>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
