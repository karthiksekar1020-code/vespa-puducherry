import Image from "next/image";
import Link from "next/link";
import { ScooterArt } from "@/components/ui/scooter-art";
import { AVAILABILITY_LABEL, formatINR } from "@/lib/format";
import type { Scooter } from "@/lib/types";

export function priceLabel(s: Pick<Scooter, "price_inr" | "price_verified">): string {
  return s.price_inr != null && s.price_verified ? formatINR(s.price_inr) : "Price on request";
}

export function ScooterCard({ scooter: s }: { scooter: Scooter }) {
  const img = s.images[0];
  const title = [s.name, s.variant].filter(Boolean).join(" ");
  return (
    <article className="group flex h-full flex-col bg-white shadow-[0_1px_0_rgba(28,29,28,0.06)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-20px_rgba(5,36,28,0.35)]">
      <Link href={`/scooters/${s.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-ivory-dark" aria-label={`View ${title}`}>
        {img ? (
          <Image src={img.url} alt={img.alt || title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center p-8 opacity-60 transition-transform duration-700 group-hover:scale-105"><ScooterArt body="#6b6e6a" className="w-full" /></div>
        )}
        <span className="absolute left-3 top-3 bg-ivory/95 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-900">{AVAILABILITY_LABEL[s.availability]}</span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl leading-tight">{s.name}</h3>
        {s.variant && <p className="text-sm text-grey">{s.variant}</p>}
        {s.colors.length > 0 && (
          <ul className="mt-3 flex gap-1.5" aria-label="Available colours">
            {s.colors.map((c) => <li key={c.name} title={c.name} className="h-4 w-4 rounded-full border border-silver" style={{ background: c.hex }}><span className="sr-only">{c.name}</span></li>)}
          </ul>
        )}
        <p className="mt-4 font-display text-xl text-emerald-800">{priceLabel(s)}</p>
        {s.specs.length > 0 && (
          <dl className="mt-3 space-y-1 border-t border-silver/50 pt-3 text-xs text-grey">
            {s.specs.slice(0, 3).map((r) => <div key={r.label} className="flex justify-between gap-3"><dt>{r.label}</dt><dd className="font-semibold text-charcoal">{r.value}</dd></div>)}
          </dl>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Link href={`/scooters/${s.slug}`} className="btn btn-emerald btn-sm">Details</Link>
          <Link href={`/contact?related=${encodeURIComponent(title)}&category=Scooter+enquiry`} className="btn btn-outline-dark btn-sm">Enquire now</Link>
          <Link href={`/book-test-ride?scooter=${s.id}`} className="btn btn-outline-dark btn-sm">Test ride</Link>
        </div>
      </div>
    </article>
  );
}

export function ScooterCardSkeleton() {
  return (
    <div aria-hidden className="bg-white">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-3 p-6"><div className="skeleton h-6 w-2/3" /><div className="skeleton h-4 w-1/3" /><div className="skeleton h-4 w-1/2" /></div>
    </div>
  );
}
