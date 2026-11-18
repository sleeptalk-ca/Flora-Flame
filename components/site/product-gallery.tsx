"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const OPTIMIZABLE = [/^https:\/\/images\.pexels\.com\//, /^https:\/\/images\.unsplash\.com\//, /^\/media\//, /\.supabase\.co\/storage\/v1\/object\/public\//];
const optimizable = (src: string) => OPTIMIZABLE.some((re) => re.test(src));

export function ProductGallery({ images, name, illustrative }: { images: string[]; name: string; illustrative: boolean }) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] ?? "/placeholder.svg";

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {list.length > 1 && (
        <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 md:size-24",
                i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="96px" unoptimized={!optimizable(src)} className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-surface">
        {list.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt={i === active ? `${name}${illustrative ? " — illustrative image" : ""}` : ""}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized={!optimizable(src)}
            className={cn(
              "object-cover transition-all duration-1000 ease-[var(--ease-luxe)]",
              i === active ? "scale-100 opacity-100" : "scale-105 opacity-0",
            )}
          />
        ))}
        {list.length === 0 && (
          <Image src={current} alt={name} fill unoptimized className="object-cover" />
        )}
        {illustrative && (
          <span className="absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1.5 text-[10px] tracking-[0.14em] text-cream/80 uppercase backdrop-blur">
            Illustrative image — not the actual product
          </span>
        )}
      </div>
    </div>
  );
}
