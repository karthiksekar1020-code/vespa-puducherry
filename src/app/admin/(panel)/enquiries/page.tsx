import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { EnquiryAdminForm } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { Enquiry } from "@/lib/types";

export default async function AdminEnquiries({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await getOwnerClient();
  let q = supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Enquiry[];
  return (
    <>
      <AdminTitle title="Enquiries" />
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        {["", "new", "in_progress", "resolved", "spam"].map((s) => (
          <a key={s} href={s ? `?status=${s}` : "?"} className={`px-3 py-1.5 ${(status ?? "") === s ? "bg-emerald-900 text-ivory" : "bg-white"}`}>{s.replace("_", " ") || "all"}</a>
        ))}
      </nav>
      {rows.length === 0 ? <Empty>No enquiries{status ? ` with status “${status}”` : " yet"}.</Empty> : (
        <ul className="space-y-4">
          {rows.map((e) => (
            <li key={e.id} className="bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{e.name} <span className="font-sans text-xs text-grey">· {e.reference} · {formatDate(e.created_at)}</span></p>
                  <p className="text-sm text-grey">{e.category}{e.related ? ` · ${e.related}` : ""}</p>
                  <p className="mt-1 text-sm"><a href={`mailto:${e.email}`} className="underline">{e.email}</a>{e.phone && <> · <a href={`tel:${e.phone}`} className="underline">{e.phone}</a></>}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{e.message}</p>
                </div>
                <StatusPill status={e.status} />
              </div>
              <div className="mt-4 border-t border-silver/50 pt-2"><EnquiryAdminForm e={e} /></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
