import { AdminTitle } from "@/components/admin/admin-shell";
import { ScooterForm } from "@/components/admin/admin-forms";
import { listCategories } from "@/lib/data/catalogue";

export default async function NewScooter() {
  return (
    <>
      <AdminTitle title="Add scooter" />
      <div className="max-w-4xl bg-white p-7"><ScooterForm categories={await listCategories("scooter")} /></div>
    </>
  );
}
