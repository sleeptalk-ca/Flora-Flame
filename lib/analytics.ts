import type { Category, Order, Product } from "./types";

/** Orders that count toward revenue. */
export const isRevenue = (o: Order) => !["cancelled", "refunded"].includes(o.status);

export function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function lastNMonths(now: Date, n: number) {
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-CA", { month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

export function summarize(orders: Order[], products: Product[], categories: Category[], now: Date) {
  const revenueOrders = orders.filter(isRevenue);
  const totalRevenue = revenueOrders.reduce((s, o) => s + o.subtotal_cents, 0);
  const months = lastNMonths(now, 6);
  const byMonth = new Map(months.map((m) => [m.key, 0]));
  for (const o of revenueOrders) {
    const k = monthKey(o.created_at);
    if (byMonth.has(k)) byMonth.set(k, byMonth.get(k)! + o.subtotal_cents);
  }

  const productCat = new Map(products.map((p) => [p.id, p.category_id]));
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const byCategory = new Map<string, number>(categories.map((c) => [c.name, 0]));
  const byProduct = new Map<string, { name: string; cents: number; units: number }>();
  for (const o of revenueOrders) {
    for (const it of o.items) {
      const cents = it.unit_price_cents * it.quantity;
      const cat = catName.get(productCat.get(it.product_id) ?? "") ?? "Uncategorized";
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + cents);
      const prev = byProduct.get(it.product_id) ?? { name: it.name, cents: 0, units: 0 };
      byProduct.set(it.product_id, { name: prev.name, cents: prev.cents + cents, units: prev.units + it.quantity });
    }
  }

  const inventoryValue = products.reduce((s, p) => s + p.price_cents * p.inventory, 0);

  return {
    totalRevenue,
    orderCount: revenueOrders.length,
    avgOrder: revenueOrders.length ? Math.round(totalRevenue / revenueOrders.length) : 0,
    monthly: months.map((m) => ({ label: m.label, cents: byMonth.get(m.key) ?? 0 })),
    byCategory: [...byCategory.entries()].map(([name, cents]) => ({ name, cents })).sort((a, b) => b.cents - a.cents),
    topProducts: [...byProduct.values()].sort((a, b) => b.cents - a.cents).slice(0, 6),
    inventoryValue,
    hasDemo: orders.some((o) => o.is_demo),
  };
}
