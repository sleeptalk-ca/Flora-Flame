import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "./password";

/**
 * Admin credential check. Two modes (ADMIN_AUTH_MODE):
 *  - "env" (default): ADMIN_EMAIL + ADMIN_PASSWORD_HASH (scrypt, preferred) or ADMIN_PASSWORD (plain text)
 *    from server env vars. These are never sent to the browser.
 *  - "supabase": Supabase Auth email/password; the email must also be in ADMIN_EMAILS (allowlist).
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const mode = process.env.ADMIN_AUTH_MODE === "supabase" ? "supabase" : "env";

  if (mode === "supabase") {
    const allow = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!allow.includes(normalized)) return false;
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!url || !anon) return false;
    const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await sb.auth.signInWithPassword({ email: normalized, password });
    if (error || !data.user) return false;
    await sb.auth.signOut();
    return true;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  // ADMIN_PASSWORD_HASH (scrypt) takes precedence; ADMIN_PASSWORD (plain text in server env) is the fallback.
  const hash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  const plain = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail || (!hash && !plain)) return false;

  // Compare both email and password in constant time, and always do the password check,
  // so response timing doesn't reveal which part was wrong.
  const passwordOk = hash ? await verifyPassword(password, hash) : safeEqual(password, plain);
  const emailOk = safeEqual(normalized, adminEmail);
  return emailOk && passwordOk;
}

/** Constant-time string comparison (digests are always 32 bytes, so lengths never leak or throw). */
function safeEqual(a: string, b: string) {
  const da = createHash("sha256").update(a, "utf8").digest();
  const db = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(da, db);
}
