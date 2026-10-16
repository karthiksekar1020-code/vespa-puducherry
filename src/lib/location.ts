/** Showroom location, taken from the dealership's Google Maps listing. */
export const SHOWROOM = {
  name: "Vespa Puducherry (Vignesh Moteurx)",
  lat: 11.9449427,
  lng: 79.8094234,
  /** The owner's own Google Maps share link. */
  shareUrl: "https://maps.app.goo.gl/7Xt5Cp3Pt6Byen8F7",
};

export const MAP_EMBED_URL = `https://www.google.com/maps?q=${SHOWROOM.lat},${SHOWROOM.lng}&z=17&output=embed`;
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${SHOWROOM.lat},${SHOWROOM.lng}`;
