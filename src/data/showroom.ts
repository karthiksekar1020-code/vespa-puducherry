/**
 * Photos and names taken from the dealership's previous website (vespapondicherry.com) and stored locally in /public.
 * This is display content only: no prices, stock or specifications are claimed here. Real catalogue data lives in the
 * database; these entries drive the "At the showroom" sections so the site is never empty of imagery.
 */
/** A colour box in the gallery. `hue` is the target hue for the simulated preview; omit it for the model's photographed colour. */
export type ShowroomColour = { name: string; hex: string; hue?: number };
export type ShowroomModel = { name: string; slug: string; image: string; baseHue?: number;
  /** Short blurb for the gallery. Describe only what the photo shows; leave specs and prices to verified data. */
  blurb?: string;
  /** Exactly four boxes work best in the gallery. The first should be the photographed colour. */
  colours?: ShowroomColour[];
  /** Fill these in with showroom-verified figures, e.g. "95 km/h" and "45 km/l". Left empty they show "Ask the showroom". */
  topSpeed?: string; mileage?: string };
export type ShowroomAccessory = { name: string; image: string; baseHue?: number; modelOnly?: string[] };

export const SHOWROOM_MODELS: ShowroomModel[] = [
  {
    name: "Vespa Elegante", slug: "vespa-elegante", image: "/scooters/vespa-elegante/1.png", baseHue: 35,
    blurb: "A warm, classic Vespa as photographed at the showroom, with a tinted windscreen, brown saddle and rear carrier.",
    colours: [
      { name: "Showroom tan", hex: "#b08a5b" },
      { name: "Red", hex: "#c0272d", hue: 355 },
      { name: "Blue", hex: "#2a4fa0", hue: 225 },
      { name: "Green", hex: "#2f7d4f", hue: 140 },
    ],
  },
  {
    name: "Vespa Racing Sixties", slug: "vespa-racing-sixties", image: "/scooters/vespa-racing-sixties/1.png", baseHue: 140,
    blurb: "A sporty green Vespa with contrasting yellow accents and a dark saddle, as photographed at the showroom.",
    colours: [
      { name: "Showroom green", hex: "#2f6b4a" },
      { name: "Red", hex: "#c0272d", hue: 355 },
      { name: "Blue", hex: "#2a4fa0", hue: 225 },
      { name: "Yellow", hex: "#e3b61f", hue: 48 },
    ],
  },
  {
    name: "Vespa SXL", slug: "vespa-sxl", image: "/scooters/vespa-sxl/1.png", baseHue: 225,
    blurb: "A bold blue Vespa with a dark saddle and rear carrier, as photographed at the showroom.",
    colours: [
      { name: "Showroom blue", hex: "#2a4fa0" },
      { name: "Red", hex: "#c0272d", hue: 355 },
      { name: "Green", hex: "#2f7d4f", hue: 140 },
      { name: "Yellow", hex: "#e3b61f", hue: 48 },
    ],
  },
  {
    name: "Vespa VXL", slug: "vespa-vxl", image: "/scooters/vespa-vxl/1.png", baseHue: 355,
    blurb: "A vivid red Vespa with a dark saddle and a retro round headlamp, as photographed at the showroom.",
    colours: [
      { name: "Showroom red", hex: "#c0272d" },
      { name: "Blue", hex: "#2a4fa0", hue: 225 },
      { name: "Green", hex: "#2f7d4f", hue: 140 },
      { name: "Yellow", hex: "#e3b61f", hue: 48 },
    ],
  },
];

export const SHOWROOM_ACCESSORIES: ShowroomAccessory[] = [
  { name: "Clear windscreen", image: "/accessories/clear-windscreen.jpg" },
  { name: "Tinted windscreen", image: "/accessories/tinted-windscreen.jpg" },
  { name: "Helmet", image: "/accessories/helmet-white.jpg" },
  { name: "Elegante helmet", image: "/accessories/helmet-elegante.jpg", modelOnly: ["vespa-elegante"] },
  { name: "Rear carrier", image: "/accessories/rear-carrier.jpg", modelOnly: ["vespa-sxl"] },
  { name: "Rear carrier (side view)", image: "/accessories/rear-carrier-side.jpg", modelOnly: ["vespa-sxl"] },
  { name: "Front fender", image: "/accessories/front-fender.jpg" },
  { name: "USB charging", image: "/accessories/usb-charging.jpg" },
  { name: "Vehicle cover", image: "/accessories/vehicle-cover.jpg" },
  { name: "Floor mat", image: "/accessories/floor-mat.jpg" },
];

/** Accessories shown as related to a model: general items plus any pictured on that specific model. Fitment is not verified. */
export function accessoriesFor(slug: string): ShowroomAccessory[] {
  return SHOWROOM_ACCESSORIES.filter((a) => !a.modelOnly || a.modelOnly.includes(slug));
}
