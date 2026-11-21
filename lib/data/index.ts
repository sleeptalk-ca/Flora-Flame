import "server-only";
import { StoreError, type DataStore } from "./store";
import { localStore } from "./local-store";
import { supabaseStore } from "./supabase-store";

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Selects the persistence backend.
 *  DATA_BACKEND=supabase | local  (explicit)
 *  otherwise: Supabase when configured, else the local JSON store.
 */
export function getStore(): DataStore {
  const explicit = process.env.DATA_BACKEND;
  const useLocal = explicit === "local" || (explicit !== "supabase" && !isSupabaseConfigured());
  if (useLocal && process.env.VERCEL) {
    // Vercel's file system is read-only/ephemeral: products and uploaded images would be lost.
    const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((k) => !process.env[k]);
    const reason =
      explicit === "local"
        ? "DATA_BACKEND is set to \"local\""
        : `missing environment variable(s): ${missing.join(", ")}`;
    const message = `[Talk To Me] Can't use the local file store on Vercel (${reason}). In Vercel → Settings → Environment Variables set DATA_BACKEND=supabase, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for this environment, then redeploy.`;
    // Production builds hide error messages, so log it explicitly for the build/runtime logs.
    console.error(message);
    throw new StoreError(message);
  }
  return useLocal ? localStore : supabaseStore;
}

export { StoreError } from "./store";
