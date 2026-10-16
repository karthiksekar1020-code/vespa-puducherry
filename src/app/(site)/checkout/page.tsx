import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CheckoutView } from "@/components/shop/checkout-view";
import { getProfile, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  await requireUser("/checkout");
  const profile = await getProfile();
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Place your order request" />
      <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8"><CheckoutView defaultName={profile?.full_name ?? ""} defaultPhone={profile?.phone ?? ""} /></div>
    </>
  );
}
