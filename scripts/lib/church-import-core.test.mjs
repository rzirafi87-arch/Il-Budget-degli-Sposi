import assert from "node:assert/strict";
import test from "node:test";
import {
  deterministicExternalId,
  normalizeChurch,
  normalizeText,
  validateChurch,
} from "./church-import-core.mjs";

test("normalization removes accents for matching without changing source input", () => {
  assert.equal(normalizeText("  Chiesa di Sant’Àgata  "), "chiesa di sant agata");
});

test("deterministic identity is stable and location-sensitive", () => {
  const base = { source: "openstreetmap", name: "San Giuseppe", address_line: "Via Roma 1", city: "Agrigento", country_code: "it" };
  assert.equal(deterministicExternalId(base), deterministicExternalId({ ...base }));
  assert.notEqual(deterministicExternalId(base), deterministicExternalId({ ...base, city: "Palermo" }));
});

test("official source with a complete identity derives VERIFIED status", () => {
  const record = normalizeChurch({
    name: "Cattedrale di Test",
    place_type: "cathedral",
    city: "Agrigento",
    province: "AG",
    region: "Sicilia",
    country_code: "it",
    address_line: "Via Test 1",
    source: "official_diocese",
    source_url: "https://example.org/church",
    external_id: "official-1",
  });
  assert.equal(record.verification_status, "VERIFIED");
  assert.deepEqual(validateChurch(record), []);
});

test("invalid rows are isolated instead of breaking a batch", () => {
  const record = normalizeChurch({ name: "", country_code: "italy", source: "legacy" });
  assert.ok(validateChurch(record).length >= 4);
});
