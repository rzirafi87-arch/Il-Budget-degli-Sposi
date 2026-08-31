import { normalizeChurch, validateChurch } from "./church-import-core.mjs";
import { normalizeLocation, validateLocation } from "./location-import-core.mjs";
import { normalizeSupplier, validateSupplier } from "./supplier-import-core.mjs";
import { blockingIssues, CATALOG_ENTITY_TYPES, rawFingerprint } from "./catalog-import-core.mjs";

const ADAPTERS = {
  church: { table: "churches", normalize: normalizeChurch, validate: validateChurch },
  location: { table: "locations", normalize: normalizeLocation, validate: validateLocation },
  supplier: { table: "suppliers", normalize: normalizeSupplier, validate: validateSupplier },
};

export function createImportReport(input = 0) {
  return { input, normalized: 0, valid: 0, invalid: 0, inserted: 0, updated: 0, duplicates: 0, review: 0, rejected: 0, errors: [], records: [] };
}

export function mergeWithoutDataLoss(existing, incoming) {
  const incomingIsBetter = (incoming.confidence_score ?? 0) >= (existing.confidence_score ?? 0);
  const result = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (value == null || value === "") continue;
    if (incomingIsBetter || result[key] == null || result[key] === "") result[key] = value;
  }
  if (existing.verification_status === "VERIFIED" && incoming.verification_status !== "VERIFIED") {
    result.verification_status = "VERIFIED"; result.verified = true;
    result.confidence_score = Math.max(existing.confidence_score ?? 0, incoming.confidence_score ?? 0);
    result.last_verified_at = existing.last_verified_at;
  }
  if (existing.id) result.id = existing.id;
  return result;
}

export async function runCatalogIngestion({ entityType, source, records, repository, dryRun = true, now = new Date() }) {
  if (!CATALOG_ENTITY_TYPES.includes(entityType)) throw new Error(`Unsupported entity type: ${entityType}`);
  if (!source?.type || !source?.name) throw new Error("Source type and name are required");
  if (!Array.isArray(records)) throw new Error("Records must be an array");
  const adapter = ADAPTERS[entityType]; const report = createImportReport(records.length); const inputKeys = new Set();

  for (const [index, raw] of records.entries()) {
    try {
      const normalized = adapter.normalize({ ...raw, source: raw?.source || source.type, source_url: raw?.source_url || source.url });
      report.normalized += 1;
      const issues = adapter.validate(normalized); const blocking = blockingIssues(issues);
      const detail = { index, name: normalized.name || null, stage: "VALIDATED", action: null, issues };
      if (blocking.length) { report.invalid += 1; report.rejected += 1; detail.stage = "REJECTED"; detail.action = "reject"; report.records.push(detail); continue; }
      report.valid += 1;
      const inputKey = `${normalized.source}|${normalized.external_id}`;
      if (inputKeys.has(inputKey)) { report.duplicates += 1; report.rejected += 1; detail.stage = "REJECTED"; detail.action = "duplicate-input"; report.records.push(detail); continue; }
      inputKeys.add(inputKey);

      const duplicate = await repository.findDuplicate(entityType, normalized);
      if (duplicate.kind === "ambiguous") { report.duplicates += 1; report.review += 1; detail.stage = "READY_FOR_REVIEW"; detail.action = "review"; detail.candidateIds = duplicate.records.map(({ id }) => id); report.records.push(detail); continue; }
      const existing = duplicate.record || null; const action = existing ? "update" : "insert";
      detail.stage = normalized.verification_status === "VERIFIED" ? "VERIFIED" : "DUPLICATE_CHECKED"; detail.action = action;
      if (existing) report.duplicates += 1;
      if (!dryRun) {
        const saved = await repository.upsert(entityType, mergeWithoutDataLoss(existing || {}, normalized));
        await repository.recordProvenance({ entity_type: entityType, entity_id: saved.id, external_key: normalized.external_id, source_type: source.type, source_name: source.name, source_url: normalized.source_url, external_id: normalized.external_id, imported_at: now.toISOString(), last_seen_at: now.toISOString(), raw_fingerprint: rawFingerprint(raw), metadata: source.metadata || {} });
      }
      if (action === "insert") report.inserted += 1; else report.updated += 1;
      report.records.push(detail);
    } catch (error) { report.errors.push({ index, message: error instanceof Error ? error.message : String(error) }); report.rejected += 1; }
  }
  return { mode: dryRun ? "dry-run" : "apply", entityType, source: source.name, ...report };
}

export function formatImportReport(report) {
  return `${report.entityType} ${report.mode}: input=${report.input}, normalized=${report.normalized}, valid=${report.valid}, invalid=${report.invalid}, inserted=${report.inserted}, updated=${report.updated}, duplicates=${report.duplicates}, review=${report.review}, rejected=${report.rejected}, errors=${report.errors.length}`;
}

export class MemoryCatalogRepository {
  constructor(seed = {}) { this.rows = Object.fromEntries(CATALOG_ENTITY_TYPES.map((type) => [type, structuredClone(seed[type] || [])])); this.provenance = []; this.writes = 0; }
  async findDuplicate(type, record) {
    const rows = this.rows[type];
    const strong = rows.find((row) => (row.source === record.source && row.external_id === record.external_id) || (record.phone && row.phone === record.phone) || (record.website && row.website === record.website) || (row.normalized_name === record.normalized_name && row.normalized_address && row.normalized_address === record.normalized_address && row.city?.toLowerCase() === record.city?.toLowerCase()));
    if (strong) return { kind: "strong", record: strong };
    const ambiguous = rows.filter((row) => row.normalized_name === record.normalized_name && row.city?.toLowerCase() === record.city?.toLowerCase());
    return ambiguous.length ? { kind: "ambiguous", records: ambiguous } : { kind: "none", records: [] };
  }
  async upsert(type, record) { this.writes += 1; const rows = this.rows[type]; const index = rows.findIndex((row) => row.id === record.id || (row.source === record.source && row.external_id === record.external_id)); const saved = { ...record, id: record.id || `${type}-${rows.length + 1}` }; if (index >= 0) rows[index] = saved; else rows.push(saved); return saved; }
  async recordProvenance(record) { this.writes += 1; const index = this.provenance.findIndex((row) => row.entity_type === record.entity_type && row.source_type === record.source_type && row.source_name === record.source_name && row.external_id === record.external_id); if (index >= 0) this.provenance[index] = { ...this.provenance[index], ...record, imported_at: this.provenance[index].imported_at }; else this.provenance.push(record); }
}
