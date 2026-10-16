import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { getProfile } from "@/lib/auth";

/** Shown only to the signed-in owner: quick links to add a new bike model or update the photos of existing ones. */
export async function OwnerModelBar() {
  let owner = false;
  try {
    owner = (await getProfile())?.role === "owner";
  } catch {
    owner = false;
  }
  if (!owner) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/40 bg-white px-5 py-4 shadow-[0_14px_40px_-26px_rgba(5,36,28,0.5)]">
      <p className="mr-auto text-xs font-semibold uppercase tracking-[0.18em] text-grey">Owner tools</p>
      <Link href="/admin/showroom/new" className="btn btn-emerald btn-sm"><Plus size={14} /> Add new model</Link>
      <Link href="/admin/showroom" className="btn btn-outline-dark btn-sm"><Pencil size={14} /> Update model photos</Link>
    </div>
  );
}
