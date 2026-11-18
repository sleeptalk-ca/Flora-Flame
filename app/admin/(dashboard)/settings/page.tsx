import type { Metadata } from "next";
import { CircleSlash, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { ComplianceForm, ContactSettingsForm } from "@/components/admin/settings-forms";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/data";
import { getCheckoutStatus, listRegisteredProviders } from "@/lib/payments";

// Session-bound admin data: allowed to block on navigation.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getStore().getSettings();
  const status = getCheckoutStatus(settings.compliance);

  return (
    <>
      <PageHeader title="Settings" description="Contact details shown across the site, and compliance controls for restricted sales." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Contact information">
            <ContactSettingsForm settings={settings} />
          </Card>
          <Card title="Compliance & payments">
            <ComplianceForm settings={settings} providers={listRegisteredProviders()} />
          </Card>
        </div>
        <aside className="space-y-6">
          <Card title="Checkout status">
            {status.enabled ? (
              <p className="flex items-center gap-2 text-sm text-accent">
                <ShieldCheck className="size-4" /> Checkout is enabled.
              </p>
            ) : (
              <ul className="space-y-3">
                {status.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                    <CircleSlash className="mt-0.5 size-3.5 shrink-0 text-warning" /> {r}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Important">
            <p className="text-xs leading-relaxed text-muted">
              These switches record your own confirmation — they are not a substitute for legal advice. Confirm licensing, marketing
              (Cannabis Act and Tobacco and Vaping Products Act promotion rules) and payment-provider terms with qualified counsel before
              enabling any sales.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
