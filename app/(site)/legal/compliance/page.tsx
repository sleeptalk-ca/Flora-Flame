import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Compliance", alternates: { canonical: "/legal/compliance" } };

export default function CompliancePage() {
  return (
    <LegalPage
      current="/legal/compliance"
      title="Compliance"
      intro="How Talk To Me approaches age, licensing, marketing and payment rules in Ontario."
    >
      <h2>Legal age</h2>
      <p>
        The minimum age to buy, possess or consume recreational cannabis in Ontario is <strong>19</strong>. The minimum age to buy
        tobacco in Ontario is also 19. The age confirmation at site entry is a courtesy gate, not identity verification — every
        purchase requires valid government-issued photo ID.
      </p>
      <h2>Cannabis retail authorization</h2>
      <p>
        Private cannabis retail in Ontario requires licensing by the Alcohol and Gaming Commission of Ontario (AGCO), including a Retail
        Operator Licence and a Retail Store Authorization. <strong>Cannabis sales through this website are disabled</strong> until the
        operator holds and records the required authorizations.
      </p>
      <h2>Tobacco</h2>
      <p>
        Grabba is tobacco leaf. Tobacco products contain nicotine, which is highly addictive. Tobacco is sold only to adults 19+ in
        accordance with the Smoke-Free Ontario Act, 2017 and applicable federal law.
      </p>
      <h2>Marketing standards</h2>
      <ul>
        <li>We do not make health, therapeutic or effect claims.</li>
        <li>We do not publish potency or other regulated information except as provided on the regulated product label.</li>
        <li>We don&rsquo;t direct content at young people, and we don&rsquo;t use testimonials or endorsements for regulated products.</li>
        <li>Product imagery is clearly identified when it is illustrative.</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Checkout is disabled. We will only accept payments through a provider that has explicitly approved this business for the
        product categories sold. We do not route restricted products through processors that prohibit them, and we do not
        misdescribe products to payment providers.
      </p>
      <h2>Responsible use</h2>
      <p>
        Don&rsquo;t drive or operate machinery while impaired. Keep products locked away from children and pets. If you have concerns
        about substance use, ConnexOntario offers free, confidential support 24/7 at 1-866-531-2600.
      </p>
    </LegalPage>
  );
}
