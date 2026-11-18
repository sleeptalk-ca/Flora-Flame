import type { Metadata } from "next";
import { PageHeader, Table } from "@/components/admin/ui";
import { InventoryRow } from "@/components/admin/inventory-row";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { formatCAD } from "@/lib/utils";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Inventory & prices" };

export default async function InventoryPage() {
  await requireAdmin();
  const store = getStore();
  const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const sorted = [...products].sort((a, b) => a.inventory - b.inventory || a.name.localeCompare(b.name));
  const totalUnits = products.reduce((s, p) => s + p.inventory, 0);
  const value = products.reduce((s, p) => s + p.inventory * p.price_cents, 0);

  return (
    <>
      <PageHeader
        title="Inventory & prices"
        description={`${totalUnits} units on hand · ${formatCAD(value)} at list price. Edit a row and press Save. Prices are in CAD.`}
      />
      <Table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price (CAD)</th>
            <th>Stock</th>
            <th>Availability</th>
            <th className="text-right">
              <span className="sr-only">Save</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <InventoryRow key={p.id} product={p} category={catName.get(p.category_id) ?? "—"} />
          ))}
        </tbody>
      </Table>
    </>
  );
}
