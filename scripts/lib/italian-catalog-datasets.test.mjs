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
