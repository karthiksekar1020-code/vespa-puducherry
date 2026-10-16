import type { Metadata } from "next";
import Link from "next/link";
import { AboutPhoto } from "@/components/home/about-photo";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="About Vespa Puducherry" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <AboutPhoto src="/site/vespa-heritage.jpg" alt="Front of a classic green Vespa with its round headlight and gold badge" />
        <Stagger className="space-y-12">
          <StaggerItem>
            <section>
              <h2 className="text-3xl">The Vespa heritage</h2>
              <p className="mt-4 leading-relaxed text-grey">Vespa, Italian for &ldquo;wasp&rdquo;, was introduced by Piaggio in 1946. Its pressed-steel monocoque body, designed with Corradino D&rsquo;Ascanio, set it apart from the motorcycles of its day and helped define scooter culture around the world.</p>
            </section>
          </StaggerItem>
          <StaggerItem>
            <section>
              <h2 className="text-3xl">Our showroom</h2>
              <p className="mt-4 italic leading-relaxed text-grey">The showroom&rsquo;s own story, team and credentials have not been added yet. We make no claims about dealership status, partnerships, awards or service facilities until the owner confirms them.</p>
            </section>
          </StaggerItem>
          <StaggerItem><Link href="/contact" className="btn btn-emerald">Contact the showroom</Link></StaggerItem>
        </Stagger>
      </div>
    </>
  );
}
