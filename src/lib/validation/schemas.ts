import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91[\s-]?)?[6-9]\d{9}$|^\+?[0-9][0-9\s-]{8,14}$/, "Enter a valid phone number");

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "At most 72 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.email("Enter a valid email").trim().toLowerCase(),
    phone: z.string().trim().optional().refine((v) => !v || phoneSchema.safeParse(v).success, "Enter a valid phone number"),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const forgotSchema = z.object({ email: z.email("Enter a valid email").trim().toLowerCase() });

export const resetSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: phoneSchema,
  scooter_id: z.string().uuid().optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
  message: z.string().trim().max(1000).optional(),
  consent: z.literal("on", { error: "Consent is required so we can contact you about this request" }),
  website: z.string().max(0).optional(), // honeypot
});

export const ENQUIRY_CATEGORIES = ["Scooter enquiry", "Accessories", "Test ride", "Service & support", "Other"] as const;
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: z.string().trim().optional().refine((v) => !v || phoneSchema.safeParse(v).success, "Enter a valid phone number"),
  category: z.enum(ENQUIRY_CATEGORIES, { error: "Choose a category" }),
  related: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
  website: z.string().max(0).optional(), // honeypot
});

export const checkoutSchema = z.object({
  contact_name: z.string().trim().min(2, "Enter your name").max(100),
  contact_phone: phoneSchema,
  line1: z.string().trim().min(3, "Enter your address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  notes: z.string().trim().max(500).optional(),
});

export const cartItemsSchema = z
  .array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
  .min(1, "Your cart is empty")
  .max(50);

const jsonString = <T extends z.ZodType>(inner: T) =>
  z.string().transform((s, ctx) => {
    try {
      return JSON.parse(s || "[]");
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  }).pipe(inner);

export const scooterSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  variant: z.string().trim().max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price_inr: z.string().trim().optional().transform((v) => (v ? Number(v) : null)).pipe(z.number().min(0).nullable()),
  price_verified: z.string().optional().transform((v) => v === "on"),
  availability: z.enum(["available", "coming_soon", "unavailable", "on_request"]),
  category_id: z.string().uuid().optional().or(z.literal("")),
  colors: jsonString(z.array(z.object({ name: z.string().min(1), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), image: z.string().optional() }))),
  images: jsonString(z.array(z.object({ url: z.string().min(1), alt: z.string() }))),
  specs: jsonString(z.array(z.object({ label: z.string().min(1), value: z.string().min(1) }))),
  features: z.string().optional().transform((v) => (v ?? "").split("\n").map((s) => s.trim()).filter(Boolean)),
  published: z.string().optional().transform((v) => v === "on"),
  featured: z.string().optional().transform((v) => v === "on"),
});

export const accessorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  description: z.string().trim().max(5000).optional(),
  price_inr: z.string().trim().min(1, "Price required").transform(Number).pipe(z.number().min(0)),
  stock: z.string().trim().min(1, "Stock required").transform(Number).pipe(z.number().int().min(0)),
  category_id: z.string().uuid().optional().or(z.literal("")),
  images: jsonString(z.array(z.object({ url: z.string().min(1), alt: z.string() }))),
  compatibility: z.string().optional().transform((v) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean)),
  published: z.string().optional().transform((v) => v === "on"),
  featured: z.string().optional().transform((v) => v === "on"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  kind: z.enum(["scooter", "accessory"]),
});

export const showroomModelSchema = z.object({
  name: z.string().trim().min(2, "Enter the model name").max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  image_url: z.string().trim().min(1, "Upload a photo of the model"),
  blurb: z.string().trim().max(400).optional(),
  colours: jsonString(z.array(z.object({ name: z.string().min(1), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).max(4, "Use at most four colours")),
  top_speed: z.string().trim().max(60).optional(),
  mileage: z.string().trim().max(60).optional(),
  sort_order: z.string().trim().optional().transform((v) => (v ? Number(v) : 100)).pipe(z.number().int().min(0).max(9999)),
  active: z.string().optional().transform((v) => v === "on"),
});
