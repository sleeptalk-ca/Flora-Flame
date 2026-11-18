"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

export function ShopToolbar({ categories }: { categories: { slug: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const active = params.get("category") ?? "";
  const sort = params.get("sort") ?? "featured";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounced search.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const pill = (isActive: boolean) =>
    cn(
      "rounded-full border px-5 py-2.5 text-xs tracking-[0.14em] uppercase transition-all duration-500",
      isActive ? "border-accent bg-accent text-ink" : "border-line-strong text-cream/80 hover:border-accent hover:text-accent",
    );

  return (
    <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0" role="tablist" aria-label="Categories">
        <button type="button" role="tab" aria-selected={!active} className={pill(!active)} onClick={() => update({ category: null })}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={active === c.slug}
            className={cn(pill(active === c.slug), "shrink-0")}
            onClick={() => update({ category: c.slug })}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className={cn(inputClasses, "rounded-full pl-11")}
          />
          {pending && <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-accent" aria-label="Loading" />}
        </div>
        <select
          aria-label="Sort products"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
          className={cn(inputClasses, "rounded-full sm:w-52")}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
