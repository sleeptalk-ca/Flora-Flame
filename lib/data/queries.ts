import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Category, Product, ProductFilter, ProductWithCategory, SiteSettings } from "../types";
import { getStore } from "./index";

/**
 * Public, cached read layer for the storefront.
 * Admin mutations call `updateTag(TAGS.x)` so changes appear immediately.
 */
export const TAGS = {
  catalog: "catalog",
  settings: "settings",
} as const;

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.settings);
  return getStore().getSettings();
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.catalog);
  return getStore().listCategories();
}

async function getCatalog(): Promise<ProductWithCategory[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAGS.catalog);
  const store = getStore();
  const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);
  const byId = new Map(categories.map((c) => [c.id, c]));
  return products.filter((p) => p.is_active).map((p) => ({ ...p, category: byId.get(p.category_id) ?? null }));
}

const AVAILABILITY_RANK: Record<Product["availability"], number> = {
  in_stock: 0,
  low_stock: 1,
  coming_soon: 2,
  out_of_stock: 3,
};

export async function getProducts(filter: ProductFilter = {}): Promise<ProductWithCategory[]> {
  let list = await getCatalog();
  if (filter.categorySlug) list = list.filter((p) => p.category?.slug === filter.categorySlug);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q),
    );
  }
  const sorted = [...list];
  switch (filter.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price_cents - b.price_cents);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price_cents - a.price_cents);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
    default:
      sorted.sort(
        (a, b) =>
          AVAILABILITY_RANK[a.availability] - AVAILABILITY_RANK[b.availability] ||
          Number(b.is_featured) - Number(a.is_featured) ||
          (a.category?.sort_order ?? 0) - (b.category?.sort_order ?? 0) ||
          a.name.localeCompare(b.name),
      );
  }
  return sorted;
}

export async function getProductBySlug(slug: string) {
  const list = await getCatalog();
  return list.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const list = await getCatalog();
  return list.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProducts(): Promise<ProductWithCategory[]> {
  const [settings, list] = await Promise.all([getSettings(), getCatalog()]);
  const byId = new Map(list.map((p) => [p.id, p]));
  const chosen = settings.featured_product_ids.map((id) => byId.get(id)).filter(Boolean) as ProductWithCategory[];
  return chosen.length ? chosen : list.filter((p) => p.is_featured).slice(0, 6);
}

export async function getBestSellers(limit = 4) {
  const list = await getCatalog();
  return list.filter((p) => p.is_best_seller).slice(0, limit);
}

export async function getRelatedProducts(product: ProductWithCategory, limit = 4) {
  const list = await getCatalog();
  const same = list.filter((p) => p.id !== product.id && p.category_id === product.category_id);
  const others = list.filter((p) => p.id !== product.id && p.category_id !== product.category_id);
  return [...same, ...others].slice(0, limit);
}
