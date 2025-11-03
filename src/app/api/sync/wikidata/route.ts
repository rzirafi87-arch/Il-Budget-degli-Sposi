/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * Wikidata SPARQL sync endpoint
 * GET /api/sync/wikidata?region=all&force=false
 * 
 * Syncs historic venues (villas, castles, manors) from Wikidata to normalized schema
 */

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// SPARQL query to find historic wedding venues in Italy
const SPARQL_QUERY = `
SELECT DISTINCT ?item ?itemLabel ?coord ?address ?website ?phone ?image ?description
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q23413 .  # Instance of building or subclass
  ?item wdt:P17 wd:Q38 .                 # Located in Italy
  
  # Must have coordinates
  ?item wdt:P625 ?coord .
  
  # Filter for historic venues (villas, castles, palaces, manors)
  VALUES ?venueType {
    wd:Q3950          # villa
    wd:Q23413         # castle
    wd:Q16560         # palace
    wd:Q879050        # manor house
    wd:Q1343246       # historic house
  }
  ?item wdt:P31 ?venueType .
  
  # Optional fields
  OPTIONAL { ?item wdt:P6375 ?address . }
  OPTIONAL { ?item wdt:P856 ?website . }
  OPTIONAL { ?item wdt:P1329 ?phone . }
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item schema:description ?description . FILTER(LANG(?description) = "it") }
  
  # Get labels in Italian
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" . }
}
LIMIT 500
`;

interface WikidataResult {
  item: { value: string };
  itemLabel: { value: string };
  coord: { value: string }; // "Point(lng lat)"
  address?: { value: string };
  website?: { value: string };
  phone?: { value: string };
  image?: { value: string };
  description?: { value: string };
}

interface WikidataResponse {
  results: {
    bindings: WikidataResult[];
  };
}

