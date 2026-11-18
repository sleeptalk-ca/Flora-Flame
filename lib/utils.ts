import { clsx, type ClassValue } from "clsx";
import type { Availability, InquiryStatus, OrderStatus, RestrictedClass } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export function formatCAD(cents: number) {
  return cad.format((cents ?? 0) / 100);
}

export function centsToDollarsString(cents: number) {
  return ((cents ?? 0) / 100).toFixed(2);
}

export function dollarsToCents(value: string | number) {
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", ...opts }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  coming_soon: "Coming soon",
};

export const RESTRICTED_LABEL: Record<RestrictedClass, string> = {
  cannabis: "Cannabis (AGCO licence required)",
  tobacco: "Tobacco (age 19+)",
  none: "Unrestricted",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

/** Tel href from a display phone number. */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
