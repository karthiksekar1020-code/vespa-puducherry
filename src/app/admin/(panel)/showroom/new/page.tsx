import { AdminTitle } from "@/components/admin/admin-shell";
import { ShowroomModelForm } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";
import { SHOWROOM_MODELS } from "@/data/showroom";

export default async function NewShowroomModel({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  await getOwnerClient();
  const { from } = await searchParams;
  // "Customise" starts from a built-in model, keeping its slug so the saved row replaces it.
  const base = SHOWROOM_MODELS.find((m) => m.slug === from);
  const model = base
    ? { slug: base.slug, name: base.name, image_url: base.image, blurb: base.blurb ?? "", colours: base.colours ?? [], top_speed: base.topSpeed ?? "", mileage: base.mileage ?? "", sort_order: 100, active: true }
    : undefined;
  return (
    <>
      <AdminTitle title={base ? `Customise ${base.name}` : "Add showroom model"} />
      <div className="max-w-4xl bg-white p-7"><ShowroomModelForm model={model} slugLocked={Boolean(base)} /></div>
    </>
  );
}
