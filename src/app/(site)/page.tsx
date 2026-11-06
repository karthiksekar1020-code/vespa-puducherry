import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { StorySlider } from "@/components/home/story-slider";
import { ShowroomAccessoryGrid, ShowroomModelGrid } from "@/components/home/showroom-grids";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { ScooterCard } from "@/components/shop/scooter-card";
import { AccessoryCard } from "@/components/shop/accessory-card";
import { BenefitCard } from "@/components/home/benefit-card";
import { CtaButtons } from "@/components/home/cta-buttons";
import { ShowroomMaps } from "@/components/home/showroom-map";
import { ShowroomGallery } from "@/components/home/showroom-gallery";
import { featuredScooters, listAccessories } from "@/lib/data/catalogue";
import { getShowroomModels } from "@/lib/data/showroom-models";

const BENEFITS = [
  { icon: "heart" as const, title: "Personalised scooter assistance", text: "Tell us how you ride and we will help you shortlist." },
  { icon: "calendar" as const, title: "Test ride enquiries", text: "Request a slot online; the showroom confirms it with you." },
  { icon: "package" as const, title: "Accessories discovery", text: "Helmets, storage, covers and more, listed by the showroom." },
  { icon: "message" as const, title: "Customer support", text: "Send an enquiry and track it with a reference number." },
  { icon: "store" as const, title: "Local showroom assistance", text: "Speak to the team in Puducherry about your plans." },
];

const FAQS = [
  ["How do I book a test ride?", "Use the Book a Test Ride page to choose a scooter, date and time. Your request is saved as pending and is only confirmed once the showroom approves it. You will see its status and a reference number."],
  ["Are the prices on this website final?", "Prices are shown only when the showroom has marked them as verified. Otherwise the page says \"Price on request\". Please confirm the on-road price with the showroom before you decide."],
  ["Can I buy accessories online?", "You can add accessories to your cart and place an order request. Until an online payment provider is connected, the showroom contacts you to arrange payment; no payment is taken on the website."],
  ["Do I need an account?", "Enquiries and test ride requests do not require one. An account is needed to place accessory orders and to view your order history."],
];

// Drop a hero photo at public/hero/hero.webp (or .jpg) and it is used automatically.
const HERO_IMAGE = ["hero.webp", "hero.jpg", "hero.jpeg", "hero.png"].map((f) => path.join(process.cwd(), "public", "hero", f)).find(existsSync)
  ? "/hero/" + ["hero.webp", "hero.jpg", "hero.jpeg", "hero.png"].find((f) => existsSync(path.join(process.cwd(), "public", "hero", f)))
  : null;

const HERO_VIDEO = existsSync(path.join(process.cwd(), "public", "hero", "hero.mp4")) ? "/hero/hero.mp4" : null;

