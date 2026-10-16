"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/forms/action-form";
import { Notice } from "@/components/ui/page-header";
import { placeOrderAction } from "@/actions/shop";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart-context";
import { usePricedCart } from "./use-priced-cart";

export function CheckoutView({ defaultName, defaultPhone }: { defaultName: string; defaultPhone: string }) {
  const { ready } = useCart();
  const { priced, loading } = usePricedCart();

  if (!ready || (loading && !priced)) return <div className="skeleton h-64" />;
  if (!priced || priced.lines.length === 0) {
    return <div className="text-center"><p className="font-display text-2xl">Your cart is empty</p><Link href="/accessories" className="btn btn-emerald mt-6">Browse accessories</Link></div>;
  }
  const blocked = priced.lines.some((l) => !l.available);
  const payload = JSON.stringify(priced.lines.filter((l) => l.available).map((l) => ({ id: l.id, quantity: l.quantity })));


  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-6">
          <Notice tone="warn">
            <strong>Order request, not an online payment.</strong> Online payments are not enabled on this website yet. Placing this request reserves the items and the showroom will contact you to arrange payment and delivery. Nothing is charged now.
          </Notice>
        </div>
        <ActionForm action={placeOrderAction} submitLabel="Place order request">
          <input type="hidden" name="items" value={payload} />
          <div className="grid gap-x-8 md:grid-cols-2">
            <Field name="contact_name" label="Full name" defaultValue={defaultName} autoComplete="name" required />
            <Field name="contact_phone" label="Phone" type="tel" defaultValue={defaultPhone} autoComplete="tel" required />
          </div>
          <Field name="line1" label="Address" autoComplete="street-address" required />
          <div className="grid gap-x-8 md:grid-cols-3">
            <Field name="city" label="City" autoComplete="address-level2" required />
            <Field name="state" label="State" autoComplete="address-level1" required />
            <Field name="pincode" label="PIN code" autoComplete="postal-code" required />
          </div>
          <Field name="notes" label="Notes (optional)" as="textarea" rows={3} />
        </ActionForm>
        {blocked && <p className="err mt-4">Some items are out of stock and are excluded from this request. <Link href="/cart" className="underline">Review cart</Link></p>}
      </div>
      <aside className="h-fit bg-white p-7">
        <h2 className="text-2xl">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {priced.lines.filter((l) => l.available).map((l) => <li key={l.id} className="flex justify-between gap-4"><span>{l.name} × {l.quantity}</span><span>{formatINR(l.unit_price * l.quantity)}</span></li>)}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-silver/60 pt-4 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(priced.totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{formatINR(priced.totals.shipping)}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{formatINR(priced.totals.tax)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatINR(priced.totals.total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
