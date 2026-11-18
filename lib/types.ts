export const AVAILABILITY = ["in_stock", "low_stock", "out_of_stock", "coming_soon"] as const;
export type Availability = (typeof AVAILABILITY)[number];

/** Regulatory class of a category — drives sales gating in checkout and order management. */
export const RESTRICTED_CLASSES = ["cannabis", "tobacco", "none"] as const;
export type RestrictedClass = (typeof RESTRICTED_CLASSES)[number];

export const ORDER_STATUSES = ["pending", "confirmed", "ready", "fulfilled", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const FULFILLMENT_TYPES = ["pickup", "delivery"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  restricted: RestrictedClass;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  /** Price in Canadian cents. */
  price_cents: number;
  category_id: string;
  image_url: string;
  gallery: string[];
  availability: Availability;
  inventory: number;
  sku: string;
  /** Free-form, operator-supplied details (e.g. size, format). Never auto-generated. */
  details: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  /** Demo listing — shown with a visible "Demo" label on the storefront. */
  is_demo: boolean;
  /** Image is a stock/illustrative photo, not the actual product. */
  image_is_illustrative: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface OrderItem {
  product_id: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  fulfillment: FulfillmentType;
  items: OrderItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  notes: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  product_id: string | null;
  status: InquiryStatus;
  created_at: string;
}

export interface ComplianceSettings {
  /** Operator confirms they hold an AGCO Retail Operator Licence + Retail Store Authorization. */
  cannabis_retail_authorized: boolean;
  agco_licence_number: string;
  agco_store_authorization_number: string;
  /** Operator confirms they are permitted to sell tobacco products in Ontario. */
  tobacco_retail_authorized: boolean;
  /** Master switch for online checkout. Also requires an approved payment provider. */
  checkout_enabled: boolean;
  /** Identifier of the payment provider that has approved this business in writing. */
  payment_provider: string;
  payment_provider_approval_reference: string;
}

export interface SiteSettings {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  business_hours: string;
  instagram_url: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  announcement: string;
  featured_product_ids: string[];
  compliance: ComplianceSettings;
}

export interface ProductFilter {
  categorySlug?: string;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "name" | "newest";
  includeInactive?: boolean;
}
