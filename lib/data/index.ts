import "server-only";
import type { DataStore } from "./store";
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
  if (explicit === "local") return localStore;
  if (explicit === "supabase" || isSupabaseConfigured()) return supabaseStore;
  return localStore;
}

export { StoreError } from "./store";
