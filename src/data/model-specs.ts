/**
 * Specification sheets for the four showroom model cards (keyed by the slug in SHOWROOM_MODELS).
 *
 * VERIFICATION STATUS (checked 2026-10-15):
 *  - vespaindia.com does NOT list the Elegante, Racing Sixties, SXL or VXL in its current range (Vespa, Vespa S,
 *    Vespa Tech, Vespa S Tech, Qala). Its /vespa-sxl and /vespa-racing-sixties addresses serve the current Vespa S page, so
 *    those figures must not be reused here. Autocar India's July 2026 lineup omits them too.
 *  - BikeWale (a third party) still publishes sheets for the Elegante 150, SXL 150 and VXL 150 and states each is discontinued.
 *    Its figures are used below, labelled as third-party, never as official. Where its own sections disagree, the spec-table
 *    value is shown and the disagreement is recorded in `sourceNotes`.
 *  - A field with no value shows "Not officially confirmed". Never fill one with a guess.
 *
 * To upgrade a model: when Vespa India (or your dealer, with Piaggio documents) confirms a figure, edit it here, set
 * source.official to true and update verifiedOn.
 */
export type MileageBasis = "claimed" | "tested" | "owner-reported";

export type ModelSpecs = {
  variant: string;
  status: { label: string; note: string };
  /** What was checked on the official site. */
  officialCheck: string;
  source: { name: string; url: string; official: boolean; verifiedOn: string };
  sourceNotes: string[];
  key: {
    displacement?: string;
    power?: string;
    torque?: string;
    mileage?: { value: string; basis: MileageBasis };
    /** Third-party figure (BikeWale for the Elegante; Team-BHP and Smartprix list the SXL and VXL at the same value). */
    topSpeed?: string;
  };
  /** Fixed order; undefined values render as "Not officially confirmed". */
  details: {
    tank?: string; transmission?: string; brakes?: string; frontSuspension?: string; rearSuspension?: string;
    tyres?: string; kerbWeight?: string; seatHeight?: string; groundClearance?: string; dimensions?: string;
    wheelbase?: string; colours?: string;
  };
  features: string[];
};

const OFFICIAL_CHECK = "Not listed on vespaindia.com (range page and model pages checked 2026-10-15).";
const BASIS_NOTE = "Mileage is the owner-reported figure shown by the source, not a manufacturer claim.";
const SHARED = {
  officialCheck: OFFICIAL_CHECK,
  status: { label: "Discontinued", note: "Marked discontinued by BikeWale; no date given. Not in Vespa India's current range." },
};

