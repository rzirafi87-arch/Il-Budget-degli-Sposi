import { getRetirementTemplate } from "@/data/templates/retirement";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const resolvedParams = await context.params;
  const { eventId } = resolvedParams;

  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const db = getServiceClient();

  // Verify JWT and get user
  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData.user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  const userId = userData.user.id;

  // Verify event ownership
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id, user_id, event_type")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.user_id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (event.event_type !== "retirement") {
    return NextResponse.json(
      { error: "Event type must be retirement" },
      { status: 400 }
    );
  }

  // Get retirement template
  const template = getRetirementTemplate("IT");

  let categoriesCreated = 0;
  let subcategoriesCreated = 0;

  // Upsert categories and subcategories
  for (const category of template) {
    const { data: cat, error: catError } = await db
      .from("categories")
      .upsert(
        {
          event_id: eventId,
          name: category.name,
        },
        { onConflict: "event_id,name" }
      )
      .select("id")
      .single();

    if (catError || !cat) {
      console.error("Error creating category:", catError);
      continue;
    }

    categoriesCreated++;

    // Upsert subcategories
    for (const subName of category.subs) {
      const { error: subError } = await db.from("subcategories").upsert(
        {
          category_id: cat.id,
          name: subName,
        },
        { onConflict: "category_id,name" }
      );

      if (!subError) {
        subcategoriesCreated++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    categoriesCreated,
    subcategoriesCreated,
  });
}
