import { BRAND } from "@/lib/brand";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, PageHero } from "./section-heading";
import { getSettings } from "@/lib/data/queries";

const LEGAL_NAV = [
  { href: "/legal/terms", label: "Terms of use" },
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/shipping", label: "Shipping & pickup" },
  { href: "/legal/refunds", label: "Refunds & returns" },
  { href: "/legal/compliance", label: "Compliance" },
];

export const LEGAL_UPDATED = "November 18, 2026";

export async function LegalPage({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: string;
  current: string;
  children: ReactNode;
}) {
  const settings = await getSettings();
  return (
    <>
      <PageHero eyebrow="Legal" title={title} description={intro} />
      <Container className="pb-28">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
          <nav aria-label="Legal pages" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1">
              {LEGAL_NAV.map((l) => (
                <li key={l.href} className="shrink-0">
                  <Link
                    href={l.href}
                    aria-current={l.href === current ? "page" : undefined}
                    className="block rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-cream aria-[current=page]:bg-surface aria-[current=page]:text-accent lg:rounded-xl"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <article className="legal max-w-3xl space-y-6 text-[15px] leading-relaxed text-muted [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-cream [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-cream [&_ul]:space-y-2">
            <p className="text-xs tracking-[0.14em] uppercase">Last updated: {LEGAL_UPDATED}</p>
            {children}
            <h2>Contact</h2>
            <p>
              Questions about this page? Email{" "}
              <a className="text-accent link-underline" href={`mailto:${settings.contact_email}`}>
                {settings.contact_email}
              </a>{" "}
              or call {BRAND.phone}. {settings.contact_address}.
            </p>
          </article>
        </div>
      </Container>
    </>
  );
}
