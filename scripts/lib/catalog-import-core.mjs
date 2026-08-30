import { createHash } from "node:crypto";

export function normalizeText(value) {
  if (typeof value !== "string") return null;
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() || null;
}

export function normalizePhone(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const compact = value.trim().replace(/[\s().-]+/g, "");
  return compact.startsWith("+") ? `+${compact.slice(1).replace(/\D/g, "")}` : compact.replace(/\D/g, "");
}

export function normalizeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try { const url = new URL(value.trim()); if (!["http:", "https:"].includes(url.protocol)) return null; url.hash = ""; return url.toString(); }
  catch { return null; }
}

export function deterministicExternalId(record) {
  const identity = [record.source, normalizeText(record.name), normalizeText(record.address_line), normalizeText(record.city), String(record.country_code || "").toLowerCase()].join("|");
  return createHash("sha256").update(identity).digest("hex").slice(0, 24);
}

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
  const errors = [];
  if (!record.name) errors.push("missing name");
  if (!record.normalized_name) errors.push("name cannot be normalized");
  if (!record.city) errors.push("missing city");
  if (!record.province) errors.push("missing province");
  if (!record.region) errors.push("missing region");
  if (!/^[a-z]{2}$/.test(record.country_code)) errors.push("invalid country code");
  if (!record.source) errors.push("missing source");
  if (!record.external_id) errors.push("missing external id");
  if ((record.latitude == null) !== (record.longitude == null)) errors.push("incomplete coordinates");
  if (record.latitude != null && (record.latitude < -90 || record.latitude > 90)) errors.push("latitude out of range");
  if (record.longitude != null && (record.longitude < -180 || record.longitude > 180)) errors.push("longitude out of range");
  if (record.phone && record.phone.replace(/\D/g, "").length < 6) errors.push("invalid phone");
  return errors;
}
