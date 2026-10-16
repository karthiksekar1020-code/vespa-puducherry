import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { getOwnerClient } from "@/lib/admin";
import { formatDate } from "@/lib/format";

export default async function AdminCustomers() {
  const supabase = await getOwnerClient();
  const { data } = await supabase.from("profiles").select("id, full_name, phone, role, created_at").order("created_at", { ascending: false }).limit(500);
  const rows = data ?? [];
  return (
    <>
      <AdminTitle title="Customers" />
      {rows.length === 0 ? <Empty>No customers yet.</Empty> : (
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-silver/60 text-xs uppercase tracking-widest text-grey"><tr><th className="p-4">Name</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody className="divide-y divide-silver/40">
              {rows.map((c) => <tr key={c.id}><td className="p-4 font-semibold">{c.full_name || "—"}</td><td>{c.phone ?? "—"}</td><td className="uppercase">{c.role}</td><td>{formatDate(c.created_at)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-grey">Roles can only be changed by the server-side setup script, never from this panel.</p>
    </>
  );
}
