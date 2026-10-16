import Image from "next/image";
import Link from "next/link";
import { KeyFigures } from "@/components/shop/key-figures";
import { ShowroomCard } from "./showroom-card";
import { MODEL_SPECS } from "@/data/model-specs";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { accessoriesFor, type ShowroomModel } from "@/data/showroom";

/** Static detail page for showroom models that are not in the database yet. Makes no price, spec or stock claims. */
export function ShowroomModelPage({ model: m, models }: { model: ShowroomModel; models: ShowroomModel[] }) {
  const related = accessoriesFor(m.slug);
  const specs = MODEL_SPECS[m.slug];
  const fromSpecs = (!m.topSpeed && specs?.key.topSpeed) || (!m.mileage && specs?.key.mileage);
  const others = models.filter((x) => x.slug !== m.slug);
  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-xs uppercase tracking-widest text-grey">
          <Link href="/scooters" className="hover:text-gold">Scooters</Link> / <span className="text-charcoal">{m.name}</span>
        </nav>
        <div className="grid items-start gap-12 lg:grid-cols-[32rem_1fr]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <nav aria-label="All models" className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
              {models.map((x) => {
                const current = x.slug === m.slug;
                return (
                  <Link
                    key={x.slug} href={`/scooters/${x.slug}`} aria-label={x.name} aria-current={current ? "page" : undefined} title={x.name}
                    className={`group/m relative block h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 ${current ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory" : "opacity-75 ring-1 ring-silver hover:opacity-100 hover:ring-gold/60"}`}
                  >
                    <Image src={x.image} alt="" fill sizes="96px" className="object-contain p-1.5" />
                    <span className="absolute inset-x-0 bottom-0 bg-emerald-950/80 px-1 py-0.5 text-center text-[0.55rem] font-semibold uppercase tracking-wider text-ivory opacity-0 transition-opacity group-hover/m:opacity-100">{x.name.replace("Vespa ", "")}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="w-full max-w-sm"><ShowroomCard key={m.slug} model={m} detail /></div>
          </div>
          <div>
            <p className="eyebrow">At the showroom</p>
            <h1 className="mt-2 text-5xl">{m.name}</h1>
            <p className="mt-6 leading-relaxed text-grey">Price, colours and availability for the {m.name} are confirmed by the showroom. Send an enquiry or book a test ride and the team will get back to you.</p>
            <div className="mt-8"><KeyFigures modelName={m.name} note={fromSpecs ? "Third-party figures (BikeWale and similar), mileage owner-reported. Please confirm with the showroom." : undefined} figures={[{ label: "Top speed", value: m.topSpeed ?? specs?.key.topSpeed }, { label: "Mileage", value: m.mileage ?? specs?.key.mileage?.value }]} /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book-test-ride" className="btn btn-gold">Book a test ride</Link>
              <a href="#enquire" className="btn btn-outline-dark">Enquire now</a>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-ivory-dark py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-3xl">Related accessories</h2>
          <ul className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {related.map((a) => (
              <li key={a.name}>
                <Link href={`/contact?related=${encodeURIComponent(`${a.name} for ${m.name}`)}&category=Accessories`} className="group block bg-white">
                  <div className="relative aspect-square overflow-hidden"><Image src={a.image} alt={a.name} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                  <p className="p-4 text-sm font-semibold">{a.name}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-grey">Please confirm fitment for your model with the showroom before ordering.</p>
        </div>
      </section>

      <section id="enquire" className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2 className="text-3xl">Ask about the {m.name}</h2>
        <div className="mt-6"><EnquiryForm related={m.name} category="Scooter enquiry" /></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <h2 className="text-3xl">Related scooters</h2>
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/scooters/${o.slug}`} className="group block bg-white">
                <div className="relative aspect-square overflow-hidden"><Image src={o.image} alt={o.name} fill sizes="(min-width:640px) 33vw, 100vw" className="object-contain p-4 transition-transform duration-700 group-hover:scale-105" /></div>
                <p className="p-4 font-display text-xl">{o.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
