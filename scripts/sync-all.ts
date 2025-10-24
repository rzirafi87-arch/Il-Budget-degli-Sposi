// Script per sync automatico di tutti i fornitori
// Da schedulare via cron, GitHub Actions, o altro

import fetch from "node-fetch";

const endpoints = [
  // Google Places: diversi tipi in Sicilia
  "/api/sync/places?region=Sicilia&type=location",
  "/api/sync/places?region=Sicilia&type=church",
  "/api/sync/places?region=Sicilia&type=photographer",
  "/api/sync/places?region=Sicilia&type=florist",
  "/api/sync/places?region=Sicilia&type=planner",
  
  // OSM: church e location in Sicilia
  "/api/sync/osm?area=Sicilia&type=church",
  "/api/sync/osm?area=Sicilia&type=location",
  
  // Wikidata: ville storiche
  "/api/sync/wikidata"
];

async function syncAll() {
  for (const ep of endpoints) {
    try {
      console.log(`Chiamata a ${ep}...`);
      const res = await fetch(`http://localhost:3000${ep}`, { method: "POST" });
      const json = await res.json();
      console.log(`Risposta da ${ep}:`, JSON.stringify(json, null, 2));
    } catch (e) {
      console.error(`Errore sync ${ep}:`, e);
    }
  }
  console.log("Sync completato.");
}

syncAll();
