import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  // Brand mark for Talk To Me (TTM).
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity=".35" />
      <path
        d="M16 6c4.2 4.1 6.3 7.7 6.3 11a6.3 6.3 0 0 1-12.6 0c0-2 .8-3.9 2.3-5.6.3 1.9 1.3 3.2 2.9 3.8C14.1 12 14.5 9 16 6Z"
        fill="currentColor"
      />
      <path d="M16 24.5V16" stroke="#10120F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3 text-cream", className)} aria-label="Talk To Me — home">
      <LogoMark className="text-accent transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:rotate-[20deg]" />
      <span className="font-display text-2xl leading-none tracking-tight">
        Talk <span className="italic text-accent">To</span> Me
      </span>
    </Link>
  );
}
