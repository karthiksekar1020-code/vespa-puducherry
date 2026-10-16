import type { Metadata } from "next";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { CompareTable } from "@/components/home/compare-table";
import { getShowroomModels } from "@/lib/data/showroom-models";

export const metadata: Metadata = { title: "Compare bikes", description: "Compare the Vespa models at Vespa Puducherry side by side." };

export default async function ComparePage() {
  const models = await getShowroomModels();
  return (
    <>
      <PageHeader eyebrow="Side by side" title="Compare bikes">Choose two to four models and compare their figures. Highlighted rows show where they differ.</PageHeader>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-14 lg:px-8">
        <Notice tone="warn">
          These four models are not listed on vespaindia.com any more and are marked discontinued by the source used here. Figures come from BikeWale (a third party), not Vespa India, and may differ between its own sections. Anything not confirmed shows &ldquo;Not officially confirmed&rdquo;. Please confirm details and availability with the showroom.
        </Notice>
        <CompareTable models={models} />
      </div>
    </>
  );
}
