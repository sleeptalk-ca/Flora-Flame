import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { AvailabilityBadge, Badge } from "@/components/ui/badge";
import { formatCAD, cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductWithCategory;
  priority?: boolean;
  className?: string;
}) {
  const unavailable = product.availability === "out_of_stock";
  return (
    <article className={cn("group relative", className)}>
      <Link href={`/shop/${product.slug}`} className="block focus-visible:outline-none" aria-label={`${product.name} — view details`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          <SmartImage
            src={product.image_url}
            alt={`${product.name}${product.image_is_illustrative ? " (illustrative image)" : ""}`}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              "object-cover transition-transform duration-[1400ms] ease-[var(--ease-luxe)] group-hover:scale-[1.06]",
              unavailable && "grayscale-[60%]",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-ink/20 opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <AvailabilityBadge value={product.availability} />
          </div>
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {product.is_demo && <Badge tone="neutral">Demo</Badge>}
          </div>
          {product.image_is_illustrative && (
            <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.12em] text-cream/70 uppercase">Illustrative image</span>
          )}
          <span className="absolute right-3 bottom-3 flex size-10 translate-y-3 items-center justify-center rounded-full bg-cream text-ink opacity-0 transition-all duration-500 ease-[var(--ease-luxe)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-muted uppercase">{product.category?.name}</p>
            <h3 className="mt-1.5 font-display text-2xl leading-tight transition-colors duration-300 group-hover:text-accent">
              {product.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.short_description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium text-cream">{formatCAD(product.price_cents)}</p>
            <p className="text-[10px] tracking-wide text-muted uppercase">CAD{product.is_demo ? " · demo" : ""}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductWithCategory[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-2xl bg-surface" />
      <div className="mt-5 h-3 w-20 rounded bg-surface" />
      <div className="mt-3 h-6 w-2/3 rounded bg-surface" />
      <div className="mt-3 h-4 w-full rounded bg-surface" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
