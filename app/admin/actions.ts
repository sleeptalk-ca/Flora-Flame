"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { getStore, StoreError } from "@/lib/data";
import { TAGS } from "@/lib/data/queries";
import { requireAdmin } from "@/lib/auth/guard";
import { verifyAdminCredentials } from "@/lib/auth/credentials";
import { signSession, SESSION_TTL_SECONDS } from "@/lib/auth/session";
import { ADMIN_COOKIE } from "@/lib/brand";
import { clientKeyFromHeaders, isRateLimited, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { restrictedSaleViolations } from "@/lib/payments";
import {
  categorySchema,
  complianceSchema,
  fieldErrors,
  homepageSchema,
  inquiryStatusSchema,
  inventoryUpdateSchema,
  loginSchema,
  manualOrderSchema,
  orderStatusSchema,
  productSchema,
  settingsSchema,
} from "@/lib/validation";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  /** Changes on every submit so client effects can react to repeat results. */
  at?: number;
};

const ok = (message: string): ActionState => ({ status: "success", message, at: Date.now() });
const fail = (message: string, errors?: Record<string, string>): ActionState => ({
  status: "error",
  message,
  errors,
  at: Date.now(),
});

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

function handleError(err: unknown): ActionState {
  if (err instanceof StoreError) return fail(err.message);
  console.error("[admin action]", err);
  return fail("Something went wrong. Please try again.");
}

// ───────────────────────── Auth ─────────────────────────

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  // Lock out an IP after 5 FAILED attempts within 15 minutes.
  const key = `login:${clientKeyFromHeaders(await headers())}`;
  const MAX_FAILURES = 5;
  const WINDOW = 15 * 60_000;
  const locked = isRateLimited(key, MAX_FAILURES);
  if (locked.limited) {
    return fail(`Too many failed sign-in attempts. Try again in ${Math.ceil(locked.retryAfterMs / 60_000)} minutes.`);
  }

  const parsed = loginSchema.safeParse({ email: str(formData, "email"), password: str(formData, "password") });
  if (!parsed.success) return fail("Please check the form.", fieldErrors(parsed.error));

  let valid = false;
  try {
    valid = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  } catch (err) {
    console.error("[login]", err);
    return fail("Sign-in is not configured. See README → Admin setup.");
  }
  if (!valid) {
    rateLimit(key, MAX_FAILURES, WINDOW);
    return fail("Incorrect email or password.");
  }
  resetRateLimit(key);

  const token = await signSession(parsed.data.email.toLowerCase());
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ───────────────────────── Products ─────────────────────────

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id");
  const parsed = productSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    short_description: str(formData, "short_description"),
    description: str(formData, "description"),
    price: str(formData, "price"),
    category_id: str(formData, "category_id"),
    image_url: str(formData, "image_url"),
    gallery: formData.getAll("gallery").map(String).filter(Boolean),
    availability: str(formData, "availability"),
    inventory: str(formData, "inventory") || "0",
    sku: str(formData, "sku"),
    details: str(formData, "details"),
    is_featured: bool(formData, "is_featured"),
    is_best_seller: bool(formData, "is_best_seller"),
    is_active: bool(formData, "is_active"),
    is_demo: bool(formData, "is_demo"),
    image_is_illustrative: bool(formData, "image_is_illustrative"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));

  const { price, ...rest } = parsed.data;
  const store = getStore();
  try {
    const categories = await store.listCategories();
    if (!categories.some((c) => c.id === rest.category_id)) return fail("Choose a valid category.", { category_id: "Invalid category" });
    if (id) await store.updateProduct(id, { ...rest, price_cents: price });
    else await store.createProduct({ ...rest, price_cents: price });
  } catch (err) {
    const res = handleError(err);
    if (err instanceof StoreError && err.code === "conflict") res.errors = { slug: err.message };
    return res;
  }
  updateTag(TAGS.catalog);
  if (!id) redirect("/admin/products?created=1");
  return ok("Product saved.");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await getStore().deleteProduct(id);
  updateTag(TAGS.catalog);
  updateTag(TAGS.settings);
  redirect("/admin/products?deleted=1");
}

