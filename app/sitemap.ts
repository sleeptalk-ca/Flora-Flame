import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/queries";
import { siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  const staticRoutes = ["", "/shop", "/about", "/contact", "/legal/terms", "/legal/privacy", "/legal/shipping", "/legal/refunds", "/legal/compliance"];
  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
