"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { DIRECTIONS_URL, MAP_EMBED_URL, SHOWROOM } from "@/lib/location";

/** Embedded Google Map of the showroom: scroll-in reveal, pulsing rings on the pin, animated buttons. */
export function ShowroomMap({ className = "", heightClass = "h-52 md:h-60" }: { className?: string; heightClass?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`mx-auto overflow-hidden rounded-3xl bg-emerald-950 shadow-[0_18px_50px_-22px_rgba(5,36,28,0.75)] ring-1 ring-gold/30 ${className}`}
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.94, clipPath: "inset(18% 12% 18% 12% round 28px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0% round 24px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`relative ${heightClass}`}>
        <iframe
          title={`Map showing ${SHOWROOM.name}`}
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
        {/* Radar rings centred on the pin (the embed centres the map on the showroom). Decorative only. */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="map-ring" />
          <span className="map-ring" style={{ animationDelay: "0.8s" }} />
          <span className="map-ring" style={{ animationDelay: "1.6s" }} />
        </div>
      </div>

      <motion.div
        className="flex flex-col items-center justify-center gap-3 px-4 py-4 text-center"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } } }}
      >
        <motion.p
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          className="flex items-center justify-center gap-2 text-sm text-ivory/80"
        >
          <MapPin size={16} className="animate-bounce text-gold" aria-hidden /> {SHOWROOM.name}
        </motion.p>
        <div className="flex justify-center gap-2 whitespace-nowrap">
          <motion.a
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="map-btn group btn btn-gold btn-sm !rounded-full"
          >
            <Navigation size={13} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12" /> Directions
          </motion.a>
          <motion.a
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
            href={SHOWROOM.shareUrl} target="_blank" rel="noopener noreferrer" className="map-btn btn btn-outline btn-sm !rounded-full text-ivory"
          >
            Google Maps
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
