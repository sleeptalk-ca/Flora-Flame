import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const store = getStore();
  const [categories, products] = await Promise.all([store.listCategories(), store.listProducts()]);
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Each category carries a regulatory class. Cannabis and tobacco categories are blocked from sales until the matching authorization is recorded in Settings."
      />
      <CategoryManager categories={categories} counts={counts} />
    </>
  );
}
