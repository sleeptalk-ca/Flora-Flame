import type { Metadata } from "next";
import { Suspense } from "react";
import { AlertTriangle, Info, PackageSearch } from "lucide-react";
import { Container, PageHero } from "@/components/site/section-heading";
import { ProductGrid, ProductGridSkeleton } from "@/components/site/product-card";
import { ShopToolbar } from "@/components/site/shop-toolbar";
import { SmartImage } from "@/components/ui/smart-image";
import { getCategories, getProducts } from "@/lib/data/queries";
import { IMAGES } from "@/lib/data/seed";
import type { ProductFilter } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse cannabis flowers, grabba and accessories curated in North York, Toronto. Adults 19+ only.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const SORTS = new Set(["featured", "price-asc", "price-desc", "name", "newest"]);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = one(sp.category).slice(0, 80);
  const q = one(sp.q).slice(0, 80);
  const sortRaw = one(sp.sort);
  const sort = (SORTS.has(sortRaw) ? sortRaw : "featured") as ProductFilter["sort"];

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category || undefined, search: q || undefined, sort }),
  ]);
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <>
      <ShopToolbar categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

      {activeCategory && (
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl">{activeCategory.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{activeCategory.description}</p>
          </div>
        </div>
      )}
      {activeCategory?.restricted === "tobacco" && (
        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          WARNING: Tobacco products contain nicotine, which is highly addictive. Sold only to adults 19+.
        </p>
      )}

      <p className="mt-8 text-xs tracking-[0.14em] text-muted uppercase" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q && <> matching &ldquo;{q}&rdquo;</>}
      </p>

      <div className="mt-8">
        {products.length ? (
          <ProductGrid products={products} priorityCount={4} />
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-24 text-center">
            <PackageSearch className="size-10 text-muted" aria-hidden />
            <h3 className="mt-6 font-display text-3xl">Nothing here yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">Try another category or clear your search.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHero
        eyebrow="The collection"
        title={<>Shop <em className="text-accent">Flora &amp; Flame</em></>}
        description="Cannabis flowers, grabba and accessories — a deliberately small edit for adults 19+."
        image={<SmartImage src={IMAGES.flowerHero} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-60" />}
      />
      <Container className="pb-28">
        <div className="mb-10 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <p>
            Online ordering is not available yet. Prices are shown in CAD, and product photos may be illustrative. Product information is provided by the licensed producer or supplier — contact us with any
            questions.
          </p>
        </div>
        <Suspense
          fallback={
            <>
              <div className="h-14 animate-pulse rounded-full bg-surface" />
              <div className="mt-16">
                <ProductGridSkeleton />
              </div>
            </>
          }
        >
          <Results searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}
