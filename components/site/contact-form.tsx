"use client";

import { useSubmitWithoutReset } from "@/components/ui/use-submit-without-reset";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/(site)/contact/actions";
import { Button } from "@/components/ui/button";
import { CheckboxField, FormMessage, TextAreaField, TextField } from "@/components/ui/field";

const initial: ContactState = { status: "idle" };

export function ContactForm({ product }: { product?: { id: string; name: string } | null }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const onSubmit = useSubmitWithoutReset(action);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-accent/30 bg-accent/5 px-8 py-16 text-center" role="status">
        <CheckCircle2 className="size-12 text-accent" aria-hidden />
        <h3 className="mt-6 font-display text-4xl">Message received</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{state.message}</p>
        <Link href="/shop" className="mt-8 text-xs tracking-[0.14em] text-accent uppercase link-underline">
          Continue browsing
        </Link>
      </div>
    );
  }

  const e = state.errors ?? {};
  const v = state.values ?? {};

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5" aria-describedby={state.message ? "contact-status" : undefined}>
      {state.status === "error" && state.message && (
        <div id="contact-status">
          <FormMessage tone="error">{state.message}</FormMessage>
        </div>
      )}
      {product && <input type="hidden" name="product_id" value={product.id} />}

      {/* Honeypot (hidden from humans) */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" autoComplete="name" required defaultValue={v.name} error={e.name} />
        <TextField name="email" label="Email" type="email" autoComplete="email" required defaultValue={v.email} error={e.email} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="phone" label="Phone" hint="Optional" type="tel" autoComplete="tel" defaultValue={v.phone} error={e.phone} />
        <TextField
          name="subject"
          label="Subject"
          required
          defaultValue={v.subject ?? (product ? `Question about ${product.name}` : "")}
          error={e.subject}
        />
      </div>
      <TextAreaField
        name="message"
        label="Message"
        required
        rows={6}
        maxLength={4000}
        defaultValue={v.message}
        error={e.message}
        placeholder="How can we help?"
      />
      <div className="space-y-4 rounded-2xl border border-line bg-ink/40 p-5">
        <CheckboxField name="confirm_age" label="I confirm I am 19 years of age or older." error={e.confirm_age} required />
        <CheckboxField
          name="consent"
          label="I agree to the handling of my information as described in the privacy policy."
          description={
            <>
              We use your details only to respond to this message.{" "}
              <Link href="/legal/privacy" className="text-accent link-underline">
                Privacy policy
              </Link>
            </>
          }
          error={e.consent}
          required
        />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
