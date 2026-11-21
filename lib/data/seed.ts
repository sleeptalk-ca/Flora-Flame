/**
 * Seed / demo data for Talk To Me.
 *
 * Product images are flagged `image_is_illustrative` so the storefront labels them clearly.
 * Copy intentionally contains NO potency (THC/CBD), terpene, origin or certification claims —
 * operators must replace it with information from the licensed producer's regulated label.
 *
 * Images: Pexels (https://www.pexels.com/license/) — free to use, verified reachable.
 *
 * This file only uses type-only imports so it can also run under plain Node (scripts/seed-supabase.mjs).
 */
import type { Category, Inquiry, Order, Product, SiteSettings } from "../types";

export const pexels = (id: number, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Lifestyle / editorial imagery used across the marketing pages. */
export const IMAGES = {
  hero: pexels(2478248, 2400), // Toronto skyline at night (aerial)
  skylineDusk: pexels(19733715, 2000),
  skylineNight: pexels(6136496, 2000),
  skylineWater: pexels(3671394, 2000),
  skylineLake: pexels(29568188, 2000),
  skylineHarbour: pexels(8582241, 2000),
  lounge: pexels(5863513, 2000),
  loungeArches: pexels(4846221, 1600),
  hallway: pexels(33196901, 1600),
  flowerHero: pexels(34246666, 1600),
  accessoriesFlatlay: pexels(8139194, 1600),
  tobaccoLeaves: pexels(27793718, 1600),
} as const;

const CAT = {
  flowers: "c0000000-0000-4000-8000-000000000001",
  grabba: "c0000000-0000-4000-8000-000000000002",
  accessories: "c0000000-0000-4000-8000-000000000003",
};

const P = (n: number) => `a0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const SEED_TIME = "2026-01-01T12:00:00.000Z";

export const seedCategories: Category[] = [
  {
    id: CAT.flowers,
    slug: "cannabis-flowers",
    name: "Cannabis Flowers",
    description:
      "A curated edit of dried flower from licensed Canadian producers. Product details are shown exactly as provided on the regulated label.",
    image_url: pexels(3047447),
    restricted: "cannabis",
    sort_order: 1,
    created_at: SEED_TIME,
  },
  {
    id: CAT.grabba,
    slug: "grabba",
    name: "Grabba",
    description:
      "Natural fire-cured tobacco leaf — whole leaf, crushed and ready-to-use shakers. Tobacco products contain nicotine and are sold only to adults 19+ in Ontario.",
    image_url: IMAGES.tobaccoLeaves,
    restricted: "tobacco",
    sort_order: 2,
    created_at: SEED_TIME,
  },
  {
    id: CAT.accessories,
    slug: "accessories",
    name: "Accessories",
    description: "Considered essentials — grinders, trays, storage and papers chosen for design and durability.",
    image_url: IMAGES.accessoriesFlatlay,
    restricted: "none",
    sort_order: 3,
    created_at: SEED_TIME,
  },
];

const FLOWER_COPY =
  "Premium dried cannabis flower. Potency and terpene information appears on the regulated Health Canada label of each package. Sold only where the operator holds the required Ontario authorization.";

const GRABBA_COPY =
  "Natural, fire-cured tobacco leaf. WARNING: Tobacco products contain nicotine, which is highly addictive. Sold only to adults 19+ in accordance with the Smoke-Free Ontario Act, 2017.";

const GRABBA_SHAKER_COPY =
  "Pre-crushed, fire-cured tobacco leaf packed in a flip-top shaker jar — ready to sprinkle, with no breaking down by hand. Net weight is printed on the jar. WARNING: Tobacco products contain nicotine, which is highly addictive. Sold only to adults 19+ in accordance with the Smoke-Free Ontario Act, 2017.";

type SeedProduct = Omit<Product, "created_at" | "updated_at" | "is_demo" | "image_is_illustrative" | "is_active">;

const baseProducts: SeedProduct[] = [
  // ——— Cannabis Flowers ———
  {
    id: P(1),
    slug: "bayview-reserve",
    name: "Bayview Reserve",
    short_description: "Our signature flower selection, presented in a weighted glass jar.",
    description: FLOWER_COPY,
    price_cents: 4500,
    category_id: CAT.flowers,
    image_url: pexels(34246666),
    gallery: [pexels(3047447), pexels(7773109)],
    availability: "in_stock",
    inventory: 24,
    sku: "FF-FL-001",
    details: "Format: as listed on the producer's label.\nPackaging: resealable glass jar.",
    is_featured: true,
    is_best_seller: true,
  },
  {
    id: P(2),
    slug: "don-mills-select",
    name: "Don Mills Select",
    short_description: "A small-batch pick, hand-selected for presentation and freshness.",
    description: FLOWER_COPY,
    price_cents: 3900,
    category_id: CAT.flowers,
    image_url: pexels(3047447),
    gallery: [pexels(34246666)],
    availability: "in_stock",
    inventory: 18,
    sku: "FF-FL-002",
    details: "Format: as listed on the producer's label.",
    is_featured: true,
    is_best_seller: false,
  },
  {
    id: P(3),
    slug: "sheppard-small-batch",
    name: "Sheppard Small Batch",
    short_description: "Limited release from a craft-focused licensed producer.",
    description: FLOWER_COPY,
    price_cents: 5200,
    category_id: CAT.flowers,
    image_url: pexels(6462279),
    gallery: [pexels(7667742)],
    availability: "low_stock",
    inventory: 4,
    sku: "FF-FL-003",
    details: "Format: as listed on the producer's label.",
    is_featured: false,
    is_best_seller: true,
  },
  {
    id: P(4),
    slug: "yorkville-classic",
    name: "Yorkville Classic",
    short_description: "A refined everyday selection with a clean, modern presentation.",
    description: FLOWER_COPY,
    price_cents: 3400,
    category_id: CAT.flowers,
    image_url: pexels(7667742),
    gallery: [pexels(6462279)],
    availability: "in_stock",
    inventory: 31,
    sku: "FF-FL-004",
    details: "Format: as listed on the producer's label.",
    is_featured: false,
    is_best_seller: false,
  },
  {
    id: P(5),
    slug: "lakeshore-collection",
    name: "Lakeshore Collection",
    short_description: "A rotating collection of seasonal selections. Ask in store for this month's release.",
    description: FLOWER_COPY,
    price_cents: 4800,
    category_id: CAT.flowers,
    image_url: pexels(7773109),
    gallery: [pexels(34246666)],
    availability: "coming_soon",
    inventory: 0,
    sku: "FF-FL-005",
    details: "Format: as listed on the producer's label.",
    is_featured: true,
    is_best_seller: false,
  },
  // ——— Grabba ———
  {
    id: P(6),
    slug: "classic-grabba-leaf",
    name: "Classic Grabba Leaf",
    short_description: "Whole fire-cured tobacco leaf, carefully stored for freshness.",
    description: GRABBA_COPY,
    price_cents: 1500,
    category_id: CAT.grabba,
    image_url: IMAGES.tobaccoLeaves,
    gallery: [pexels(8804298)],
    availability: "in_stock",
    inventory: 40,
    sku: "FF-GB-001",
    details: "Contains nicotine.\nFormat: as listed on the supplier's package.",
    is_featured: true,
    is_best_seller: true,
  },
  {
    id: P(7),
    slug: "fronto-whole-leaf",
    name: "Fronto Whole Leaf",
    short_description: "Large-format whole leaf, sold sealed.",
    description: GRABBA_COPY,
    price_cents: 1200,
    category_id: CAT.grabba,
    image_url: pexels(8804298),
    gallery: [IMAGES.tobaccoLeaves],
    availability: "in_stock",
    inventory: 26,
    sku: "FF-GB-002",
    details: "Contains nicotine.\nFormat: as listed on the supplier's package.",
    is_featured: false,
    is_best_seller: true,
  },
  {
    id: P(8),
    slug: "grabba-crushed-leaf",
    name: "Grabba Crushed Leaf",
    short_description: "Pre-crushed leaf in a resealable pouch.",
    description: GRABBA_COPY,
    price_cents: 1000,
    category_id: CAT.grabba,
    image_url: pexels(27793718, 1200),
    gallery: [],
    availability: "out_of_stock",
    inventory: 0,
    sku: "FF-GB-003",
    details: "Contains nicotine.\nFormat: as listed on the supplier's package.",
    is_featured: false,
    is_best_seller: false,
  },
  {
    id: P(14),
    slug: "grabba-shaker-original",
    name: "Grabba Shaker — Original Cut",
    short_description: "Pre-crushed fire-cured leaf in a flip-top shaker jar. Shake, sprinkle, reseal.",
    description: GRABBA_SHAKER_COPY,
    price_cents: 1400,
    category_id: CAT.grabba,
    image_url: pexels(12627162),
    gallery: [pexels(227908), IMAGES.tobaccoLeaves],
    availability: "in_stock",
    inventory: 36,
    sku: "FF-GB-004",
    details: "Contains nicotine.\nFormat: flip-top shaker jar — net weight as listed on the supplier's label.",
    is_featured: true,
    is_best_seller: true,
  },
  {
    id: P(15),
    slug: "grabba-shaker-trio",
    name: "Grabba Shaker Trio",
    short_description: "Three shaker jars of crushed leaf, bundled at a better price.",
    description: GRABBA_SHAKER_COPY,
    price_cents: 3600,
    category_id: CAT.grabba,
    image_url: pexels(227908),
    gallery: [pexels(12627162)],
    availability: "in_stock",
    inventory: 12,
    sku: "FF-GB-005",
    details: "Contains nicotine.\nContents: 3 × shaker jar — net weight per jar as listed on the supplier's label.",
    is_featured: false,
    is_best_seller: false,
  },
  // ——— Accessories ———
  {
    id: P(9),
    slug: "brushed-steel-grinder",
    name: "Brushed Steel Grinder",
    short_description: "Four-piece grinder with precision-cut teeth and a magnetic lid.",
    description:
      "A four-piece grinder with sharp, precision-cut teeth, a magnetic lid and a fine mesh screen.",
    price_cents: 4200,
    category_id: CAT.accessories,
    image_url: pexels(8139103),
    gallery: [IMAGES.accessoriesFlatlay],
    availability: "in_stock",
    inventory: 15,
    sku: "FF-AC-001",
    details: "Material: as specified by supplier.\nPieces: 4",
    is_featured: true,
    is_best_seller: true,
  },
  {
    id: P(10),
    slug: "walnut-rolling-tray",
    name: "Walnut Rolling Tray",
    short_description: "A low-profile tray with a raised edge — designed to live on the coffee table.",
    description:
      "A minimal tray with a raised lip to keep everything in place.",
    price_cents: 3800,
    category_id: CAT.accessories,
    image_url: pexels(7852569),
    gallery: [],
    availability: "in_stock",
    inventory: 12,
    sku: "FF-AC-002",
    details: "Material: as specified by supplier.",
    is_featured: false,
    is_best_seller: true,
  },
  {
    id: P(11),
    slug: "unbleached-rolling-papers",
    name: "Unbleached Rolling Papers",
    short_description: "Slow-burning, unbleached papers in a slim booklet.",
    description:
      "Unbleached rolling papers in a slim booklet.",
    price_cents: 400,
    category_id: CAT.accessories,
    image_url: pexels(8139707),
    gallery: [],
    availability: "in_stock",
    inventory: 120,
    sku: "FF-AC-003",
    details: "Format: as specified by supplier.",
    is_featured: false,
    is_best_seller: false,
  },
  {
    id: P(12),
    slug: "smell-proof-glass-jar",
    name: "Airtight Glass Jar",
    short_description: "Thick glass storage with an airtight seal and a matte finish.",
    description:
      "Airtight glass storage with a sealing lid.",
    price_cents: 2600,
    category_id: CAT.accessories,
    image_url: pexels(8139069),
    gallery: [],
    availability: "low_stock",
    inventory: 5,
    sku: "FF-AC-004",
    details: "Material: glass.\nCapacity: as specified by supplier.",
    is_featured: false,
    is_best_seller: false,
  },
  {
    id: P(13),
    slug: "essentials-kit",
    name: "The Essentials Kit",
    short_description: "Grinder, papers, tips and storage — everything in one considered set.",
    description:
      "A curated set of everyday accessories presented in a gift box. Contents may vary.",
    price_cents: 7900,
    category_id: CAT.accessories,
    image_url: IMAGES.accessoriesFlatlay,
    gallery: [pexels(8139103), pexels(8139707)],
    availability: "in_stock",
    inventory: 8,
    sku: "FF-AC-005",
    details: "Contents: as listed on the box.",
    is_featured: true,
    is_best_seller: false,
  },
];

export const seedProducts: Product[] = baseProducts.map((p) => ({
  ...p,
  is_active: true,
  is_demo: false,
  image_is_illustrative: true,
  created_at: SEED_TIME,
  updated_at: SEED_TIME,
}));

export const seedSettings: SiteSettings = {
  contact_email: "sleeptalktoronto@proton.me",
  contact_phone: "+1 (249) 875-8541",
  contact_address: "North York, Ontario, Canada",
  business_hours: "By appointment — contact us for availability",
  instagram_url: "",
  hero_eyebrow: "North York · Toronto",
  hero_title: "Premium Toronto Lifestyle.",
  hero_subtitle:
    "A considered edit of flower, grabba and accessories for adults 19+ — curated in North York, inspired by the city that never sits still.",
  hero_image_url: IMAGES.hero,
  announcement: "Online ordering is not yet available. Browse the collection and contact us with any questions.",
  featured_product_ids: [P(1), P(14), P(6), P(9), P(13), P(2)],
  compliance: {
    cannabis_retail_authorized: false,
    agco_licence_number: "",
    agco_store_authorization_number: "",
    tobacco_retail_authorized: false,
    checkout_enabled: false,
    payment_provider: "none",
    payment_provider_approval_reference: "",
  },
};

/** Demo orders so analytics have shape. Always flagged is_demo and removable from the admin. */
export function seedOrders(now = new Date()): Order[] {
  const day = 86_400_000;
  const mk = (
    n: number,
    daysAgo: number,
    name: string,
    status: Order["status"],
    items: [number, number][],
  ): Order => {
    const lines = items.map(([pid, qty]) => {
      const p = seedProducts.find((x) => x.id === P(pid))!;
      return { product_id: p.id, name: p.name, unit_price_cents: p.price_cents, quantity: qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
    const tax = Math.round(subtotal * 0.13);
    const created = new Date(now.getTime() - daysAgo * day).toISOString();
    return {
      id: `d0000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
      order_number: `DEMO-${1000 + n}`,
      customer_name: name,
      customer_email: `demo${n}@example.com`,
      customer_phone: "",
      status,
      fulfillment: n % 2 ? "pickup" : "delivery",
      items: lines,
      subtotal_cents: subtotal,
      tax_cents: tax,
      total_cents: subtotal + tax,
      notes: "Demo order — sample data for analytics preview.",
      is_demo: true,
      created_at: created,
      updated_at: created,
    };
  };
  return [
    mk(1, 160, "Demo Customer A", "fulfilled", [[9, 1], [11, 3]]),
    mk(2, 140, "Demo Customer B", "fulfilled", [[1, 1], [10, 1]]),
    mk(3, 118, "Demo Customer C", "fulfilled", [[6, 2]]),
    mk(4, 96, "Demo Customer D", "fulfilled", [[13, 1]]),
    mk(5, 75, "Demo Customer E", "refunded", [[12, 1]]),
    mk(6, 60, "Demo Customer F", "fulfilled", [[2, 1], [9, 1]]),
    mk(7, 41, "Demo Customer G", "fulfilled", [[7, 3], [11, 2]]),
    mk(8, 22, "Demo Customer H", "fulfilled", [[3, 1], [12, 1]]),
    mk(9, 9, "Demo Customer I", "confirmed", [[13, 1], [6, 1]]),
    mk(10, 2, "Demo Customer J", "pending", [[10, 1], [11, 4]]),
  ];
}

export const seedInquiries = (now = new Date()): Inquiry[] => [
  {
    id: "e0000000-0000-4000-8000-000000000001",
    name: "Demo Visitor",
    email: "visitor@example.com",
    phone: "",
    subject: "Demo inquiry — store hours",
    message: "This is a sample inquiry so you can preview the inbox. Delete it any time.",
    product_id: null,
    status: "new",
    created_at: new Date(now.getTime() - 3 * 3_600_000).toISOString(),
  },
];
