import assert from "node:assert/strict";
import test from "node:test";
import { advancedConfidence, classifyStaleness, evaluateCatalogMatch, nameSimilarity, normalizeComparablePhone, normalizeDomain, normalizeIdentityName, normalizeWebsite } from "./catalog-reliability.mjs";

const base = { name:"Villa Athena", address_line:"Via Passeggiata Archeologica 33", postal_code:"92100", city:"Agrigento", province:"AG", country_code:"it", latitude:37.292, longitude:13.585, category:"location", source:"official_site", external_id:"athena", phone:"0922400000", website:"https://www.villa-athena.it/" };

test("name aliases support fuzzy matching without erasing the original", () => {
  assert.deepEqual(normalizeIdentityName("Hotel Villa Athena S.R.L."), { original:"hotel villa athena srl", legalNeutral:"hotel villa athena", core:"villa athena", descriptors:["hotel"] });
  assert.ok(nameSimilarity("Hotel Villa Athena", "Villa Athena Resort") > 0.8);
});
test("phone and website normalization are deterministic", () => {
  assert.equal(normalizeComparablePhone("(+39) 0922-400 000", "it"), "+390922400000");
  assert.equal(normalizeDomain("https://www.example.it/path"), "example.it"); assert.equal(normalizeDomain("https://facebook.com/example"), null);
  assert.equal(normalizeWebsite("https://WWW.Example.it/x/?utm_source=a&z=1#top"), "https://example.it/x?z=1");
});
test("exact source identity is an explainable match", () => {
  const result = evaluateCatalogMatch("location", base, { ...base }); assert.equal(result.outcome,"MATCH"); assert.equal(result.score,100); assert.ok(result.signals.some(({code})=>code==="SOURCE_EXTERNAL_ID"));
});
test("a weak name alone never auto-merges", () => {
  const result = evaluateCatalogMatch("supplier", { name:"Rossi", city:"Agrigento", source:"directory", external_id:"1" }, { id:"2", name:"Rossi", city:"Agrigento", source:"legacy", external_id:"2" }); assert.notEqual(result.outcome,"MATCH");
});
test("a shared domain with conflicting address remains reviewable", () => {
  const result = evaluateCatalogMatch("location", { ...base, external_id:"new", address_line:"Via Roma 1", city:"Palermo", latitude:38.11, longitude:13.36 }, base); assert.equal(result.outcome,"POSSIBLE_MATCH"); assert.equal(result.conflictLevel,"HARD_CONFLICT");
});
test("near coordinates require a compatible name", () => {
  const result = evaluateCatalogMatch("supplier", { ...base, name:"Mario Rossi Fotografo", external_id:"x", phone:null, website:null }, { ...base, name:"Luigi Bianchi Catering", external_id:"y", phone:null, website:null }); assert.notEqual(result.outcome,"MATCH");
});
test("confidence is distinct from match score and exposes components", () => {
  const confidence = advancedConfidence({ ...base, verification_status:"PROBABLE", source_updated_at:new Date().toISOString() }); assert.ok(confidence.score > 0); assert.equal(typeof confidence.components.sourceTrust,"number");
});
test("stale status needs time or repeated misses and never means deleted", () => {
  const now = new Date("2026-08-31T00:00:00Z"); assert.equal(classifyStaleness({lastSeenAt:"2026-08-01",now}),"ACTIVE"); assert.equal(classifyStaleness({lastSeenAt:"2025-01-01",missedObservations:2,now}),"UNVERIFIED_STALE");
});
