import { getEngagementTemplate } from "@/data/templates/engagement";
import { calculateDifference, splitBudgetByType } from "@/lib/budgetCalc";
import { calculateResidual } from "@/lib/budgetUtils";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export type ExpenseRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier?: string;
  amount?: number;
  spendType?: "common" | "bride" | "groom";
  notes?: string;
};

import { getBearer } from "@/lib/apiAuth";
export async function GET(req: NextRequest) {
  const jwt = getBearer(req);
  const country = new URL(req.url).searchParams.get("country") || "it";

  if (!jwt) {
    // Demo mode: return template-only data
    const tpl = getEngagementTemplate(country);
    const demoRows: ExpenseRow[] = [];
    for (const c of tpl) {
      for (const s of c.subs) {
        demoRows.push({ category: c.name, subcategory: s, spendType: "common" });
      }
    }
    return NextResponse.json({
      ok: true,
      demo: true,
      rows: demoRows,
      budgets: { total: 0 },
    });
  }

  const db = getServiceClient();
  const { data: userData, error: authErr } = await db.auth.getUser(jwt);
  if (authErr) return NextResponse.json({ ok: false, error: authErr.message }, { status: 401 });

  const userId = userData.user.id;

  // Find engagement event for user
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, type_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (evErr || !ev) {
    // No event yet – return demo template
    const tpl = getEngagementTemplate(country);
    const demoRows: ExpenseRow[] = [];
    for (const c of tpl) {
      for (const s of c.subs) demoRows.push({ category: c.name, subcategory: s, spendType: "common" });
    }
    return NextResponse.json({ ok: true, demo: true, rows: demoRows, budgets: { total: 0 } });
  }

  // Fetch categories/subcategories for engagement
  const { data: typeRow } = await db.from("event_types").select("id").eq("slug", "engagement").single();
  const { data: cats } = await db
    .from("categories")
    .select("id, name")
    .eq("type_id", typeRow?.id || null);

  const catNameToId = new Map<string, string>();
  (cats || []).forEach((c) => catNameToId.set(c.name, c.id));

  const { data: subs } = await db
    .from("subcategories")
    .select("id, name, category_id");

  // Pull existing expenses for this event
  const { data: expenses } = await db
    .from("expenses")
    .select("id, subcategory_id, amount, supplier, notes, spend_type")
    .eq("event_id", ev.id);

  const subIdToRow = new Map<string, ExpenseRow>();
  for (const sub of subs || []) {
    const catId = sub.category_id as string;
    const catName = (cats || []).find((c) => c.id === catId)?.name || "";
    if (!catName) continue;
    const row: ExpenseRow = { category: catName, subcategory: sub.name, spendType: "common" };
    subIdToRow.set(sub.id as string, row);
  }

  for (const e of expenses || []) {
    const row = subIdToRow.get(e.subcategory_id as string);
    if (row) {
      row.amount = e.amount || 0;
      row.supplier = e.supplier || undefined;
      row.notes = e.notes || undefined;
      row.spendType = (e.spend_type as "common" | "bride" | "groom") || "common";
    }
  }

  let rows = Array.from(subIdToRow.values());
  // Calcola residual e difference per ogni riga (qui manca paid, quindi residual = amount)
  rows = rows.map((row) => ({
    ...row,
    residual: calculateResidual(row.amount || 0, 0),
    difference: calculateDifference(row.amount || 0, 0),
  }));
  // Calcola split budget
  const split = splitBudgetByType(rows.map(r => ({ budget: r.amount || 0, spendType: r.spendType as "common"|"bride"|"groom" })));
  return NextResponse.json({ ok: true, rows, budgets: { total: split.total, bride: split.bride, groom: split.groom } });
}

export async function POST(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error: authErr } = await db.auth.getUser(jwt);
  if (authErr) return NextResponse.json({ ok: false, error: authErr.message }, { status: 401 });

  const userId = userData.user.id;
  const body = await req.json().catch(() => ({}));
  const rows = (body?.rows || []) as ExpenseRow[];
  const totalBudget = Number(body?.totalBudget || 0) || 0;
  const brideBudget = Number(body?.brideBudget || 0) || 0;
  const groomBudget = Number(body?.groomBudget || 0) || 0;
  const date = String(body?.ceremonyDate || body?.eventDate || "");

  // Get user engagement event
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (evErr || !ev) return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });

  // Update budgets on event
  await db
    .from("events")
    .update({
      total_budget: totalBudget,
      bride_initial_budget: brideBudget,
      groom_initial_budget: groomBudget,
      date,
    })
    .eq("id", ev.id);

  // Map category+sub to subcategory_id
  const { data: typeRow } = await db.from("event_types").select("id").eq("slug", "engagement").single();
  const { data: cats } = await db
    .from("categories")
    .select("id, name")
    .eq("type_id", typeRow?.id || null);
  const { data: subs } = await db
    .from("subcategories")
    .select("id, name, category_id");

  const subKeyToId = new Map<string, string>();
  for (const s of subs || []) {
    const catName = (cats || []).find((c) => c.id === s.category_id)?.name || "";
    if (!catName) continue;
    subKeyToId.set(`${catName}|||${s.name}`, s.id);
  }

  // Upsert expenses
  for (const r of rows) {
    const subId = subKeyToId.get(`${r.category}|||${r.subcategory}`);
    if (!subId) continue;
    await db
      .from("expenses")
      .upsert(
        {
          event_id: ev.id,
          subcategory_id: subId,
          amount: r.amount || 0,
          supplier: r.supplier || null,
          notes: r.notes || null,
          spend_type: r.spendType || "common",
        },
        { onConflict: "event_id,subcategory_id" }
      );
  }

  return NextResponse.json({ ok: true });
}
