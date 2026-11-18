"use server";

import { headers } from "next/headers";
import { getStore } from "@/lib/data";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { clientKeyFromHeaders, isRateLimited, rateLimit } from "@/lib/rate-limit";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    product_id: String(formData.get("product_id") ?? ""),
    confirm_age: formData.get("confirm_age") === "on",
    consent: formData.get("consent") === "on",
    website: String(formData.get("website") ?? ""),
  };
  const values = { name: raw.name, email: raw.email, phone: raw.phone, subject: raw.subject, message: raw.message };

  // Honeypot: silently "succeed" for bots.
  if (raw.website) return { status: "success", message: "Thank you — we'll be in touch soon." };

  // Limit successful messages to 5 per 10 minutes per IP (validation errors don't count).
  const rlKey = `contact:${clientKeyFromHeaders(await headers())}`;
  if (isRateLimited(rlKey, 5).limited) {
    return { status: "error", message: "Too many messages. Please try again in a few minutes.", values };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error), values };
  }

  try {
    const d = parsed.data;
    await getStore().createInquiry({
      name: d.name,
      email: d.email,
      phone: d.phone,
      subject: d.subject,
      message: d.message,
      product_id: d.product_id || null,
    });
    rateLimit(rlKey, 5, 10 * 60_000);
    return { status: "success", message: "Thank you — your message has been received. We usually reply within one business day." };
  } catch (err) {
    console.error("[contact] failed to save inquiry", err);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please email us directly.",
      values,
    };
  }
}
