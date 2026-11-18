import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Refunds & returns", alternates: { canonical: "/legal/refunds" } };

export default function RefundsPage() {
  return (
    <LegalPage
      current="/legal/refunds"
      title="Refunds & returns"
      intro="Our approach to returns, exchanges and refunds."
    >
      <h2>Cannabis and tobacco products</h2>
      <p>
        For product-safety and regulatory reasons, opened or unsealed cannabis and tobacco products cannot be returned or exchanged,
        except where required by law. If you believe a product is defective or was supplied in error, contact us within 7 days with
        your order details and we&rsquo;ll make it right. Recalled products will be handled according to Health Canada and producer
        recall instructions.
      </p>
      <h2>Accessories</h2>
      <ul>
        <li>Unused accessories in original packaging may be returned within 14 days of purchase with proof of purchase.</li>
        <li>Defective accessories may be exchanged or refunded within 30 days.</li>
        <li>Used grinders, papers and other consumables cannot be returned for hygiene reasons unless defective.</li>
      </ul>
      <h2>How refunds are issued</h2>
      <p>
        Approved refunds are issued to the original payment method. Your statutory rights under the Ontario Consumer Protection Act,
        2002 are not affected.
      </p>
    </LegalPage>
  );
}
