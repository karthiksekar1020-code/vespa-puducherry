import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScooterGallery } from "@/components/shop/scooter-gallery";
import { ScooterCard } from "@/components/shop/scooter-card";
import { AccessoryCard } from "@/components/shop/accessory-card";
import { priceLabel } from "@/components/shop/scooter-card";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { getScooter, listAccessories, relatedScooters } from "@/lib/data/catalogue";
import { AVAILABILITY_LABEL } from "@/lib/format";
import { KeyFigures } from "@/components/shop/key-figures";
import { ShowroomModelPage } from "@/components/home/showroom-model-page";
import { getShowroomModels } from "@/lib/data/showroom-models";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScooter(slug);
  if (!s) {
    const m = (await getShowroomModels()).find((x) => x.slug === slug);
    return { title: m ? m.name : "Scooter not found" };
  }
  return { title: [s.name, s.variant].filter(Boolean).join(" "), description: s.tagline ?? s.description?.slice(0, 150) ?? undefined };
}

export default async function ScooterPage({ params }: Props) {
  const { slug } = await params;
  const s = await getScooter(slug);
  if (!s) {
    const models = await getShowroomModels();
    const m = models.find((x) => x.slug === slug);
    if (m) return <ShowroomModelPage model={m} models={models} />;
    notFound();
  }
  const title = [s.name, s.variant].filter(Boolean).join(" ");
  const [related, acc] = await Promise.all([relatedScooters(s.id), listAccessories({ scooter: s.slug, pageSize: 4 })]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-widest text-grey">
          <Link href="/scooters" className="hover:text-gold">Scooters</Link> / <span className="text-charcoal">{s.name}</span>
        </nav>
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr]">
          <ScooterGallery images={s.images} colors={s.colors} title={title} />
          <div>
            <p className="eyebrow">{AVAILABILITY_LABEL[s.availability]}</p>
            <h1 className="mt-2 text-5xl">{s.name}</h1>
            {s.variant && <p className="mt-1 text-lg text-grey">{s.variant}</p>}
            {s.tagline && <p className="mt-4 font-display text-2xl italic text-emerald-800">{s.tagline}</p>}
            <p className="mt-6 font-display text-3xl">{priceLabel(s)}</p>
            {!(s.price_inr != null && s.price_verified) && <p className="mt-1 text-xs text-grey">Contact the showroom for the current on-road price.</p>}
            {s.description && <p className="mt-6 leading-relaxed text-grey">{s.description}</p>}
            <div className="mt-8">
              <KeyFigures
                modelName={title}
                figures={[
                  { label: "Top speed", value: s.specs.find((r) => /top speed|max(imum)? speed/i.test(r.label))?.value },
                  { label: "Mileage", value: s.specs.find((r) => /mileage|fuel (efficiency|economy)|kmpl|km\/l/i.test(r.label))?.value },
                ]}
              />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/book-test-ride?scooter=${s.id}`} className="btn btn-gold">Book a test ride</Link>
              <a href="#enquire" className="btn btn-outline-dark">Enquire now</a>
            </div>
            {s.specs.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Specifications</h2>
                <dl className="mt-3 divide-y divide-silver/50 border-y border-silver/50 text-sm">
                  {s.specs.map((r) => <div key={r.label} className="flex justify-between gap-4 py-3"><dt className="text-grey">{r.label}</dt><dd className="text-right font-semibold">{r.value}</dd></div>)}
                </dl>
                <p className="mt-2 text-xs text-grey">Specifications are entered by the showroom. Please confirm details before purchase.</p>
              </section>
            )}
            {s.features.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl">Features</h2>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-grey">{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
              </section>
            )}
          </div>
        </div>
      </div>

      <section className="bg-ivory-dark py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-3xl">Compatible accessories</h2>
          {acc.data.items.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">{acc.data.items.map((a) => <AccessoryCard key={a.id} accessory={a} />)}</div>
          ) : (
            <p className="mt-4 text-sm text-grey">No accessories have been marked as compatible with this model yet.</p>
          )}
        </div>
      </section>

      <section id="enquire" className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2 className="text-3xl">Ask about the {s.name}</h2>
        <p className="mt-2 text-sm text-grey">The showroom will reply to the email you provide.</p>
        <div className="mt-6"><EnquiryForm related={title} category="Scooter enquiry" /></div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <h2 className="text-3xl">Related scooters</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">{related.map((r) => <ScooterCard key={r.id} scooter={r} />)}</div>
        </section>
      )}
    </>
  );
}
