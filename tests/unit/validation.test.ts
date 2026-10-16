import { describe, expect, it } from "vitest";
import { bookingSchema, checkoutSchema, enquirySchema, passwordSchema, registerSchema } from "@/lib/validation/schemas";
import { safeNext } from "@/lib/auth";
import { slugify } from "@/lib/format";

describe("passwordSchema", () => {
  it("enforces the policy", () => {
    expect(passwordSchema.safeParse("short1A").success).toBe(false);
    expect(passwordSchema.safeParse("alllowercase1").success).toBe(false);
    expect(passwordSchema.safeParse("NoDigitsHere").success).toBe(false);
    expect(passwordSchema.safeParse("GoodPass123").success).toBe(true);
  });
});

describe("registerSchema", () => {
  const base = { full_name: "Asha Rao", email: "ASHA@Example.com", password: "GoodPass123", confirm: "GoodPass123" };
  it("normalises email and accepts valid input", () => {
    const r = registerSchema.safeParse(base);
    expect(r.success && r.data.email).toBe("asha@example.com");
  });
  it("rejects mismatched passwords", () => {
    expect(registerSchema.safeParse({ ...base, confirm: "Different123" }).success).toBe(false);
  });
});

describe("bookingSchema", () => {
  const ok = { name: "Asha", email: "a@b.co", phone: "9876543210", date: "2026-02-01", time: "11:00", consent: "on" };
  it("accepts a valid request", () => expect(bookingSchema.safeParse(ok).success).toBe(true));
  it("rejects a bad phone", () => expect(bookingSchema.safeParse({ ...ok, phone: "12" }).success).toBe(false));
  it("requires consent", () => expect(bookingSchema.safeParse({ ...ok, consent: undefined }).success).toBe(false));
  it("rejects a filled honeypot", () => expect(bookingSchema.safeParse({ ...ok, website: "http://spam" }).success).toBe(false));
});

describe("enquirySchema", () => {
  it("requires a known category and a real message", () => {
    const base = { name: "Asha", email: "a@b.co", category: "Other", message: "Tell me more about colours" };
    expect(enquirySchema.safeParse(base).success).toBe(true);
    expect(enquirySchema.safeParse({ ...base, category: "Hack" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...base, message: "hi" }).success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("validates PIN codes", () => {
    const base = { contact_name: "Asha", contact_phone: "9876543210", line1: "12 Beach Rd", city: "Puducherry", state: "Puducherry" };
    expect(checkoutSchema.safeParse({ ...base, pincode: "605001" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, pincode: "6050" }).success).toBe(false);
  });
});

describe("safeNext (open-redirect protection)", () => {
  it("allows only same-site relative paths", () => {
    expect(safeNext("/orders/1")).toBe("/orders/1");
    expect(safeNext("//evil.com")).toBe("/account");
    expect(safeNext("https://evil.com")).toBe("/account");
    expect(safeNext("/\\evil.com")).toBe("/account");
    expect(safeNext(null)).toBe("/account");
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => expect(slugify("  Primavera 150 — S! ")).toBe("primavera-150-s"));
});