export async function toggleProductFlagAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const flag = str(formData, "flag");
  if (!id || !["is_active", "is_featured", "is_best_seller"].includes(flag)) return;
  const store = getStore();
  const product = await store.getProduct(id);
  if (!product) return;
  const key = flag as "is_active" | "is_featured" | "is_best_seller";
  await store.updateProduct(id, { [key]: !product[key] });
  updateTag(TAGS.catalog);
}

// ───────────────────────── Inventory & pricing ─────────────────────────

export async function updateInventoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = inventoryUpdateSchema.safeParse({
    id: str(formData, "id"),
    price: str(formData, "price"),
    inventory: str(formData, "inventory"),
    availability: str(formData, "availability"),
  });
  if (!parsed.success) return fail(Object.values(fieldErrors(parsed.error))[0] ?? "Invalid values");
  try {
    const { id, price, inventory, availability } = parsed.data;
    await getStore().updateProduct(id, { price_cents: price, inventory, availability });
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.catalog);
  return ok("Saved");
}

// ───────────────────────── Categories ─────────────────────────

export async function saveCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData, "id");
  const parsed = categorySchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    description: str(formData, "description"),
    image_url: str(formData, "image_url"),
    restricted: str(formData, "restricted"),
    sort_order: str(formData, "sort_order") || "0",
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  try {
    if (id) await getStore().updateCategory(id, parsed.data);
    else await getStore().createCategory(parsed.data);
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.catalog);
  return ok(id ? "Category updated." : "Category created.");
}

export async function deleteCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await getStore().deleteCategory(str(formData, "id"));
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.catalog);
  return ok("Category deleted.");
}

// ───────────────────────── Orders ─────────────────────────

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse({ id: str(formData, "id"), status: str(formData, "status") });
  if (!parsed.success) return;
  await getStore().updateOrder(parsed.data.id, { status: parsed.data.status });
  refresh();
}

export async function createManualOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const productIds = formData.getAll("item_product").map(String);
  const qtys = formData.getAll("item_qty").map(String);
  const items = productIds
    .map((product_id, i) => ({ product_id, quantity: qtys[i] }))
    .filter((x) => x.product_id);

  const parsed = manualOrderSchema.safeParse({
    customer_name: str(formData, "customer_name"),
    customer_email: str(formData, "customer_email"),
    customer_phone: str(formData, "customer_phone"),
    fulfillment: str(formData, "fulfillment"),
    notes: str(formData, "notes"),
    items,
    confirm_age_verified: bool(formData, "confirm_age_verified"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));

  const store = getStore();
  try {
    const [products, categories, settings] = await Promise.all([
      store.listProducts(),
      store.listCategories(),
      store.getSettings(),
    ]);
    const lines = parsed.data.items.map((it) => {
      const p = products.find((x) => x.id === it.product_id);
      if (!p) throw new StoreError("One of the selected products no longer exists", "invalid");
      return { product: p, quantity: it.quantity };
    });

    // Legal gate: never record sales of restricted products without the matching authorization.
    const violations = restrictedSaleViolations(
      settings.compliance,
      categories,
      lines.map((l) => l.product.category_id),
    );
    if (violations.length) return fail(violations.join(" "));

    for (const l of lines) {
      if (l.product.inventory < l.quantity) return fail(`Not enough stock for ${l.product.name} (${l.product.inventory} left).`);
    }

    const subtotal = lines.reduce((s, l) => s + l.product.price_cents * l.quantity, 0);
    const tax = Math.round(subtotal * 0.13); // Ontario HST
    const orders = await store.listOrders();
    await store.createOrder({
      order_number: `FF-${String(orders.filter((o) => !o.is_demo).length + 1001)}`,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      fulfillment: parsed.data.fulfillment,
      notes: parsed.data.notes,
      status: "confirmed",
      items: lines.map((l) => ({
        product_id: l.product.id,
        name: l.product.name,
        unit_price_cents: l.product.price_cents,
        quantity: l.quantity,
      })),
      subtotal_cents: subtotal,
      tax_cents: tax,
      total_cents: subtotal + tax,
      is_demo: false,
    });
    for (const l of lines) {
      const inventory = l.product.inventory - l.quantity;
      await store.updateProduct(l.product.id, {
        inventory,
        availability: inventory === 0 ? "out_of_stock" : inventory <= 5 ? "low_stock" : l.product.availability,
      });
    }
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.catalog);
  return ok("Order recorded and inventory updated.");
}

