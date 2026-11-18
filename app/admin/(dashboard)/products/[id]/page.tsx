import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmSubmit } from "@/components/admin/form-bits";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { deleteProductAction } from "@/app/admin/actions";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const store = getStore();
  const [product, categories] = await Promise.all([store.getProduct(id), store.listCategories()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-xs text-muted hover:text-cream">
        <ArrowLeft className="size-3.5" /> Products
      </Link>
      <PageHeader
        title={product.name}
        description={`Last updated ${new Date(product.updated_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}`}
        actions={
          <>
            <Link
              href={`/shop/${product.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-4 text-xs hover:border-accent hover:text-accent"
            >
              <ExternalLink className="size-3.5" /> View live
            </Link>
            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmSubmit message={`Delete “${product.name}”? This cannot be undone.`}>
                <Trash2 className="size-3.5" /> Delete
              </ConfirmSubmit>
            </form>
          </>
        }
      />
      <ProductForm product={product} categories={categories} />
    </>
  );
}
