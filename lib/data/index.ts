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
    throw new StoreError(
      "The local file data store can't run on Vercel. Set DATA_BACKEND=supabase with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the Vercel project settings.",
    );
  }
  return useLocal ? localStore : supabaseStore;
}

export { StoreError } from "./store";
