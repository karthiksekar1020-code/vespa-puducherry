/**
 * Official colour catalogue for models shown with the interactive colour selector.
 *
 * Rules for editing:
 *  - Only list a colour here once it appears on the official Vespa India page named in `sourceUrl`.
 *  - `name` is the official name exactly as published. Never rename or invent colours.
 *  - `image` is a file under /public. Save the official photo from `imageSourceUrl` into that path.
 *    Until the file exists the page shows "photo pending" for that colour instead of a stand-in picture.
 *  - `swatch` is only an indicative on-screen shade for the colour chip; the official photo is the true reference.
 *  - To retire a colour, delete its entry (or set status to "needs-verification" to hide it while you check).
 */
export type ColourStatus = "verified" | "needs-verification";

export type VespaColour = {
  id: string;
  /** Official colour name, exactly as published by Vespa India. */
  name: string;
  /** Indicative chip colour. Not an official colour value. */
  swatch: string;
  /** Local image asset, relative to /public. */
  image: string;
  /** Optional extra views of the same colour, relative to /public. Only add files confirmed to show this colour. */
  gallery?: string[];
  /** Official page (and file) the image should be saved from. */
  imageSourceUrl: string;
  /** Official page that publishes this colour. */
  sourceUrl: string;
  status: ColourStatus;
  /** ISO date this colour was last checked against the official page. */
  verifiedOn: string;
};

export type VespaColourModel = {
  slug: string;
  /** Model name exactly as published. */
  name: string;
  /** Engine sizes the official page lists under this model name. */
  engines: string;
  sourceUrl: string;
  colours: VespaColour[];
  /** Colour names seen elsewhere that are NOT confirmed on the official page. Never shown publicly; kept to document why. */
  notConfirmed: { name: string; reason: string }[];
};

const TECH_URL = "https://vespaindia.com/vespa-tech";
const TECH_IMG = "https://vespaindia.com/images/vespa-tech";

export const VESPA_TECH: VespaColourModel = {
  slug: "vespa-tech",
  name: "Vespa Tech",
  engines: "125 cc and 150 cc",
  sourceUrl: TECH_URL,
  colours: [
    {
      id: "matt-deep-blue",
      name: "Matt Deep Blue",
      swatch: "#1f3a6e",
      image: "/scooters/vespa-tech/matt-deep-blue.webp",
      gallery: [
        "/scooters/vespa-tech/matt-deep-blue-1.png",
        "/scooters/vespa-tech/matt-deep-blue-2.png",
        "/scooters/vespa-tech/matt-deep-blue-3.png",
      ],
      imageSourceUrl: `${TECH_IMG}/vespa_tech_vxl_blue_energico.webp`,
      sourceUrl: TECH_URL,
      status: "verified",
      verifiedOn: "2026-10-15",
    },
    {
      id: "grigio-grey",
      name: "Grigio Grey",
      swatch: "#8d9196",
      image: "/scooters/vespa-tech/grigio-grey.webp",
      imageSourceUrl: `${TECH_IMG}/vespa_tech_vxl_grigio_grey.webp`,
      sourceUrl: TECH_URL,
      status: "verified",
      verifiedOn: "2026-10-15",
    },
  ],
  notConfirmed: [
    { name: "Energico Blue", reason: "Appears only inside an image file name on the official page; the published colour name is Matt Deep Blue." },
    { name: "Qala", reason: "A separate special-edition model (vespaindia.com/vespa-special-edition-qala), not a Vespa Tech colour." },
    { name: "Nero Black / Pearl White", reason: "Listed by third-party sites for the S Tech; not on the Vespa Tech page." },
  ],
};