export default async function HomePage() {
  // Optional looping background for the call-to-action band: drop the file at public/site/vespa-scooter-moving.mp4 to switch it on.
  const BAND_VIDEO = existsSync(path.join(process.cwd(), "public", "site", "vespa-scooter-moving.mp4")) ? "/site/vespa-scooter-moving.mp4" : null;
  const [featured, accessories, showroomModels] = await Promise.all([featuredScooters(3), listAccessories({ pageSize: 4, sort: "newest" }), getShowroomModels()]);

  return (
    <>
      <Hero image={HERO_IMAGE} video={HERO_VIDEO} />

      {featured.data.length > 0 && (
        <section id="featured" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <Reveal><p className="eyebrow">The collection</p><h2 className="mt-3 text-4xl md:text-5xl">Featured scooters</h2></Reveal>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.data.map((s) => <StaggerItem key={s.id}><ScooterCard scooter={s} /></StaggerItem>)}
            </Stagger>
          <div className="mt-10"><Link href="/scooters" className="btn btn-outline-dark">View all scooters <ArrowRight size={14} /></Link></div>
        </section>
      )}

      <section id="showroom" className="scroll-mt-0 bg-ivory-dark pb-24 pt-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal><p className="eyebrow">At the showroom</p><h2 className="mt-3 text-4xl md:text-5xl">Models you can see in person</h2><p className="mt-4 max-w-2xl text-grey">Ask the team about availability, colours and the on-road price.</p></Reveal>
          <div className="mt-12"><ShowroomModelGrid /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal><p className="eyebrow">Gallery</p><h2 className="mt-3 text-4xl md:text-5xl">See them up close</h2><p className="mt-4 max-w-2xl text-grey">Pick a model to view it. Ask the team about colours and availability.</p></Reveal>
        <Reveal className="mt-10"><ShowroomGallery models={showroomModels} /></Reveal>
      </section>

      <section className="bg-ivory-dark py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal><p className="eyebrow">Why Vespa Puducherry</p><h2 className="mt-3 text-4xl md:text-5xl">A more personal way to buy</h2></Reveal>
          <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map((b, i) => (
              <StaggerItem key={b.title}><BenefitCard {...b} index={i} /></StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal><p className="eyebrow">Accessories</p><h2 className="mt-3 text-4xl md:text-5xl">Complete the ride</h2></Reveal>
        {accessories.data.items.length > 0 ? (
          <Stagger className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {accessories.data.items.map((a) => <StaggerItem key={a.id}><AccessoryCard accessory={a} /></StaggerItem>)}
          </Stagger>
        ) : (
          <>
            <div className="mt-12"><ShowroomAccessoryGrid /></div>
            <p className="mt-4 text-xs text-grey">Available at the showroom. Tap an item to enquire about price and fitment. Online ordering opens once items are listed with prices.</p>
          </>
        )}
        <div className="mt-10"><Link href="/accessories" className="btn btn-outline-dark">Shop accessories <ArrowRight size={14} /></Link></div>
      </section>

      <section className="bg-emerald-900 py-24 text-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <Reveal>
            <div className="relative aspect-[4/5] max-h-[34rem] overflow-hidden rounded-3xl ring-1 ring-gold/30"><StorySlider />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-emerald-950/45 to-transparent" />
              <p className="absolute inset-x-0 top-5 text-center font-display text-4xl font-semibold uppercase tracking-[0.42em] text-transparent sm:top-7 sm:text-5xl [background-image:linear-gradient(180deg,#f0d78c_0%,#d4b36e_45%,#b8924a_100%)] bg-clip-text [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.45))] [padding-left:0.42em]">Vespa</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="eyebrow">Vespa Puducherry</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Our story</h2>
            <p className="mt-6 italic leading-relaxed text-ivory/60">The showroom&rsquo;s own story has not been added yet. The owner can describe the team, history and approach from the admin settings. Until then we make no claims about it.</p>
            <div className="mt-10 border-t border-ivory/15 pt-8">
              <p className="eyebrow">The Vespa story</p>
              <h3 className="mt-2 text-3xl">An Italian icon since 1946</h3>
              <p className="mt-4 text-lg leading-relaxed text-ivory/80">Vespa, Italian for &ldquo;wasp&rdquo;, was introduced by Piaggio in 1946. Its pressed-steel monocoque body, designed with Corradino D&rsquo;Ascanio, set it apart from the motorcycles of its day and helped define scooter culture around the world.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="find-us" className="mx-auto max-w-7xl px-5 pb-24 pt-24 lg:px-8">
        <Reveal className="text-center"><p className="eyebrow">Find us</p><h2 className="mt-3 text-4xl md:text-5xl">Visit the showroom</h2><p className="mx-auto mt-4 max-w-2xl text-grey">Come and see the scooters in person. Open Monday to Saturday 9 am – 9 pm, Sunday 10 am – 8 pm.</p></Reveal>
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[1fr_22rem]">
          <Reveal><ShowroomMaps heightClass="h-64 md:h-72" /></Reveal>
          <Reveal delay={0.15} className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_-28px_rgba(5,36,28,0.5)] ring-1 ring-silver/40 md:p-7">
            <p className="eyebrow">Questions</p><h2 className="mt-2 text-3xl">Frequently asked</h2>
            <div className="mt-4 divide-y divide-silver/60 border-y border-silver/60">
              {FAQS.map(([q, a]) => (
                <details key={q} className="group py-3.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg leading-snug">
                    {q}<span className="text-gold transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-grey">{a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="relative isolate mt-16 overflow-hidden rounded-3xl bg-emerald-950 text-ivory shadow-[0_18px_50px_-22px_rgba(5,36,28,0.75)] ring-1 ring-gold/30">
          {BAND_VIDEO && (
            <>
              <video className="absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden" src={BAND_VIDEO} autoPlay muted loop playsInline preload="metadata" aria-hidden tabIndex={-1} />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          )}
          <div className="flex min-h-[22rem] items-end justify-center px-6 pb-12 pt-20 md:min-h-[28rem] md:pb-14">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
              <CtaButtons />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

