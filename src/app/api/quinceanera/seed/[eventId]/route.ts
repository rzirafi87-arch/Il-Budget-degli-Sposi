export const runtime = "nodejs";
import { getQuinceaneraTemplate } from "@/data/templates/quinceanera";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ ok: false, error: "No JWT" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error: authErr } = await db.auth.getUser(jwt);
  if (authErr) {
    return NextResponse.json({ ok: false, error: authErr.message }, { status: 401 });
  }

  const userId = userData.user.id;

  // Verify event ownership
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, user_id")
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !ev || ev.user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Event not found or unauthorized" }, { status: 404 });
  }

  const country = new URL(req.url).searchParams.get("country") || "mx";
  const template = getQuinceaneraTemplate(country);

  // Get quinceanera event type
  const { data: typeRow } = await db
    .from("event_types")
    .select("id")
    .eq("slug", "quinceanera")
    .single();

  if (!typeRow) {
    return NextResponse.json({ ok: false, error: "Quinceañera event type not found" }, { status: 404 });
  }

  const typeId = typeRow.id;

  // Upsert categories and subcategories
  for (const cat of template) {
    const { data: catRow } = await db
      .from("categories")
      .upsert({ type_id: typeId, name: cat.name }, { onConflict: "type_id,name" })
      .select("id")
      .single();

    if (catRow) {
      for (const sub of cat.subs) {
        await db
          .from("subcategories")
          .upsert(
            { category_id: catRow.id, name: sub },
            { onConflict: "category_id,name" }
          );
      }
    }
  }

  return NextResponse.json({ ok: true, message: "Quinceañera event seeded successfully" });
}
