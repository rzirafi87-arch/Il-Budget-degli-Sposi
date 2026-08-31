import { normalizeChurch, validateChurch } from "./church-import-core.mjs";
import { normalizeLocation, validateLocation } from "./location-import-core.mjs";
import { normalizeSupplier, validateSupplier } from "./supplier-import-core.mjs";
import { blockingIssues, CATALOG_ENTITY_TYPES, rawFingerprint } from "./catalog-import-core.mjs";
import { advancedConfidence, evaluateCatalogMatch, mergePreview } from "./catalog-reliability.mjs";

const ADAPTERS = {
  church: { table: "churches", normalize: normalizeChurch, validate: validateChurch },
  location: { table: "locations", normalize: normalizeLocation, validate: validateLocation },
  supplier: { table: "suppliers", normalize: normalizeSupplier, validate: validateSupplier },
};

export function createImportReport(input = 0) {
  return { input, normalized: 0, valid: 0, invalid: 0, new: 0, exactMatch: 0, highConfidenceMatch: 0, possibleMatch: 0, conflicts: 0, staleCandidates: 0, inserted: 0, updated: 0, unchanged: 0, duplicates: 0, review: 0, reviewQueued: 0, rejected: 0, errors: [], records: [] };
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

      const candidates = await repository.findCandidates(entityType, normalized);
      const evaluated = candidates.map((candidate) => ({ candidate, match: evaluateCatalogMatch(entityType, normalized, candidate) })).sort((a, b) => b.match.score - a.match.score);
      const best = evaluated[0] || null; const exact = best?.match.signals.some(({ code }) => code === "SOURCE_EXTERNAL_ID");
      if (best?.match.outcome === "POSSIBLE_MATCH") {
        report.duplicates += 1; report.possibleMatch += 1; report.review += 1; if (best.match.conflictLevel !== "NON_CONFLICTING") report.conflicts += 1;
        detail.stage = "READY_FOR_REVIEW"; detail.action = best.match.conflictLevel === "NON_CONFLICTING" ? "POSSIBLE_MATCH" : "CONFLICT"; detail.candidateIds = evaluated.filter(({ match }) => match.outcome !== "NO_MATCH").map(({ candidate }) => candidate.id); detail.match = best.match;
        if (!dryRun) { await repository.queueReview({ entity_type: entityType, candidate_entity_id: best.candidate.id, source: source.name, incoming_fingerprint: rawFingerprint(raw), match_score: best.match.score, conflict_level: best.match.conflictLevel, reasons: { signals: best.match.signals, conflicts: best.match.conflicts }, payload: { external_id: normalized.external_id, name: normalized.name, city: normalized.city }, created_at: now.toISOString() }); report.reviewQueued += 1; }
        report.records.push(detail); continue;
      }
      const existing = best?.match.outcome === "MATCH" ? best.candidate : null; const action = existing ? (exact ? "EXACT_MATCH" : "HIGH_CONFIDENCE_MATCH") : "NEW";
      detail.stage = normalized.verification_status === "VERIFIED" ? "VERIFIED" : "DUPLICATE_CHECKED"; detail.action = action; detail.match = best?.match || null;
      if (existing) { report.duplicates += 1; if (exact) report.exactMatch += 1; else report.highConfidenceMatch += 1; } else report.new += 1;
      const merged = mergeWithoutDataLoss(existing || {}, normalized); const confidence = advancedConfidence(merged, { conflictLevel: best?.match.conflictLevel, supportingSources: evaluated.filter(({ match }) => match.outcome === "MATCH").length });
      merged.confidence_score = confidence.score; if (merged.verification_status === "VERIFIED" && normalized.verification_status !== "VERIFIED") merged.verification_status = "VERIFIED";
      detail.confidence = confidence; detail.mergePreview = mergePreview(existing, normalized, merged);
      if (!dryRun) {
        const saved = await repository.upsert(entityType, merged);
        await repository.recordProvenance({ entity_type: entityType, entity_id: saved.id, external_key: normalized.external_id, source_type: source.type, source_name: source.name, source_url: normalized.source_url, external_id: normalized.external_id, imported_at: now.toISOString(), last_seen_at: now.toISOString(), source_updated_at: normalized.source_updated_at, raw_fingerprint: rawFingerprint(raw), metadata: { ...(source.metadata || {}), field_sources: Object.fromEntries(Object.keys(normalized).filter((key) => normalized[key] != null && normalized[key] !== "").map((key) => [key, source.name])) } });
      }
      if (!existing) report.inserted += 1; else if (detail.mergePreview.fieldsChanged.length) report.updated += 1; else report.unchanged += 1;
      report.records.push(detail);
    } catch (error) { report.errors.push({ index, message: error instanceof Error ? error.message : String(error) }); report.rejected += 1; }
  }
  return { mode: dryRun ? "dry-run" : "apply", entityType, source: source.name, ...report };
}

export function formatImportReport(report) {
  return `${report.entityType} ${report.mode}: input=${report.input}, valid=${report.valid}, invalid=${report.invalid}, new=${report.new}, exact=${report.exactMatch}, high=${report.highConfidenceMatch}, possible=${report.possibleMatch}, conflicts=${report.conflicts}, stale=${report.staleCandidates}, inserted=${report.inserted}, updated=${report.updated}, unchanged=${report.unchanged}, rejected=${report.rejected}, review=${report.reviewQueued}, errors=${report.errors.length}`;
}

export class MemoryCatalogRepository {
  constructor(seed = {}) { this.rows = Object.fromEntries(CATALOG_ENTITY_TYPES.map((type) => [type, structuredClone(seed[type] || [])])); this.provenance = []; this.writes = 0; }
  async findCandidates(type, record) { return this.rows[type].filter((row) => (row.source === record.source && row.external_id === record.external_id) || (record.phone && row.phone === record.phone) || (record.website && row.website === record.website) || row.normalized_name === record.normalized_name || (record.normalized_address && row.normalized_address === record.normalized_address) || (record.postal_code && row.postal_code === record.postal_code && row.city?.toLowerCase() === record.city?.toLowerCase())); }
  async upsert(type, record) { this.writes += 1; const rows = this.rows[type]; const index = rows.findIndex((row) => row.id === record.id || (row.source === record.source && row.external_id === record.external_id)); const saved = { ...record, id: record.id || `${type}-${rows.length + 1}` }; if (index >= 0) rows[index] = saved; else rows.push(saved); return saved; }
  async recordProvenance(record) { this.writes += 1; const index = this.provenance.findIndex((row) => row.entity_type === record.entity_type && row.source_type === record.source_type && row.source_name === record.source_name && row.external_id === record.external_id); if (index >= 0) this.provenance[index] = { ...this.provenance[index], ...record, imported_at: this.provenance[index].imported_at }; else this.provenance.push(record); }
  async queueReview(record) { this.writes += 1; this.reviews ||= []; if (!this.reviews.some((row) => row.entity_type === record.entity_type && row.incoming_fingerprint === record.incoming_fingerprint && row.candidate_entity_id === record.candidate_entity_id)) this.reviews.push(record); }
}
