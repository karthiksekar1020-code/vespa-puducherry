"use client";

import { ActionForm, Field, Honeypot, SelectField } from "./action-form";
import { submitEnquiryAction } from "@/actions/forms";
import { ENQUIRY_CATEGORIES } from "@/lib/validation/schemas";

export function EnquiryForm({ related = "", category = "" }: { related?: string; category?: string }) {
  return (
    <ActionForm action={submitEnquiryAction} submitLabel="Send enquiry" resetOnSuccess className="form-card relative">
      <Honeypot />
      <div className="grid gap-x-8 md:grid-cols-2">
        <Field name="name" label="Name" autoComplete="name" required />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
        <SelectField name="category" label="Enquiry category" options={ENQUIRY_CATEGORIES} defaultValue={category} required />
      </div>
      <Field name="related" label="Related scooter or accessory (optional)" defaultValue={related} />
      <Field name="message" label="Message" as="textarea" rows={3} required />
    </ActionForm>
  );
}
