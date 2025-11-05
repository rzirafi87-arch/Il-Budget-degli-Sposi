export const runtime = "nodejs";
import babyShowerTemplate from "@/data/templates/babyshower";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const db = getServiceClient();

  // Upsert categories
  for (const [catIdx, cat] of babyShowerTemplate.categories.entries()) {
    const { data: catData, error: catError } = await db
      .from("categories")
      .upsert({
        event_id: eventId,
        name: cat.name,
        display_order: catIdx + 1,
        icon: cat.icon,
      }, { onConflict: "event_id,name" })
      .select()
      .single();
    if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });
    const categoryId = catData?.id;
    if (!categoryId) continue;

    // Upsert subcategories
    for (const [subIdx, sub] of cat.subcategories.entries()) {
      const { error: subError } = await db
        .from("subcategories")
        .upsert({
          category_id: categoryId,
          name: sub.name,
          estimated_cost: sub.estimated_cost ?? 0,
          display_order: subIdx + 1,
          description: sub.description,
        }, { onConflict: "category_id,name" });
      if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });
    }
  }

  // Upsert timeline
  let timelineOrder = 1;
  for (const phase of babyShowerTemplate.timeline) {
    for (const item of phase.items) {
      const { error: timelineError } = await db
        .from("timeline_items")
        .upsert({
          event_id: eventId,
          phase: phase.phase,
          title: item.title,
          description: item.description,
          days_before: item.days_before ?? null,
          category: phase.phase,
          completed: false,
          display_order: timelineOrder,
        }, { onConflict: "event_id,title" });
      if (timelineError) return NextResponse.json({ error: timelineError.message }, { status: 500 });
      timelineOrder++;
    }
  }

  return NextResponse.json({ ok: true });
}