export async function clearDemoOrdersAction() {
  await requireAdmin();
  await getStore().deleteDemoOrders();
  refresh();
}

// ───────────────────────── Inquiries ─────────────────────────

export async function updateInquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = inquiryStatusSchema.safeParse({ id: str(formData, "id"), status: str(formData, "status") });
  if (!parsed.success) return;
  await getStore().updateInquiry(parsed.data.id, { status: parsed.data.status });
  refresh();
}

export async function deleteInquiryAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await getStore().deleteInquiry(id);
  refresh();
}

// ───────────────────────── Homepage & settings ─────────────────────────

export async function saveHomepageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = homepageSchema.safeParse({
    hero_eyebrow: str(formData, "hero_eyebrow"),
    hero_title: str(formData, "hero_title"),
    hero_subtitle: str(formData, "hero_subtitle"),
    hero_image_url: str(formData, "hero_image_url"),
    announcement: str(formData, "announcement"),
    featured_product_ids: formData.getAll("featured_product_ids").map(String),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  try {
    const products = await getStore().listProducts();
    const valid = new Set(products.map((p) => p.id));
    await getStore().updateSettings({
      ...parsed.data,
      featured_product_ids: parsed.data.featured_product_ids.filter((id) => valid.has(id)),
    });
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.settings);
  return ok("Homepage updated.");
}

export async function saveContactSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    contact_email: str(formData, "contact_email"),
    contact_phone: str(formData, "contact_phone"),
    contact_address: str(formData, "contact_address"),
    business_hours: str(formData, "business_hours"),
    instagram_url: str(formData, "instagram_url"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  try {
    await getStore().updateSettings(parsed.data);
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.settings);
  return ok("Contact information updated.");
}

export async function saveComplianceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = complianceSchema.safeParse({
    cannabis_retail_authorized: bool(formData, "cannabis_retail_authorized"),
    agco_licence_number: str(formData, "agco_licence_number"),
    agco_store_authorization_number: str(formData, "agco_store_authorization_number"),
    tobacco_retail_authorized: bool(formData, "tobacco_retail_authorized"),
    checkout_enabled: bool(formData, "checkout_enabled"),
    payment_provider: str(formData, "payment_provider") || "none",
    payment_provider_approval_reference: str(formData, "payment_provider_approval_reference"),
  });
  if (!parsed.success) return fail("Please fix the highlighted fields.", fieldErrors(parsed.error));
  const c = parsed.data;
  if (c.cannabis_retail_authorized && (!c.agco_licence_number || !c.agco_store_authorization_number)) {
    return fail("Enter your AGCO Retail Operator Licence and Retail Store Authorization numbers to enable cannabis sales.", {
      agco_licence_number: !c.agco_licence_number ? "Required" : "",
      agco_store_authorization_number: !c.agco_store_authorization_number ? "Required" : "",
    });
  }
  if (c.payment_provider.toLowerCase() === "stripe") {
    return fail("Stripe does not permit cannabis and restricts tobacco businesses. Choose a provider that has approved this business in writing.", {
      payment_provider: "Not permitted for restricted products",
    });
  }
  try {
    await getStore().updateSettings({ compliance: c });
  } catch (err) {
    return handleError(err);
  }
  updateTag(TAGS.settings);
  return ok("Compliance settings saved.");
}
