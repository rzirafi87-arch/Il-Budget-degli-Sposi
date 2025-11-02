export const runtime = "nodejs";
import { getEighteenthTemplate } from "@/data/templates/eighteenth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/eighteenth/seed/[eventId]?country=it
 * Seed categories and subcategories for an eighteenth birthday event
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Verify event ownership
    const { data: eventData, error: eventError } = await db
      .from("events")
      .select("id, user_id")
      .eq("id", eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventData.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get country from query params
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "it";

    // Get template for country
    const template = getEighteenthTemplate(country);

    // Get eighteenth event type
    const { data: eventType } = await db
      .from("event_types")
      .select("id")
      .eq("slug", "eighteenth")
      .single();

    if (!eventType) {
      return NextResponse.json(
        { error: "Eighteenth event type not found in database" },
        { status: 500 }
      );
    }

    // Get categories for eighteenth
    const { data: categories, error: catError } = await db
      .from("categories")
      .select("id, name")
      .eq("type_id", eventType.id);

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json(
        { error: "Categories not found. Run SQL seed first." },
        { status: 500 }
      );
    }

    // Build category map
    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.name, cat.id);
    });

    // Insert subcategories from template
    let insertedCount = 0;
    for (const cat of template) {
      const categoryId = categoryMap.get(cat.name);
      if (!categoryId) {
        console.warn(`Category "${cat.name}" not found in DB, skipping...`);
        continue;
      }

      for (let i = 0; i < cat.subs.length; i++) {
        const subName = cat.subs[i];
        const { error: subError } = await db
          .from("subcategories")
          .upsert(
            {
              category_id: categoryId,
              name: subName,
              sort: i + 1,
            },
            {
              onConflict: "category_id,name",
              ignoreDuplicates: false,
            }
          );

        if (!subError) {
          insertedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${insertedCount} subcategories for eighteenth event`,
      eventId,
      country,
    });
  } catch (e) {
    console.error("/api/eighteenth/seed/[eventId] error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
