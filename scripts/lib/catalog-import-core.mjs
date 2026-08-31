import { createHash } from "node:crypto";

export const CATALOG_ENTITY_TYPES = Object.freeze(["church", "location", "supplier"]);
export const PIPELINE_STAGES = Object.freeze(["RAW", "NORMALIZED", "VALIDATED", "DUPLICATE_CHECKED", "READY_FOR_REVIEW", "VERIFIED", "REJECTED"]);
export const VERIFICATION_STATUSES = Object.freeze(["VERIFIED", "PROBABLE", "TO_CHECK"]);

export function emptyToNull(value) {
  if (value == null) return null;
  const normalized = String(value).normalize("NFC").replace(/\s+/gu, " ").trim();
  return normalized || null;
}

export function normalizeDisplayText(value) { return emptyToNull(value); }

export function normalizeText(value) {
  const text = emptyToNull(value); if (!text) return null;
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() || null;
}

export function normalizeSlug(value) { return normalizeText(value)?.replace(/\s+/g, "-") || null; }

export function normalizePhone(value) {
  const text = emptyToNull(value); if (!text) return null;
  const compact = text.replace(/[\s().-]+/g, "");
  return compact.startsWith("+") ? `+${compact.slice(1).replace(/\D/g, "")}` : compact.replace(/\D/g, "");
}

export function normalizeEmail(value) { return emptyToNull(value)?.toLowerCase() || null; }

export function normalizeUrl(value) {
  const text = emptyToNull(value); if (!text) return null;
  try { const url = new URL(text); if (!["http:", "https:"].includes(url.protocol)) return null; url.hash = ""; url.hostname = url.hostname.toLowerCase(); url.searchParams.sort(); if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, ""); return url.toString(); }
  catch { return null; }
}

export function normalizeAddressFields(raw) {
  const addressLine = normalizeDisplayText(raw.address_line ?? raw.address);
  const coordinate = (value) => value == null || value === "" ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  return { address_line: addressLine, normalized_address: normalizeText(addressLine), postal_code: normalizeDisplayText(raw.postal_code), city: normalizeDisplayText(raw.city) || "", province: normalizeDisplayText(raw.province) || "", region: normalizeDisplayText(raw.region) || "", country_code: emptyToNull(raw.country_code ?? raw.country)?.toLowerCase() || "", latitude: coordinate(raw.latitude), longitude: coordinate(raw.longitude) };
}

export function deterministicExternalId(record) {
  const identity = [record.source, normalizeText(record.name), normalizeText(record.address_line), normalizeText(record.city), String(record.country_code || "").toLowerCase()].join("|");
  return createHash("sha256").update(identity).digest("hex").slice(0, 24);
}

export function rawFingerprint(raw) { return createHash("sha256").update(stableStringify(raw)).digest("hex"); }
function stableStringify(value) { if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`; return JSON.stringify(value); }

export function confidenceFor(record) {
  let score = 0;
  if (["official_site", "official_diocese", "admin_import"].includes(record.source)) score += 50;
  else if (["openstreetmap", "wikidata"].includes(record.source)) score += 30;
  if (record.source_url) score += 15;
  if (record.external_id) score += 10;
  if (record.address_line && record.city) score += 10;
  if (record.latitude != null && record.longitude != null) score += 10;
  if (record.phone || record.website) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function verificationFor(score) {
  if (score >= 80) return "VERIFIED";
  if (score >= 55) return "PROBABLE";
  return "TO_CHECK";
}

export function validateCatalogIdentity(record) {
  const issues = []; const add = (code, severity = "blocking") => issues.push({ code, severity });
  if (!record.name) add("missing name"); if (!record.normalized_name) add("name cannot be normalized"); if (!record.city) add("missing city");
  if (!record.province) add("missing province", "warning"); if (!record.region) add("missing region", "warning");
  if (!/^[a-z]{2}$/.test(record.country_code)) add("invalid country code"); if (!record.source) add("missing source"); if (!record.external_id) add("missing external id");
  if ((record.latitude == null) !== (record.longitude == null)) add("incomplete coordinates"); if (record.latitude != null && (record.latitude < -90 || record.latitude > 90)) add("latitude out of range"); if (record.longitude != null && (record.longitude < -180 || record.longitude > 180)) add("longitude out of range");
  if (record.phone && record.phone.replace(/\D/g, "").length < 6) add("invalid phone", "warning"); if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) add("invalid email", "warning");
  return issues;
}

export function validationIssue(code, severity = "blocking") { return { code, severity }; }
export function blockingIssues(issues) { return issues.filter((issue) => issue.severity === "blocking"); }
