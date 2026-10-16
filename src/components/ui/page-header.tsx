import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="bg-emerald-950 px-5 pb-14 pt-36 text-ivory lg:px-8">
      <div className="mx-auto max-w-7xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 text-5xl md:text-6xl">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-ivory/70">{children}</div>}
      </div>
    </header>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error"; children: ReactNode }) {
  const cls = tone === "error" ? "border-red-300 bg-red-50 text-red-900" : tone === "warn" ? "border-gold/50 bg-gold/10 text-charcoal" : "border-emerald-800/30 bg-emerald-800/5 text-emerald-950";
  return <div role={tone === "error" ? "alert" : "note"} className={`border px-5 py-4 text-sm ${cls}`}>{children}</div>;
}
