import { notFound } from "next/navigation";
import { AdminTitle } from "@/components/admin/admin-shell";
import { AccessoryForm } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";
import { listCategories } from "@/lib/data/catalogue";
import type { Accessory } from "@/lib/types";

export default async function EditAccessory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("accessories").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <>
      <AdminTitle title={`Edit ${(data as Accessory).name}`} />
      <div className="max-w-4xl bg-white p-7"><AccessoryForm accessory={data as Accessory} categories={await listCategories("accessory")} /></div>
    </>
  );
}
