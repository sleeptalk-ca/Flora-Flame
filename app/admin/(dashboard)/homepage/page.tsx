import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { HomepageForm } from "@/components/admin/homepage-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Homepage" };

export default async function HomepageAdmin() {
  await requireAdmin();
  const store = getStore();
  const [settings, products, categories] = await Promise.all([store.getSettings(), store.listProducts(), store.listCategories()]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit the hero and choose which products appear in the featured collection."
        actions={
          <Link href="/" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm hover:border-accent hover:text-accent">
            <ExternalLink className="size-4" /> Preview
          </Link>
        }
      />
      <HomepageForm
        settings={settings}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          image_url: p.image_url,
          category: catName.get(p.category_id) ?? "",
          is_active: p.is_active,
        }))}
      />
    </>
  );
}