export const MODEL_SPECS: Record<string, ModelSpecs> = {
  "vespa-elegante": {
    ...SHARED,
    variant: "Elegante 150",
    source: { name: "BikeWale (third party)", url: "https://bikewale.com/vespa-bikes/elegante", official: false, verifiedOn: "2026-10-15" },
    sourceNotes: ["Source shows 10.32 bhp in its table but 11.4 bhp in its summary; the table value is used.", BASIS_NOTE],
    key: {
      displacement: "149.5 cc",
      power: "10.32 bhp @ 7600 rpm",
      torque: "10.6 Nm @ 5500 rpm",
      mileage: { value: "45 kmpl", basis: "owner-reported" },
      topSpeed: "90 km/h",
    },
    details: {
      tank: "7.4 L (2 L reserve)", transmission: "Automatic (CVT)",
      brakes: "Front 200 mm disc, rear 140 mm drum, single-channel ABS",
      frontSuspension: "Hydraulic, with anti-dive", rearSuspension: "Adjustable dual-effect hydraulic shock absorber",
      tyres: "Front 110/70-11, rear 120/70-10 (tubeless)", kerbWeight: "115 kg", seatHeight: "770 mm", groundClearance: "155 mm",
      dimensions: "1770 × 690 × 1140 mm", wheelbase: "1290 mm",
    },
    features: ["LED headlamp", "Semi-digital console", "USB charging port", "Under-seat and front storage", "Kick and self start"],
  },

  "vespa-racing-sixties": {
    ...SHARED,
    variant: "SXL 150 Racing Sixties (limited edition)",
    source: { name: "BikeWale (third party)", url: "https://www.bikewale.com/vespa-bikes/sxl-150/", official: false, verifiedOn: "2026-10-15" },
    sourceNotes: [
      "Source has no separate sheet for this edition; it says it is mechanically the same as the standard SXL 150 and VXL 150, so SXL 150 figures are shown.",
      "Source lists 11.4 bhp and 11.5 Nm in its table but 10.2 bhp and 10.6 Nm in its summary; the table values are used.",
      BASIS_NOTE,
    ],
    key: {
      displacement: "150 cc",
      power: "11.4 bhp @ 7000 rpm",
      torque: "11.5 Nm @ 5500 rpm",
      mileage: { value: "35 kmpl", basis: "owner-reported" },
      topSpeed: "90 km/h",
    },
    details: {
      tank: "8 L (2 L reserve)", transmission: "Automatic (CVT)",
      brakes: "Front 200 mm disc, rear 140 mm drum, single-channel ABS",
      frontSuspension: "Single side arm", rearSuspension: "Hydraulic shock absorber",
      tyres: "Front 110/70-11, rear 120/70-10 (tubeless)", kerbWeight: "114 kg", seatHeight: "770 mm", groundClearance: "155 mm",
      dimensions: "1770 × 690 × 1140 mm", wheelbase: "1290 mm",
    },
    features: ["Analogue speedometer with digital odometer and fuel gauge", "Self start", "Pillion footrest and grab rail"],
  },

  "vespa-sxl": {
    ...SHARED,
    variant: "SXL 150",
    source: { name: "BikeWale (third party)", url: "https://www.bikewale.com/vespa-bikes/sxl-150/", official: false, verifiedOn: "2026-10-15" },
    sourceNotes: ["Source lists 11.4 bhp and 11.5 Nm in its table but 10.2 bhp and 10.6 Nm in its summary; the table values are used.", BASIS_NOTE],
    key: {
      displacement: "150 cc",
      power: "11.4 bhp @ 7000 rpm",
      torque: "11.5 Nm @ 5500 rpm",
      mileage: { value: "35 kmpl", basis: "owner-reported" },
      topSpeed: "90 km/h",
    },
    details: {
      tank: "8 L (2 L reserve)", transmission: "Automatic (CVT)",
      brakes: "Front 200 mm disc, rear 140 mm drum, single-channel ABS",
      frontSuspension: "Single side arm", rearSuspension: "Hydraulic shock absorber",
      tyres: "Front 110/70-11, rear 120/70-10 (tubeless)", kerbWeight: "114 kg", seatHeight: "770 mm", groundClearance: "155 mm",
      dimensions: "1770 × 690 × 1140 mm", wheelbase: "1290 mm",
    },
    features: ["Analogue speedometer with digital odometer and fuel gauge", "Self start", "Pillion footrest and grab rail"],
  },

  "vespa-vxl": {
    ...SHARED,
    variant: "VXL 150",
    source: { name: "BikeWale (third party)", url: "https://www.bikewale.com/vespa-bikes/vxl-150/", official: false, verifiedOn: "2026-10-15" },
    sourceNotes: [
      "Source lists 11.4 bhp and 11.5 Nm in its table but 10.2 bhp and 10.6 Nm in its review; the table values are used.",
      "ABS is not in the source's spec table; its review calls it an option.",
      BASIS_NOTE,
    ],
    key: {
      displacement: "150 cc",
      power: "11.4 bhp @ 7000 rpm",
      torque: "11.5 Nm @ 5500 rpm",
      mileage: { value: "42 kmpl", basis: "owner-reported" },
      topSpeed: "90 km/h",
    },
    details: {
      tank: "8 L (2 L reserve)", transmission: "Automatic (CVT)",
      brakes: "Front 200 mm disc, rear 140 mm drum; ABS optional per source review",
      frontSuspension: "Single side arm", rearSuspension: "Hydraulic shock absorber",
      tyres: "Front 110/70-11, rear 120/70-10 (tubeless)", kerbWeight: "114 kg", seatHeight: "770 mm", groundClearance: "155 mm",
      dimensions: "1770 × 690 × 1140 mm", wheelbase: "1290 mm",
    },
    features: ["Analogue speedometer with digital odometer and fuel gauge", "Self start", "Under-seat and front storage (per review)", "Full-LED headlamp (per review)"],
  },
};