async function fetchWikidataVenues(): Promise<WikidataResult[]> {
  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "User-Agent": "Il-Budget-degli-Sposi/1.0 (wedding planning app)",
    },
    body: `query=${encodeURIComponent(SPARQL_QUERY)}`,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Wikidata SPARQL error: ${response.status} - ${error}`);
  }

  const data: WikidataResponse = await response.json();
  return data.results.bindings;
}

function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  // Format: "Point(lng lat)"
  const match = coordString.match(/Point\(([0-9.-]+)\s+([0-9.-]+)\)/);
  if (!match) return null;

  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}

// Reverse geocode to get region from coordinates
function getRegionFromCoords(lat: number, lng: number): string {
  // Simplified region mapping based on coordinates
  // In production, use a proper reverse geocoding service
  
  if (lat >= 37.0 && lat <= 38.5 && lng >= 12.0 && lng <= 15.5) return "Sicilia";
  if (lat >= 38.5 && lat <= 41.5 && lng >= 15.5 && lng <= 18.5) return "Calabria";
  if (lat >= 39.5 && lat <= 42.0 && lng >= 15.0 && lng <= 19.0) return "Puglia";
  if (lat >= 40.0 && lat <= 41.5 && lng >= 13.5 && lng <= 15.5) return "Campania";
  if (lat >= 41.0 && lat <= 42.5 && lng >= 11.5 && lng <= 13.5) return "Lazio";
  if (lat >= 39.0 && lat <= 41.5 && lng >= 8.0 && lng <= 10.0) return "Sardegna";
  if (lat >= 42.5 && lat <= 44.5 && lng >= 10.0 && lng <= 12.5) return "Toscana";
  if (lat >= 43.0 && lat <= 44.0 && lng >= 12.0 && lng <= 14.0) return "Marche";
  if (lat >= 42.5 && lat <= 43.5 && lng >= 11.5 && lng <= 13.0) return "Umbria";
  if (lat >= 41.5 && lat <= 43.0 && lng >= 13.0 && lng <= 14.5) return "Abruzzo";
  if (lat >= 41.0 && lat <= 42.0 && lng >= 14.0 && lng <= 15.5) return "Molise";
  if (lat >= 39.5 && lat <= 41.0 && lng >= 15.5 && lng <= 17.0) return "Basilicata";
  if (lat >= 44.0 && lat <= 46.0 && lng >= 7.5 && lng <= 9.5) return "Piemonte";
  if (lat >= 45.0 && lat <= 46.5 && lng >= 8.5 && lng <= 10.5) return "Lombardia";
  if (lat >= 44.0 && lat <= 45.5 && lng >= 10.5 && lng <= 13.0) return "Veneto";
  if (lat >= 44.0 && lat <= 45.5 && lng >= 9.5 && lng <= 12.5) return "Emilia-Romagna";
  if (lat >= 45.5 && lat <= 47.0 && lng >= 12.0 && lng <= 14.0) return "Friuli-Venezia Giulia";
  if (lat >= 46.0 && lat <= 47.5 && lng >= 10.5 && lng <= 12.5) return "Trentino-Alto Adige";
  if (lat >= 44.0 && lat <= 45.0 && lng >= 7.5 && lng <= 10.0) return "Liguria";
  if (lat >= 45.5 && lat <= 46.0 && lng >= 6.5 && lng <= 8.0) return "Valle d'Aosta";
  
  return "Italia"; // Fallback
}

async function syncWikidataVenues(force: boolean = false): Promise<{ count: number; newCount: number }> {
  const db = getServiceClient();
  
  // Check if already synced recently (last 30 days) unless force=true
  if (!force) {
    const { data: recentSync } = await db
      .from("sync_jobs")
      .select("*")
      .eq("source", "wikidata")
      .eq("type", "location")
      .eq("status", "completed")
      .gte("completed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentSync) {
      return { count: recentSync.results_count, newCount: 0 };
    }
  }

  // Create sync job
  const { data: job } = await db
    .from("sync_jobs")
    .insert({
      source: "wikidata",
      type: "location",
      region: "all",
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  const jobId = job?.id;

  try {
    const venues = await fetchWikidataVenues();
    let totalCount = 0;
    let newCount = 0;

    for (const venue of venues) {
      const coords = parseCoordinates(venue.coord.value);
      if (!coords) continue;

      const region = getRegionFromCoords(coords.lat, coords.lng);
      const wikidataId = venue.item.value.split("/").pop() || "";

      // Upsert vendor using stored procedure
      const { error } = await db.rpc("upsert_vendor", {
        p_name: venue.itemLabel.value,
        p_type: "location",
        p_source: "wikidata",
        p_source_id: wikidataId,
        p_phone: venue.phone?.value,
        p_website: venue.website?.value,
        p_rating: null,
        p_rating_count: 0,
        p_description: venue.description?.value,
        p_price_range: null,
        p_metadata: {
          wikidata_url: venue.item.value,
          image: venue.image?.value,
          venue_type: "historic",
        },
        p_google_place_id: null,
        p_lat: coords.lat,
        p_lng: coords.lng,
        p_address: venue.address?.value,
        p_city: null,
        p_province: null,
        p_region: region,
        p_postal_code: null,
      });

      if (!error) {
        totalCount++;
        newCount++;
      } else {
        console.error(`Failed to upsert venue ${venue.itemLabel.value}:`, error);
      }

      // Rate limiting: 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update job as completed
    await db
      .from("sync_jobs")
      .update({
        status: "completed",
        results_count: totalCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return { count: totalCount, newCount };
  } catch (error: any) {
    console.error("Wikidata sync error:", error);
    
    // Update job as failed
    if (jobId) {
      await db
        .from("sync_jobs")
        .update({
          status: "failed",
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobId);
    }

    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const result = await syncWikidataVenues(force);

    return NextResponse.json({
      success: true,
      source: "wikidata",
      type: "location",
      count: result.count,
      newCount: result.newCount,
      message: `Synced ${result.count} historic venues from Wikidata (${result.newCount} new)`,
    });
  } catch (error: any) {
    console.error("Wikidata sync error:", error);
    return NextResponse.json(
      { error: error.message || "Wikidata sync failed" },
      { status: 500 }
    );
  }
}
