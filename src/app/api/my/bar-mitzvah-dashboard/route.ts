export const runtime = "nodejs";
import { getBarMitzvahTemplate } from "@/data/templates/bar-mitzvah";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export type ExpenseRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier?: string;
  amount?: number;
  spendType?: "common";
  notes?: string;
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  const country = new URL(req.url).searchParams.get("country") || "it";

  if (!jwt) {
    // Demo mode: return template-only data
    const tpl = getBarMitzvahTemplate(country);
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

  // Find bar-mitzvah event for user
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, type_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (evErr || !ev) {
    // No event yet – return demo template
    const tpl = getBarMitzvahTemplate(country);
    const demoRows: ExpenseRow[] = [];
    for (const c of tpl) {
      for (const s of c.subs) demoRows.push({ category: c.name, subcategory: s, spendType: "common" });
    }
    return NextResponse.json({ ok: true, demo: true, rows: demoRows, budgets: { total: 0 } });
  }

  // Fetch categories/subcategories for bar-mitzvah
  const { data: typeRow } = await db.from("event_types").select("id").eq("slug", "bar-mitzvah").single();
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
      row.spendType = "common"; // Bar Mitzvah is family event (single-budget)
    }
  }

  const allRows = Array.from(subIdToRow.values());
  const totalSpent = allRows.reduce((sum, r) => sum + (r.amount || 0), 0);

  return NextResponse.json({
    ok: true,
    rows: allRows,
    budgets: { total: totalSpent },
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error: authErr } = await db.auth.getUser(jwt);
  if (authErr) return NextResponse.json({ ok: false, error: authErr.message }, { status: 401 });

  const userId = userData.user.id;
  const body = await req.json();
  const { rows } = body as { rows: ExpenseRow[] };

  // Find user's bar-mitzvah event
  const { data: ev } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!ev) {
    return NextResponse.json({ ok: false, error: "No event found" }, { status: 404 });
  }

  const { data: typeRow } = await db.from("event_types").select("id").eq("slug", "bar-mitzvah").single();
  const typeId = typeRow?.id;

  // Upsert categories & subcategories, then expenses
  for (const row of rows) {
    const { data: catRow } = await db
      .from("categories")
      .upsert({ type_id: typeId, name: row.category }, { onConflict: "type_id,name" })
      .select("id")
      .single();

    if (!catRow) continue;

    const { data: subRow } = await db
      .from("subcategories")
      .upsert(
        { category_id: catRow.id, name: row.subcategory },
        { onConflict: "category_id,name" }
      )
      .select("id")
      .single();

    if (!subRow) continue;

    await db.from("expenses").upsert(
      {
        event_id: ev.id,
        subcategory_id: subRow.id,
        amount: row.amount || 0,
        supplier: row.supplier || null,
        notes: row.notes || null,
        spend_type: "common", // Force common for bar-mitzvah (family event)
      },
      { onConflict: "event_id,subcategory_id" }
    );
  }

  return NextResponse.json({ ok: true, message: "Bar Mitzvah data saved" });
}
