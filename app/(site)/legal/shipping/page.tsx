import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Shipping & pickup", alternates: { canonical: "/legal/shipping" } };

export default function ShippingPage() {
  return (
    <LegalPage
      current="/legal/shipping"
      title="Shipping & pickup"
      intro="How orders will be fulfilled once online ordering is available."
    >
      <h2>Current status</h2>
      <p>
        <strong>Online ordering, shipping and delivery are not currently available.</strong> This page describes the policies that will
        apply once ordering opens.
      </p>
      <h2>Service area</h2>
      <p>We will serve customers in Ontario only, starting with North York and the Greater Toronto Area.</p>
      <h2>Cannabis</h2>
      <ul>
        <li>Cannabis will only be fulfilled as permitted under the operator&rsquo;s AGCO authorization and Ontario law.</li>
        <li>Pickup and any delivery will be completed only by authorized staff, in person, to the adult who placed the order.</li>
        <li>Valid government-issued photo ID showing the customer is 19+ will be checked every time. Orders are never left unattended.</li>
        <li>We will refuse fulfillment to anyone who appears intoxicated or cannot provide valid ID.</li>
      </ul>
      <h2>Grabba (tobacco)</h2>
      <ul>
        <li>Tobacco products are sold only to adults 19+, with ID verification at handover, in accordance with the Smoke-Free Ontario Act, 2017.</li>
      </ul>
      <h2>Accessories</h2>
      <ul>
        <li>Accessories may be available for pickup or delivery within Ontario. Timelines and fees will be confirmed at the time of order.</li>
      </ul>
    </LegalPage>
  );
}
