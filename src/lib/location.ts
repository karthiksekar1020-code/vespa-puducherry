/** Showroom location, taken from the dealership's Google Maps listing. */
export const SHOWROOM = {
  name: "Vespa Puducherry (Vignesh Moteurx)",
  lat: 11.9449427,
  lng: 79.8094234,
  /** The owner's own Google Maps share link. */
  shareUrl: "https://maps.app.goo.gl/7Xt5Cp3Pt6Byen8F7",
};

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${SHOWROOM.lat},${SHOWROOM.lng}&t=k&z=18&output=embed`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${SHOWROOM.lat},${SHOWROOM.lng}`;

/** Footer "Get directions" branches. Each opens only its own Google Maps search. */
export const BRANCHES = [
  {
    name: "Vignesh Moteurx",
    /** What the map embed searches for: exact coordinates, or the Google Maps business listing. */
    embedQuery: `${SHOWROOM.lat},${SHOWROOM.lng}`,
    address: "No.10-A, Vignesh Towers, E.C.R Road, Pakkamudayanpet, Lawspet, Puducherry.",
    url: "https://www.google.com/maps/search/?api=1&query=No.10-A%2C+Vignesh+Towers%2C+E.C.R+Road%2C+Pakkamudayanpet%2C+Lawspet%2C+Puducherry",
  },
  {
    name: "Vignesh Auto",
    embedQuery: "Vignesh Auto Mudaliarpet Puducherry",
    address: "#126, 100 Feet Road, Near RTO Office, Mudaliarpet, Puducherry - 605004.",
    url: "https://www.google.com/maps/search/?api=1&query=%23126%2C+100+Feet+Road%2C+Near+RTO+Office%2C+Mudaliarpet%2C+Puducherry+605004",
  },
] as const;
