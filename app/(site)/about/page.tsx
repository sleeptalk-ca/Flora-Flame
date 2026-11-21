import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Container, Eyebrow, PageHero, SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/ui/smart-image";
import { LinkButton } from "@/components/ui/button";
import { IMAGES } from "@/lib/data/seed";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description: "The story of Talk To Me — a premium Toronto lifestyle house rooted in North York, built on quality, discretion and design.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    n: "01",
    title: "Quality, quietly",
    text: "We keep the edit small so every piece earns its place. If we wouldn't put it on our own shelf, it doesn't make the list.",
  },
  {
    n: "02",
    title: "Honest information",
    text: "No hype and no invented claims. Product details come straight from the licensed producer or supplier — exactly as labelled.",
  },
  {
    n: "03",
    title: "Responsibility first",
    text: "Adults 19+ only, ID checked every time, and a compliance-first approach to everything from marketing to payments.",
  },
  {
    n: "04",
    title: "Toronto hospitality",
    text: "Personal, discreet and unhurried. The same care you'd expect from the city's best boutiques and dining rooms.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={<>A North York house with a <em className="text-accent">Toronto</em> point of view.</>}
        description={BRAND.description}
        image={<SmartImage src={IMAGES.skylineDusk} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />}
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <SmartImage src={IMAGES.hallway} alt="A minimal, softly lit corridor" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            </Reveal>
            <Reveal className="space-y-8 lg:col-span-7 lg:pt-16" delay={120}>
              <Eyebrow>Beginnings</Eyebrow>
              <p className="font-display text-4xl leading-[1.15] tracking-tight md:text-5xl">
                We grew up between the 401 and the lake — on late TTC rides, Sheppard patios and Sunday drives down the Don Valley.
              </p>
              <div className="space-y-5 text-base leading-relaxed text-muted">
                <p>
                  {BRAND.name} began as a conversation between friends in North York: why did so much of this category feel either
                  clinical or careless? Toronto deserved something better — a place where design, discretion and genuine knowledge
                  came first.
                </p>
                <p>
                  So we built a house around those ideas. A deliberately small collection of cannabis flower, grabba and accessories,
                  presented with the care of a gallery and the warmth of a neighbourhood shop. Every listing is reviewed by us;
                  every customer is welcomed like a regular.
                </p>
                <p>
                  We take the responsibility that comes with this work seriously. We serve adults 19+ only, we verify ID for every
                  purchase, and we only sell what we are properly authorized to sell in Ontario.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-24 md:py-32">
        <Container>
          <SectionHeading eyebrow="What we stand for" title="Four principles." />
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2">
            {VALUES.map((v, i) => (
              <Reveal key={v.n} delay={i * 100} className="group bg-surface p-8 transition-colors duration-700 hover:bg-surface-2 md:p-12">
                <p className="font-display text-5xl text-accent/40 transition-colors duration-700 group-hover:text-accent">{v.n}</p>
                <h3 className="mt-8 font-display text-3xl">{v.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden">
        <div className="relative h-[70vh] min-h-[460px]">
          <SmartImage src={IMAGES.skylineLake} alt="Toronto skyline and CN Tower across the lake at night" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
          <Container className="relative flex h-full items-end pb-16 md:pb-24">
            <Reveal className="max-w-3xl">
              <p className="font-display text-4xl leading-[1.1] md:text-6xl">
                &ldquo;The city moves fast. <em className="text-accent">We&rsquo;d rather you slow down.</em>&rdquo;
              </p>
              <p className="mt-6 text-xs tracking-[0.3em] text-muted uppercase">— The {BRAND.name} house</p>
            </Reveal>
          </Container>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <Container className="text-center">
          <Reveal>
            <Eyebrow className="justify-center">Visit the collection</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">{BRAND.tagline}</h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <LinkButton href="/shop" size="lg">
                Shop now <ArrowRight className="size-4" />
              </LinkButton>
              <LinkButton href="/contact" variant="outline" size="lg">
                Contact us
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
