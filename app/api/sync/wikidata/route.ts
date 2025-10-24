export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

import { getServiceClient } from "@/lib/supabaseServer";

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const SPARQL_QUERY = `
SELECT ?item ?itemLabel ?address ?coord ?typeLabel WHERE {
  ?item wdt:P31/wdt:P279* wd:Q23413. # instance of historic building (villa, castle, manor)
  OPTIONAL { ?item wdt:P969 ?address. }
  OPTIONAL { ?item wdt:P625 ?coord. }
  OPTIONAL { ?item wdt:P31 ?type. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}
LIMIT 100
`;

async function fetchWikidataVenues() {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results.bindings.map((row: any) => ({
    name: row.itemLabel?.value,
    address: row.address?.value || "",
    coordinates: row.coord?.value || "",
    type: row.typeLabel?.value || "Villa storica",
    source: "wikidata"
  }));
}

export async function POST(req: NextRequest) {
  const db = getServiceClient();
  const venues = await fetchWikidataVenues();
  let inserted = 0;
  for (const v of venues) {
    // Upsert vendor (semplificato, da adattare a schema reale)
    await db.from("vendors").upsert({
      name: v.name,
      address: v.address,
      coordinates: v.coordinates,
      type: v.type,
      source: v.source
    });
    inserted++;
  }
  return NextResponse.json({ status: "ok", inserted });
}
