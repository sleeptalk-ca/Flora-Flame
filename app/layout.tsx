import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { BRAND, AGE_COOKIE } from "@/lib/brand";
import { siteUrl } from "@/lib/utils";
import { IMAGES } from "@/lib/data/seed";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: ["Talk To Me", "North York", "Toronto", "lifestyle", "accessories", "Ontario", "19+"],
  openGraph: {
    type: "website",
    locale: BRAND.locale,
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [{ url: IMAGES.hero, width: 2400, height: 1600, alt: "Toronto skyline at night" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#10120F",
  colorScheme: "dark",
};

/**
 * Runs before paint: marks JS as available (for scroll reveals) and hides the age gate
 * immediately for visitors who already confirmed their age — prevents a flash of the modal.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(document.cookie.split('; ').indexOf('${AGE_COOKIE}=1')>-1){d.setAttribute('data-age-verified','true')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-ink text-cream">{children}</body>
    </html>
  );
}
