export const runtime = "nodejs";
import { getFiftyTemplate } from "@/data/templates/fifty";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type CtxEvent = { params: Promise<{ eventId: string }> };

export async function POST(req: NextRequest, ctx: CtxEvent) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error: userErr } = await db.auth.getUser(jwt);
  if (userErr) return NextResponse.json({ ok: false, error: userErr.message }, { status: 401 });

  const userId = userData.user.id;
  const { eventId } = await ctx.params;
  const country = new URL(req.url).searchParams.get("country") || "it";

  // Verify event ownership
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, user_id")
    .eq("id", eventId)
    .single();
  if (evErr || !ev || ev.user_id !== userId) {
    return NextResponse.json({ ok: false, error: "Event not found or unauthorized" }, { status: 404 });
  }

  // Ensure event type is fifty
  const { data: typeRow, error: typeErr } = await db
    .from("event_types")
    .select("id")
    .eq("slug", "fifty")
    .single();
  if (typeErr) return NextResponse.json({ ok: false, error: typeErr.message }, { status: 500 });

  // Upsert categories
  const tpl = getFiftyTemplate(country);
  let insertedCount = 0;

  // Build map of existing categories for this type
  const { data: existingCats } = await db
    .from("categories")
    .select("id, name")
    .eq("type_id", typeRow.id);

  const catNameToId = new Map<string, string>();
  (existingCats || []).forEach((c) => catNameToId.set(c.name, c.id));

  // Create categories if missing with sequential sort order
  for (let i = 0; i < tpl.length; i++) {
    const cat = tpl[i]!;
    if (!catNameToId.has(cat.name)) {
      const { data: ins, error: insErr } = await db
        .from("categories")
        .insert({ type_id: typeRow.id, name: cat.name, sort_order: i + 1 })
        .select("id")
        .single();
      if (insErr) return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
      if (ins) catNameToId.set(cat.name, ins.id);
    }
  }

  // Upsert subcategories per category
  for (let i = 0; i < tpl.length; i++) {
    const cat = tpl[i]!;
    const catId = catNameToId.get(cat.name);
    if (!catId) continue;
    for (let j = 0; j < cat.subs.length; j++) {
      const sub = cat.subs[j]!;
      const { data: existing } = await db
        .from("subcategories")
        .select("id")
        .eq("category_id", catId)
        .eq("name", sub)
        .maybeSingle();
      if (!existing) {
        const { error: subErr } = await db
          .from("subcategories")
          .insert({ category_id: catId, name: sub, sort_order: j + 1 });
        if (subErr) return NextResponse.json({ ok: false, error: subErr.message }, { status: 500 });
        insertedCount++;
      }
    }
  }

  return NextResponse.json({ ok: true, insertedCount });
}
