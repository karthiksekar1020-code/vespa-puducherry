"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ActionForm, Field } from "@/components/forms/action-form";
import { ColorsEditor, ImageEditor, PhotoEditor, SpecsEditor } from "./editors";
import {
  saveScooterAction, saveAccessoryAction, updateBookingAction, updateEnquiryAction, updateOrderAction, saveSettingsAction,
  updateStockAction, createCategoryAction, deleteCategoryAction, deleteScooterAction, deleteAccessoryAction,
  setScooterPublishedAction, setAccessoryPublishedAction, saveShowroomModelAction, deleteShowroomModelAction, setShowroomModelActiveAction,
} from "@/actions/admin";
import type { ShowroomModelRow } from "@/lib/data/showroom-models";
import { slugify } from "@/lib/format";
import type { Accessory, Booking, Category, Enquiry, Order, Scooter, SiteSettings } from "@/lib/types";

const check = (name: string, label: string, on: boolean) => (
  <label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={on} /> {label}</label>
);

export function ScooterForm({ scooter, categories }: { scooter?: Scooter; categories: Category[] }) {
  const s = scooter;
  const [name, setName] = useState(s?.name ?? "");
  const [slug, setSlug] = useState(s?.slug ?? "");
  return (
    <ActionForm action={saveScooterAction.bind(null, s?.id ?? null)} submitLabel={s ? "Save changes" : "Create scooter"}>
      <div className="grid gap-x-8 md:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="label">Model name *</label>
          <input id="f-name" name="name" value={name} onChange={(e) => { setName(e.target.value); if (!s) setSlug(slugify(e.target.value)); }} className="field" required />
        </div>
        <div>
          <label htmlFor="f-slug" className="label">URL slug *</label>
          <input id="f-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="field" required />
        </div>
        <Field name="variant" label="Variant" defaultValue={s?.variant ?? ""} />
        <Field name="tagline" label="Tagline" defaultValue={s?.tagline ?? ""} />
        <Field name="price_inr" label="Price (₹)" type="number" min="0" step="1" defaultValue={s?.price_inr?.toString() ?? ""} hint="Leave empty for “Price on request”." />
        <Field name="availability" label="Availability" as="select" defaultValue={s?.availability ?? "on_request"}>
          <option value="available">Available</option><option value="coming_soon">Coming soon</option>
          <option value="unavailable">Currently unavailable</option><option value="on_request">Availability on request</option>
        </Field>
        <Field name="category_id" label="Category" as="select" defaultValue={s?.category_id ?? ""}>
          <option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Field>
      </div>
      {check("price_verified", "Price is verified (only then it is shown publicly)", s?.price_verified ?? false)}
      <Field name="description" label="Description" as="textarea" rows={5} defaultValue={s?.description ?? ""} />
      <Field name="features" label="Features (one per line)" as="textarea" rows={4} defaultValue={(s?.features ?? []).join("\n")} />
      <div className="mt-6 space-y-8">
        <ImageEditor name="images" initial={s?.images ?? []} />
        <ColorsEditor name="colors" initial={s?.colors ?? []} />
        <SpecsEditor name="specs" initial={s?.specs ?? []} />
      </div>
      {check("published", "Published (visible on the public website)", s?.published ?? false)}
      {check("featured", "Featured on the homepage", s?.featured ?? false)}
    </ActionForm>
  );
}

