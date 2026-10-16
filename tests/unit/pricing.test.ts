import { describe, expect, it } from "vitest";
import { computeTotals, normaliseCart } from "@/lib/pricing";

describe("computeTotals", () => {
  const cfg = { shipping_flat: 100, free_shipping_over: 2000, tax_percent: 18 };
  it("adds shipping and tax", () => {
    expect(computeTotals([{ unit_price: 500, quantity: 2 }], cfg)).toEqual({ subtotal: 1000, shipping: 100, tax: 180, total: 1280 });
  });
  it("waives shipping above the free threshold", () => {
    expect(computeTotals([{ unit_price: 1500, quantity: 2 }], cfg).shipping).toBe(0);
  });
  it("charges nothing for an empty cart", () => {
    expect(computeTotals([], cfg)).toEqual({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  });
  it("rounds tax to paise", () => {
    expect(computeTotals([{ unit_price: 99.99, quantity: 1 }], { shipping_flat: 0, free_shipping_over: null, tax_percent: 5 }).tax).toBe(5);
  });
});

describe("normaliseCart", () => {
  it("merges duplicates, clamps quantity and drops invalid lines", () => {
    expect(normaliseCart([{ id: "a", quantity: 2 }, { id: "a", quantity: 30 }, { id: "b", quantity: 0 }, { id: "c", quantity: NaN }])).toEqual([{ id: "a", quantity: 20 }]);
  });
});
