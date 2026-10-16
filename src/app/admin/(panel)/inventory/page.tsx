import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { StockForm } from "@/components/admin/admin-forms";
import { getOwnerClient } from "@/lib/admin";

export default async function AdminInventory() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("accessories").select("id, name, stock").order("stock").order("name");
  const rows = data ?? [];
  return (
    <>
      <AdminTitle title="Inventory" />
      {rows.length === 0 ? <Empty>No accessories to track yet.</Empty> : (
        <ul className="divide-y divide-silver/50 bg-white">
          {rows.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <span className="font-semibold">{a.name}{a.stock <= 5 && <span className="ml-3 text-xs uppercase tracking-widest text-red-700">{a.stock === 0 ? "Out of stock" : "Low"}</span>}</span>
              <StockForm id={a.id} stock={a.stock} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-grey">Scooter availability is a showroom-set label, not tracked stock. Edit it on the scooter itself.</p>
    </>
  );
}
