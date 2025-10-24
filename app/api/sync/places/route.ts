export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * Google Places API sync endpoint
 * GET /api/sync/places?region=Sicilia&type=location&force=false
 * 
 * Syncs wedding vendors from Google Places API to normalized schema
 */

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_BASE = "https://places.googleapis.com/v1/places";

// Type to Google Places includedTypes mapping
// Note: Google Places API (New) supports limited types. For others, use keywords only.
const TYPE_CONFIG = {
  location: {
    includedTypes: ["wedding_venue", "banquet_hall", "event_venue"],
    keywords: ["matrimonio", "ricevimento nozze", "location matrimonio"],
  },
  church: {
    includedTypes: ["church"],
    keywords: ["chiesa matrimonio", "cattedrale", "basilica", "santuario"],
  },
  planner: {
    includedTypes: ["event_planner"],
    keywords: ["wedding planner", "organizzazione matrimoni"],
  },
  band: {
    includedTypes: [],
    keywords: ["band matrimonio", "musica matrimonio", "gruppo musicale matrimonio"],
  },
  dj: {
    includedTypes: [],
    keywords: ["dj matrimonio", "disc jockey matrimonio"],
  },
  photographer: {
    includedTypes: [],
    keywords: ["fotografo matrimonio", "wedding photographer", "fotografia matrimoni"],
  },
  videographer: {
    includedTypes: [],
    keywords: ["videomaker matrimonio", "video matrimonio", "riprese matrimonio"],
  },
  florist: {
    includedTypes: ["florist"],
    keywords: ["fiorista matrimonio", "addobbi floreali matrimonio", "fiori matrimonio"],
  },
  caterer: {
    includedTypes: [],
    keywords: ["catering matrimonio", "banchetti matrimonio", "servizio catering"],
  },
};

// Italian regions with approximate center coordinates (max radius: 50000m per Google API limits)
const REGION_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  Sicilia: { lat: 37.5999938, lng: 14.0153557, radius: 50000 },
  Lombardia: { lat: 45.5792055, lng: 9.6810566, radius: 50000 },
  Lazio: { lat: 41.9027835, lng: 12.4963655, radius: 50000 },
  Toscana: { lat: 43.7710513, lng: 11.2486208, radius: 50000 },
  Campania: { lat: 40.8517746, lng: 14.2681244, radius: 50000 },
  Veneto: { lat: 45.4398169, lng: 12.3319848, radius: 50000 },
  Piemonte: { lat: 45.0732745, lng: 7.6824892, radius: 50000 },
  "Emilia-Romagna": { lat: 44.4938203, lng: 11.3426327, radius: 50000 },
  Puglia: { lat: 41.1253641, lng: 16.8626686, radius: 50000 },
  Calabria: { lat: 38.9100046, lng: 16.5873113, radius: 50000 },
  Sardegna: { lat: 40.1208752, lng: 9.0128926, radius: 50000 },
  Liguria: { lat: 44.3160612, lng: 8.4136834, radius: 50000 },
  Marche: { lat: 43.6158109, lng: 13.5188753, radius: 50000 },
  Umbria: { lat: 43.1121164, lng: 12.3888815, radius: 50000 },
  Abruzzo: { lat: 42.3506154, lng: 13.3995091, radius: 50000 },
  Basilicata: { lat: 40.6389877, lng: 15.8053352, radius: 50000 },
  Molise: { lat: 41.6759323, lng: 14.6099362, radius: 40000 },
  "Friuli-Venezia Giulia": { lat: 46.1512003, lng: 13.1502778, radius: 50000 },
  "Trentino-Alto Adige": { lat: 46.4336426, lng: 11.1693293, radius: 50000 },
  "Valle d'Aosta": { lat: 45.7389277, lng: 7.4261941, radius: 30000 },
};

interface PlaceResult {
  id: string;
  displayName: { text: string };
  formattedAddress?: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: any;
  photos?: any[];
  priceLevel?: string;
  types?: string[];
}

