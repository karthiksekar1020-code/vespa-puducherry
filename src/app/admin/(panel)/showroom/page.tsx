import Image from "next/image";
import Link from "next/link";
import { AdminTitle, Empty } from "@/components/admin/admin-shell";
import { DeleteShowroomModelButton, ShowroomActiveToggle } from "@/components/admin/admin-forms";
import { StatusPill } from "@/components/ui/status-pill";
import { getOwnerClient } from "@/lib/admin";
import { listShowroomRows } from "@/lib/data/showroom-models";
import { SHOWROOM_MODELS } from "@/data/showroom";

export default async function AdminShowroomModels() {
  await getOwnerClient();
  const rows = await listShowroomRows();
  const saved = new Set(rows.map((r) => r.slug));
  const untouched = SHOWROOM_MODELS.filter((m) => !saved.has(m.slug));
  return (
    <>
      <AdminTitle title="Showroom models" action={<Link href="/admin/showroom/new" className="btn btn-emerald">Add model</Link>} />
      <p className="mb-6 max-w-2xl text-sm text-grey">These are the bikes shown in “At the showroom”, the gallery, compare and specifications pages. Add a new model with its photo, or customise a built-in one to change its photo and details.</p>
      {rows.length === 0 && untouched.length === 0 ? <Empty>No models yet.</Empty> : (
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-silver/60 text-xs uppercase tracking-widest text-grey"><tr><th className="p-4">Model</th><th>Source</th><th>Status</th><th className="pr-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-silver/40">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="flex items-center gap-4 p-4 font-semibold">
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-ivory"><Image src={r.image_url} alt="" fill sizes="64px" className="object-contain p-1" /></span>{r.name}
                  </td>
                  <td className="text-grey">{SHOWROOM_MODELS.some((m) => m.slug === r.slug) ? "Customised built-in" : "Added"}</td>
                  <td><StatusPill status={r.active ? "published" : "draft"} /></td>
                  <td className="space-x-4 pr-4 text-right">
                    <Link href={`/admin/showroom/${r.id}`} className="text-xs uppercase tracking-widest underline">Edit</Link>
                    <ShowroomActiveToggle id={r.id} active={r.active} />
                    <DeleteShowroomModelButton id={r.id} name={r.name} />
                  </td>
                </tr>
              ))}
              {untouched.map((m) => (
                <tr key={m.slug}>
                  <td className="flex items-center gap-4 p-4 font-semibold">
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-ivory"><Image src={m.image} alt="" fill sizes="64px" className="object-contain p-1" /></span>{m.name}
                  </td>
                  <td className="text-grey">Built-in</td>
                  <td><StatusPill status="published" /></td>
                  <td className="pr-4 text-right"><Link href={`/admin/showroom/new?from=${m.slug}`} className="text-xs uppercase tracking-widest underline">Customise</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
