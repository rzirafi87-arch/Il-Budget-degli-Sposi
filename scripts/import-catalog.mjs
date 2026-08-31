import fs from "node:fs/promises";
import process from "node:process";
import { formatImportReport, MemoryCatalogRepository, runCatalogIngestion } from "./lib/common-catalog-pipeline.mjs";
import { PgCatalogRepository } from "./lib/pg-catalog-repository.mjs";

const options = Object.fromEntries(process.argv.slice(2).filter((value) => value.startsWith("--")).map((value) => { const [key, ...rest] = value.slice(2).split("="); return [key, rest.length ? rest.join("=") : true]; }));
const entityType = String(options.entity || ""); const file = String(options.file || ""); const dryRun = options.apply !== true;
if (!entityType || !file) throw new Error("Usage: node scripts/import-catalog.mjs --entity=church|location|supplier --file=dataset.json [--apply]");
const payload = JSON.parse(await fs.readFile(file, "utf8")); const records = Array.isArray(payload) ? payload : payload.records;
if (!Array.isArray(records)) throw new Error("Dataset must be an array or contain a records array");
const source = { type: String(options["source-type"] || payload.source_type || records[0]?.source || "admin_import"), name: String(options["source-name"] || payload.dataset || file), url: options["source-url"] || null, metadata: { license_note: payload.license_note || null } };
const databasePreview = dryRun && options["database-preview"] === true;
if ((!dryRun || databasePreview) && !process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for --apply or --database-preview");
const repository = dryRun && !databasePreview ? new MemoryCatalogRepository() : await PgCatalogRepository.connect(process.env.DATABASE_URL);
try {
  if (!dryRun) await repository.begin();
  const report = await runCatalogIngestion({ entityType, source, records, repository, dryRun });
  if (!dryRun) await repository.commit();
  console.log(formatImportReport(report)); console.log(JSON.stringify(report, null, 2));
} catch (error) { if (!dryRun) await repository.rollback(); throw error; }
finally { if (!dryRun || databasePreview) await repository.close(); }
