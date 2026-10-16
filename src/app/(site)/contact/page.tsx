import type { Metadata } from "next";
import { ContactHero } from "@/components/home/contact-hero";
import { ContactShowroomCard } from "@/components/home/contact-showroom-card";
import { Reveal } from "@/components/ui/reveal";
import { ShowroomMap } from "@/components/home/showroom-map";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ related?: string; category?: string }> }) {
  const sp = await searchParams;
  const { business } = (await getSettings());
  return (
    <>
      <ContactHero eyebrow="Get in touch" title="Contact & enquiries">Send us a message and we will reply by email.</ContactHero>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <Reveal><EnquiryForm related={sp.related ?? ""} category={sp.category ?? ""} /></Reveal>
        <ContactShowroomCard address={business.address} phone={business.phone} email={business.email} />
      </div>
      <Reveal className="mx-auto max-w-6xl px-5 pb-20 lg:px-8"><ShowroomMap className="max-w-3xl" /></Reveal>
    </>
  );
}
