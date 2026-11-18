import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Notice } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getStore().listCategories();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-xs text-muted hover:text-cream">
        <ArrowLeft className="size-3.5" /> Products
      </Link>
      <PageHeader title="New product" />
      {categories.length === 0 ? (
        <Notice tone="warning">
          Create a category first. <Link href="/admin/categories" className="underline">Manage categories</Link>
        </Notice>
      ) : (
        <ProductForm categories={categories} />
      )}
    </>
  );
}
