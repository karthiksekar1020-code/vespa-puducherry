import { notFound } from "next/navigation";
import { AdminTitle } from "@/components/admin/admin-shell";
import { ScooterForm } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";
import { listCategories } from "@/lib/data/catalogue";
import type { Scooter } from "@/lib/types";

export default async function EditScooter({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("scooters").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminTitle title={`Edit ${(data as Scooter).name}`} />
      <div className="max-w-4xl bg-white p-7"><ScooterForm scooter={data as Scooter} categories={await listCategories("scooter")} /></div>
    </>
  );
}
