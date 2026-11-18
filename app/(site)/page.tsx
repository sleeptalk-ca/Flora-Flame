import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone, ShieldCheck, Sparkles, Store } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Container, Eyebrow, SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/site/product-card";
import { getBestSellers, getCategories, getFeaturedProducts, getSettings } from "@/lib/data/queries";
import { IMAGES } from "@/lib/data/seed";
import { BRAND } from "@/lib/brand";
import { telHref } from "@/lib/utils";

export default async function HomePage() {
  const [settings, featured, bestSellers, categories] = await Promise.all([
    getSettings(),
    getFeaturedProducts(),
    getBestSellers(4),
    getCategories(),
  ]);

  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative -mt-20 flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 animate-slow-zoom">
          <SmartImage
            src={settings.hero_image_url}
            alt="Toronto skyline at night"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
        <div className="grain absolute inset-0" />

        <Container className="relative pt-36 pb-16 md:pb-24">
          <div className="max-w-4xl">
            <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
              <Eyebrow>{settings.hero_eyebrow}</Eyebrow>
            </div>
            <h1
              className="mt-6 animate-fade-up font-display text-[3.4rem] leading-[0.95] tracking-tight text-balance sm:text-7xl md:text-8xl lg:text-[8.5rem]"
              style={{ animationDelay: "300ms" }}
            >
              {settings.hero_title}
            </h1>
            <p
              className="mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-cream/75 md:text-lg"
              style={{ animationDelay: "500ms" }}
            >
              {settings.hero_subtitle}
            </p>
            <div className="mt-10 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "700ms" }}>
              <LinkButton href="/shop" size="lg">
                Explore the collection <ArrowRight className="size-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
              </LinkButton>
              <LinkButton href="/about" variant="outline" size="lg">
                Our story
              </LinkButton>
            </div>
          </div>

          <div
            className="mt-16 grid animate-fade-in grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3"
            style={{ animationDelay: "1000ms" }}
          >
            {[
              { icon: Sparkles, title: "Curated, not crowded", text: "A tight edit chosen for quality and presentation." },
              { icon: Store, title: "Rooted in North York", text: "Local, personal and by appointment." },
              { icon: ShieldCheck, title: "Adults 19+ only", text: "Photo ID required. Compliance first, always." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4 bg-ink/70 p-5 backdrop-blur-md md:p-6">
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ——— BRAND INTRODUCTION ——— */}
      <section className="py-28 md:py-40">
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <Eyebrow>The house</Eyebrow>
              <p className="mt-8 font-display text-4xl leading-[1.15] tracking-tight text-balance md:text-6xl">
                {BRAND.name} is a North York house for considered living — <em className="text-accent">where the city&rsquo;s
                energy meets a slower, more deliberate ritual.</em>
              </p>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
                We keep the edit small on purpose. Every flower, leaf and accessory we list is chosen for presentation,
                freshness and design — and every interaction is handled with the discretion Toronto expects.
              </p>
              <Link href="/about" className="link-underline mt-8 inline-flex items-center gap-2 pb-1 text-sm tracking-[0.14em] text-accent uppercase">
                Read our story <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
            <Reveal className="relative lg:col-span-5" delay={150}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                <SmartImage src={IMAGES.loungeArches} alt="A softly lit lounge with arched windows" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-6 hidden w-48 overflow-hidden rounded-2xl border-4 border-ink md:block">
                <div className="relative aspect-square">
                  <SmartImage src={IMAGES.skylineDusk} alt="Toronto skyline at dusk" fill sizes="200px" className="object-cover" />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ——— FEATURED COLLECTION ——— */}
      {featured.length > 0 && (
        <section className="border-t border-line py-24 md:py-32">
          <Container>
            <SectionHeading
              eyebrow="Featured collection"
              title={<>The current <em className="text-accent">edit</em></>}
              description="Hand-picked by the house this season. Listings marked Demo are samples with illustrative imagery."
              action={
                <LinkButton href="/shop" variant="outline">
                  View all <ArrowRight className="size-4" />
                </LinkButton>
              }
            />
            <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 120}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ——— CATEGORIES ——— */}
      <section className="bg-surface py-24 md:py-32">
        <Container>
          <SectionHeading eyebrow="Shop by category" title="Three disciplines." align="center" />
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.id} delay={i * 120}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-3xl"
                >
                  <SmartImage
                    src={c.image_url || "/placeholder.svg"}
                    alt={c.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <p className="text-[11px] tracking-[0.3em] text-accent uppercase">0{i + 1}</p>
                    <h3 className="mt-3 font-display text-4xl">{c.name}</h3>
                    <p className="mt-3 line-clamp-2 max-w-xs text-sm leading-relaxed text-cream/70">{c.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase transition-colors group-hover:text-accent">
                      Discover <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ——— BEST SELLERS ——— */}
      {bestSellers.length > 0 && (
        <section className="py-24 md:py-32">
          <Container>
            <SectionHeading
              eyebrow="Best sellers"
              title="Most requested."
              description="The pieces our guests ask about most often."
            />
            <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map((p, i) => (
                <Reveal key={p.id} delay={i * 100}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ——— BRAND STORY ——— */}
      <section className="relative overflow-hidden border-y border-line">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[720px]">
            <SmartImage src={IMAGES.lounge} alt="A dark, warmly lit lounge interior" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/40" />
          </div>
          <div className="flex items-center bg-surface">
            <Reveal className="px-6 py-20 md:px-16 lg:px-20">
              <Eyebrow>Our story</Eyebrow>
              <h2 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
                Born north of Bloor. <br />
                <em className="text-accent">Made for the whole city.</em>
              </h2>
              <p className="mt-8 max-w-lg leading-relaxed text-muted">
                {BRAND.name} started with a simple idea: the experience should feel as considered as the city&rsquo;s best
                restaurants and boutiques. Quiet design, honest information and genuine hospitality — from Yonge &amp; Sheppard
                to the waterfront.
              </p>
              <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-8">
                <div>
                  <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">Based in</dt>
                  <dd className="mt-2 font-display text-2xl">North York, ON</dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">Service</dt>
                  <dd className="mt-2 font-display text-2xl">Adults 19+</dd>
                </div>
              </dl>
              <LinkButton href="/about" variant="outline" className="mt-12">
                The full story <ArrowRight className="size-4" />
              </LinkButton>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ——— LIFESTYLE PHOTOGRAPHY ——— */}
      <section className="py-24 md:py-32">
        <Container>
          <SectionHeading eyebrow="The city" title={<>Toronto, <em className="text-accent">after dark.</em></>} description="The skyline, the lake, the late nights — the city that shapes our point of view." />
          <div className="mt-16 grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[240px] md:grid-cols-4">
            {[
              { src: IMAGES.skylineNight, alt: "Toronto towers lit at night", cls: "col-span-2 row-span-2" },
              { src: IMAGES.skylineWater, alt: "Toronto skyline reflected on Lake Ontario", cls: "col-span-2" },
              { src: IMAGES.hallway, alt: "A moody minimalist hallway", cls: "row-span-2" },
              { src: IMAGES.skylineHarbour, alt: "Toronto harbourfront at night", cls: "row-span-2" },
              { src: IMAGES.skylineLake, alt: "CN Tower over the lake at night", cls: "col-span-2" },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 90} className={`group relative overflow-hidden rounded-2xl ${img.cls}`}>
                <SmartImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] group-hover:scale-105"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ——— CONTACT ——— */}
      <section className="pb-28 md:pb-36">
        <Container>
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-line bg-surface">
            <div className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full bg-accent/10 blur-3xl" />
            <div className="relative grid gap-12 p-8 md:p-16 lg:grid-cols-2 lg:items-center">
              <div>
                <Eyebrow>Get in touch</Eyebrow>
                <h2 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
                  Questions? <em className="text-accent">We&rsquo;re close by.</em>
                </h2>
                <p className="mt-6 max-w-md leading-relaxed text-muted">
                  Ask about a product, availability or an appointment. We usually reply within one business day.
                </p>
                <LinkButton href="/contact" size="lg" className="mt-10">
                  Contact us <ArrowRight className="size-4" />
                </LinkButton>
              </div>
              <ul className="divide-y divide-line rounded-2xl border border-line bg-ink/40">
                {[
                  { icon: Mail, label: "Email", value: settings.contact_email, href: `mailto:${settings.contact_email}` },
                  { icon: Phone, label: "Phone", value: settings.contact_phone, href: telHref(settings.contact_phone) },
                  { icon: MapPin, label: "Location", value: settings.contact_address },
                ].map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-center gap-5 p-6">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-accent">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{label}</p>
                      {href ? (
                        <a href={href} className="mt-1 block truncate text-lg transition-colors hover:text-accent">
                          {value}
                        </a>
                      ) : (
                        <p className="mt-1 text-lg">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
