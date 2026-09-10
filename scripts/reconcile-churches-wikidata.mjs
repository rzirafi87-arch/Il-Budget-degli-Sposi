import fs from "node:fs/promises";
import pg from "pg";
import { normalizedReconciliation, validateReconciliationRecord } from "./lib/wikidata-place-reconciliation.mjs";

const options = Object.fromEntries(process.argv.slice(2).filter((value) => value.startsWith("--")).map((value) => { const [key, ...rest] = value.slice(2).split("="); return [key, rest.length ? rest.join("=") : true]; }));
const file = String(options.file || "scripts/datasets/churches-italy-wikidata-reconciliation.json");
const apply = options.apply === true;
const payload = JSON.parse(await fs.readFile(file, "utf8"));
const records = payload.records.map(normalizedReconciliation);
const invalid = records.flatMap((record) => validateReconciliationRecord(record).map((error) => ({ external_id: record.external_id, error })));
if (invalid.length) throw new Error(JSON.stringify(invalid.slice(0, 20)));
if (!apply) {
  console.log(JSON.stringify({ mode: "dry-run", input: records.length, unique: new Set(records.map((record) => record.external_id)).size }, null, 2));
  process.exit(0);
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required with --apply");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("begin");
  let updated = 0;
  for (const record of records) {
    const result = await client.query(
      `update public.churches set place_type=$2,religion=$3,denomination=$4,subtype=$5,updated_at=now() where source='wikidata' and external_id=$1`,
      [record.external_id, record.canonical_place_type, record.religion, record.denomination, record.source_type_labels.join(" | ") || null],
    );
    if (result.rowCount !== 1) throw new Error(`Expected one church for ${record.external_id}, got ${result.rowCount}`);
    await client.query(
      `update public.catalog_provenance set metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object('wikidata_reconciliation',$2::jsonb),last_seen_at=now() where entity_type='church' and source_type='wikidata' and external_id=$1`,
      [record.external_id, JSON.stringify(record)],
    );
    updated += result.rowCount;
  }
  await client.query("commit");
  console.log(JSON.stringify({ mode: "apply", input: records.length, updated }, null, 2));
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}
