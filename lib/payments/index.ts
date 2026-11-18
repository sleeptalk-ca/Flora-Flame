import type { Category, ComplianceSettings, OrderItem, RestrictedClass } from "../types";

/**
 * Modular payment integration.
 *
 * NO PROVIDER IS ACTIVE. Checkout stays disabled until ALL of the following are true:
 *   1. A payment provider has approved this business *in writing* for the product classes sold,
 *      and an adapter for it is registered in PROVIDERS below.
 *   2. The operator records the approval reference in Admin → Settings → Compliance.
 *   3. The operator enables checkout.
 *   4. For cannabis: the operator holds an AGCO Retail Operator Licence and Retail Store Authorization.
 *   5. For tobacco: the operator is permitted to sell tobacco in Ontario.
 *
 * Stripe is explicitly blocked for cannabis and tobacco: Stripe's restricted-business policy
 * prohibits marijuana businesses and restricts tobacco. Do not route restricted products through
 * a processor that has not approved them — that would breach the processor's terms.
 */

export interface PaymentSessionRequest {
  orderId: string;
  items: OrderItem[];
  totalCents: number;
  currency: "CAD";
  customerEmail: string;
}

export interface PaymentSessionResult {
  redirectUrl: string;
}

export interface PaymentProvider {
  id: string;
  label: string;
  /** Product classes this provider has approved for THIS business. */
  approvedClasses: RestrictedClass[];
  createSession(req: PaymentSessionRequest): Promise<PaymentSessionResult>;
}

/** Providers that must never process these classes regardless of configuration. */
const HARD_BLOCKED: Record<string, RestrictedClass[]> = {
  stripe: ["cannabis", "tobacco"],
};

/**
 * Registry of approved provider adapters. Intentionally empty.
 * To add one: implement PaymentProvider in lib/payments/providers/<id>.ts, list only the
 * classes the provider approved in writing, and register it here.
 */
const PROVIDERS: Record<string, PaymentProvider> = {};

export function listRegisteredProviders() {
  return Object.values(PROVIDERS).map((p) => ({ id: p.id, label: p.label }));
}

export interface CheckoutStatus {
  enabled: boolean;
  reasons: string[];
}

export function getCheckoutStatus(
  compliance: ComplianceSettings,
  classesInCart: RestrictedClass[] = ["cannabis", "tobacco", "none"],
): CheckoutStatus {
  const reasons: string[] = [];
  const providerId = (compliance.payment_provider || "none").toLowerCase();
  const provider = PROVIDERS[providerId];

  if (!compliance.checkout_enabled) reasons.push("Online checkout has not been enabled by the operator.");
  if (providerId === "none" || !provider)
    reasons.push("No approved payment provider is configured. Checkout stays disabled until a compliant provider approves the business.");
  if (provider && !compliance.payment_provider_approval_reference.trim())
    reasons.push("The payment provider's written approval reference has not been recorded.");

  const blocked = HARD_BLOCKED[providerId] ?? [];
  for (const cls of classesInCart) {
    if (cls === "none") continue;
    if (blocked.includes(cls))
      reasons.push(`${providerId} does not permit ${cls} sales. Use a provider that has approved this business for ${cls}.`);
    else if (provider && !provider.approvedClasses.includes(cls))
      reasons.push(`The configured provider has not approved ${cls} products.`);
  }
  if (classesInCart.includes("cannabis") && !compliance.cannabis_retail_authorized)
    reasons.push("Cannabis sales require an AGCO Retail Operator Licence and Retail Store Authorization.");
  if (classesInCart.includes("tobacco") && !compliance.tobacco_retail_authorized)
    reasons.push("Tobacco sales require confirmation that the operator may sell tobacco in Ontario.");

  return { enabled: reasons.length === 0, reasons };
}

/** Server-side guard for any order/sales action involving restricted products. */
export function restrictedSaleViolations(
  compliance: ComplianceSettings,
  categories: Pick<Category, "id" | "restricted">[],
  categoryIds: string[],
) {
  const classes = new Set(
    categoryIds.map((id) => categories.find((c) => c.id === id)?.restricted ?? "none"),
  );
  const out: string[] = [];
  if (classes.has("cannabis") && !compliance.cannabis_retail_authorized)
    out.push("Cannabis orders are blocked: no AGCO retail authorization is recorded in Settings → Compliance.");
  if (classes.has("tobacco") && !compliance.tobacco_retail_authorized)
    out.push("Tobacco orders are blocked: tobacco retail authorization is not confirmed in Settings → Compliance.");
  return out;
}

export async function createPaymentSession(
  compliance: ComplianceSettings,
  classesInCart: RestrictedClass[],
  req: PaymentSessionRequest,
): Promise<PaymentSessionResult> {
  const status = getCheckoutStatus(compliance, classesInCart);
  if (!status.enabled) throw new Error(`Checkout disabled: ${status.reasons.join(" ")}`);
  const provider = PROVIDERS[compliance.payment_provider.toLowerCase()];
  return provider.createSession(req);
}
