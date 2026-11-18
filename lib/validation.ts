import { z } from "zod";
import {
  AVAILABILITY,
  FULFILLMENT_TYPES,
  INQUIRY_STATUSES,
  ORDER_STATUSES,
  RESTRICTED_CLASSES,
} from "./types";

const trimmed = (max: number) => z.string().trim().max(max);

/** Accepts absolute https URLs or site-relative /media paths (local uploads). */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => v === "" || /^\/media\/[a-zA-Z0-9._-]+$/.test(v) || /^https:\/\/[^\s]+$/.test(v),
    "Use an https:// image URL or upload an image",
  );

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug is too short")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const priceSchema = z
  .string()
  .trim()
  .regex(/^\d{1,6}(\.\d{1,2})?$/, "Enter a price like 24.99")
  .transform((v) => Math.round(Number(v) * 100));

export const productSchema = z.object({
  name: trimmed(120).min(2, "Name is required"),
  slug: slugSchema,
  short_description: trimmed(200).min(5, "Add a short description"),
  description: trimmed(5000).min(10, "Add a description"),
  price: priceSchema,
  category_id: z.string().trim().min(1, "Choose a category"),
  image_url: imageUrlSchema.refine((v) => v !== "", "Add a product image"),
  gallery: z.array(imageUrlSchema).max(8).default([]),
  availability: z.enum(AVAILABILITY),
  inventory: z.coerce.number().int("Whole numbers only").min(0).max(100000),
  sku: trimmed(60),
  details: trimmed(2000),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  is_active: z.boolean(),
  is_demo: z.boolean(),
  image_is_illustrative: z.boolean(),
});
export type ProductInput = z.output<typeof productSchema>;

export const categorySchema = z.object({
  name: trimmed(80).min(2, "Name is required"),
  slug: slugSchema,
  description: trimmed(600),
  image_url: imageUrlSchema,
  restricted: z.enum(RESTRICTED_CLASSES),
  sort_order: z.coerce.number().int().min(0).max(999),
});
export type CategoryInput = z.output<typeof categorySchema>;

export const inventoryUpdateSchema = z.object({
  id: z.string().min(1),
  price: priceSchema,
  inventory: z.coerce.number().int().min(0).max(100000),
  availability: z.enum(AVAILABILITY),
});

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^[+()\d\s.-]{7,30}$/.test(v), "Enter a valid phone number");

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name"),
  email: z.string().trim().max(200).email("Please enter a valid email"),
  phone: phoneSchema,
  subject: trimmed(150).min(2, "Please add a subject"),
  message: trimmed(4000).min(10, "Please write at least 10 characters"),
  product_id: z.string().trim().max(64).optional().default(""),
  confirm_age: z.literal(true, { error: "Please confirm you are 19 or older" }),
  consent: z.literal(true, { error: "Please agree to the privacy policy" }),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().default(""),
});

export const inquiryStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(INQUIRY_STATUSES),
});

export const orderStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export const manualOrderSchema = z.object({
  customer_name: trimmed(100).min(2, "Customer name is required"),
  customer_email: z.string().trim().max(200).email("Valid email required"),
  customer_phone: phoneSchema,
  fulfillment: z.enum(FULFILLMENT_TYPES),
  notes: trimmed(1000),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Add at least one item"),
  confirm_age_verified: z.literal(true, { error: "Confirm the customer's age was verified with ID" }),
});

export const settingsSchema = z.object({
  contact_email: z.string().trim().email("Valid email required").max(200),
  contact_phone: trimmed(40).min(7, "Phone is required"),
  contact_address: trimmed(200).min(2, "Address is required"),
  business_hours: trimmed(200),
  instagram_url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Use an https:// link"),
});

export const homepageSchema = z.object({
  hero_eyebrow: trimmed(80),
  hero_title: trimmed(120).min(2, "Title is required"),
  hero_subtitle: trimmed(400),
  hero_image_url: imageUrlSchema.refine((v) => v !== "", "Add a hero image"),
  announcement: trimmed(200),
  featured_product_ids: z.array(z.string()).max(12),
});

export const complianceSchema = z.object({
  cannabis_retail_authorized: z.boolean(),
  agco_licence_number: trimmed(60),
  agco_store_authorization_number: trimmed(60),
  tobacco_retail_authorized: z.boolean(),
  checkout_enabled: z.boolean(),
  payment_provider: trimmed(60),
  payment_provider_approval_reference: trimmed(120),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

/** Flatten zod issues into a { field: message } map for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
