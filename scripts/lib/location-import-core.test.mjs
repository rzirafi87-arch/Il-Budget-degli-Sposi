import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLocation, validateLocation } from "./location-import-core.mjs";

test("location normalization reuses canonical verification states", () => {
  const record = normalizeLocation({ name: "Villa Èlite", venue_type: "villa", city: "Agrigento", province: "AG", region: "Sicilia", country_code: "it", address_line: "Via Test 1", source: "official_site", source_url: "https://example.org/venue", external_id: "venue-1" });
  assert.equal(record.normalized_name, "villa elite"); assert.equal(record.verification_status, "VERIFIED"); assert.deepEqual(validateLocation(record), []);
});

test("same chain name in another city gets a different deterministic identity", () => {
  const first = normalizeLocation({ name: "Hotel X", city: "Palermo", province: "PA", region: "Sicilia", country_code: "it", source: "openstreetmap" });
  const second = normalizeLocation({ name: "Hotel X", city: "Catania", province: "CT", region: "Sicilia", country_code: "it", source: "openstreetmap" });
  assert.notEqual(first.external_id, second.external_id);
});

test("invalid capacity range is rejected", () => {
  const record = normalizeLocation({ name: "Test", city: "Agrigento", province: "AG", region: "Sicilia", country_code: "it", source: "legacy", capacity_min: 200, capacity_max: 100 });
  assert.ok(validateLocation(record).includes("invalid capacity range"));
});
