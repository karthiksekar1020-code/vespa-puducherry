"use client";

import { useState } from "react";
import { ActionForm, Field, Honeypot } from "./action-form";
import { bookTestRideAction } from "@/actions/forms";
import { slotsForDay } from "@/lib/booking-logic";
import { formatTime } from "@/lib/format";
import type { HoursSettings } from "@/lib/types";

function todayIST(): string {
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function BookingForm({
  scooters, hours, defaultScooter = "", defaultName = "", defaultEmail = "", defaultPhone = "",
}: {
  scooters: { id: string; label: string }[]; hours: HoursSettings;
  defaultScooter?: string; defaultName?: string; defaultEmail?: string; defaultPhone?: string;
}) {
  const [date, setDate] = useState("");
  const slots = date ? slotsForDay(date, hours) : [];

  return (
    <ActionForm action={bookTestRideAction} submitLabel="Request test ride" resetOnSuccess className="relative">
      <Honeypot />
      <div className="grid gap-x-8 md:grid-cols-2">
        <Field name="name" label="Your name" defaultValue={defaultName} autoComplete="name" required />
        <Field name="email" label="Email" type="email" defaultValue={defaultEmail} autoComplete="email" required />
        <Field name="phone" label="Phone" type="tel" defaultValue={defaultPhone} autoComplete="tel" required hint="Indian mobile or international number" />
        <Field name="scooter_id" label="Preferred scooter" as="select" defaultValue={defaultScooter}>
          <option value="">No preference</option>
          {scooters.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Field>
        <div>
          <label htmlFor="f-date" className="label">Preferred date <span aria-hidden>*</span></label>
          <input id="f-date" name="date" type="date" min={todayIST()} className="field" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <Field name="time" label="Preferred time" as="select" required>
          <option value="">{!date ? "Choose a date first" : slots.length ? "Choose a time" : "Showroom closed that day"}</option>
          {slots.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
        </Field>
      </div>
      <Field name="message" label="Message (optional)" as="textarea" rows={3} />
      <label className="mt-6 flex items-start gap-3 text-sm text-grey">
        <input type="checkbox" name="consent" className="mt-1" required />
        <span>I agree that Vespa Puducherry may contact me about this request using the details above.</span>
      </label>
    </ActionForm>
  );
}
