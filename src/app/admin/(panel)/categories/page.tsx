import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { CategoryForm, DeleteCategoryButton } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";
import type { Category } from "@/lib/types";

export default async function AdminCategories() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("categories").select("*").order("kind").order("name");
  const rows = (data ?? []) as Category[];
  return (
    <>
      <AdminTitle title="Categories" />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <section className="h-fit bg-white p-7"><h2 className="text-2xl">New category</h2><CategoryForm /></section>
        <section>
          {rows.length === 0 ? <Empty>No categories yet. Tip: create “Classic Elegance”, “Modern Style”, “Sporty Design”, “Premium Collections” and “Urban Riding” (scooter type) to power the homepage style tiles.</Empty> : (
            <ul className="divide-y divide-silver/50 bg-white text-sm">
              {rows.map((c) => <li key={c.id} className="flex items-center justify-between p-4"><span>{c.name} <span className="ml-2 text-xs uppercase tracking-widest text-grey">{c.kind}</span></span><DeleteCategoryButton id={c.id} name={c.name} /></li>)}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
