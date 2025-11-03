export const runtime = "nodejs";
import { getBirthdayTemplate } from "@/data/templates/birthday";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/birthday/seed/[eventId]?country=it
 * Seed categories and subcategories for a birthday event
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

    // Get template
    const template = getBirthdayTemplate(country);

    // Insert categories and subcategories
    let totalCategories = 0;
    let totalSubcategories = 0;

    for (const cat of template) {
      const { data: categoryData, error: catError } = await db
        .from("categories")
        .insert({
          event_id: eventId,
          name: cat.name,
        })
        .select()
        .single();

      if (catError || !categoryData) {
        console.error("Error creating category:", cat.name, catError);
        continue;
      }

      totalCategories++;

      // Insert subcategories
      if (cat.subs && cat.subs.length > 0) {
        const subcategories = cat.subs.map((sub) => ({
          category_id: categoryData.id,
          name: sub,
        }));

        const { error: subError } = await db
          .from("subcategories")
          .insert(subcategories);

        if (subError) {
          console.error("Error creating subcategories for:", cat.name, subError);
        } else {
          totalSubcategories += subcategories.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Birthday event seeded successfully",
      stats: {
        categories: totalCategories,
        subcategories: totalSubcategories,
      },
    });
  } catch (error) {
    console.error("Birthday seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed birthday event" },
      { status: 500 }
    );
  }
}
