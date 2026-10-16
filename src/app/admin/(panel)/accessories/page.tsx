import Link from "next/link";
import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { DeleteAccessoryButton, PublishToggle } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { formatINR } from "@/lib/format";
import type { Accessory } from "@/lib/types";

export default async function AdminAccessories() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("accessories").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Accessory[];
  return (
    <>
      <AdminTitle title="Accessories" action={<Link href="/admin/accessories/new" className="btn btn-emerald">Add accessory</Link>} />
      {rows.length === 0 ? <Empty>No accessories yet.</Empty> : (
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-silver/60 text-xs uppercase tracking-widest text-grey"><tr><th className="p-4">Name</th><th>Price</th><th>Stock</th><th>Status</th><th className="pr-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-silver/40">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="p-4 font-semibold">{a.name}</td><td>{formatINR(Number(a.price_inr))}</td><td>{a.stock}</td>
                  <td><StatusPill status={a.published ? "published" : "draft"} /></td>
                  <td className="space-x-4 pr-4 text-right">
                    <Link href={`/admin/accessories/${a.id}`} className="text-xs uppercase tracking-widest underline">Edit</Link>
                    <PublishToggle id={a.id} published={a.published} kind="accessory" />
                    <DeleteAccessoryButton id={a.id} name={a.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
