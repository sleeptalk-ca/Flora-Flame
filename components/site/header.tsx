"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=cannabis-flowers", label: "Flowers" },
  { href: "/shop?category=grabba", label: "Grabba" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change (state adjusted during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/shop" ? pathname.startsWith("/shop") : pathname === href.split("?")[0]);

  return (
    <>
      {announcement && (
        <div className="relative z-50 border-b border-line bg-surface px-4 py-2 text-center text-[11px] tracking-[0.12em] text-muted uppercase">
          {announcement}
        </div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-700 ease-[var(--ease-luxe)]",
          scrolled ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-underline pb-1 text-[13px] tracking-[0.12em] uppercase transition-colors duration-300",
                  isActive(item.href) && item.href === "/shop" ? "text-accent" : "text-cream/80 hover:text-cream",
                  isActive(item.href) && item.href !== "/shop" && "text-accent",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-xs tracking-[0.14em] uppercase transition-all duration-500 hover:border-accent hover:text-accent md:inline-flex"
            >
              Inquire <ArrowUpRight className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-30 bg-ink/98 backdrop-blur-xl transition-all duration-700 ease-[var(--ease-luxe)] lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className="flex h-full flex-col justify-center gap-2 px-8 pt-20">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              className={cn(
                "font-display text-5xl text-cream transition-all duration-700 ease-[var(--ease-luxe)] hover:text-accent",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
          <p className="mt-10 text-xs tracking-[0.18em] text-muted uppercase">Adults 19+ · North York, Ontario</p>
        </nav>
      </div>
    </>
  );
}
