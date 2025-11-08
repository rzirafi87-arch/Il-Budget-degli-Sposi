export const runtime = "nodejs";

import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

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

interface SupplierRow {
  id: string;
  name: string;
  verified: boolean;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  subscription_tier: string | null;
  is_featured: boolean;
  category: string | null;
}

interface VendorPlaceRow {
  id: string;
  name: string;
  type: string;
  rating: number | null;
  rating_count: number | null;
  price_range: string | null;
  verified: boolean;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city: string | null;
  province: string | null;
  region: string | null;
  postal_code: string | null;
  source: string | null;
  source_id: string | null;
  google_place_id: string | null;
  osm_id: string | null;
  wikidata_qid: string | null;
  metadata: unknown;
  updated_at: string | null;
  last_synced_at: string | null;
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

    // Determine demo vs authenticated (JWT presence)
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const jwt = authHeader?.split(" ")[1];
    const isDemo = !jwt; // if no JWT, treat as demo (gating applies)

    // Branch: suppliers use visibility rules via RPC; others use the existing view
    if (filters.type && (filters.type.toLowerCase() === "supplier" || filters.type.toLowerCase() === "suppliers")) {
      // Use DB visibility function for suppliers
      const { data: sup, error: supErr } = await db.rpc("get_visible_suppliers", {
        p_category: null, // you can pass a real category when you add ?category=
        p_region: filters.region ?? null,
        p_province: filters.province ?? null,
        p_is_demo: isDemo,
      });

      if (supErr) {
        console.error("RPC get_visible_suppliers error:", supErr);
        return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
      }

      // Optional city filter client-side (function does not filter city)
      let rows = Array.isArray(sup) ? sup : [];
      if (filters.city) {
        const cityTerm = filters.city.toLowerCase();
        rows = rows.filter((r: SupplierRow) => (r.city || "").toLowerCase().includes(cityTerm));
      }

      // Pagination client-side
      const total = rows.length;
      const start = filters.offset ?? 0;
      const end = start + (filters.limit ?? 50);
      const page = rows.slice(start, end);

      const vendors = page.map((v: SupplierRow) => ({
        id: v.id,
        name: v.name,
        type: "supplier",
        rating: undefined,
        ratingCount: undefined,
        priceRange: undefined,
        verified: v.verified,
        description: v.description,
        contact: {
          phone: v.phone,
          email: v.email,
          website: v.website,
        },
        location: {
          lat: undefined,
          lng: undefined,
          address: v.address,
          city: v.city,
          province: v.province,
          region: v.region,
          postalCode: undefined,
        },
        source: undefined,
        metadata: undefined,
        updatedAt: undefined,
        lastSyncedAt: undefined,
        subscriptionTier: v.subscription_tier,
        isFeatured: v.is_featured,
        category: v.category,
      }));

      return NextResponse.json({
        success: true,
        data: vendors,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          hasMore: (start + (filters.limit ?? 50)) < total,
        },
        filters: { ...filters, demo: isDemo },
      });
    }

    // Default branch: existing unified view for locations/churches/others
    let query = db.from("vendors_with_places").select("*", { count: "exact" });

    if (filters.type) query = query.eq("type", filters.type);
    if (filters.region) query = query.eq("region", filters.region);
    if (filters.province) query = query.eq("province", filters.province);
    if (filters.city) query = query.ilike("city", `%${filters.city}%`);
    if (filters.minRating) query = query.gte("rating", filters.minRating);
    if (filters.verified !== undefined) query = query.eq("verified", filters.verified);
    if (filters.priceRange) query = query.eq("price_range", filters.priceRange);
    if (filters.source) query = query.eq("source", filters.source);

    query = query
      .order("verified", { ascending: false })
      .order("rating", { ascending: false, nullsFirst: false })
      .order("rating_count", { ascending: false })
      .range(filters.offset!, filters.offset! + filters.limit! - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error("Query error:", error);
      return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }

    const vendors = (data ?? []).map((vendor: VendorPlaceRow) => ({
      id: vendor.id,
      name: vendor.name,
      type: vendor.type,
      rating: vendor.rating,
      ratingCount: vendor.rating_count,
      priceRange: vendor.price_range,
      verified: vendor.verified,
      description: vendor.description,
      contact: { phone: vendor.phone, email: vendor.email, website: vendor.website },
      location: vendor.lat && vendor.lng
        ? { lat: vendor.lat, lng: vendor.lng, address: vendor.address, city: vendor.city, province: vendor.province, region: vendor.region, postalCode: vendor.postal_code }
        : null,
      source: { type: vendor.source, id: vendor.source_id, googlePlaceId: vendor.google_place_id, osmId: vendor.osm_id, wikidataQid: vendor.wikidata_qid },
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
      filters: { ...filters, demo: isDemo },
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
