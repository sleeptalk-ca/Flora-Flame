import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductCard } from "@/components/site/product-card";
import { Container, Eyebrow } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { AvailabilityBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/data/queries";
import { formatCAD, AVAILABILITY_LABEL } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  // Cache Components requires at least one param; unknown slugs render on demand.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "placeholder" }];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return {
    title: product.name,
    description: product.short_description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: { title: product.name, description: product.short_description, images: [{ url: product.image_url }] },
  };
}

async function ProductDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const restricted = product.category?.restricted ?? "none";
  const info: [string, string][] = [
    ["Category", product.category?.name ?? "—"],
    ["Price", `${formatCAD(product.price_cents)} CAD`],
    ["Availability", AVAILABILITY_LABEL[product.availability]],
    ...(product.sku ? ([["SKU", product.sku]] as [string, string][]) : []),
    ["Age requirement", "19+ with valid government-issued photo ID"],
  ];

  return (
    <>
      <Container className="pt-8 pb-24">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs tracking-[0.14em] text-muted uppercase">
          <Link href="/shop" className="inline-flex items-center gap-2 transition-colors hover:text-accent">
            <ArrowLeft className="size-3.5" /> Shop
          </Link>
          {product.category && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="transition-colors hover:text-accent">
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="animate-fade-in lg:sticky lg:top-28 lg:self-start">
            <ProductGallery
              images={[product.image_url, ...product.gallery]}
              name={product.name}
              illustrative={product.image_is_illustrative}
            />
          </div>

          <div className="animate-fade-up">
            <div className="flex flex-wrap items-center gap-2">
              <AvailabilityBadge value={product.availability} />
            </div>
            <p className="mt-6 text-[11px] font-semibold tracking-[0.3em] text-accent uppercase">{product.category?.name}</p>
            <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight md:text-7xl">{product.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-cream/80">{product.short_description}</p>

            <div className="mt-8 flex items-baseline gap-3 border-y border-line py-6">
              <span className="font-display text-4xl">{formatCAD(product.price_cents)}</span>
              <span className="text-xs tracking-[0.14em] text-muted uppercase">CAD</span>
            </div>

            {restricted === "tobacco" && (
              <p className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm font-medium text-warning">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                WARNING: Tobacco products contain nicotine, which is highly addictive.
              </p>
            )}

            <div className="mt-8 space-y-3">
              <button
                type="button"
                disabled
                aria-describedby="ordering-note"
                className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-line-strong text-sm tracking-[0.14em] text-muted uppercase"
              >
                <Lock className="size-4" aria-hidden /> Online ordering unavailable
              </button>
              <LinkButton href={`/contact?product=${encodeURIComponent(product.slug)}`} size="lg" className="w-full">
                <MessageCircle className="size-4" aria-hidden /> Ask about this product
              </LinkButton>
              <p id="ordering-note" className="text-center text-xs leading-relaxed text-muted">
                Checkout is disabled until a compliant payment provider and all required Ontario authorizations are in place.{" "}
                <Link href="/checkout" className="text-accent link-underline">
                  Learn more
                </Link>
              </p>
            </div>

            <section className="mt-12">
              <Eyebrow>Description</Eyebrow>
              <div className="mt-5 space-y-4 leading-relaxed text-muted">
                {product.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <Eyebrow>Product information</Eyebrow>
              <dl className="mt-5 divide-y divide-line rounded-2xl border border-line">
                {info.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-sm">
                    <dt className="text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                {product.details && (
                  <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-sm">
                    <dt className="text-muted">Details</dt>
                    <dd className="whitespace-pre-line">{product.details}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                {restricted === "cannabis"
                  ? "Potency and other regulated information appear exactly as printed on the licensed producer's Health Canada label. We do not make health or effect claims."
                  : "Product details are supplied by the manufacturer or supplier."}
              </p>
            </section>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line bg-surface py-24">
          <Container>
            <Reveal className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>You may also like</Eyebrow>
                <h2 className="mt-5 font-display text-4xl md:text-5xl">Related pieces</h2>
              </div>
              <LinkButton href="/shop" variant="outline" className="hidden sm:inline-flex">
                All products <ArrowRight className="size-4" />
              </LinkButton>
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <Container className="pt-8 pb-24">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-surface" />
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              <div className="h-16 w-3/4 animate-pulse rounded bg-surface" />
              <div className="h-24 animate-pulse rounded bg-surface" />
            </div>
          </div>
        </Container>
      }
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}