async function searchPlaces(
  type: string,
  region: string,
  keyword: string,
  pageToken?: string
): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured");
  }

  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
  if (!config) {
    throw new Error(`Unknown type: ${type}`);
  }

  const regionCoord = REGION_COORDS[region];
  if (!regionCoord) {
    throw new Error(`Unknown region: ${region}`);
  }

  const body: any = {
    textQuery: keyword,
    locationBias: {
      circle: {
        center: {
          latitude: regionCoord.lat,
          longitude: regionCoord.lng,
        },
        radius: regionCoord.radius,
      },
    },
    maxResultCount: 20,
    languageCode: "it",
    regionCode: "IT",
  };

  if (config.includedTypes.length > 0) {
    body.includedType = config.includedTypes[0]; // API accepts single type
  }

  if (pageToken) {
    body.pageToken = pageToken;
  }

  const response = await fetch(`${PLACES_API_BASE}:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.priceLevel,places.types,nextPageToken",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    results: data.places || [],
    nextPageToken: data.nextPageToken,
  };
}

function parseAddress(formattedAddress?: string): {
  city: string;
  province: string;
  region: string;
  postalCode?: string;
} {
  if (!formattedAddress) {
    return { city: "Unknown", province: "Unknown", region: "Unknown" };
  }

  // Italian address format: Street, PostalCode City Province, Italy
  // Example: "Via Roma 1, 90100 Palermo PA, Italia"
  
  const parts = formattedAddress.split(",").map((p) => p.trim());
  
  let city = "Unknown";
  let province = "Unknown";
  let region = "Unknown";
  let postalCode: string | undefined;

  // Extract city and province from "90100 Palermo PA" format
  if (parts.length >= 2) {
    const cityProvincePart = parts[parts.length - 2];
    const match = cityProvincePart.match(/(\d{5})?\s*([A-Za-zàèéìòù\s'-]+?)\s+([A-Z]{2})/);
    
    if (match) {
      postalCode = match[1] || undefined;
      city = match[2].trim();
      province = match[3];
    } else {
      // Fallback: just extract city name
      city = cityProvincePart.replace(/\d{5}\s*/, "").trim();
    }
  }

  return { city, province, region, postalCode };
}

function calculatePriceRange(priceLevel?: string): string | null {
  if (!priceLevel) return null;
  
  const mapping: Record<string, string> = {
    PRICE_LEVEL_FREE: "€",
    PRICE_LEVEL_INEXPENSIVE: "€",
    PRICE_LEVEL_MODERATE: "€€",
    PRICE_LEVEL_EXPENSIVE: "€€€",
    PRICE_LEVEL_VERY_EXPENSIVE: "€€€€",
  };
  
  return mapping[priceLevel] || null;
}

async function getPlaceDetails(placeId: string): Promise<any> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured");
  }

  const response = await fetch(`${PLACES_API_BASE}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,photos,priceLevel,types,editorialSummary",
    },
  });

  if (!response.ok) {
    console.error(`Failed to get place details for ${placeId}: ${response.status}`);
    return null;
  }

  return response.json();
}

async function syncRegionType(
  region: string,
  type: string,
  force: boolean = false
): Promise<{ count: number; newCount: number }> {
  const db = getServiceClient();
  
  // Check if already synced recently (last 7 days) unless force=true
  if (!force) {
    const { data: recentSync } = await db
      .from("sync_jobs")
      .select("*")
      .eq("source", "google")
      .eq("type", type)
      .eq("region", region)
      .eq("status", "completed")
      .gte("completed_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (recentSync) {
      return { count: recentSync.results_count, newCount: 0 };
    }
  }

  // Create sync job
  const { data: job } = await db
    .from("sync_jobs")
    .insert({
      source: "google",
      type,
      region,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  const jobId = job?.id;

  try {
    const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
    let totalCount = 0;
    let newCount = 0;

    // Search for each keyword
    for (const keyword of config.keywords) {
      let nextPageToken: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const { results, nextPageToken: nextToken } = await searchPlaces(
          type,
          region,
          keyword,
          nextPageToken
        );

        for (const place of results) {
          // Get detailed info
          const details = await getPlaceDetails(place.id);
          if (!details) continue;

          const addressParts = parseAddress(details.formattedAddress);

          // Upsert vendor using stored procedure
          const { error } = await db.rpc("upsert_vendor", {
            p_name: details.displayName?.text || "Unknown",
            p_type: type,
            p_source: "google",
            p_source_id: details.id,
            p_phone: details.internationalPhoneNumber || details.nationalPhoneNumber,
            p_website: details.websiteUri,
            p_rating: details.rating,
            p_rating_count: details.userRatingCount || 0,
            p_description: details.editorialSummary?.text,
            p_price_range: calculatePriceRange(details.priceLevel),
            p_metadata: {
              types: details.types,
              opening_hours: details.regularOpeningHours,
              photos: details.photos?.slice(0, 5),
            },
            p_google_place_id: details.id,
            p_lat: details.location?.latitude,
            p_lng: details.location?.longitude,
            p_address: details.formattedAddress,
            p_city: addressParts.city,
            p_province: addressParts.province,
            p_region: region,
            p_postal_code: addressParts.postalCode,
          });

          if (!error) {
            totalCount++;
            newCount++;
          }

          // Rate limiting: 50ms between requests
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        nextPageToken = nextToken;
        hasMore = !!nextToken && totalCount < 100; // Max 100 results per sync

        // Delay between pages
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Delay between keywords
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
    // Update job as failed
    await db
      .from("sync_jobs")
      .update({
        status: "failed",
        error_message: error.message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const type = searchParams.get("type");
    const force = searchParams.get("force") === "true";

    if (!region || !type) {
      return NextResponse.json(
        { error: "Missing required parameters: region, type" },
        { status: 400 }
      );
    }

    const result = await syncRegionType(region, type, force);

    return NextResponse.json({
      success: true,
      region,
      type,
      count: result.count,
      newCount: result.newCount,
      message: `Synced ${result.count} vendors (${result.newCount} new) for ${type} in ${region}`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}
