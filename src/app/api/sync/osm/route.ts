/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * OpenStreetMap (Overpass API) sync endpoint
 * GET /api/sync/osm?area=Provincia di Agrigento&type=church
 * 
 * Syncs wedding venues and churches from OpenStreetMap to normalized schema
 */

const OVERPASS_API = "https://overpass-api.de/api/interpreter";

// Type to OSM tag mapping
const OSM_QUERIES = {
  church: `
    [out:json][timeout:90];
    area["name"="{AREA}"]["admin_level"~"6|7|8"]->.searchArea;
    (
      node["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);
      way["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);
      relation["amenity"="place_of_worship"]["religion"="christian"](area.searchArea);
    );
    out center tags;
  `,
  
  location: `
    [out:json][timeout:90];
    area["name"="{AREA}"]["admin_level"~"6|7|8"]->.searchArea;
    (
      node["tourism"~"hotel|guest_house"]["wedding"="yes"](area.searchArea);
      way["tourism"~"hotel|guest_house"]["wedding"="yes"](area.searchArea);
      node["amenity"="events_venue"](area.searchArea);
      way["amenity"="events_venue"](area.searchArea);
      node["building"="castle"](area.searchArea);
      way["building"="castle"](area.searchArea);
      node["historic"~"castle|manor|villa"](area.searchArea);
      way["historic"~"castle|manor|villa"](area.searchArea);
    );
    out center tags;
  `,
};

interface OSMElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

interface OSMResponse {
  elements: OSMElement[];
}

async function queryOverpass(query: string): Promise<OSMElement[]> {
  const response = await fetch(OVERPASS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Overpass API error: ${response.status} - ${error}`);
  }

  const data: OSMResponse = await response.json();
  return data.elements || [];
}

function extractCoordinates(element: OSMElement): { lat: number; lng: number } | null {
  if (element.lat && element.lon) {
    return { lat: element.lat, lng: element.lon };
  }
  
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon };
  }
  
  return null;
}

function extractName(tags: Record<string, string>): string {
  return (
    tags.name ||
    tags["name:it"] ||
    tags["official_name"] ||
    tags["loc_name"] ||
    "Unknown"
  );
}

function extractChurchType(tags: Record<string, string>): string {
  const denomination = tags.denomination || "";
  const building = tags.building || "";
  
  if (denomination.includes("catholic")) return "Chiesa Cattolica";
  if (building === "cathedral") return "Cattedrale";
  if (building === "basilica") return "Basilica";
  if (tags.tourism === "attraction") return "Santuario";
  
  return "Chiesa";
}

function extractAddress(tags: Record<string, string>): {
  address: string;
  city: string;
  province: string;
  postalCode?: string;
} {
  const street = tags["addr:street"] || "";
  const houseNumber = tags["addr:housenumber"] || "";
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || "Unknown";
  const province = tags["addr:province"] || tags["addr:county"] || "Unknown";
  const postalCode = tags["addr:postcode"];

  const address = [street, houseNumber].filter(Boolean).join(", ");

  return { address, city, province, postalCode };
}

function extractContact(tags: Record<string, string>): {
  phone?: string;
  email?: string;
  website?: string;
} {
  const phone = tags.phone || tags["contact:phone"];
  const email = tags.email || tags["contact:email"];
  const website = tags.website || tags["contact:website"] || tags.url;

  return { phone, email, website };
}

function extractDescription(element: OSMElement, type: string): string {
  const tags = element.tags;
  const parts: string[] = [];

  if (type === "church") {
    const churchType = extractChurchType(tags);
    parts.push(churchType);

    if (tags.denomination) {
      parts.push(tags.denomination);
    }

    if (tags["heritage:operator"]) {
      parts.push("Bene tutelato");
    }

    if (tags.wikipedia) {
      parts.push("Documentata su Wikipedia");
    }
  } else if (type === "location") {
    if (tags.tourism === "hotel") {
      parts.push("Hotel");
    } else if (tags.building === "castle") {
      parts.push("Castello");
    } else if (tags.historic) {
      parts.push(`Edificio storico (${tags.historic})`);
    }

    if (tags.stars) {
      parts.push(`${tags.stars} stelle`);
    }

    if (tags.capacity) {
      parts.push(`Capacità: ${tags.capacity} persone`);
    }
  }

  if (tags.description) {
    parts.push(tags.description);
  }

  return parts.join(" • ");
}

async function syncOSMData(
  area: string,
  type: string,
  region: string
): Promise<{ count: number; newCount: number }> {
  const db = getServiceClient();

  // Create sync job
  const { data: job } = await db
    .from("sync_jobs")
    .insert({
      source: "osm",
      type,
      region,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  const jobId = job?.id;

  try {
    const queryTemplate = OSM_QUERIES[type as keyof typeof OSM_QUERIES];
    if (!queryTemplate) {
      throw new Error(`Unknown type: ${type}`);
    }

    // Replace area placeholder
    const query = queryTemplate.replace(/{AREA}/g, area);

    console.log(`Querying Overpass for ${type} in ${area}...`);
    const elements = await queryOverpass(query);

    let totalCount = 0;
    let newCount = 0;

    for (const element of elements) {
      const coords = extractCoordinates(element);
      if (!coords) {
        console.warn(`Skipping element ${element.id}: no coordinates`);
        continue;
      }

      const name = extractName(element.tags);
      if (name === "Unknown") {
        console.warn(`Skipping element ${element.id}: no name`);
        continue;
      }

      const addressInfo = extractAddress(element.tags);
      const contactInfo = extractContact(element.tags);
      const description = extractDescription(element, type);

      // Generate OSM ID
      const osmId = `osm:${element.type}/${element.id}`;

      // Upsert vendor
      const { error } = await db.rpc("upsert_vendor", {
        p_name: name,
        p_type: type,
        p_source: "osm",
        p_source_id: osmId,
        p_phone: contactInfo.phone,
        p_email: contactInfo.email,
        p_website: contactInfo.website,
        p_description: description || null,
        p_metadata: {
          osm_tags: element.tags,
          osm_type: element.type,
          osm_id: element.id,
        },
        p_osm_id: osmId,
        p_lat: coords.lat,
        p_lng: coords.lng,
        p_address: addressInfo.address || null,
        p_city: addressInfo.city,
        p_province: addressInfo.province,
        p_region: region,
        p_postal_code: addressInfo.postalCode,
      });

      if (!error) {
        totalCount++;
        newCount++;
      } else {
        console.error(`Failed to upsert ${name}:`, error);
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
    const area = searchParams.get("area");
    const type = searchParams.get("type");
    const region = searchParams.get("region");

    if (!area || !type) {
      return NextResponse.json(
        { error: "Missing required parameters: area, type" },
        { status: 400 }
      );
    }

    // Try to infer region from area if not provided
    const inferredRegion = region || area.split(" ").pop() || "Unknown";

    const result = await syncOSMData(area, type, inferredRegion);

    return NextResponse.json({
      success: true,
      area,
      type,
      region: inferredRegion,
      count: result.count,
      newCount: result.newCount,
      message: `Synced ${result.count} vendors (${result.newCount} new) for ${type} in ${area}`,
    });
  } catch (error: any) {
    console.error("OSM sync error:", error);
    return NextResponse.json(
      { error: error.message || "OSM sync failed" },
      { status: 500 }
    );
  }
}
