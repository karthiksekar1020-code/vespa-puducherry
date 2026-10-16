import type { HoursSettings } from "@/lib/types";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export const IST_OFFSET = "+05:30";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Day-of-week key for a YYYY-MM-DD date (calendar date, timezone independent). */
export function dayKey(date: string): (typeof DAY_KEYS)[number] {
  const [y, m, d] = date.split("-").map(Number);
  return DAY_KEYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Current time in Puducherry (IST) as a Date-like instant. */
export function slotInstant(date: string, time: string): Date {
  return new Date(`${date}T${time.slice(0, 5)}:00${IST_OFFSET}`);
}

export type SlotCheck = { ok: true } | { ok: false; reason: string };

export function validateSlot(date: string, time: string, hours: HoursSettings, now: Date = new Date()): SlotCheck {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}/.test(time)) return { ok: false, reason: "Invalid date or time." };
  const instant = slotInstant(date, time);
  if (Number.isNaN(instant.getTime())) return { ok: false, reason: "Invalid date or time." };
  if (instant.getTime() <= now.getTime()) return { ok: false, reason: "Please choose a date and time in the future." };
  const window = hours.days[dayKey(date)];
  if (!window) return { ok: false, reason: "The showroom is closed on the selected day." };
  const t = toMinutes(time);
  if (t < toMinutes(window[0]) || t + hours.slot_minutes > toMinutes(window[1])) {
    return { ok: false, reason: `Please choose a time between ${window[0]} and ${window[1]} (slots are ${hours.slot_minutes} minutes).` };
  }
  return { ok: true };
}

/** Bookable slot start times for a day. */
export function slotsForDay(date: string, hours: HoursSettings): string[] {
  const window = hours.days[dayKey(date)];
  if (!window) return [];
  const out: string[] = [];
  for (let t = toMinutes(window[0]); t + hours.slot_minutes <= toMinutes(window[1]); t += hours.slot_minutes) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}
