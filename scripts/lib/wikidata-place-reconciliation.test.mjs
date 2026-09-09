import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { CANONICAL_PLACE_TYPES, normalizedReconciliation, validateReconciliationRecord } from "./wikidata-place-reconciliation.mjs";

const dataset = JSON.parse(fs.readFileSync(new URL("../datasets/churches-italy-wikidata-reconciliation.json", import.meta.url), "utf8"));

test("reconciliation covers each imported Wikidata place exactly once", () => {
  assert.equal(dataset.records.length, 895);
  assert.equal(new Set(dataset.records.map((record) => record.external_id)).size, 895);
  for (const record of dataset.records) assert.deepEqual(validateReconciliationRecord(record), []);
});

test("normalization is idempotent and preserves source evidence", () => {
  const fixture = { external_id: "Q1", canonical_place_type: "mosque", source_type_ids: ["Q32815", "Q32815"], source_type_labels: ["mosque"], religion_ids: ["Q432"], religion_labels: ["Islam"], religion: "islam", denomination: null };
  const once = normalizedReconciliation(fixture);
  assert.deepEqual(normalizedReconciliation(once), once);
  assert.deepEqual(once.source_type_ids, ["Q32815"]);
});

test("canonical vocabulary supports future neutral ceremony types", () => {
  for (const type of ["church","cathedral","basilica","chapel","abbey","mosque","synagogue","temple","other_place_of_worship","unknown_place_of_worship"]) assert.ok(CANONICAL_PLACE_TYPES.includes(type));
});
