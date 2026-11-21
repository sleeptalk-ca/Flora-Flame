import type { Metadata } from "next";
import { CheckCircle2, CircleSlash, CreditCard, Lock } from "lucide-react";
import { Container, PageHero } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/button";
import { getSettings } from "@/lib/data/queries";
import { getCheckoutStatus } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Ordering status",
  description: "Online ordering status for Talk To Me.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  const status = getCheckoutStatus(settings.compliance);

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title={<>Online ordering is <em className="text-accent">{status.enabled ? "open" : "not yet available"}</em>.</>}
        description="We only take payment once every legal and payment-provider requirement is in place. Until then, you're welcome to browse and contact us with questions."
      />
      <Container className="pb-28">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-line bg-surface p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-accent" aria-hidden />
              <h2 className="font-display text-3xl">Why checkout is closed</h2>
            </div>
            <ul className="mt-8 space-y-4">
              {status.reasons.length ? (
                status.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                    <CircleSlash className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                    {r}
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-3 text-sm text-accent">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> All requirements are met.
                </li>
              )}
            </ul>
          </section>
          <section className="rounded-3xl border border-line bg-surface p-8 md:p-10">
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-accent" aria-hidden />
              <h2 className="font-display text-3xl">Our commitment</h2>
            </div>
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                We will never route cannabis or tobacco payments through a processor that does not permit them, and we will not
                accept payment for cannabis unless we hold the required Ontario retail authorization.
              </p>
              <p>
                When ordering opens, every order will require age verification with valid government-issued photo ID at pickup or
                delivery.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton href="/shop">Browse the collection</LinkButton>
              <LinkButton href="/contact" variant="outline">
                Contact us
              </LinkButton>
            </div>
          </section>
        </div>
      </Container>
    </>
  );
}
