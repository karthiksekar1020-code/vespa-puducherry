import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScooterCard, priceLabel } from "@/components/shop/scooter-card";
import type { Scooter } from "@/lib/types";

vi.mock("next/image", () => ({ default: (p: { alt: string }) => <span role="img" aria-label={p.alt} /> }));

const base: Scooter = {
  id: "11111111-1111-1111-1111-111111111111", slug: "demo", name: "Demo", variant: "S", tagline: null, description: null,
  price_inr: 100000, price_verified: false, availability: "on_request", category_id: null, colors: [{ name: "Green", hex: "#0a0" }],
  images: [], specs: [{ label: "Seats", value: "2" }], features: [], published: true, featured: false, created_at: "",
};

describe("priceLabel", () => {
  it("never shows an unverified price", () => expect(priceLabel(base)).toBe("Price on request"));
  it("shows a verified price", () => expect(priceLabel({ ...base, price_verified: true })).toContain("1,00,000"));
});

describe("ScooterCard", () => {
  it("renders the required actions with working links", () => {
    render(<ScooterCard scooter={base} />);
    expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute("href", "/scooters/demo");
    expect(screen.getByRole("link", { name: /enquire now/i })).toHaveAttribute("href", expect.stringContaining("/contact"));
    expect(screen.getByRole("link", { name: /test ride/i })).toHaveAttribute("href", `/book-test-ride?scooter=${base.id}`);
    expect(screen.getByText("Price on request")).toBeInTheDocument();
  });
});
