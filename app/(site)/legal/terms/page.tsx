import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/legal/terms" } };

export default function TermsPage() {
  return (
    <LegalPage
      current="/legal/terms"
      title="Terms of use"
      intro="The rules for using the Talk To Me website. Please read them carefully."
    >
      <h2>1. Eligibility</h2>
      <p>
        This website is intended only for adults who are <strong>19 years of age or older</strong> and located in Ontario, Canada. By
        entering, you confirm that you meet this requirement. The age confirmation at entry is not identity verification; valid
        government-issued photo ID is required for any purchase.
      </p>
      <h2>2. Information only — no online sales</h2>
      <p>
        Online ordering and payment are currently disabled. Nothing on this website is an offer to sell any product to any person or in
        any place where the sale would be unlawful. Products will only be sold where the operator holds every required authorization,
        including authorization from the Alcohol and Gaming Commission of Ontario (AGCO) for cannabis.
      </p>
      <h2>3. Product information and imagery</h2>
      <ul>
        <li>Images marked &ldquo;Illustrative&rdquo; are stock photography and do not show the actual product.</li>
        <li>Prices are shown in Canadian dollars (CAD) and may change without notice.</li>
        <li>Regulated product information (for example, cannabinoid content) is shown only as provided on the producer&rsquo;s label.</li>
      </ul>
      <h2>4. No health claims</h2>
      <p>
        We do not make claims about the health, therapeutic or other effects of any product. Nothing on this site is medical advice.
      </p>
      <h2>5. Acceptable use</h2>
      <p>
        You agree not to misuse the site, attempt to access restricted areas, interfere with its security, or submit false information.
      </p>
      <h2>6. Intellectual property</h2>
      <p>
        The Talk To Me name, logo and original content belong to the operator. Third-party photography is used under the
        licence of its source.
      </p>
      <h2>7. Limitation of liability</h2>
      <p>
        The website is provided &ldquo;as is&rdquo;. To the extent permitted by law, the operator is not liable for indirect or
        consequential losses arising from use of the site.
      </p>
      <h2>8. Governing law</h2>
      <p>These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable there.</p>
    </LegalPage>
  );
}
