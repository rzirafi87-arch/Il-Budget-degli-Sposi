export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) return NextResponse.json({ data: [] });

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const eventId = (await requireServerCurrentEvent(userData.user.id)).eventId;
  const { data: rows, error: qErr } = await db
    .from("expenses")
    .select(`
      id,
      supplier,
      notes,
      committed_amount,
      spend_type,
      status,
      from_dashboard,
      subcategory:subcategories!inner(
        name,
        category:categories!inner(name, event_id)
      )
    `)
    .eq("event_id", eventId)
    .eq("status", "planned")
    .eq("from_dashboard", true)
    .order("inserted_at", { ascending: true });

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  const data = (rows || []).map((e: unknown) => {
    const expense = e as {
      id: string;
      supplier: string | null;
      notes: string | null;
      committed_amount: number | null;
      spend_type: string | null;
      subcategory: { name: string; category: { name: string } };
    };
    return {
      id: expense.id,
      category: expense.subcategory?.category?.name || "",
      subcategory: expense.subcategory?.name || "",
      spendType: expense.spend_type || "common",
      idea_amount: Number(expense.committed_amount || 0),
      supplier: expense.supplier || "",
      notes: expense.notes || "",
    };
  });

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const inputRows: Array<{
    category?: string;
    subcategory?: string;
    idea_amount?: number;
    amount?: number;
    spendType?: string;
    supplier?: string;
    notes?: string;
  }> = Array.isArray(body) ? body : Array.isArray(body?.rows) ? body.rows : [];

  const eventId = (await requireServerCurrentEvent(userData.user.id)).eventId;

  const { error: delErr } = await db
    .from("expenses")
    .delete()
    .eq("event_id", eventId)
    .eq("status", "planned")
    .eq("from_dashboard", true);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  const toInsert: Array<{
    event_id: string;
    category: string;
    subcategory: string;
    subcategory_id: string;
    supplier: string | null;
    amount: number;
    committed_amount: number;
    paid_amount: number;
    spend_type: string;
    notes: string | null;
    status: string;
    from_dashboard: boolean;
  }> = [];

  for (const r of inputRows) {
    const categoryName = (r.category || "").trim();
    const subcategoryName = (r.subcategory || "").trim();
    const amount = Number(r.idea_amount ?? r.amount ?? 0) || 0;
    const spendType = r.spendType || "common";
    if (!categoryName || !subcategoryName) continue;

    let { data: cat } = await db
      .from("categories")
      .select("id")
      .eq("event_id", eventId)
      .eq("name", categoryName)
      .maybeSingle();
    if (!cat) {
      const { data: newCat } = await db
        .from("categories")
        .insert({ event_id: eventId, name: categoryName })
        .select("id")
        .single();
      cat = newCat;
    }
    if (!cat?.id) continue;

    let { data: sub } = await db
      .from("subcategories")
      .select("id")
      .eq("category_id", cat.id)
      .eq("name", subcategoryName)
      .maybeSingle();
    if (!sub) {
      const { data: newSub } = await db
        .from("subcategories")
        .insert({ category_id: cat.id, name: subcategoryName })
        .select("id")
        .single();
      sub = newSub;
    }
    if (!sub?.id) continue;

    toInsert.push({
      event_id: eventId,
      category: categoryName,
      subcategory: subcategoryName,
      subcategory_id: sub.id,
      supplier: r.supplier || null,
      amount,
      committed_amount: amount,
      paid_amount: 0,
      spend_type: spendType,
      notes: r.notes || null,
      status: "planned",
      from_dashboard: true,
    });
  }

  if (toInsert.length > 0) {
    const { error: insErr } = await db.from("expenses").insert(toInsert);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: toInsert.length });
}
