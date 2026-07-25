// Script per sync automatico di tutti i fornitori
// Da schedulare via cron, GitHub Actions, o altro

import fetch from "node-fetch";

const adminSecret = process.env.ADMIN_SYNC_SECRET;
if (!adminSecret) {
  throw new Error("ADMIN_SYNC_SECRET is required");
}

const syncs = [
  { path: "/api/sync/places", body: { region: "Sicilia", type: "location" } },
  { path: "/api/sync/places", body: { region: "Sicilia", type: "church" } },
  { path: "/api/sync/places", body: { region: "Sicilia", type: "photographer" } },
  { path: "/api/sync/places", body: { region: "Sicilia", type: "florist" } },
  { path: "/api/sync/places", body: { region: "Sicilia", type: "planner" } },
  { path: "/api/sync/osm", body: { area: "Sicilia", type: "church", region: "Sicilia" } },
  { path: "/api/sync/osm", body: { area: "Sicilia", type: "location", region: "Sicilia" } },
  { path: "/api/sync/wikidata", body: {} },
];

async function syncAll() {
  for (const sync of syncs) {
    try {
      console.log(`Chiamata a ${sync.path}...`);
      const res = await fetch(`http://localhost:3000${sync.path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${adminSecret}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(sync.body),
      });
      const json = await res.json();
      console.log(`Risposta da ${sync.path}:`, JSON.stringify(json, null, 2));
    } catch (error) {
      console.error(`Errore sync ${sync.path}:`, error);
    }
  }
  console.log("Sync completato.");
}

syncAll();
