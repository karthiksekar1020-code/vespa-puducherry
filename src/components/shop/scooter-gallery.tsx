"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Share2 } from "lucide-react";
import { ScooterArt } from "@/components/ui/scooter-art";
import type { ColorOption, ImageRef } from "@/lib/types";

export function ScooterGallery({ images, colors, title }: { images: ImageRef[]; colors: ColorOption[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [color, setColor] = useState<ColorOption | null>(colors[0] ?? null);
  const [override, setOverride] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // A colour only swaps the image when the admin attached an image to that colour.
  const shown = override ?? images[index]?.url ?? null;
  const alt = override ? `${title} in ${color?.name}` : images[index]?.alt || title;

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* user cancelled share or clipboard blocked */ }
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory-dark">
        <AnimatePresence mode="wait">
          <motion.div key={shown ?? "placeholder"} className="absolute inset-0" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {shown ? (
              <Image src={shown} alt={alt} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-10 opacity-70"><ScooterArt body={color?.hex ?? "#6b6e6a"} className="w-full" /></div>
            )}
          </motion.div>
        </AnimatePresence>
        <button onClick={share} className="btn btn-outline-dark btn-sm absolute right-4 top-4 bg-ivory/90" aria-label="Share this scooter">
          {copied ? <><Check size={13} /> Link copied</> : <><Share2 size={13} /> Share</>}
        </button>
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto" aria-label="Gallery thumbnails">
          {images.map((img, i) => (
            <li key={img.url}>
              <button onClick={() => { setIndex(i); setOverride(null); }} aria-label={`Show image ${i + 1}`} aria-current={!override && i === index}
                className={`relative block h-16 w-24 overflow-hidden border-2 ${!override && i === index ? "border-gold" : "border-transparent"}`}>
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {colors.length > 0 && (
        <div className="mt-6">
          <p className="label !mt-0">Colour: <span className="text-charcoal">{color?.name}</span></p>
          <div role="radiogroup" aria-label="Colour" className="mt-2 flex gap-3">
            {colors.map((c) => (
              <button key={c.name} role="radio" aria-checked={color?.name === c.name} aria-label={c.name} title={c.name}
                onClick={() => { setColor(c); setOverride(c.image ?? null); }}
                className={`h-9 w-9 rounded-full border-2 p-0.5 transition-transform hover:scale-110 ${color?.name === c.name ? "border-gold" : "border-silver"}`}>
                <span className="block h-full w-full rounded-full" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
          {color && !color.image && images.length > 0 && <p className="mt-2 text-xs text-grey">No photo is available for this colour yet; the gallery shows the main images.</p>}
        </div>
      )}
    </div>
  );
}
