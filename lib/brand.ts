/** Single source of truth for brand identity. Contact details live in editable site settings. */
export const BRAND = {
  name: "Flora & Flame",
  shortName: "Flora & Flame",
  tagline: "Premium Toronto Lifestyle.",
  description:
    "Flora & Flame is a premium Toronto lifestyle brand based in North York, Ontario — a curated edit of cannabis flower, grabba and accessories for adults 19+.",
  locale: "en_CA",
  region: "North York, Toronto, Ontario",
  minimumAge: 19,
} as const;

/** Cookie names (no personal data is stored in them). */
export const AGE_COOKIE = "ff_age_verified";
export const ADMIN_COOKIE = "ff_admin_session";