/** Add or change a showroom model. `model` may be a saved row, or a built-in model being customised (no id yet). */
export function ShowroomModelForm({ model, id, slugLocked = false }: { model?: Partial<ShowroomModelRow>; id?: string; slugLocked?: boolean }) {
  const m = model;
  const [name, setName] = useState(m?.name ?? "");
  const [slug, setSlug] = useState(m?.slug ?? "");
  return (
    <ActionForm action={saveShowroomModelAction.bind(null, id ?? null)} submitLabel={id ? "Save changes" : "Save model"}>
      <div className="grid gap-x-8 md:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="label">Model name *</label>
          <input id="f-name" name="name" value={name} onChange={(e) => { setName(e.target.value); if (!m?.slug) setSlug(slugify(e.target.value)); }} className="field" required />
        </div>
        <div>
          <label htmlFor="f-slug" className="label">URL slug *</label>
          <input id="f-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="field" readOnly={slugLocked} required />
          {slugLocked && <p className="mt-1 text-xs text-grey">Kept the same so this replaces the built-in model.</p>}
        </div>
        <Field name="top_speed" label="Top speed (optional)" defaultValue={m?.top_speed ?? ""} hint="Only enter showroom-verified figures." />
        <Field name="mileage" label="Mileage (optional)" defaultValue={m?.mileage ?? ""} hint="Only enter showroom-verified figures." />
        <Field name="sort_order" label="Display order" type="number" min="0" step="1" defaultValue={String(m?.sort_order ?? 100)} hint="Smaller numbers appear first among new models." />
      </div>
      <Field name="blurb" label="Short description" as="textarea" rows={3} defaultValue={m?.blurb ?? ""} hint="Describe only what the photo shows." />
      <div className="mt-6 space-y-8">
        <PhotoEditor name="image_url" initial={m?.image_url} />
        <ColorsEditor name="colours" initial={(m?.colours ?? []).map((c) => ({ name: c.name, hex: c.hex }))} />
        <p className="-mt-6 text-xs text-grey">Up to four. The first is the colour in the photo; the others show as a simulated colour preview.</p>
      </div>
      {check("active", "Show on the website", m?.active ?? true)}
    </ActionForm>
  );
}

export function DeleteShowroomModelButton({ id, name }: { id: string; name: string }) {
  return <ConfirmButton label="Delete" confirm={`Delete “${name}”? If it is a built-in model, the original returns.`} onConfirm={() => deleteShowroomModelAction(id)} />;
}

export function ShowroomActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className="text-xs uppercase tracking-widest underline"
      onClick={() => start(async () => { await setShowroomModelActiveAction(id, !active); router.refresh(); })}>
      {active ? "Hide" : "Show"}
    </button>
  );
}

export function AccessoryForm({ accessory, categories }: { accessory?: Accessory; categories: Category[] }) {
  const a = accessory;
  const [name, setName] = useState(a?.name ?? "");
  const [slug, setSlug] = useState(a?.slug ?? "");
  return (
    <ActionForm action={saveAccessoryAction.bind(null, a?.id ?? null)} submitLabel={a ? "Save changes" : "Create accessory"}>
      <div className="grid gap-x-8 md:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="label">Name *</label>
          <input id="f-name" name="name" value={name} onChange={(e) => { setName(e.target.value); if (!a) setSlug(slugify(e.target.value)); }} className="field" required />
        </div>
        <div>
          <label htmlFor="f-slug" className="label">URL slug *</label>
          <input id="f-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="field" required />
        </div>
        <Field name="price_inr" label="Price (₹) *" type="number" min="0" step="1" defaultValue={a?.price_inr?.toString() ?? ""} required />
        <Field name="stock" label="Stock *" type="number" min="0" step="1" defaultValue={a?.stock?.toString() ?? "0"} required />
        <Field name="category_id" label="Category" as="select" defaultValue={a?.category_id ?? ""}>
          <option value="">None</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Field>
        <Field name="compatibility" label="Compatible scooter slugs (comma separated)" defaultValue={(a?.compatibility ?? []).join(", ")} />
      </div>
      <Field name="description" label="Description" as="textarea" rows={5} defaultValue={a?.description ?? ""} />
      <div className="mt-6"><ImageEditor name="images" initial={a?.images ?? []} /></div>
      {check("published", "Published (visible on the public website)", a?.published ?? false)}
      {check("featured", "Featured", a?.featured ?? false)}
    </ActionForm>
  );
}

