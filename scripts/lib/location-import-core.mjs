import { confidenceFor, deterministicExternalId, normalizePhone, normalizeText, normalizeUrl, validateCatalogIdentity, verificationFor } from "./catalog-import-core.mjs";

export function normalizeLocation(raw) {
  const record = {
    name: typeof raw.name === "string" ? raw.name.trim() : "",
    normalized_name: normalizeText(raw.name), venue_type: String(raw.venue_type || "other").trim().toLowerCase(), subtype: raw.subtype || null,
    address_line: raw.address_line?.trim() || null, normalized_address: normalizeText(raw.address_line), postal_code: raw.postal_code?.trim() || null,
    city: raw.city?.trim() || "", province: raw.province?.trim() || "", region: raw.region?.trim() || "", country_code: String(raw.country_code || "").trim().toLowerCase(),
    latitude: raw.latitude ?? null, longitude: raw.longitude ?? null, phone: normalizePhone(raw.phone), email: raw.email?.trim().toLowerCase() || null,
    website: normalizeUrl(raw.website), instagram_url: normalizeUrl(raw.instagram_url), facebook_url: normalizeUrl(raw.facebook_url),
    accommodation_available: raw.accommodation_available ?? null, catering_internal: raw.catering_internal ?? null,
    catering_external_allowed: raw.catering_external_allowed ?? null, parking: raw.parking ?? null, accessibility: raw.accessibility ?? null,
    outdoor_space: raw.outdoor_space ?? null, indoor_space: raw.indoor_space ?? null, capacity_min: raw.capacity_min ?? null, capacity_max: raw.capacity_max ?? null,
    source: String(raw.source || "").trim().toLowerCase(), source_url: normalizeUrl(raw.source_url), external_id: raw.external_id?.trim() || null,
    source_updated_at: raw.source_updated_at || null, last_verified_at: raw.last_verified_at || null,
  };
  if (!record.external_id) record.external_id = deterministicExternalId(record);
  const confidence_score = confidenceFor(record);
  return { ...record, confidence_score, verification_status: verificationFor(confidence_score), verified: verificationFor(confidence_score) === "VERIFIED", location_type: record.venue_type, address: record.address_line, country: record.country_code };
}

export function validateLocation(record) {
  const errors = validateCatalogIdentity(record);
  if (record.capacity_min != null && (!Number.isInteger(record.capacity_min) || record.capacity_min < 0)) errors.push("invalid minimum capacity");
  if (record.capacity_max != null && (!Number.isInteger(record.capacity_max) || record.capacity_max < 0)) errors.push("invalid maximum capacity");
  if (record.capacity_min != null && record.capacity_max != null && record.capacity_min > record.capacity_max) errors.push("invalid capacity range");
  return errors;
}
