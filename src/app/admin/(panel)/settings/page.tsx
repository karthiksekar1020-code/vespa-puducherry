import { AdminTitle } from "@/components/admin/admin-shell";
import { SettingsForms } from "@/components/admin/admin-forms";
import { getSettings } from "@/lib/data/settings";

export default async function AdminSettings() {
  return (
    <>
      <AdminTitle title="Settings" />
      <div className="max-w-3xl"><SettingsForms settings={await getSettings()} /></div>
    </>
  );
}
