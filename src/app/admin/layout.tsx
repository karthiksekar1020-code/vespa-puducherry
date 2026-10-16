import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin · Vespa Puducherry" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ivory">{children}</div>;
}
