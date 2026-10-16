import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { BookingForm } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { formatDate, formatTime } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await getOwnerClient();
  let q = supabase.from("bookings").select("*").order("preferred_date", { ascending: true }).limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as Booking[];
  return (
    <>
      <AdminTitle title="Test ride bookings" />
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
        {["", "pending", "confirmed", "rescheduled", "completed", "rejected", "cancelled"].map((s) => (
          <a key={s} href={s ? `?status=${s}` : "?"} className={`px-3 py-1.5 ${(status ?? "") === s ? "bg-emerald-900 text-ivory" : "bg-white"}`}>{s || "all"}</a>
        ))}
      </nav>
      {rows.length === 0 ? <Empty>No bookings{status ? ` with status “${status}”` : " yet"}.</Empty> : (
        <ul className="space-y-4">
          {rows.map((b) => (
            <li key={b.id} className="bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{b.name} <span className="font-sans text-xs text-grey">· {b.reference}</span></p>
                  <p className="text-sm text-grey">{b.scooter_label ?? "No scooter preference"} · {formatDate(b.preferred_date)} at {formatTime(b.preferred_time)}</p>
                  <p className="mt-1 text-sm"><a href={`mailto:${b.email}`} className="underline">{b.email}</a> · <a href={`tel:${b.phone}`} className="underline">{b.phone}</a></p>
                  {b.message && <p className="mt-2 text-sm italic">“{b.message}”</p>}
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="mt-4 border-t border-silver/50 pt-2"><BookingForm b={b} /></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
