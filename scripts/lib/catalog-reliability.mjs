import { normalizeText } from "./catalog-import-core.mjs";

export const MATCH_OUTCOMES = Object.freeze(["MATCH", "POSSIBLE_MATCH", "NO_MATCH"]);
export const CONFLICT_LEVELS = Object.freeze(["NON_CONFLICTING", "SOFT_CONFLICT", "HARD_CONFLICT"]);
export const DRY_RUN_ACTIONS = Object.freeze(["NEW", "EXACT_MATCH", "HIGH_CONFIDENCE_MATCH", "POSSIBLE_MATCH", "CONFLICT", "STALE_CANDIDATE", "REJECTED"]);

const LEGAL_SUFFIXES = new Set(["srl", "sas", "snc", "societa"]);
const DESCRIPTORS = new Set(["hotel", "resort", "ristorante", "chiesa", "parrocchia", "santuario"]);
const TRACKING_KEYS = new Set(["fbclid", "gclid", "mc_cid", "mc_eid"]);
const SHARED_EMAIL_LOCAL = new Set(["info", "booking", "reception"]);
const NON_OFFICIAL_DOMAINS = new Set(["facebook.com", "instagram.com", "tiktok.com", "linkedin.com", "tripadvisor.com"]);

export const SOURCE_TRUST = Object.freeze({
  official_site: 6, official_diocese: 6, public_registry: 5, institutional_directory: 5,
  admin_import: 5, trusted_partner: 4, openstreetmap: 3, wikidata: 3,
  secondary_directory: 2, legacy: 1, unverified: 0,
});

function tokens(value) { return (normalizeText(value) || "").split(" ").filter(Boolean); }
export function normalizeIdentityName(value) {
  const original = tokens(value).join(" ").replace(/\bs r l\b/g,"srl").replace(/\bs a s\b/g,"sas").replace(/\bs n c\b/g,"snc").split(" "); const withoutLegal = original.filter((token) => !LEGAL_SUFFIXES.has(token));
  return { original: original.join(" "), legalNeutral: withoutLegal.join(" "), core: withoutLegal.filter((token) => !DESCRIPTORS.has(token)).join(" "), descriptors: withoutLegal.filter((token) => DESCRIPTORS.has(token)) };
}

export function levenshtein(a, b) {
  const left = String(a || ""); const right = String(b || "");
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) { let previous = row[0]; row[0] = i; for (let j = 1; j <= right.length; j += 1) { const saved = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1)); previous = saved; } }
  return row[right.length];
}

export function nameSimilarity(a, b) {
  const left = normalizeIdentityName(a); const right = normalizeIdentityName(b);
  if (!left.core || !right.core) return 0;
  if (left.legalNeutral === right.legalNeutral) return 1;
  const distance = levenshtein(left.core, right.core); const edit = 1 - distance / Math.max(left.core.length, right.core.length, 1);
  const leftSet = new Set(left.core.split(" ")); const rightSet = new Set(right.core.split(" "));
  const intersection = [...leftSet].filter((token) => rightSet.has(token)).length; const union = new Set([...leftSet, ...rightSet]).size;
  return Math.max(0, Math.min(1, (edit + intersection / Math.max(union, 1)) / 2));
}

