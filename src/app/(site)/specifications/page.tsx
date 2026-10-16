import type { Metadata } from "next";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { SpecificationsView } from "@/components/home/specifications-view";
import { getShowroomModels } from "@/lib/data/showroom-models";

export const metadata: Metadata = { title: "Specifications", description: "Full specification sheets for the Vespa models at Vespa Puducherry." };

export default async function SpecificationsPage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model } = await searchParams;
  const models = await getShowroomModels();
  return (
    <>
      <PageHeader eyebrow="The details" title="Specifications">Pick a model to see its full specification sheet.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-14 lg:px-8">
        <Notice tone="warn">
          Figures come from BikeWale (a third party), not Vespa India, because these models are no longer listed on vespaindia.com. Anything not confirmed shows &ldquo;Not officially confirmed&rdquo;. Please confirm details and availability with the showroom.
        </Notice>
        <SpecificationsView initial={model} models={models} />
      </div>
    </>
  );
}
