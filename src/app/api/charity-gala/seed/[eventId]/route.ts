export const runtime = "nodejs";

import { getCharityGalaTemplate } from "@/data/templates/charity-gala";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * API per seed categorie Charity/Gala
 * POST /api/charity-gala/seed/[eventId]
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await context.params;
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

  if (authError || !userData.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Verifica che l'evento appartenga all'utente
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id, type")
    .eq("id", eventId)
    .eq("user_id", userId)
    .single();

  if (eventError || !event || event.type !== "charity-gala") {
    return NextResponse.json(
      { error: "Event not found or not a charity-gala event" },
      { status: 404 }
    );
  }

  // Carica template
  const template = getCharityGalaTemplate();

  // Inserisci categorie e sottocategorie
  for (const cat of template) {
    const { data: category, error: catError } = await db
      .from("categories")
      .upsert(
        {
          event_id: eventId,
          name: cat.category,
          display_order: template.indexOf(cat) + 1,
        },
        { onConflict: "event_id,name" }
      )
      .select()
      .single();

    if (catError) {
      console.error("Error inserting category:", catError);
      continue;
    }

    // Inserisci sottocategorie
    for (const subcat of cat.subcategories) {
      await db.from("subcategories").upsert(
        {
          category_id: category.id,
          name: subcat,
          display_order: cat.subcategories.indexOf(subcat) + 1,
        },
        { onConflict: "category_id,name" }
      );
    }
  }

  return NextResponse.json({ success: true, message: "Charity/Gala categories seeded" });
}
