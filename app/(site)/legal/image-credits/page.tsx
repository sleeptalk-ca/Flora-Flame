import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { IMAGE_CREDITS } from "@/lib/data/seed";

export const metadata: Metadata = { title: "Image credits", alternates: { canonical: "/legal/image-credits" } };

export default function ImageCreditsPage() {
  return (
    <LegalPage
      current="/legal/image-credits"
      title="Image credits"
      intro="Sample photography used on this site is sourced from Pexels and used under the Pexels licence."
    >
      <p>
        Product photos are <strong>illustrative stock images</strong> and do not depict the actual products offered. They will be
        replaced with real product photography through the admin dashboard.
      </p>
      <ul>
        {IMAGE_CREDITS.map((c) => (
          <li key={c.id}>
            {c.subject} —{" "}
            <a
              className="text-accent link-underline"
              href={`https://www.pexels.com/photo/${c.id}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Pexels photo #{c.id}
            </a>
          </li>
        ))}
      </ul>
      <p>
        Licence:{" "}
        <a className="text-accent link-underline" href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">
          pexels.com/license
        </a>
      </p>
    </LegalPage>
  );
}
