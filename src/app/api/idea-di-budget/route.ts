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
      is_enabled,
      canonical_key,
      subcategory:subcategories!inner(
        name,
        is_custom,
        category:categories!inner(name, event_id)
      )
    `)
    .eq("event_id", eventId)
    .eq("status", "planned")
    .eq("from_dashboard", true)
    .eq("taxonomy_status", "active")
    .order("inserted_at", { ascending: true });

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  const data = (rows || []).map((e: unknown) => {
    const expense = e as {
      id: string;
      supplier: string | null;
      notes: string | null;
      is_enabled: boolean | null;
      committed_amount: number | null;
      spend_type: string | null;
      subcategory: { name: string; is_custom: boolean | null; category: { name: string } };
    };
    return {
      id: expense.id,
      category: expense.subcategory?.category?.name || "",
      subcategory: expense.subcategory?.name || "",
      spendType: expense.spend_type || "common",
      idea_amount: Number(expense.committed_amount || 0),
      supplier: expense.supplier || "",
      notes: expense.notes || "",
      enabled: expense.is_enabled !== false,
      custom: expense.subcategory?.is_custom === true,
      canonicalKey: (expense as { canonical_key?: string | null }).canonical_key || undefined,
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
    enabled?: boolean;
    custom?: boolean;
    canonicalKey?: string;
  }> = Array.isArray(body) ? body : Array.isArray(body?.rows) ? body.rows : [];

  const eventId = (await requireServerCurrentEvent(userData.user.id)).eventId;

  const { data, error: snapshotError } = await db.rpc("save_budget_idea_snapshot", {
    p_event_id: eventId,
    p_user_id: userData.user.id,
    p_rows: inputRows,
  });
  if (snapshotError) {
    console.error("IDEA_BUDGET snapshot failed", {
      code: snapshotError.code,
      message: snapshotError.message,
      eventId,
    });
    return NextResponse.json(
      { error: "Salvataggio non riuscito: nessun dato è stato modificato" },
      { status: 500 },
    );
  }

  return NextResponse.json(data || { success: true, inserted: 0 });
}
