export const runtime = "nodejs";

import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type UpdateFeaturedInput = {
  entity_type: "supplier" | "location" | "church";
  entity_id: string;
  is_featured: boolean;
};

/**
 * PUT /api/subscription-featured
 * Updates the featured status of a supplier/location/church
 * Only allowed for Premium/Premium Plus subscribers
 */
export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const body: UpdateFeaturedInput = await req.json();

    const { entity_type, entity_id, is_featured } = body;

    // Validate required fields
    if (!entity_type || !entity_id || is_featured === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tableName = entity_type === "supplier" ? "suppliers" : entity_type === "location" ? "locations" : "churches";

    // Get entity and verify ownership + subscription tier
    const { data: entity, error: entityError } = await db
      .from(tableName)
      .select("id, user_id, subscription_tier, subscription_expires_at")
      .eq("id", entity_id)
      .single();

    if (entityError || !entity || entity.user_id !== userId) {
      return NextResponse.json(
        { error: "Entity not found or access denied" },
        { status: 403 }
      );
    }

    // Check if subscription tier allows featured status
    if (entity.subscription_tier !== "premium" && entity.subscription_tier !== "premium_plus") {
      return NextResponse.json(
        { error: "Featured status requires Premium or Premium Plus subscription" },
        { status: 403 }
      );
    }

    // Check if subscription is active
    const expiresAt = entity.subscription_expires_at ? new Date(entity.subscription_expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Subscription has expired" },
        { status: 403 }
      );
    }

    // Update featured status
    const { data: updated, error: updateError } = await db
      .from(tableName)
      .update({ is_featured })
      .eq("id", entity_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating featured status:", updateError);
      return NextResponse.json(
        { error: "Failed to update featured status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      entity: updated 
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
