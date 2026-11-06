"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { Fragment, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

function Row({ icon, label, children, i }: { icon: ReactNode; label: string; children: ReactNode; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="group flex gap-4 rounded-2xl p-3 transition-colors duration-300 hover:bg-ivory"
      initial={reduce ? false : { opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: 0.25 + i * 0.15, ease: EASE }}
    >
      <span className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-gold transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
        <span aria-hidden className="pulse-ring absolute inset-0 rounded-full border border-gold/60" style={{ animationDelay: `${i * 0.6}s` }} />
        {icon}
      </span>
      <div className="min-w-0">
        <span className="label !mt-0">{label}</span>
        <div className="mt-0.5 break-words">{children}</div>
      </div>
    </motion.div>
  );
}

/** Animated showroom details card: rows slide in one by one, icons pulse and tilt on hover. */
export function ContactShowroomCard({ address, phone, email }: { address: string; phone: string; email: string }) {
  const missing = <i className="text-grey">To be added by the showroom</i>;
  const addresses = address.split("|").map((a) => a.trim()).filter(Boolean);
  const phoneGroups = phone.split(";").map((g) => g.split("|").map((n) => n.trim()).filter(Boolean));
  return (
    <aside className="h-fit rounded-3xl bg-white p-5 text-sm shadow-[0_24px_60px_-30px_rgba(5,36,28,0.55)] ring-1 ring-gold/30">
      <h2 className="px-3 pt-2 text-2xl">Showroom</h2>
      <address className="mt-3 space-y-1 not-italic">
        {addresses.length ? addresses.map((a, k) => (<Fragment key={a}><Row i={k} icon={<MapPin size={18} />} label={addresses.length > 1 ? `Address ${k + 1}` : "Address"}>{a}</Row>{phoneGroups[k]?.length > 0 && <Row i={k} icon={<Phone size={18} />} label="Phone">{phoneGroups[k].map((n) => <span key={n} className="block"><a href={`https://wa.me/${n.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label={`Chat on WhatsApp: ${n}`} className="hover:text-gold">{n}</a></span>)}</Row>}</Fragment>)) : <Row i={0} icon={<MapPin size={18} />} label="Address">{missing}</Row>}
        <Row i={2} icon={<Mail size={18} />} label="Email">{email ? <a href={`mailto:${email}`} className="hover:text-gold">{email}</a> : missing}</Row>
      </address>
    </aside>
  );
}
