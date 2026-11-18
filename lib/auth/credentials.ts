import "server-only";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "./password";

/**
 * Admin credential check. Two modes (ADMIN_AUTH_MODE):
 *  - "env" (default): ADMIN_EMAIL + ADMIN_PASSWORD_HASH (scrypt) from server env vars.
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
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  if (!adminEmail || !hash) return false;

  // Always run the (slow) hash check to keep timing uniform regardless of email match.
  const passwordOk = await verifyPassword(password, hash);
  const a = Buffer.from(normalized.padEnd(200));
  const b = Buffer.from(adminEmail.padEnd(200));
  const emailOk = a.length === b.length && timingSafeEqual(a, b);
  return emailOk && passwordOk;
}