function ConfirmButton({ label, confirm, onConfirm }: { label: string; confirm: string; onConfirm: () => Promise<unknown> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className="text-xs uppercase tracking-widest text-red-700 hover:underline"
      onClick={() => { if (window.confirm(confirm)) start(async () => { await onConfirm(); router.refresh(); }); }}>
      {pending ? "Working…" : label}
    </button>
  );
}

export function DeleteScooterButton({ id, name }: { id: string; name: string }) {
  return <ConfirmButton label="Delete" confirm={`Delete “${name}” permanently? This cannot be undone.`} onConfirm={() => deleteScooterAction(id)} />;
}
export function DeleteAccessoryButton({ id, name }: { id: string; name: string }) {
  return <ConfirmButton label="Delete" confirm={`Delete “${name}” permanently? This cannot be undone.`} onConfirm={() => deleteAccessoryAction(id)} />;
}
export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  return <ConfirmButton label="Delete" confirm={`Delete category “${name}”? Items keep existing but lose this category.`} onConfirm={() => deleteCategoryAction(id)} />;
}

export function PublishToggle({ id, published, kind }: { id: string; published: boolean; kind: "scooter" | "accessory" }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button type="button" disabled={pending} className="text-xs uppercase tracking-widest underline"
      onClick={() => start(async () => { await (kind === "scooter" ? setScooterPublishedAction : setAccessoryPublishedAction)(id, !published); router.refresh(); })}>
      {published ? "Unpublish" : "Publish"}
    </button>
  );
}

export function CategoryForm() {
  return (
    <ActionForm action={createCategoryAction} submitLabel="Add category" resetOnSuccess submitClassName="btn btn-emerald btn-sm">
      <div className="grid gap-x-6 md:grid-cols-2">
        <Field name="name" label="Name" required />
        <Field name="kind" label="Type" as="select" defaultValue="scooter"><option value="scooter">Scooter</option><option value="accessory">Accessory</option></Field>
      </div>
    </ActionForm>
  );
}

export function StockForm({ id, stock }: { id: string; stock: number }) {
  return (
    <ActionForm action={updateStockAction.bind(null, id)} submitLabel="Save" submitClassName="btn btn-emerald btn-sm" className="flex items-end gap-3">
      <div className="w-24"><Field name="stock" label="Stock" type="number" min="0" step="1" defaultValue={String(stock)} /></div>
    </ActionForm>
  );
}

