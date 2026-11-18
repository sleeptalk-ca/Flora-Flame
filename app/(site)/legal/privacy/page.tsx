import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/legal/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/legal/privacy"
      title="Privacy policy"
      intro="How Flora & Flame collects, uses and protects personal information, in line with Canada's PIPEDA."
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Contact form:</strong> your name, email, optional phone number, and your message — only so we can reply.
        </li>
        <li>
          <strong>Age confirmation:</strong> your date of birth is evaluated in your browser only. It is never stored or sent to us. We set
          a single cookie (<code>ff_age_verified</code>) that records only that the confirmation was completed.
        </li>
        <li>
          <strong>Technical data:</strong> standard server logs (such as IP address and browser type) kept for security and abuse
          prevention.
        </li>
      </ul>
      <h2>What we don&rsquo;t collect</h2>
      <p>
        We don&rsquo;t collect payment information, we don&rsquo;t ask for ID documents online, and we don&rsquo;t use advertising
        trackers. Please don&rsquo;t send ID or payment details through the contact form.
      </p>
      <h2>How we use it</h2>
      <p>
        Only to respond to your inquiry and to keep the site secure. We do not sell or rent personal information, and we do not use it
        for marketing without your express consent.
      </p>
      <h2>Retention</h2>
      <p>
        Inquiries are kept only as long as needed to respond and for reasonable record-keeping, then deleted. You can ask us to delete
        your information at any time.
      </p>
      <h2>Where it&rsquo;s stored</h2>
      <p>
        Data is stored with our hosting and database providers, which may process data outside Ontario. We use access controls,
        encryption in transit, and restricted admin access to protect it.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information, and you may withdraw consent at any time by
        contacting us. You can also contact the Office of the Privacy Commissioner of Canada.
      </p>
      <h2>Cookies</h2>
      <ul>
        <li>
          <code>ff_age_verified</code> — remembers age confirmation (session or 30 days if you choose).
        </li>
        <li>
          <code>ff_admin_session</code> — used only by authorized staff in the admin area.
        </li>
      </ul>
    </LegalPage>
  );
}
