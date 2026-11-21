import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AgeGate } from "@/components/site/age-gate";
import { getSettings } from "@/lib/data/queries";
import { BRAND } from "@/lib/brand";
import { siteUrl } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    slogan: BRAND.tagline,
    url: siteUrl(),
    email: settings.contact_email,
    telephone: BRAND.phone,
    address: { "@type": "PostalAddress", addressLocality: "North York", addressRegion: "ON", addressCountry: "CA" },
  };
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[200] rounded-full bg-accent px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header announcement={settings.announcement} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <AgeGate />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
