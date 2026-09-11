/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { findWeddingBudgetItem } from "@/constants/budgetCategories";
import { deduplicateCanonicalBudgetItems } from "@/lib/budgetCanonical";

// POST /api/idea-di-budget/apply
// Body: { country?: string, rows?: Array<{ category?: string; subcategory?: string; spendType?: string; idea_amount?: number; amount?: number; name?: string; }> }
// Effect: replaces only budget_items generated from ideas for the given event and country.
// If rows are not provided, it pulls planned expenses saved from Budget Idea (status='planned' AND from_dashboard=true).
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });

  const body = await req.json();
  const country = (body?.country || req.nextUrl.searchParams.get("country") || "it").toLowerCase();
  let rows: any[] = Array.isArray(body?.rows) ? body.rows : Array.isArray(body) ? body : [];

  const ev = { id: (await requireServerCurrentEvent(userData.user.id)).eventId };

  if (rows.length === 0) {
    const { data: planned, error: qErr } = await db
      .from("expenses")
      .select(`
        committed_amount,
        spend_type,
        is_enabled,
        canonical_key,
        subcategory:subcategories!inner(
          name,
          category:categories!inner(name, event_id)
        )
      `)
      .eq("subcategory.category.event_id", ev.id)
      .eq("status", "planned")
      .eq("from_dashboard", true)
      .eq("taxonomy_status", "active");
    if (qErr) return NextResponse.json({ error: "BUDGET_IDEA_LOAD_FAILED", code: qErr.code || null }, { status: 500 });
    rows = (planned || []).map((e: any) => ({
      category: e.subcategory?.category?.name,
      subcategory: e.subcategory?.name,
      idea_amount: e.committed_amount,
      spendType: e.spend_type || "common",
      enabled: e.is_enabled !== false,
      canonicalKey: e.canonical_key || undefined,
    }));
  }

  const items = rows
    .map((r) => {
      const amount = Number(r.idea_amount ?? r.amount ?? 0) || 0;
      const category = r.category || "";
      const sub = r.subcategory || "";
      const st = (r.spendType || r.spend_type || "common") as string;
      const name = r.name || [category, sub].filter(Boolean).join(" - ") || "budget-item";
      const canonical = r.custom === true ? undefined : findWeddingBudgetItem(category, r.canonicalKey || sub);
      return { name: canonical?.label || name, amount, spend_type: st, canonical_key: canonical?.key || null };
    })
    .filter((it, index) => it.amount > 0 && rows[index]?.enabled !== false);
  const uniqueItems = deduplicateCanonicalBudgetItems(items);

  const del = await db.from("budget_items").delete().eq("event_id", ev.id).eq("country_code", country).eq("source", "budget_idea");
  if (del.error) return NextResponse.json({ error: "BUDGET_IDEA_APPLY_DELETE_FAILED", code: del.error.code || null }, { status: 500 });

  if (uniqueItems.length === 0) return NextResponse.json({ success: true, inserted: 0 });

  const payload = uniqueItems.map((it) => ({
    event_id: ev.id,
    country_code: country,
    name: it.name,
    amount: it.amount,
    spend_type: it.spend_type,
    source: "budget_idea",
    canonical_key: it.canonical_key,
  }));

  const { error: insErr, data } = await db.from("budget_items").insert(payload).select();
  if (insErr) return NextResponse.json({ error: "BUDGET_IDEA_APPLY_INSERT_FAILED", code: insErr.code || null }, { status: 500 });
  return NextResponse.json({ success: true, inserted: data?.length || 0 });
}