export function normalizeDomain(value) {
  if (!value) return null;
  try { const url = new URL(value); const hostname = url.hostname.toLowerCase().replace(/^www\./, ""); return NON_OFFICIAL_DOMAINS.has(hostname) || [...NON_OFFICIAL_DOMAINS].some((domain) => hostname.endsWith(`.${domain}`)) ? null : hostname; } catch { return null; }
}
export function normalizeSocial(value, network) {
  if (!value) return null; const raw = String(value).trim().replace(/^@/, "");
  try { const url = new URL(raw.includes("://") ? raw : `https://${raw}`); const host = url.hostname.toLowerCase().replace(/^www\./, ""); if (!host.includes(network)) return null; return url.pathname.split("/").filter(Boolean)[0]?.toLowerCase() || null; } catch { return raw.toLowerCase().replace(/\/$/, "") || null; }
}
export function normalizeWebsite(value) {
  if (!value) return null;
  try { const url = new URL(value); url.hash = ""; for (const key of [...url.searchParams.keys()]) if (key.startsWith("utm_") || TRACKING_KEYS.has(key)) url.searchParams.delete(key); url.hostname = url.hostname.toLowerCase().replace(/^www\./, ""); url.pathname = url.pathname.replace(/\/+$/, "") || "/"; return url.toString(); } catch { return null; }
}
export function normalizeComparablePhone(value, country = "it") {
  const digits = String(value || "").replace(/\D/g, ""); if (!digits) return null;
  if (country.toLowerCase() === "it") return digits.startsWith("0039") ? `+39${digits.slice(4)}` : digits.startsWith("39") && digits.length > 10 ? `+${digits}` : `+39${digits}`;
  return String(value).trim().startsWith("+") ? `+${digits}` : digits;
}
export function normalizeComparableAddress(record) {
  const street = normalizeText(record.address_line || record.address)?.replace(/\b(viale)\b/g, "vle").replace(/\b(via)\b/g, "via").replace(/\b(piazza|p zza)\b/g, "piazza") || null;
  return { street, postalCode: normalizeText(record.postal_code), city: normalizeText(record.city), province: normalizeText(record.province), region: normalizeText(record.region), country: normalizeText(record.country_code || record.country) };
}
export function distanceMeters(a, b) {
  if ([a.latitude, a.longitude, b.latitude, b.longitude].some((value) => value == null || !Number.isFinite(Number(value)))) return null;
  const rad = (value) => Number(value) * Math.PI / 180; const dLat = rad(b.latitude - a.latitude); const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function signal(code, weight, strength, detail) { return { code, weight, strength, detail }; }
export function evaluateCatalogMatch(entityType, incoming, candidate) {
  const signals = []; const conflicts = [];
  const add = (condition, code, weight, strength, detail) => { if (condition) signals.push(signal(code, weight, strength, detail)); };
  add(incoming.source && incoming.source === candidate.source && incoming.external_id && incoming.external_id === candidate.external_id, "SOURCE_EXTERNAL_ID", 100, "strong", "same source and external id");
  const inDomain = normalizeDomain(incoming.website); const candidateDomain = normalizeDomain(candidate.website);
  add(inDomain && inDomain === candidateDomain, "OFFICIAL_DOMAIN", 55, "strong", inDomain);
  const inPhone = normalizeComparablePhone(incoming.phone, incoming.country_code); const candidatePhone = normalizeComparablePhone(candidate.phone, candidate.country_code);
  add(inPhone && inPhone === candidatePhone, "PHONE", 45, "strong", inPhone);
  const inEmail = incoming.email?.toLowerCase(); const candidateEmail = candidate.email?.toLowerCase(); const emailLocal = inEmail?.split("@")[0];
  add(inEmail && inEmail === candidateEmail, "EMAIL", SHARED_EMAIL_LOCAL.has(emailLocal) ? 25 : 45, "strong", SHARED_EMAIL_LOCAL.has(emailLocal) ? "shared-role mailbox" : inEmail);
  const ia = normalizeComparableAddress(incoming); const ca = normalizeComparableAddress(candidate);
  add(ia.street && ia.street === ca.street && ia.city && ia.city === ca.city && (!ia.postalCode || !ca.postalCode || ia.postalCode === ca.postalCode), "FULL_ADDRESS", 50, "strong", `${ia.street}, ${ia.city}`);
  const similarity = nameSimilarity(incoming.name, candidate.name); add(similarity >= 0.86, "NAME_SIMILAR", similarity >= 0.95 ? 28 : 20, "medium", Number(similarity.toFixed(3)));
  add(ia.city && ia.city === ca.city, "CITY", 10, "medium", ia.city); add(ia.postalCode && ia.postalCode === ca.postalCode, "POSTAL_CODE", 8, "medium", ia.postalCode);
  const categoryA = incoming.category || incoming.venue_type || incoming.denomination; const categoryB = candidate.category || candidate.venue_type || candidate.denomination;
  add(categoryA && categoryB && normalizeText(categoryA) === normalizeText(categoryB), "CATEGORY", 7, "medium", normalizeText(categoryA));
  for (const network of ["instagram", "facebook", "tiktok"]) { const a = normalizeSocial(incoming[`${network}_url`], network); const b = normalizeSocial(candidate[`${network}_url`], network); add(a && a === b, `SOCIAL_${network.toUpperCase()}`, 18, "medium", a); }
  const meters = distanceMeters(incoming, candidate); add(meters != null && meters <= 75 && similarity >= 0.72, "NEAR_COORDINATES_WITH_NAME", 35, "strong", Math.round(meters));
  if (inDomain && candidateDomain && inDomain !== candidateDomain) conflicts.push({ code: "DOMAIN_MISMATCH", level: "HARD_CONFLICT", incoming: inDomain, candidate: candidateDomain });
  if (ia.city && ca.city && ia.city !== ca.city) conflicts.push({ code: "CITY_MISMATCH", level: "HARD_CONFLICT", incoming: ia.city, candidate: ca.city });
  if (ia.street && ca.street && ia.street !== ca.street && ia.city === ca.city) conflicts.push({ code: "ADDRESS_MISMATCH", level: "HARD_CONFLICT", incoming: ia.street, candidate: ca.street });
  if (meters != null && meters > 1000) conflicts.push({ code: "COORDINATES_FAR", level: "HARD_CONFLICT", incoming: null, candidate: Math.round(meters) });
  if (inPhone && candidatePhone && inPhone !== candidatePhone) conflicts.push({ code: "PHONE_MISMATCH", level: "SOFT_CONFLICT", incoming: inPhone, candidate: candidatePhone });
  const rawScore = Math.min(100, signals.reduce((sum, item) => sum + item.weight, 0)); const strongCount = signals.filter(({ strength }) => strength === "strong").length;
  const hard = conflicts.some(({ level }) => level === "HARD_CONFLICT");
  const entityGuard = entityType === "supplier" && similarity < 0.72 && !signals.some(({ code }) => ["SOURCE_EXTERNAL_ID", "OFFICIAL_DOMAIN", "EMAIL"].includes(code));
  const outcome = !hard && !entityGuard && (signals.some(({ code }) => code === "SOURCE_EXTERNAL_ID") || (rawScore >= 70 && strongCount >= 1 && signals.length >= 2)) ? "MATCH" : rawScore >= 35 || hard ? "POSSIBLE_MATCH" : "NO_MATCH";
  return { outcome, score: rawScore, signals, conflicts, conflictLevel: hard ? "HARD_CONFLICT" : conflicts.length ? "SOFT_CONFLICT" : "NON_CONFLICTING", thresholds: { match: "score>=70 + strong signal + corroboration, or exact source identity; no hard conflict", possible: "score>=35 or any hard conflict", noMatch: "score<35 without hard conflict" } };
}

export function sourceTrust(source) { return SOURCE_TRUST[source] ?? 0; }
export function advancedConfidence(record, context = {}) {
  const components = { sourceTrust: sourceTrust(record.source) * 7, completeness: 0, identity: 0, freshness: 0, verification: 0, consistency: 0 };
  const fields = ["name", "address_line", "city", "postal_code", "phone", "email", "website", "latitude", "longitude"];
  components.completeness = Math.round(fields.filter((field) => record[field] != null && record[field] !== "").length / fields.length * 18);
  components.identity = Math.min(16, [record.external_id, record.website, record.phone, record.email, record.address_line && record.city].filter(Boolean).length * 4);
  const updated = Date.parse(record.source_updated_at || record.last_verified_at || ""); components.freshness = Number.isFinite(updated) ? (Date.now() - updated < 366 * 86400000 ? 10 : 4) : 2;
  components.verification = record.verification_status === "VERIFIED" ? 10 : record.verification_status === "PROBABLE" ? 6 : 2;
  components.consistency = context.conflictLevel === "HARD_CONFLICT" ? -25 : context.conflictLevel === "SOFT_CONFLICT" ? -8 : context.supportingSources > 1 ? 10 : 4;
  return { score: Math.max(0, Math.min(100, Object.values(components).reduce((sum, value) => sum + value, 0))), components };
}

export function classifyStaleness({ lastSeenAt, lastVerifiedAt, missedObservations = 0, now = new Date() }) {
  const last = Date.parse(lastSeenAt || lastVerifiedAt || ""); const ageDays = Number.isFinite(last) ? (now.getTime() - last) / 86400000 : Infinity;
  if (missedObservations >= 2 && ageDays >= 180) return "UNVERIFIED_STALE"; if (missedObservations >= 1 || ageDays >= 365) return "STALE"; return "ACTIVE";
}

export function mergePreview(existing, incoming, chosen) {
  const fieldsChanged = Object.keys(chosen).filter((key) => JSON.stringify(existing?.[key] ?? null) !== JSON.stringify(chosen[key] ?? null));
  return { before: existing || null, after: chosen, fieldsChanged };
}
