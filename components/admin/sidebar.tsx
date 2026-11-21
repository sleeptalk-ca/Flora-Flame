"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ExternalLink,
  FolderTree,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  Warehouse,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/site/logo";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory & prices", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email, newInquiries }: { email: string; newInquiries: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(href) ? "bg-accent/10 text-accent" : "text-cream/75 hover:bg-surface-2 hover:text-cream",
          )}
        >
          <Icon className="size-4" aria-hidden />
          <span className="flex-1">{label}</span>
          {href === "/admin/inquiries" && newInquiries > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-ink">{newInquiries}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:text-cream">
        <ExternalLink className="size-4" aria-hidden /> View storefront
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:text-danger">
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-[11px] text-muted/70" title={email}>
        {email}
      </p>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-ink/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="size-6 text-accent" />
          <span className="font-display text-xl">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="flex size-10 items-center justify-center rounded-full border border-line-strong"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 top-16 z-30 flex flex-col justify-between overflow-y-auto bg-ink p-4 lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-line bg-surface p-4 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 flex items-center gap-3 px-3 pt-2">
            <LogoMark className="size-7 text-accent" />
            <span className="leading-tight">
              <span className="block font-display text-xl">Talk To Me</span>
              <span className="block text-[10px] tracking-[0.24em] text-muted uppercase">Admin</span>
            </span>
          </Link>
          {nav}
        </div>
        {footer}
      </aside>
    </>
  );
}
