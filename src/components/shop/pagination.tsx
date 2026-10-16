import Link from "next/link";
import { buildQuery } from "@/lib/url";

export function Pagination({ page, pages, basePath, params }: { page: number; pages: number; basePath: string; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => `${basePath}${buildQuery({ ...params, page: p > 1 ? p : undefined })}`;
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} className="btn btn-outline-dark btn-sm" rel="prev">Previous</Link>}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={href(p)} aria-current={p === page ? "page" : undefined} className={`flex h-10 w-10 items-center justify-center text-sm ${p === page ? "bg-emerald-900 text-ivory" : "hover:bg-ivory-dark"}`}>{p}</Link>
      ))}
      {page < pages && <Link href={href(page + 1)} className="btn btn-outline-dark btn-sm" rel="next">Next</Link>}
    </nav>
  );
}
