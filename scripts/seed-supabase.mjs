#!/usr/bin/env node
/**
 * Seeds Supabase with the demo catalogue and settings.
 *
 *   npm run db:seed                 # categories, products, settings
 *   npm run db:seed -- --demo-data  # + demo orders and a sample inquiry (for analytics preview)
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env. Run supabase/schema.sql first.
 * Safe to re-run: rows are upserted by id. Settings are only written if none exist yet.
 */
import { createClient } from "@supabase/supabase-js";
import { seedCategories, seedProducts, seedSettings, seedOrders, seedInquiries } from "../lib/data/seed.ts";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const withDemo = process.argv.includes("--demo-data");

async function upsert(table, rows) {
  const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length} rows`);
}

try {
  await upsert("categories", seedCategories);
  await upsert("products", seedProducts);

  const { data: existing } = await db.from("site_settings").select("id").eq("id", 1).maybeSingle();
  if (!existing) {
    const { error } = await db.from("site_settings").insert({ id: 1, data: seedSettings });
    if (error) throw new Error(`site_settings: ${error.message}`);
    console.log("✓ site_settings: created");
  } else {
    console.log("• site_settings: already exists (left unchanged)");
  }

  if (withDemo) {
    await upsert("orders", seedOrders());
    await upsert("inquiries", seedInquiries());
  }
  console.log("\nDone.");
} catch (err) {
  console.error("Seeding failed:", err.message);
  process.exit(1);
}
