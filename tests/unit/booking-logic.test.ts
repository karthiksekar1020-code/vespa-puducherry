import { describe, expect, it } from "vitest";
import { dayKey, slotsForDay, validateSlot } from "@/lib/booking-logic";
import type { HoursSettings } from "@/lib/types";

const hours: HoursSettings = {
  days: { mon: ["10:00", "19:00"], tue: ["10:00", "19:00"], wed: ["10:00", "19:00"], thu: ["10:00", "19:00"], fri: ["10:00", "19:00"], sat: ["10:00", "14:00"], sun: null },
  slot_minutes: 60,
};
// Monday 5 Jan 2026, 09:00 IST
const now = new Date("2026-01-05T09:00:00+05:30");

describe("dayKey", () => {
  it("maps calendar dates to weekday keys", () => {
    expect(dayKey("2026-01-05")).toBe("mon");
    expect(dayKey("2026-01-11")).toBe("sun");
  });
});

describe("validateSlot", () => {
  it("accepts a future slot inside business hours", () => {
    expect(validateSlot("2026-01-06", "11:00", hours, now)).toEqual({ ok: true });
  });
  it("rejects past times", () => {
    const r = validateSlot("2026-01-05", "08:00", hours, now);
    expect(r.ok).toBe(false);
  });
  it("rejects closed days", () => {
    const r = validateSlot("2026-01-11", "11:00", hours, now);
    expect(r).toMatchObject({ ok: false });
  });
  it("rejects times outside hours or overrunning closing time", () => {
    expect(validateSlot("2026-01-06", "09:00", hours, now).ok).toBe(false);
    expect(validateSlot("2026-01-06", "18:30", hours, now).ok).toBe(false);
    expect(validateSlot("2026-01-10", "13:00", hours, now).ok).toBe(true);
    expect(validateSlot("2026-01-10", "14:00", hours, now).ok).toBe(false);
  });
  it("rejects malformed input", () => {
    expect(validateSlot("tomorrow", "noon", hours, now).ok).toBe(false);
    expect(validateSlot("2026-13-45", "10:00", hours, now).ok).toBe(false);
  });
});

describe("slotsForDay", () => {
  it("lists hourly slots", () => {
    expect(slotsForDay("2026-01-10", hours)).toEqual(["10:00", "11:00", "12:00", "13:00"]);
  });
  it("is empty when closed", () => {
    expect(slotsForDay("2026-01-11", hours)).toEqual([]);
  });
});
