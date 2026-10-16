import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { AddToCart } from "@/components/shop/add-to-cart";
import { AccessoryCard } from "@/components/shop/accessory-card";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccessory, relatedAccessories } from "@/lib/data/catalogue";
import { formatINR } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAccessory(slug);
  return a ? { title: a.name, description: a.description?.slice(0, 150) } : { title: "Accessory not found" };
}

export default async function AccessoryPage({ params }: Props) {
  const { slug } = await params;
  const a = await getAccessory(slug);
  if (!a) notFound();
  const user = await getUser();
  let wished = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from("wishlist").select("accessory_id").eq("user_id", user.id).eq("accessory_id", a.id).maybeSingle();
    wished = Boolean(data);
  }
  const related = await relatedAccessories(a);
  const img = a.images[0];

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-widest text-grey">
          <Link href="/accessories" className="hover:text-gold">Accessories</Link> / <span className="text-charcoal">{a.name}</span>
        </nav>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden bg-ivory-dark">
              {img ? <Image src={img.url} alt={img.alt || a.name} fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" /> : <div className="flex h-full items-center justify-center text-silver"><ShoppingBag size={64} strokeWidth={1} /></div>}
            </div>
            {a.images.length > 1 && (
              <ul className="mt-3 grid grid-cols-5 gap-2">
                {a.images.slice(1, 6).map((i) => <li key={i.url} className="relative aspect-square overflow-hidden bg-ivory-dark"><Image src={i.url} alt={i.alt || a.name} fill sizes="100px" className="object-cover" /></li>)}
              </ul>
            )}
          </div>
          <div>
            <h1 className="text-5xl">{a.name}</h1>
            <p className="mt-4 font-display text-3xl text-emerald-800">{formatINR(a.price_inr)}</p>
            <p className={`mt-2 text-sm font-semibold ${a.stock > 0 ? "text-emerald-800" : "text-red-700"}`}>
              {a.stock <= 0 ? "Out of stock" : a.stock <= 5 ? `Only ${a.stock} left` : "In stock"}
            </p>
            {a.description && <p className="mt-6 leading-relaxed text-grey">{a.description}</p>}
            {a.compatibility.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xl">Compatible with</h2>
                <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                  {a.compatibility.map((c) => <li key={c}><Link href={`/scooters/${c}`} className="border border-silver px-3 py-1 uppercase tracking-widest hover:border-gold">{c.replace(/-/g, " ")}</Link></li>)}
                </ul>
              </div>
            )}
            <div className="mt-8 flex flex-wrap items-start gap-4">
              <AddToCart id={a.id} stock={a.stock} />
              <WishlistButton accessoryId={a.id} initial={wished} />
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="bg-ivory-dark py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 className="text-3xl">You may also like</h2>
            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">{related.map((r) => <AccessoryCard key={r.id} accessory={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