export function BookingForm({ b }: { b: Booking }) {
  return (
    <ActionForm action={updateBookingAction.bind(null, b.id)} submitLabel="Update booking" submitClassName="btn btn-emerald btn-sm">
      <div className="grid gap-x-6 md:grid-cols-3">
        <Field name="status" label="Status" as="select" defaultValue={b.status}>
          {["pending", "confirmed", "rejected", "rescheduled", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Field>
        <Field name="date" label="Date" type="date" defaultValue={b.preferred_date} />
        <Field name="time" label="Time" type="time" defaultValue={b.preferred_time.slice(0, 5)} />
      </div>
      <Field name="admin_notes" label="Internal notes" as="textarea" rows={2} defaultValue={b.admin_notes ?? ""} />
    </ActionForm>
  );
}

export function EnquiryAdminForm({ e }: { e: Enquiry }) {
  return (
    <ActionForm action={updateEnquiryAction.bind(null, e.id)} submitLabel="Update" submitClassName="btn btn-emerald btn-sm">
      <Field name="status" label="Status" as="select" defaultValue={e.status}>
        {["new", "in_progress", "resolved", "spam"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
      </Field>
      <Field name="admin_notes" label="Internal notes" as="textarea" rows={2} defaultValue={e.admin_notes ?? ""} />
    </ActionForm>
  );
}

export function OrderAdminForm({ o }: { o: Order & { payment_reference?: string | null } }) {
  return (
    <ActionForm action={updateOrderAction.bind(null, o.id)} submitLabel="Update order" submitClassName="btn btn-emerald btn-sm">
      <div className="grid gap-x-6 md:grid-cols-3">
        <Field name="status" label="Fulfilment" as="select" defaultValue={o.status}>
          {["requested", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Field>
        <Field name="payment_status" label="Payment" as="select" defaultValue={o.payment_status}>
          {["unpaid", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
        </Field>
        <Field name="payment_reference" label="Payment reference" defaultValue={o.payment_reference ?? ""} hint="Required to mark as paid" />
      </div>
      <Field name="admin_notes" label="Internal notes" as="textarea" rows={2} defaultValue={o.admin_notes ?? ""} />
    </ActionForm>
  );
}

export function SettingsForms({ settings }: { settings: SiteSettings }) {
  const { business: b, social: so, commerce: c, hours: h } = settings;
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  return (
    <div className="space-y-10">
      <section className="bg-white p-7"><h2 className="text-2xl">Business details</h2>
        <ActionForm action={saveSettingsAction.bind(null, "business")} submitLabel="Save" submitClassName="btn btn-emerald btn-sm">
          <Field name="name" label="Business name" defaultValue={b.name} />
          <Field name="address" label="Showroom address" as="textarea" rows={2} defaultValue={b.address} />
          <div className="grid gap-x-6 md:grid-cols-3">
            <Field name="phone" label="Phone" defaultValue={b.phone} /><Field name="email" label="Email" defaultValue={b.email} /><Field name="whatsapp" label="WhatsApp" defaultValue={b.whatsapp} />
          </div>
        </ActionForm></section>
      <section className="bg-white p-7"><h2 className="text-2xl">Business hours (test ride slots)</h2>
        <ActionForm action={saveSettingsAction.bind(null, "hours")} submitLabel="Save" submitClassName="btn btn-emerald btn-sm">
          {days.map((d) => (
            <div key={d} className="mt-3 flex flex-wrap items-center gap-4">
              <span className="w-12 text-sm uppercase">{d}</span>
              <input type="time" name={`${d}_open`} defaultValue={h.days[d]?.[0] ?? "10:00"} aria-label={`${d} opens`} className="field !w-32" />
              <input type="time" name={`${d}_close`} defaultValue={h.days[d]?.[1] ?? "19:00"} aria-label={`${d} closes`} className="field !w-32" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={`${d}_closed`} defaultChecked={!h.days[d]} /> Closed</label>
            </div>
          ))}
          <Field name="slot_minutes" label="Slot length (minutes)" as="select" defaultValue={String(h.slot_minutes)}>
            {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m}</option>)}
          </Field>
        </ActionForm></section>
      <section className="bg-white p-7"><h2 className="text-2xl">Social links</h2>
        <ActionForm action={saveSettingsAction.bind(null, "social")} submitLabel="Save" submitClassName="btn btn-emerald btn-sm">
          <Field name="instagram" label="Instagram URL" defaultValue={so.instagram} /><Field name="facebook" label="Facebook URL" defaultValue={so.facebook} /><Field name="youtube" label="YouTube URL" defaultValue={so.youtube} /><Field name="x" label="X (Twitter) URL" defaultValue={so.x} /><Field name="linkedin" label="LinkedIn URL" defaultValue={so.linkedin} />
        </ActionForm></section>
      <section className="bg-white p-7"><h2 className="text-2xl">Shipping & tax</h2>
        <ActionForm action={saveSettingsAction.bind(null, "commerce")} submitLabel="Save" submitClassName="btn btn-emerald btn-sm">
          <div className="grid gap-x-6 md:grid-cols-3">
            <Field name="shipping_flat" label="Flat shipping (₹)" type="number" min="0" defaultValue={String(c.shipping_flat)} />
            <Field name="free_shipping_over" label="Free shipping over (₹)" type="number" min="0" defaultValue={c.free_shipping_over?.toString() ?? ""} />
            <Field name="tax_percent" label="Tax (%)" type="number" min="0" max="100" step="0.01" defaultValue={String(c.tax_percent)} />
          </div>
        </ActionForm></section>
    </div>
  );
}
