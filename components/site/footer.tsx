import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import { Logo } from "./logo";
import { getSettings } from "@/lib/data/queries";
import { BRAND } from "@/lib/brand";
import { telHref } from "@/lib/utils";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=cannabis-flowers", label: "Cannabis Flowers" },
      { href: "/shop?category=grabba", label: "Grabba" },
      { href: "/shop?category=accessories", label: "Accessories" },
    ],
  },
  {
    title: "House",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/contact", label: "Contact" },
      { href: "/checkout", label: "Ordering status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of use" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/shipping", label: "Shipping & pickup" },
      { href: "/legal/refunds", label: "Refunds & returns" },
      { href: "/legal/compliance", label: "Compliance" },
    ],
  },
];

export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="relative mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-[1440px] px-5 pt-20 pb-10 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm font-display text-3xl leading-tight text-cream/90">{BRAND.tagline}</p>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li>
                <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-3 transition-colors hover:text-accent">
                  <Mail className="size-4" aria-hidden /> {settings.contact_email}
                </a>
              </li>
              <li>
                <a href={telHref(settings.contact_phone)} className="inline-flex items-center gap-3 transition-colors hover:text-accent">
                  <Phone className="size-4" aria-hidden /> {settings.contact_phone}
                </a>
              </li>
              <li className="inline-flex items-center gap-3">
                <MapPin className="size-4" aria-hidden /> {settings.contact_address}
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold tracking-[0.24em] text-muted uppercase">{col.title}</h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-underline text-sm text-cream/80 transition-colors hover:text-cream">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-line bg-ink/50 p-5 text-xs leading-relaxed text-muted md:p-6">
          <p>
            <strong className="text-cream">For adults 19+ only.</strong> Products are not available to anyone under the legal age in Ontario.
            Online ordering is not active. Cannabis is sold only where the operator holds the required AGCO authorization; valid
            government-issued photo ID is required for every purchase. Do not drive or operate machinery while impaired. Keep out of
            reach of children and pets.
          </p>
          <p className="mt-2">
            <strong className="text-cream">Tobacco warning:</strong> Tobacco products, including grabba, contain nicotine, which is highly
            addictive. Product imagery on this site may be illustrative.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © <CopyrightYear /> {BRAND.name}. {BRAND.region}.
          </p>
          <p className="tracking-[0.14em] uppercase">Crafted in North York</p>
        </div>
      </div>
    </footer>
  );
}
