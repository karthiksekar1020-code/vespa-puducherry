import type { ReactNode } from "react";
import Image from "next/image";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden items-center justify-center overflow-hidden bg-[#d9d9d9] p-12 text-ivory lg:flex">
        <Image src="/site/vespa-lineup.webp" alt="" fill priority quality={95} sizes="50vw" className="object-contain object-[50%_40%]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent" />
        <p className="absolute inset-x-12 bottom-12 font-display text-4xl leading-tight">Iconic design.<br />Timeless freedom.</p>
      </aside>
      <section className="flex items-center justify-center px-5 pb-16 pt-32 lg:px-16">
        <div className="w-full max-w-md">
          <h1 className="text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-grey">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </div>
  );
}
