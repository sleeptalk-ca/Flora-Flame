"use client";

import { useActionState } from "react";
import { saveComplianceAction, saveContactSettingsAction, type ActionState } from "@/app/admin/actions";
import { CheckboxField, SelectField, TextField } from "@/components/ui/field";
import { useSubmitWithoutReset, ActionFeedback, SubmitButton } from "./form-bits";
import type { SiteSettings } from "@/lib/types";

const initial: ActionState = { status: "idle" };

export function ContactSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(saveContactSettingsAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <ActionFeedback state={state} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="contact_email" label="Email" type="email" defaultValue={settings.contact_email} error={e.contact_email} />
        <TextField name="contact_phone" label="Phone" defaultValue={settings.contact_phone} error={e.contact_phone} />
      </div>
      <TextField name="contact_address" label="Address" defaultValue={settings.contact_address} error={e.contact_address} />
      <div className="grid gap-5 md:grid-cols-2">
        <TextField name="business_hours" label="Business hours" defaultValue={settings.business_hours} error={e.business_hours} />
        <TextField name="instagram_url" label="Instagram URL" hint="Optional" defaultValue={settings.instagram_url} error={e.instagram_url} />
      </div>
      <SubmitButton pending={pending}>Save contact information</SubmitButton>
    </form>
  );
}

export function ComplianceForm({ settings, providers }: { settings: SiteSettings; providers: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState(saveComplianceAction, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const e = state.errors ?? {};
  const c = settings.compliance;
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <ActionFeedback state={state} />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Cannabis (AGCO)</legend>
        <CheckboxField
          name="cannabis_retail_authorized"
          label="We hold a valid AGCO Retail Operator Licence and Retail Store Authorization"
          description="Required before any cannabis order can be recorded or sold."
          defaultChecked={c.cannabis_retail_authorized}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="agco_licence_number" label="Retail Operator Licence #" defaultValue={c.agco_licence_number} error={e.agco_licence_number} />
          <TextField
            name="agco_store_authorization_number"
            label="Retail Store Authorization #"
            defaultValue={c.agco_store_authorization_number}
            error={e.agco_store_authorization_number}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-line pt-6">
        <legend className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Tobacco</legend>
        <CheckboxField
          name="tobacco_retail_authorized"
          label="We are permitted to sell tobacco products (including grabba) in Ontario"
          description="Includes any municipal tobacco vendor licence required in your area."
          defaultChecked={c.tobacco_retail_authorized}
        />
      </fieldset>

      <fieldset className="space-y-4 border-t border-line pt-6">
        <legend className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted uppercase">Payments & checkout</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField name="payment_provider" label="Payment provider" defaultValue={c.payment_provider || "none"} error={e.payment_provider}>
            <option value="none">None (checkout disabled)</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </SelectField>
          <TextField
            name="payment_provider_approval_reference"
            label="Written approval reference"
            hint="From the provider"
            defaultValue={c.payment_provider_approval_reference}
            error={e.payment_provider_approval_reference}
          />
        </div>
        {providers.length === 0 && (
          <p className="text-xs leading-relaxed text-muted">
            No payment adapters are registered. A developer adds one in <code className="text-cream">lib/payments/index.ts</code> only after a
            provider approves this business in writing for the product classes sold. Stripe is blocked for cannabis and tobacco.
          </p>
        )}
        <CheckboxField
          name="checkout_enabled"
          label="Enable online checkout"
          description="Has no effect unless an approved provider is configured and every authorization above is in place."
          defaultChecked={c.checkout_enabled}
        />
      </fieldset>

      <SubmitButton pending={pending}>Save compliance settings</SubmitButton>
    </form>
  );
}
