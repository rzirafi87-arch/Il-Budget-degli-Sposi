export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/**
 * Vendor explorer API
 * GET /api/vendors?type=location&region=Sicilia&city=Palermo&minRating=4.0&verified=true
 * 
 * Public endpoint for searching and filtering wedding vendors
 */

interface VendorFilters {
  type?: string;
  region?: string;
  province?: string;
  city?: string;
  minRating?: number;
  verified?: boolean;
  priceRange?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters: VendorFilters = {
      type: searchParams.get("type") || undefined,
      region: searchParams.get("region") || undefined,
      province: searchParams.get("province") || undefined,
      city: searchParams.get("city") || undefined,
      minRating: searchParams.get("minRating") 
        ? parseFloat(searchParams.get("minRating")!) 
        : undefined,
      verified: searchParams.get("verified") === "true" ? true : undefined,
      priceRange: searchParams.get("priceRange") || undefined,
      source: searchParams.get("source") || undefined,
      limit: searchParams.get("limit") 
        ? parseInt(searchParams.get("limit")!) 
        : 50,
      offset: searchParams.get("offset") 
        ? parseInt(searchParams.get("offset")!) 
        : 0,
    };

    const db = getServiceClient();
    
    // Build query
    let query = db
      .from("vendors_with_places")
      .select("*", { count: "exact" });

    // Apply filters
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    
    if (filters.region) {
      query = query.eq("region", filters.region);
    }
    
    if (filters.province) {
      query = query.eq("province", filters.province);
    }
    
    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    
    if (filters.minRating) {
      query = query.gte("rating", filters.minRating);
    }
    
    if (filters.verified !== undefined) {
      query = query.eq("verified", filters.verified);
    }
    
    if (filters.priceRange) {
      query = query.eq("price_range", filters.priceRange);
    }
    
    if (filters.source) {
      query = query.eq("source", filters.source);
    }

    // Order by rating desc (verified first)
    query = query
      .order("verified", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false })
      .order("rating_count", { ascending: false })
      .range(filters.offset!, filters.offset! + filters.limit! - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch vendors" },
        { status: 500 }
      );
    }

    // Format response
    const vendors = data?.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      type: vendor.type,
      rating: vendor.rating,
      ratingCount: vendor.rating_count,
      priceRange: vendor.price_range,
      verified: vendor.verified,
      description: vendor.description,
      contact: {
        phone: vendor.phone,
        email: vendor.email,
        website: vendor.website,
      },
      location: vendor.lat && vendor.lng ? {
        lat: vendor.lat,
        lng: vendor.lng,
        address: vendor.address,
        city: vendor.city,
        province: vendor.province,
        region: vendor.region,
        postalCode: vendor.postal_code,
      } : null,
      source: {
        type: vendor.source,
        id: vendor.source_id,
        googlePlaceId: vendor.google_place_id,
        osmId: vendor.osm_id,
        wikidataQid: vendor.wikidata_qid,
      },
      metadata: vendor.metadata,
      updatedAt: vendor.updated_at,
      lastSyncedAt: vendor.last_synced_at,
    }));

    return NextResponse.json({
      success: true,
      data: vendors,
      pagination: {
        total: count || 0,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: (filters.offset! + filters.limit!) < (count || 0),
      },
      filters: {
        ...filters,
      },
    });
  } catch (error: any) {
    console.error("Vendor fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

/**
 * Get vendor statistics
 * GET /api/vendors/stats?type=location
 */
export async function OPTIONS(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const db = getServiceClient();
    
    let query = db.from("top_vendors_by_region").select("*");
    
    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: data,
    });
  } catch (error: any) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
