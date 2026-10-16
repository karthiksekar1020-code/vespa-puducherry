import type { Metadata } from "next";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { BookingForm } from "@/components/forms/booking-form";
import { listScooters } from "@/lib/data/catalogue";
import { getSettings } from "@/lib/data/settings";
import { getProfile, getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Book a test ride" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ scooter?: string }> }) {
  const sp = await searchParams;
  const [settings, scooters, user, profile] = await Promise.all([getSettings(), listScooters({ pageSize: 100 }), getUser(), getProfile()]);
  const options = scooters.data.items.map((s) => ({ id: s.id, label: [s.name, s.variant].filter(Boolean).join(" ") }));
  return (
    <>
      <PageHeader eyebrow="Test ride" title="Book a test ride">Choose a scooter and a time. The showroom confirms every request personally.</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <BookingForm
            scooters={options} hours={settings.hours} defaultScooter={options.some((o) => o.id === sp.scooter) ? sp.scooter : ""}
            defaultName={profile?.full_name ?? ""} defaultEmail={user?.email ?? ""} defaultPhone={profile?.phone ?? ""}
          />
        </div>
        <aside className="space-y-4 text-sm">
          <Notice>Submitting this form creates a <strong>pending</strong> request. It is confirmed only when the showroom approves a slot.</Notice>
          <div className="bg-white p-6">
            <h2 className="text-xl">Showroom hours</h2>
            <ul className="mt-3 space-y-1 text-grey">
              {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((d) => (
                <li key={d} className="flex justify-between"><span className="uppercase">{d}</span><span>{settings.hours.days[d] ? `${settings.hours.days[d]![0]} – ${settings.hours.days[d]![1]}` : "Closed"}</span></li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
