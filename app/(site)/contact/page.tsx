import { BRAND } from "@/lib/brand";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container, Eyebrow, PageHero } from "@/components/site/section-heading";
import { ContactForm } from "@/components/site/contact-form";
import { SmartImage } from "@/components/ui/smart-image";
import { getProductBySlug, getSettings } from "@/lib/data/queries";
import { IMAGES } from "@/lib/data/seed";
import { telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Talk To Me in North York, Ontario. Email, phone and a secure contact form.",
  alternates: { canonical: "/contact" },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function FormWithProduct({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const slug = typeof sp.product === "string" ? sp.product.slice(0, 80) : "";
  const product = slug ? await getProductBySlug(slug) : null;
  return <ContactForm product={product ? { id: product.id, name: product.name } : null} />;
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const settings = await getSettings();
  const items = [
    { icon: Mail, label: "Email", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    { icon: Phone, label: "Phone", value: BRAND.phone, href: telHref(BRAND.phone) },
    { icon: MapPin, label: "Address", value: settings.contact_address },
    { icon: Clock, label: "Hours", value: settings.business_hours },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Let&rsquo;s <em className="text-accent">talk.</em></>}
        description="Questions about a product, availability or an appointment — send us a note and we'll respond personally."
        image={<SmartImage src={IMAGES.skylineHarbour} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />}
      />
      <Container className="pb-28">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <aside>
            <Eyebrow>Details</Eyebrow>
            <ul className="mt-8 space-y-px overflow-hidden rounded-3xl border border-line">
              {items.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-5 bg-surface p-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-accent">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block break-words text-lg transition-colors hover:text-accent">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-lg">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Please don&rsquo;t send ID documents or payment details through this form. We&rsquo;ll never ask for them by email.
            </p>
          </aside>

          <div className="rounded-3xl border border-line bg-surface p-6 md:p-10">
            <h2 className="font-display text-4xl">Send a message</h2>
            <p className="mt-2 text-sm text-muted">All fields are required unless marked optional.</p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-[560px] animate-pulse rounded-2xl bg-ink/40" />}>
                <FormWithProduct searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
