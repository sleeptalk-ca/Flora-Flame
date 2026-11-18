#!/usr/bin/env node
/**
 * Applies supabase/schema.sql to your Supabase Postgres database (idempotent — safe to re-run).
 *
 *   npm run db:migrate
 *
 * Reads the connection string from DATABASE_STRING or SUPABASE_DB_URL in .env
 * (Supabase → Connect → "Session pooler" URI recommended; it works on IPv4 networks).
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const raw = process.env.DATABASE_STRING || process.env.SUPABASE_DB_URL;
if (!raw) {
  console.error("Set DATABASE_STRING (or SUPABASE_DB_URL) in .env first.");
  process.exit(1);
}

/** Parse manually so passwords containing "@", "#", "/" etc. work without URL-encoding. */
function parse(conn) {
  const m = conn.trim().replace(/^"|"$/g, "").match(/^postgres(?:ql)?:\/\/([^:]+):(.*)@([^@/:]+)(?::(\d+))?\/([^?]+)/);
  if (!m) throw new Error("DATABASE_STRING is not a valid postgresql:// URI");
  const [, user, password, host, port, database] = m;
  const dec = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
  return { user: dec(user), password: dec(password), host, port: Number(port || 5432), database };
}

const cfg = parse(raw);
const client = new pg.Client({
  ...cfg,
  // Supabase requires TLS. Its server certificate is signed by Supabase's own CA (not in Node's default
  // store), so verification is relaxed for this one-off admin script; the connection is still encrypted.
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

try {
  console.log(`Connecting to ${cfg.host}:${cfg.port} as ${cfg.user} …`);
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log("✓ Schema applied (tables, RLS policies, storage bucket).");
  // Ask PostgREST to reload its schema cache so the API sees new tables immediately.
  await client.query("notify pgrst, 'reload schema'");
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );
  console.log("  public tables:", rows.map((r) => r.table_name).join(", "));
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error("✗ Migration failed:", err.message);
  if (/ENOTFOUND|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|timeout/i.test(err.message) && cfg.host.startsWith("db.")) {
    console.error(
      "\nThe direct connection host (db.<ref>.supabase.co) is IPv6-only and your network may not support it.\n" +
        "Use the Session pooler URI instead: Supabase → Connect → Session pooler.",
    );
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
