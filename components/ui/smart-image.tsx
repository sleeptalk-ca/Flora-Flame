import Image, { type ImageProps } from "next/image";

const OPTIMIZABLE = [/^https:\/\/images\.pexels\.com\//, /^https:\/\/images\.unsplash\.com\//, /^\/media\//];

function isOptimizable(src: string) {
  if (OPTIMIZABLE.some((re) => re.test(src))) return true;
  const sb = process.env.SUPABASE_URL;
  return Boolean(sb && src.startsWith(`${sb.replace(/\/$/, "")}/storage/v1/object/public/`));
}

/**
 * next/image wrapper: optimizes images from known hosts, and falls back to an
 * unoptimized render for any other https URL an admin pastes (so it never breaks).
 */
export function SmartImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const safeSrc = src || "/placeholder.svg";
  return <Image src={safeSrc} alt={alt} unoptimized={!isOptimizable(safeSrc)} {...props} />;
}
