import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { Accessory } from "@/lib/types";
import { AddToCart } from "./add-to-cart";

export function AccessoryCard({ accessory: a }: { accessory: Accessory }) {
  const img = a.images[0];
  return (
    <article className="group flex h-full flex-col bg-white shadow-[0_1px_0_rgba(28,29,28,0.06)] transition-shadow duration-500 hover:shadow-[0_24px_50px_-20px_rgba(5,36,28,0.35)]">
      <Link href={`/accessories/${a.slug}`} className="relative block aspect-square overflow-hidden bg-ivory-dark" aria-label={`View ${a.name}`}>
        {img ? (
          <Image src={img.url} alt={img.alt || a.name} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-silver"><ShoppingBag size={44} strokeWidth={1} /></div>
        )}
        {a.stock <= 0 && <span className="absolute left-3 top-3 bg-charcoal px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ivory">Out of stock</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl leading-tight"><Link href={`/accessories/${a.slug}`} className="hover:text-emerald-800">{a.name}</Link></h3>
        <p className="mt-2 font-display text-xl text-emerald-800">{formatINR(a.price_inr)}</p>
        <div className="mt-auto pt-4"><AddToCart id={a.id} stock={a.stock} compact /></div>
      </div>
    </article>
  );
}
