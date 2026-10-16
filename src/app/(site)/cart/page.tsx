import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <>
      <PageHeader eyebrow="Shopping" title="Your cart" />
      <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8"><CartView /></div>
    </>
  );
}
