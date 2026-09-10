import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (name) => JSON.parse(fs.readFileSync(new URL(`../datasets/${name}`, import.meta.url), "utf8"));
const regions = new Set(["Abruzzo","Basilicata","Calabria","Campania","Emilia-Romagna","Friuli-Venezia Giulia","Lazio","Liguria","Lombardia","Marche","Molise","Piemonte","Puglia","Sardegna","Sicilia","Toscana","Trentino-Alto Adige","Umbria","Valle d'Aosta","Veneto"]);

function assertTraceable(record) {
  assert.equal(record.country_code, "IT");
  assert.match(record.external_id, /^Q\d+$/);
  assert.equal(record.source, "wikidata");
  assert.equal(record.source_url, `http://www.wikidata.org/entity/${record.external_id}`);
  assert.ok(Number.isFinite(record.latitude) && record.latitude >= 35 && record.latitude <= 48);
  assert.ok(Number.isFinite(record.longitude) && record.longitude >= 6 && record.longitude <= 19);
  assert.ok(record.name && record.city);
}

test("Italian church dataset is traceable, coordinate-safe and covers all regions", () => {
  const data = read("churches-italy-wikidata.json");
  assert.match(data.license_note, /CC0 1\.0/);
  assert.ok(data.records.length >= 800);
  assert.equal(new Set(data.records.map((record) => record.external_id)).size, data.records.length);
  data.records.forEach(assertTraceable);
  assert.deepEqual(new Set(data.records.map((record) => record.region)), regions);
  assert.ok(data.records.filter((record) => record.region === "Sicilia").length >= 40);
});

test("Italian venue dataset keeps only event venues with wedding-relevant venue identities", () => {
  const data = read("locations-italy-wikidata.json");
  const allowed = new Set(["villa","hotel","historic_residence","resort","agriturismo","masseria","castle","estate"]);
  assert.match(data.license_note, /event-venue subclasses/);
  assert.ok(data.records.length > 0);
  data.records.forEach((record) => { assertTraceable(record); assert.ok(allowed.has(record.venue_type)); assert.doesNotMatch(record.name, /teatro|cinema|multisala|auditorium|\bsala\b/i); });
});

test("curated OSM venue dataset is ODbL-traceable and closes national and Sicilian coverage gaps", () => {
  const data = read("locations-italy-openstreetmap.json");
  const allowed = new Set(["villa", "hotel", "historic_residence", "reception_hall", "agriturismo", "baglio", "estate"]);
  const excluded = /cinema|teatro|auditorium|conferenze|bambin|play house/i;
  assert.match(data.license_note, /ODbL 1\.0/);
  assert.equal(data.license_url, "https://www.openstreetmap.org/copyright");
  assert.ok(data.records.length >= 20);
  assert.equal(new Set(data.records.map((record) => record.external_id)).size, data.records.length);
  data.records.forEach((record) => {
    assert.equal(record.country_code, "IT");
    assert.equal(record.source, "openstreetmap");
    assert.match(record.external_id, /^(node|way|relation)\/\d+$/);
    assert.equal(record.source_url, `https://www.openstreetmap.org/${record.external_id}`);
    assert.ok(Number.isFinite(record.latitude) && record.latitude >= 35 && record.latitude <= 48);
    assert.ok(Number.isFinite(record.longitude) && record.longitude >= 6 && record.longitude <= 19);
    assert.ok(record.name && record.city && record.province && record.region);
    assert.ok(allowed.has(record.venue_type));
    assert.doesNotMatch(record.name, excluded);
    assert.ok(record.provenance_metadata?.verification_basis);
    const tags = record.provenance_metadata?.osm_tags || {};
    assert.ok(tags.amenity === "events_venue" || Boolean(record.provenance_metadata?.verification_url));
  });
  const combinedRegions = new Set([
    ...read("locations-italy-wikidata.json").records.map((record) => record.region),
    ...data.records.map((record) => record.region),
    "Campania", "Emilia-Romagna", "Lazio", "Lombardia", "Piemonte", "Puglia", "Toscana", "Veneto"
  ]);
  assert.deepEqual(combinedRegions, regions);
  const sicilyProvinces = new Set(data.records.filter((record) => record.region === "Sicilia").map((record) => record.province));
  assert.ok(sicilyProvinces.has("Caltanissetta"));
  assert.ok(sicilyProvinces.has("Enna"));
  assert.ok(sicilyProvinces.has("Siracusa"));
});
