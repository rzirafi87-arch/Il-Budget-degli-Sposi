export const CANONICAL_PLACE_TYPES = Object.freeze([
  "church", "basilica", "cathedral", "abbey", "sanctuary", "chapel",
  "mosque", "synagogue", "temple", "other_place_of_worship", "unknown_place_of_worship",
]);

export function validateReconciliationRecord(record) {
  const errors = [];
  if (!/^Q\d+$/.test(record.external_id || "")) errors.push("invalid external_id");
  if (!CANONICAL_PLACE_TYPES.includes(record.canonical_place_type)) errors.push("invalid canonical_place_type");
  if (!Array.isArray(record.source_type_ids) || !record.source_type_ids.every((id) => /^Q\d+$/.test(id))) errors.push("invalid source_type_ids");
  if (!Array.isArray(record.source_type_labels)) errors.push("invalid source_type_labels");
  if (!Array.isArray(record.religion_ids) || !record.religion_ids.every((id) => /^Q\d+$/.test(id))) errors.push("invalid religion_ids");
  if (!Array.isArray(record.religion_labels)) errors.push("invalid religion_labels");
  return errors;
}

export function normalizedReconciliation(record) {
  return {
    external_id: record.external_id,
    canonical_place_type: record.canonical_place_type,
    source_type_ids: [...new Set(record.source_type_ids || [])].sort(),
    source_type_labels: [...new Set(record.source_type_labels || [])].sort(),
    religion_ids: [...new Set(record.religion_ids || [])].sort(),
    religion_labels: [...new Set(record.religion_labels || [])].sort(),
    religion: record.religion || null,
    denomination: record.denomination || null,
  };
}
