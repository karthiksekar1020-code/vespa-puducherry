import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/actions/auth";

const LINKS: [string, string][] = [
  ["Dashboard", "/admin"], ["Scooters", "/admin/scooters"], ["Showroom models", "/admin/showroom"], ["Accessories", "/admin/accessories"], ["Categories", "/admin/categories"],
  ["Bookings", "/admin/bookings"], ["Enquiries", "/admin/enquiries"], ["Orders", "/admin/orders"], ["Customers", "/admin/customers"],
  ["Inventory", "/admin/inventory"], ["Settings", "/admin/settings"],
];

export function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="bg-emerald-950 p-5 text-ivory lg:min-h-screen">
        <Link href="/admin" className="block font-display text-2xl tracking-[0.12em]">VESPA <span className="block text-[0.55rem] tracking-[0.4em] text-gold">ADMIN</span></Link>
        <nav aria-label="Admin" className="mt-6 flex gap-1 overflow-x-auto lg:flex-col">
          {LINKS.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap px-3 py-2 text-xs uppercase tracking-[0.16em] hover:bg-emerald-800">{label}</Link>)}
        </nav>
        <div className="mt-8 border-t border-ivory/10 pt-4 text-xs text-ivory/60">
          <p>{name}</p>
          <Link href="/" className="mt-2 block underline">View website</Link>
          <form action={logoutAction}><button className="mt-2 underline">Sign out</button></form>
        </div>
      </aside>
      <div className="min-w-0 p-5 lg:p-10">{children}</div>
    </div>
  );
}

export function AdminTitle({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl">{title}</h1>{action}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="border border-dashed border-silver p-10 text-center text-sm text-grey">{children}</div>;
}
