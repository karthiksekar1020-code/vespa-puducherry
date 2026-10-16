import { AdminTitle } from "@/components/admin/admin-shell";
import { AccessoryForm } from "@/components/admin/admin-forms";
import { listCategories } from "@/lib/data/catalogue";

export default async function NewAccessory() {
  return (
    <>
      <AdminTitle title="Add accessory" />
      <div className="max-w-4xl bg-white p-7"><AccessoryForm categories={await listCategories("accessory")} /></div>
    </>
  );
}
