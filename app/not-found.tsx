import Link from "next/link";
import { LogoMark } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-12 text-accent" />
      <p className="mt-8 text-[11px] tracking-[0.3em] text-muted uppercase">Error 404</p>
      <h1 className="mt-4 font-display text-6xl md:text-8xl">Lost in the city.</h1>
      <p className="mt-6 max-w-md text-muted">The page you&rsquo;re looking for has moved or never existed.</p>
      <div className="mt-10 flex gap-3">
        <Link href="/" className="rounded-full bg-accent px-6 py-3 text-sm text-ink transition-colors hover:bg-cream">
          Return home
        </Link>
        <Link href="/shop" className="rounded-full border border-line-strong px-6 py-3 text-sm transition-colors hover:border-accent hover:text-accent">
          Browse the shop
        </Link>
      </div>
    </main>
  );
}
