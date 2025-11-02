export const runtime = "nodejs";
import { getCommunionTemplate } from "@/data/templates/communion";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type CtxEvent = { params: Promise<{ eventId: string }> };

export async function POST(
  req: NextRequest,
  ctx: CtxEvent
) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error: authErr } = await db.auth.getUser(jwt);
  if (authErr || !userData?.user) return NextResponse.json({ ok: false, error: authErr?.message || "Auth error" }, { status: 401 });

  const userId = userData.user.id;
  const { eventId } = await ctx.params;
  const country = new URL(req.url).searchParams.get("country") || "it";

  // Ensure event belongs to user
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, owner_id, type_id")
    .eq("id", eventId)
    .single();
  if (evErr || !ev || ev.owner_id !== userId) {
    return NextResponse.json({ ok: false, error: "Event not found or not owned" }, { status: 404 });
  }

  // Ensure event type is communion
  const { data: typeRow } = await db
    .from("event_types")
    .select("id")
    .eq("slug", "communion")
    .single();

  if (!typeRow) {
    return NextResponse.json({ ok: false, error: "Event type 'communion' not found" }, { status: 400 });
  }

  // Seed categories and subcategories
  const tpl = getCommunionTemplate(country);
  for (const cat of tpl) {
    const { data: catRow, error: catErr } = await db
      .from("categories")
      .upsert({ name: cat.name, type_id: typeRow.id }, { onConflict: "type_id,name" })
      .select("id")
      .single();
    if (catErr) return NextResponse.json({ ok: false, error: catErr.message }, { status: 500 });
    const catId = catRow.id;
    for (const sub of cat.subs) {
      const { error: subErr } = await db
        .from("subcategories")
        .upsert({ name: sub, category_id: catId }, { onConflict: "category_id,name" });
      if (subErr) return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, eventId });
}
