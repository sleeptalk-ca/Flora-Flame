import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Category, Inquiry, Order, Product, SiteSettings } from "../types";
import { seedCategories, seedInquiries, seedOrders, seedProducts, seedSettings } from "./seed";
import { StoreError, type DataStore } from "./store";

interface DbShape {
  version: 1;
  categories: Category[];
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];
  settings: SiteSettings;
}

const DATA_DIR = process.env.LOCAL_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

// Serialize writes within this process so concurrent requests can't clobber the file.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readDb(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const db = JSON.parse(raw) as DbShape;
    // Forward-compatible defaults for settings keys added later.
    db.settings = { ...seedSettings, ...db.settings, compliance: { ...seedSettings.compliance, ...db.settings?.compliance } };
    return db;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    const now = new Date();
    const db: DbShape = {
      version: 1,
      categories: seedCategories,
      products: seedProducts,
      orders: seedOrders(now),
      inquiries: seedInquiries(now),
      settings: seedSettings,
    };
    await writeDb(db);
    return db;
  }
}

async function writeDb(db: DbShape) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_FILE);
  } catch (err) {
    throw new StoreError(
      `Could not write local data file (${(err as Error).message}). In production, configure Supabase — see README.`,
    );
  }
}

const nowIso = () => new Date().toISOString();

function mutate<T>(fn: (db: DbShape) => T): Promise<T> {
  return exclusive(async () => {
    const db = await readDb();
    const result = fn(db);
    await writeDb(db);
    return result;
  });
}

function findIndexOrThrow<T extends { id: string }>(list: T[], id: string, label: string) {
  const i = list.findIndex((x) => x.id === id);
  if (i === -1) throw new StoreError(`${label} not found`, "not_found");
  return i;
}

export const localStore: DataStore = {
  kind: "local",

  async listCategories() {
    const db = await readDb();
    return [...db.categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  },
  createCategory(input) {
    return mutate((db) => {
      if (db.categories.some((c) => c.slug === input.slug)) throw new StoreError("Slug already in use", "conflict");
      const cat: Category = { ...input, id: randomUUID(), created_at: nowIso() };
      db.categories.push(cat);
      return cat;
    });
  },
  updateCategory(id, input) {
    return mutate((db) => {
      const i = findIndexOrThrow(db.categories, id, "Category");
      if (input.slug && db.categories.some((c) => c.slug === input.slug && c.id !== id))
        throw new StoreError("Slug already in use", "conflict");
      db.categories[i] = { ...db.categories[i], ...input };
      return db.categories[i];
    });
  },
  deleteCategory(id) {
    return mutate((db) => {
      if (db.products.some((p) => p.category_id === id))
        throw new StoreError("Move or delete this category's products first", "conflict");
      findIndexOrThrow(db.categories, id, "Category");
      db.categories = db.categories.filter((c) => c.id !== id);
    });
  },

  async listProducts() {
    return (await readDb()).products;
  },
  async getProduct(id) {
    return (await readDb()).products.find((p) => p.id === id) ?? null;
  },
  createProduct(input) {
    return mutate((db) => {
      if (db.products.some((p) => p.slug === input.slug)) throw new StoreError("Slug already in use", "conflict");
      const ts = nowIso();
      const product: Product = { ...input, id: randomUUID(), created_at: ts, updated_at: ts };
      db.products.push(product);
      return product;
    });
  },
  updateProduct(id, input) {
    return mutate((db) => {
      const i = findIndexOrThrow(db.products, id, "Product");
      if (input.slug && db.products.some((p) => p.slug === input.slug && p.id !== id))
        throw new StoreError("Slug already in use", "conflict");
      db.products[i] = { ...db.products[i], ...input, updated_at: nowIso() };
      return db.products[i];
    });
  },
  deleteProduct(id) {
    return mutate((db) => {
      findIndexOrThrow(db.products, id, "Product");
      db.products = db.products.filter((p) => p.id !== id);
      db.settings.featured_product_ids = db.settings.featured_product_ids.filter((x) => x !== id);
    });
  },

  async listOrders() {
    const db = await readDb();
    return [...db.orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  createOrder(input) {
    return mutate((db) => {
      const ts = nowIso();
      const order: Order = { ...input, id: randomUUID(), created_at: ts, updated_at: ts };
      db.orders.push(order);
      return order;
    });
  },
  updateOrder(id, input) {
    return mutate((db) => {
      const i = findIndexOrThrow(db.orders, id, "Order");
      db.orders[i] = { ...db.orders[i], ...input, updated_at: nowIso() };
      return db.orders[i];
    });
  },
  deleteDemoOrders() {
    return mutate((db) => {
      const before = db.orders.length;
      db.orders = db.orders.filter((o) => !o.is_demo);
      return before - db.orders.length;
    });
  },

  async listInquiries() {
    const db = await readDb();
    return [...db.inquiries].sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  createInquiry(input) {
    return mutate((db) => {
      const inquiry: Inquiry = { ...input, id: randomUUID(), status: "new", created_at: nowIso() };
      db.inquiries.push(inquiry);
      return inquiry;
    });
  },
  updateInquiry(id, input) {
    return mutate((db) => {
      const i = findIndexOrThrow(db.inquiries, id, "Inquiry");
      db.inquiries[i] = { ...db.inquiries[i], ...input };
      return db.inquiries[i];
    });
  },
  deleteInquiry(id) {
    return mutate((db) => {
      findIndexOrThrow(db.inquiries, id, "Inquiry");
      db.inquiries = db.inquiries.filter((x) => x.id !== id);
    });
  },

  async getSettings() {
    return (await readDb()).settings;
  },
  updateSettings(patch) {
    return mutate((db) => {
      db.settings = {
        ...db.settings,
        ...patch,
        compliance: { ...db.settings.compliance, ...(patch.compliance ?? {}) },
      };
      return db.settings;
    });
  },

  async saveImage({ bytes, extension }) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
    return `/media/${name}`;
  },
};
