import Link from "next/link";
import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { DeleteScooterButton, PublishToggle } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import type { Scooter } from "@/lib/types";

export default async function AdminScooters() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("scooters").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Scooter[];
  return (
    <>
      <AdminTitle title="Scooters" action={<div className="flex gap-3"><Link href="/admin/showroom" className="btn btn-outline-dark">Showroom models</Link><Link href="/admin/scooters/new" className="btn btn-emerald">Add scooter</Link></div>} />
      {rows.length === 0 ? <Empty>No scooters yet. Add the first one.</Empty> : (
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-silver/60 text-xs uppercase tracking-widest text-grey"><tr><th className="p-4">Model</th><th>Price</th><th>Availability</th><th>Status</th><th className="pr-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-silver/40">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 font-semibold">{s.name}<span className="block text-xs font-normal text-grey">{s.variant}</span></td>
                  <td>{s.price_inr != null ? `₹${Number(s.price_inr).toLocaleString("en-IN")}${s.price_verified ? "" : " (unverified)"}` : "On request"}</td>
                  <td>{s.availability.replace("_", " ")}</td>
                  <td><StatusPill status={s.published ? "published" : "draft"} /></td>
                  <td className="space-x-4 pr-4 text-right">
                    <Link href={`/admin/scooters/${s.id}`} className="text-xs uppercase tracking-widest underline">Edit</Link>
                    <PublishToggle id={s.id} published={s.published} kind="scooter" />
                    <DeleteScooterButton id={s.id} name={s.name} />
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
