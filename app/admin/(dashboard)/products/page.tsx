import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Package, Pencil, Plus, Star } from "lucide-react";
import { EmptyState, Notice, PageHeader, Table } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/button";
import { AvailabilityBadge, Badge } from "@/components/ui/badge";
import { SmartImage } from "@/components/ui/smart-image";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { toggleProductFlagAction } from "@/app/admin/actions";
import { formatCAD } from "@/lib/utils";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Products" };

type SearchParams = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const store = getStore();
  const [products, categories] = await Promise.all([store.listProducts(), store.listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const filter = typeof sp.category === "string" ? sp.category : "";
  const list = (filter ? products.filter((p) => p.category_id === filter) : products).sort((a, b) =>
    (catName.get(a.category_id) ?? "").localeCompare(catName.get(b.category_id) ?? "") || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products across ${categories.length} categories.`}
        actions={
          <LinkButton href="/admin/products/new">
            <Plus className="size-4" /> New product
          </LinkButton>
        }
      />
      {sp.created && <div className="mb-4"><Notice tone="success">Product created.</Notice></div>}
      {sp.deleted && <div className="mb-4"><Notice tone="success">Product deleted.</Notice></div>}

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/products" className={`rounded-full border px-3 py-1.5 ${!filter ? "border-accent text-accent" : "border-line text-muted hover:text-cream"}`}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/products?category=${c.id}`}
            className={`rounded-full border px-3 py-1.5 ${filter === c.id ? "border-accent text-accent" : "border-line text-muted hover:text-cream"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Package} title="No products yet">
          <Link href="/admin/products/new" className="text-accent hover:underline">Create your first product</Link>
        </EmptyState>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th className="text-right">Price</th>
              <th className="text-right">Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink">
                      <SmartImage src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-accent">
                        {p.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.is_featured && <Badge tone="accent">Featured</Badge>}
                        {p.is_best_seller && <Badge tone="neutral">Best seller</Badge>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-muted">{catName.get(p.category_id) ?? "—"}</td>
                <td className="text-right tabular-nums">{formatCAD(p.price_cents)}</td>
                <td className="text-right tabular-nums">{p.inventory}</td>
                <td>
                  <div className="flex flex-col items-start gap-1">
                    <AvailabilityBadge value={p.availability} />
                    {!p.is_active && <Badge tone="danger">Hidden</Badge>}
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <form action={toggleProductFlagAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="flag" value="is_featured" />
                      <button
                        type="submit"
                        title={p.is_featured ? "Unfeature" : "Feature"}
                        aria-label={p.is_featured ? `Unfeature ${p.name}` : `Feature ${p.name}`}
                        className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-accent"
                      >
                        <Star className={`size-4 ${p.is_featured ? "fill-accent text-accent" : ""}`} />
                      </button>
                    </form>
                    <form action={toggleProductFlagAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="flag" value="is_active" />
                      <button
                        type="submit"
                        title={p.is_active ? "Hide from storefront" : "Publish"}
                        aria-label={p.is_active ? `Hide ${p.name}` : `Publish ${p.name}`}
                        className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-cream"
                      >
                        {p.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4 text-danger" />}
                      </button>
                    </form>
                    <Link
                      href={`/admin/products/${p.id}`}
                      aria-label={`Edit ${p.name}`}
                      className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-cream"
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
