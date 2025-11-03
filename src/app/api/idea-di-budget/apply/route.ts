/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

// POST /api/idea-di-budget/apply
// Body: { country?: string, rows?: Array<{ category?: string; subcategory?: string; spendType?: string; idea_amount?: number; amount?: number; name?: string; }> }
// Effect: replaces user's budget_items for the given event and country with provided rows (amount > 0).
// If rows are not provided, it pulls planned expenses saved from Idea di Budget (status='planned' AND from_dashboard=true).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const country = (body?.country || req.nextUrl.searchParams.get("country") || "it").toLowerCase();
  let rows: any[] = Array.isArray(body?.rows) ? body.rows : Array.isArray(body) ? body : [];

  // Find user's event
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .single();
  if (evErr || !ev?.id) return NextResponse.json({ error: "No event found" }, { status: 404 });

  // If no rows provided, pull planned expenses from Idea di Budget
  if (rows.length === 0) {
    const { data: planned, error: qErr } = await db
      .from("expenses")
      .select(`
        committed_amount,
        spend_type,
        subcategory:subcategories!inner(
          name,
          category:categories!inner(name, event_id)
        )
      `)
      .eq("subcategory.category.event_id", ev.id)
      .eq("status", "planned")
      .eq("from_dashboard", true);
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
    rows = (planned || []).map((e: any) => ({
      category: e.subcategory?.category?.name,
      subcategory: e.subcategory?.name,
      idea_amount: e.committed_amount,
      spendType: e.spend_type || "common",
    }));
  }

  // Normalize items
  const items = rows
    .map((r) => {
      const amount = Number(r.idea_amount ?? r.amount ?? 0) || 0;
      const category = r.category || "";
      const sub = r.subcategory || "";
      const st = (r.spendType || r.spend_type || "common") as string;
      const name = r.name || [category, sub].filter(Boolean).join(" - ") || "Voce di budget";
      return { name, amount, spend_type: st };
    })
    .filter((it) => it.amount > 0);

  // Replace current budget_items for this event+country created from ideas (we simply wipe all and reinsert for country)
  // If your schema needs a discriminator, consider adding a "source" column; here we filter by country and event only.
  const del = await db.from("budget_items").delete().eq("event_id", ev.id).eq("country_code", country);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  if (items.length === 0) return NextResponse.json({ success: true, inserted: 0 });

  const payload = items.map((it) => ({
    event_id: ev.id,
    country_code: country,
    name: it.name,
    amount: it.amount,
    spend_type: it.spend_type,
  }));

  const { error: insErr, data } = await db.from("budget_items").insert(payload).select();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({ success: true, inserted: data?.length || 0 });
}
