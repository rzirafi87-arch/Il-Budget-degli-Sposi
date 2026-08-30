import { confidenceFor, deterministicExternalId, normalizePhone, normalizeText, normalizeUrl, validateCatalogIdentity, verificationFor } from "./catalog-import-core.mjs";
export { deterministicExternalId, normalizeText } from "./catalog-import-core.mjs";

export function normalizeChurch(raw) {
  const source = String(raw.source || "").trim().toLowerCase();
  const countryCode = String(raw.country_code || "").trim().toLowerCase();
  const sourceUrl = normalizeUrl(raw.source_url);
  const website = normalizeUrl(raw.website);
  const record = {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    normalized_name: normalizeText(raw.name),
    place_type: String(raw.place_type || "place_of_worship").trim().toLowerCase(),
    denomination: raw.denomination || null,
    religion: raw.religion || null,
    subtype: raw.subtype || null,
    address_line: raw.address_line?.trim() || null,
    normalized_address: normalizeText(raw.address_line),
    postal_code: raw.postal_code?.trim() || null,
    city: raw.city?.trim() || "",
    province: raw.province?.trim() || "",
    region: raw.region?.trim() || "",
    country_code: countryCode,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    phone: normalizePhone(raw.phone),
    email: raw.email?.trim().toLowerCase() || null,
    website,
    wedding_ceremony_available: raw.wedding_ceremony_available ?? null,
    capacity: raw.capacity ?? null,
    accessibility: raw.accessibility ?? null,
    parking: raw.parking ?? null,
    source,
    source_url: sourceUrl,
    external_id: raw.external_id?.trim() || null,
    source_updated_at: raw.source_updated_at || null,
    last_verified_at: raw.last_verified_at || null,
  };
  if (!record.external_id) record.external_id = deterministicExternalId(record);
  const confidence = confidenceFor(record);
  return {
    ...record,
    confidence_score: confidence,
    verification_status: verificationFor(confidence),
    verified: verificationFor(confidence) === "VERIFIED",
    church_type: record.denomination,
    address: record.address_line,
    country: record.country_code,
  };
}

export function validateChurch(record) {
  const errors = validateCatalogIdentity(record);
  if (record.capacity != null && (!Number.isInteger(record.capacity) || record.capacity < 0)) errors.push("invalid capacity");
  return errors;
}
