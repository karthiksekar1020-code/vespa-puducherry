"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { BRANCHES } from "@/lib/location";

export function DirectionsMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  // Bring both branches fully into view (the footer sits at the very bottom of the page).
  useEffect(() => {
    if (open) list.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={root} className="mt-6">
      <button
        type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        className="foot-directions inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-light"
      >
        Get directions <ArrowRight size={14} aria-hidden />
      </button>
      {open && (
        <ul ref={list} role="menu" className="mt-3 scroll-mb-8 w-full max-w-xs border-t-2 border-gold bg-emerald-950 py-2 shadow-2xl ring-1 ring-gold/20">
          {BRANCHES.map((b) => (
            <li key={b.name} role="none">
              <a
                role="menuitem" href={b.url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
                className="group/b flex items-start gap-3 px-4 py-3 text-ivory transition-colors hover:bg-gold/15 focus-visible:bg-gold/15"
              >
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gold transition-transform duration-300 group-hover/b:translate-x-1 group-hover/b:text-gold-light">{b.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-ivory/70">{b.address}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
