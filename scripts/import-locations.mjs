import fs from "node:fs/promises";
import process from "node:process";
import pg from "pg";
import { normalizeLocation, validateLocation } from "./lib/location-import-core.mjs";

const apply = process.argv.includes("--apply");
const file = process.argv.find((arg) => arg.startsWith("--file="))?.slice(7) || "scripts/datasets/locations-agrigento-pilot.json";
const summary = { read: 0, inserted: 0, updated: 0, skipped: 0, duplicates: 0, errors: [] };
const payload = JSON.parse(await fs.readFile(file, "utf8"));
summary.read = payload.records.length;
const seen = new Set();
const records = payload.records.map(normalizeLocation).filter((record, index) => {
  const errors = validateLocation(record); const key = `${record.source}|${record.external_id}`;
  if (seen.has(key)) { errors.push("duplicate source/external_id in input"); summary.duplicates += 1; }
  if (errors.length) { summary.skipped += 1; summary.errors.push({ index, name: record.name || null, errors }); return false; }
  seen.add(key); return true;
});

if (!apply) {
  console.log(JSON.stringify({ mode: "dry-run", dataset: payload.dataset, valid: records.length, ...summary }, null, 2));
} else {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required with --apply");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL }); await client.connect();
  try {
    await client.query("begin");
    const job = await client.query("insert into public.sync_jobs(source,type,region,province,status,started_at,records_read) values ('official_site','location','Sicilia','AG','running',now(),$1) returning id", [summary.read]);
    for (const record of records) {
      const existing = await client.query("select id from public.locations where source=$1 and external_id=$2", [record.source, record.external_id]);
      if (!existing.rowCount) {
        const duplicate = await client.query("select id from public.locations where normalized_name=$1 and country_code=$2 and lower(city)=lower($3) and normalized_address is not distinct from $4 limit 1", [record.normalized_name, record.country_code, record.city, record.normalized_address]);
        if (duplicate.rowCount) { summary.skipped += 1; summary.duplicates += 1; continue; }
      }
      const columns = Object.keys(record); const values = Object.values(record); const params = values.map((_, i) => `$${i + 1}`).join(",");
      const updates = columns.filter((column) => !["source", "external_id", "created_at"].includes(column)).map((column) => `${column}=excluded.${column}`).concat("updated_at=now()").join(",");
      await client.query(`insert into public.locations(${columns.join(",")}) values(${params}) on conflict(source,external_id) where external_id is not null do update set ${updates}`, values);
      if (existing.rowCount) summary.updated += 1; else summary.inserted += 1;
    }
    await client.query("update public.sync_jobs set status='completed',completed_at=now(),results_count=$2,records_inserted=$3,records_updated=$4,records_skipped=$5,duplicate_candidates=$6,errors_count=$7 where id=$1", [job.rows[0].id, summary.inserted + summary.updated, summary.inserted, summary.updated, summary.skipped, summary.duplicates, summary.errors.length]);
    await client.query("commit"); console.log(JSON.stringify({ mode: "applied", dataset: payload.dataset, ...summary }, null, 2));
  } catch (error) { await client.query("rollback"); throw error; } finally { await client.end(); }
}
