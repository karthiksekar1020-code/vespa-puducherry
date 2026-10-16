import { notFound } from "next/navigation";
import { AdminTitle } from "@/components/admin/admin-shell";
import { ShowroomModelForm } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";
import { SHOWROOM_MODELS } from "@/data/showroom";
import type { ShowroomModelRow } from "@/lib/data/showroom-models";

export default async function EditShowroomModel({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("showroom_models").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = data as ShowroomModelRow;
  return (
    <>
      <AdminTitle title={`Edit ${row.name}`} />
      <div className="max-w-4xl bg-white p-7"><ShowroomModelForm id={row.id} model={row} slugLocked={SHOWROOM_MODELS.some((m) => m.slug === row.slug)} /></div>
    </>
  );
}
