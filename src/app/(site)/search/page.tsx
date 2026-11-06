import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ScooterCard } from "@/components/shop/scooter-card";
import { AccessoryCard } from "@/components/shop/accessory-card";
import Image from "next/image";
import Link from "next/link";
import { listAccessories, listScooters } from "@/lib/data/catalogue";
import { getShowroomModels } from "@/lib/data/showroom-models";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const [s, a] = q ? await Promise.all([listScooters({ q, pageSize: 6 }), listAccessories({ q, pageSize: 8 })]) : [null, null];
  // Showroom models are always searchable, even when the catalogue database has no matching rows.
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const models = q ? (await getShowroomModels()).filter((m) => words.every((w) => m.name.toLowerCase().includes(w))) : [];
  const none = s && a && s.data.items.length === 0 && a.data.items.length === 0 && models.length === 0;
  return (
    <>
      <PageHeader eyebrow="Search" title={q ? `Results for “${q}”` : "Search"} />
      <div className="mx-auto max-w-7xl space-y-14 px-5 py-14 lg:px-8">
        {!q && <p className="text-grey">Type a search above to find scooters and accessories.</p>}
        {none && <p className="text-grey">Nothing matched “{q}”. Try a different word.</p>}
        {models.length > 0 && (
          <section><h2 className="text-3xl">At the showroom</h2><div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{models.map((m) => (
            <Link key={m.slug} href={`/scooters/${m.slug}`} className="group block overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-gold/30 transition-shadow hover:shadow-xl">
              <Image src={m.image} alt={m.name} width={600} height={450} className="h-56 w-full object-contain" />
              <h3 className="mt-4 text-2xl">{m.name}</h3>
            </Link>
          ))}</div></section>
        )}
        {s && s.data.items.length > 0 && (
          <section><h2 className="text-3xl">Scooters</h2><div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">{s.data.items.map((i) => <ScooterCard key={i.id} scooter={i} />)}</div></section>
        )}
        {a && a.data.items.length > 0 && (
          <section><h2 className="text-3xl">Accessories</h2><div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">{a.data.items.map((i) => <AccessoryCard key={i.id} accessory={i} />)}</div></section>
        )}
      </div>
    </>
  );
}
