import "server-only";
import type { Category, Inquiry, Order, Product, SiteSettings } from "../types";

export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;
export type NewCategory = Omit<Category, "id" | "created_at">;
export type NewOrder = Omit<Order, "id" | "created_at" | "updated_at">;
export type NewInquiry = Omit<Inquiry, "id" | "created_at" | "status">;

/**
 * Persistence contract. Two implementations:
 *  - LocalStore (JSON file on disk) — zero-config development / demo
 *  - SupabaseStore — production (Postgres + Storage)
 *
 * All methods run on the server only. Authorization is enforced by callers (see lib/auth/guard.ts).
 */
export interface DataStore {
  readonly kind: "local" | "supabase";

  listCategories(): Promise<Category[]>;
  createCategory(input: NewCategory): Promise<Category>;
  updateCategory(id: string, input: Partial<NewCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: NewProduct): Promise<Product>;
  updateProduct(id: string, input: Partial<NewProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  listOrders(): Promise<Order[]>;
  createOrder(input: NewOrder): Promise<Order>;
  updateOrder(id: string, input: Partial<NewOrder>): Promise<Order>;
  deleteDemoOrders(): Promise<number>;

  listInquiries(): Promise<Inquiry[]>;
  createInquiry(input: NewInquiry): Promise<Inquiry>;
  updateInquiry(id: string, input: Partial<Pick<Inquiry, "status">>): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<void>;

  getSettings(): Promise<SiteSettings>;
  updateSettings(patch: Partial<SiteSettings>): Promise<SiteSettings>;

  /** Persist an uploaded image and return its public URL. */
  saveImage(file: { bytes: Uint8Array; contentType: string; extension: string }): Promise<string>;
}

export class StoreError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found" | "conflict" | "invalid" | "backend" = "backend",
  ) {
    super(message);
    this.name = "StoreError";
  }
}
