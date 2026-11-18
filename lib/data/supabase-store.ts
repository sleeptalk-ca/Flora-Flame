import "server-only";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category, Inquiry, Order, Product, SiteSettings } from "../types";
import { seedSettings } from "./seed";
import { StoreError, type DataStore } from "./store";

/**
 * Supabase-backed store. Uses the SERVICE ROLE key, which bypasses RLS — so this module must
 * only ever run on the server (enforced by `server-only`), and every mutating caller must
 * authorize the admin first (lib/auth/guard.ts).
 */
let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new StoreError("Supabase is not configured");
  // With Cache Components, fetch is uncached by default; caching is controlled by `use cache` in queries.ts.
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

function check<T>(res: { data: T | null; error: { message: string; code?: string } | null }, label: string): T {
  if (res.error) {
    if (res.error.code === "23505") throw new StoreError("Slug already in use", "conflict");
    if (res.error.code === "23503") throw new StoreError(`${label} is still referenced by other records`, "conflict");
    throw new StoreError(`${label}: ${res.error.message}`);
  }
  if (res.data === null) throw new StoreError(`${label} not found`, "not_found");
  return res.data;
}

const BUCKET = () => process.env.SUPABASE_STORAGE_BUCKET || "product-images";

export const supabaseStore: DataStore = {
  kind: "supabase",

  async listCategories() {
    return check(
      await db().from("categories").select("*").order("sort_order").order("name"),
      "Categories",
    ) as Category[];
  },
  async createCategory(input) {
    return check(await db().from("categories").insert(input).select().single(), "Category") as Category;
  },
  async updateCategory(id, input) {
    return check(await db().from("categories").update(input).eq("id", id).select().single(), "Category") as Category;
  },
  async deleteCategory(id) {
    const { count } = await db().from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count) throw new StoreError("Move or delete this category's products first", "conflict");
    const res = await db().from("categories").delete().eq("id", id);
    if (res.error) throw new StoreError(res.error.message);
  },

  async listProducts() {
    return check(await db().from("products").select("*").order("created_at"), "Products") as Product[];
  },
  async getProduct(id) {
    const res = await db().from("products").select("*").eq("id", id).maybeSingle();
    if (res.error) throw new StoreError(res.error.message);
    return (res.data as Product) ?? null;
  },
  async createProduct(input) {
    return check(await db().from("products").insert(input).select().single(), "Product") as Product;
  },
  async updateProduct(id, input) {
    return check(
      await db()
        .from("products")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single(),
      "Product",
    ) as Product;
  },
  async deleteProduct(id) {
    const res = await db().from("products").delete().eq("id", id);
    if (res.error) throw new StoreError(res.error.message);
    const settings = await this.getSettings();
    if (settings.featured_product_ids.includes(id)) {
      await this.updateSettings({ featured_product_ids: settings.featured_product_ids.filter((x) => x !== id) });
    }
  },

  async listOrders() {
    return check(await db().from("orders").select("*").order("created_at", { ascending: false }), "Orders") as Order[];
  },
  async createOrder(input) {
    return check(await db().from("orders").insert(input).select().single(), "Order") as Order;
  },
  async updateOrder(id, input) {
    return check(
      await db()
        .from("orders")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single(),
      "Order",
    ) as Order;
  },
  async deleteDemoOrders() {
    const res = await db().from("orders").delete({ count: "exact" }).eq("is_demo", true);
    if (res.error) throw new StoreError(res.error.message);
    return res.count ?? 0;
  },

  async listInquiries() {
    return check(
      await db().from("inquiries").select("*").order("created_at", { ascending: false }),
      "Inquiries",
    ) as Inquiry[];
  },
  async createInquiry(input) {
    return check(await db().from("inquiries").insert(input).select().single(), "Inquiry") as Inquiry;
  },
  async updateInquiry(id, input) {
    return check(await db().from("inquiries").update(input).eq("id", id).select().single(), "Inquiry") as Inquiry;
  },
  async deleteInquiry(id) {
    const res = await db().from("inquiries").delete().eq("id", id);
    if (res.error) throw new StoreError(res.error.message);
  },

  async getSettings() {
    const res = await db().from("site_settings").select("data").eq("id", 1).maybeSingle();
    if (res.error) throw new StoreError(res.error.message);
    const data = (res.data?.data ?? {}) as Partial<SiteSettings>;
    return { ...seedSettings, ...data, compliance: { ...seedSettings.compliance, ...(data.compliance ?? {}) } };
  },
  async updateSettings(patch) {
    const current = await this.getSettings();
    const next: SiteSettings = {
      ...current,
      ...patch,
      compliance: { ...current.compliance, ...(patch.compliance ?? {}) },
    };
    const res = await db()
      .from("site_settings")
      .upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
    if (res.error) throw new StoreError(res.error.message);
    return next;
  },

  async saveImage({ bytes, contentType, extension }) {
    const objectPath = `products/${randomUUID()}.${extension}`;
    const res = await db().storage.from(BUCKET()).upload(objectPath, bytes, { contentType, upsert: false });
    if (res.error) throw new StoreError(`Upload failed: ${res.error.message}`);
    return db().storage.from(BUCKET()).getPublicUrl(objectPath).data.publicUrl;
  },
};
