import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { BABY_SHOWER_META } from "../src/features/events/baby-shower/config";
import { BIRTHDAY_META } from "../src/features/events/birthday/config";
import { ENGAGEMENT_PARTY_META } from "../src/features/events/engagement-party/config";
import type { EventMeta } from "../src/features/events/types";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");
loadEnv({ path: ENV_PATH, override: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables.");
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const TABLE_NAME = "event_budget_templates";

async function ensureTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS public.${TABLE_NAME} (
      event_key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      default_currency TEXT NOT NULL,
      sections JSONB NOT NULL,
      timeline JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  try {
    await client.rpc("exec_sql", { q: ddl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Unable to verify ${TABLE_NAME} via exec_sql: ${message}`);
  }
}

async function upsertEvent(meta: EventMeta) {
  const payload = {
    event_key: meta.key,
    name: meta.name ?? meta.key,
    default_currency: meta.defaultCurrency,
    sections: meta.sections,
    timeline: meta.timeline,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "event_key" });

  if (error) {
    throw new Error(`Failed to upsert ${meta.key}: ${error.message}`);
  }

  console.log(`Seeded template for ${meta.key}`);
}

async function main() {
  await ensureTable();

  await upsertEvent(BIRTHDAY_META);
  await upsertEvent(ENGAGEMENT_PARTY_META);
  await upsertEvent(BABY_SHOWER_META);

  console.log("✅ Seed complete");
}

main().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
