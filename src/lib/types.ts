export type ImageRef = { url: string; alt: string };
export type ColorOption = { name: string; hex: string; image?: string };
export type SpecRow = { label: string; value: string };

export type Availability = "available" | "coming_soon" | "unavailable" | "on_request";

export type Category = { id: string; kind: "scooter" | "accessory"; name: string; slug: string; sort_order: number };

export type Scooter = {
  id: string;
  slug: string;
  name: string;
  variant: string | null;
  tagline: string | null;
  description: string | null;
  price_inr: number | null;
  price_verified: boolean;
  availability: Availability;
  category_id: string | null;
  colors: ColorOption[];
  images: ImageRef[];
  specs: SpecRow[];
  features: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type Accessory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_inr: number;
  stock: number;
  category_id: string | null;
  images: ImageRef[];
  compatibility: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type BookingStatus = "pending" | "confirmed" | "rejected" | "rescheduled" | "completed" | "cancelled";
export type Booking = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  scooter_label: string | null;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  created_at: string;
};

export type EnquiryStatus = "new" | "in_progress" | "resolved" | "spam";
export type Enquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string | null;
  category: string;
  related: string | null;
  message: string;
  status: EnquiryStatus;
  admin_notes: string | null;
  created_at: string;
};

export type OrderStatus = "requested" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type OrderItem = { id: string; name: string; unit_price: number; quantity: number };
export type Order = {
  id: string;
  reference: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  contact_name: string;
  contact_phone: string;
  shipping_address: Record<string, string>;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type BusinessSettings = { name: string; address: string; phone: string; email: string; whatsapp: string };
export type HoursSettings = { days: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", [string, string] | null>; slot_minutes: number };
export type SocialSettings = { instagram: string; facebook: string; youtube: string; x: string; linkedin: string };
export type CommerceSettings = { shipping_flat: number; free_shipping_over: number | null; tax_percent: number };

export type SiteSettings = {
  business: BusinessSettings;
  hours: HoursSettings;
  social: SocialSettings;
  commerce: CommerceSettings;
};

export type ActionState = { ok: boolean; message?: string; reference?: string; fieldErrors?: Record<string, string> } | null;
