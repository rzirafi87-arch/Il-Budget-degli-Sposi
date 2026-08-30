import fs from "node:fs/promises";
import process from "node:process";
import pg from "pg";
import {
  normalizeChurch,
  validateChurch,
} from "./lib/church-import-core.mjs";

const { Client } = pg;
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const file = fileArg?.slice("--file=".length) || "scripts/datasets/churches-sicily-pilot.json";

function summaryTemplate(read) {
  return { read, inserted: 0, updated: 0, skipped: 0, duplicates: 0, errors: [] };
}

async function loadDataset() {
  const payload = JSON.parse(await fs.readFile(file, "utf8"));
  if (!Array.isArray(payload.records)) throw new Error("Dataset must contain a records array");
  return payload;
}

function prepareRecords(rawRecords, summary) {
  const seen = new Set();
  const records = [];

  rawRecords.forEach((raw, index) => {
    const record = normalizeChurch(raw);
    const errors = validateChurch(record);
    const key = `${record.source}|${record.external_id}`;

    if (errors.length > 0) {
      summary.skipped += 1;
      summary.errors.push({ index, name: record.name || null, errors });
      return;
    }
    if (seen.has(key)) {
      summary.skipped += 1;
      summary.duplicates += 1;
      summary.errors.push({ index, name: record.name, errors: ["duplicate source/external_id in input"] });
      return;
    }
    seen.add(key);
    records.push(record);
  });

  return records;
}

async function run() {
  const dataset = await loadDataset();
  const summary = summaryTemplate(dataset.records.length);
  const records = prepareRecords(dataset.records, summary);

  if (!apply) {
    console.log(JSON.stringify({ mode: "dry-run", dataset: dataset.dataset, valid: records.length, ...summary }, null, 2));
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required with --apply");
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  let jobId = null;

  try {
    await client.query("begin");
    const job = await client.query(
      `insert into public.sync_jobs(source, type, region, province, status, started_at, records_read)
       values ($1, 'church', $2, $3, 'running', now(), $4)
       returning id`,
      ["branch_26_pilot", "Sicilia", "AG", summary.read],
    );
    jobId = job.rows[0].id;

    for (const record of records) {
      const existing = await client.query(
        `select id from public.churches where source = $1 and external_id = $2`,
        [record.source, record.external_id],
      );

      if (existing.rowCount === 0) {
        const ambiguous = await client.query(
          `select id from public.churches
           where normalized_name = $1 and country_code = $2
             and lower(city) = lower($3)
             and normalized_address is not distinct from $4
           limit 1`,
          [record.normalized_name, record.country_code, record.city, record.normalized_address],
        );
        if (ambiguous.rowCount > 0) {
          summary.skipped += 1;
          summary.duplicates += 1;
          summary.errors.push({ name: record.name, errors: ["secondary duplicate candidate requires review"] });
          continue;
        }
      }

      const columns = Object.keys(record);
      const values = Object.values(record);
      const params = values.map((_, index) => `$${index + 1}`).join(", ");
      const updates = columns
        .filter((column) => !["source", "external_id", "created_at"].includes(column))
        .map((column) => `${column} = excluded.${column}`)
        .concat("updated_at = now()")
        .join(", ");

      await client.query(
        `insert into public.churches (${columns.join(", ")})
         values (${params})
         on conflict (source, external_id) where external_id is not null
         do update set ${updates}`,
        values,
      );
      if (existing.rowCount > 0) summary.updated += 1;
      else summary.inserted += 1;
    }

    await client.query(
      `update public.sync_jobs
       set status = 'completed', completed_at = now(), results_count = $2,
           records_inserted = $3, records_updated = $4, records_skipped = $5,
           duplicate_candidates = $6, errors_count = $7,
           error_message = $8
       where id = $1`,
      [
        jobId,
        summary.inserted + summary.updated,
        summary.inserted,
        summary.updated,
        summary.skipped,
        summary.duplicates,
        summary.errors.length,
        summary.errors.length ? JSON.stringify(summary.errors) : null,
      ],
    );
    await client.query("commit");
    console.log(JSON.stringify({ mode: "applied", dataset: dataset.dataset, jobId, ...summary }, null, 2));
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

