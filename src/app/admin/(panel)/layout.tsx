import { AdminShell } from "@/components/admin/admin-shell";
import { requireOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner(); // server-side role check on EVERY admin render
  return <AdminShell name={owner.full_name || "Owner"}>{children}</AdminShell>;
}
