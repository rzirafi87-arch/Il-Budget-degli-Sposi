export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// Minimal API for the retirement (pensione) event.
// GET: returns demo-generated rows when unauthenticated; when JWT provided, validates user and returns merged expenses for the user's retirement event (if any).
// POST: upserts a simple event-level budget or expenses payload (basic implementation).

type Row = {
  id?: string;
  category: string;
  subcategory: string;
  supplier?: string | null;
  amount?: number | null;
  spend_type?: "common" | "bride" | "groom" | "retirement" | null;
  notes?: string | null;
};

type EventRow = { id: string; name?: string; total_budget?: number; owner?: string };
type ExpenseRow = { id?: string; category: string; subcategory: string; supplier?: string | null; amount?: number | null; spend_type?: string | null; notes?: string | null };

function generateDemoRows(): Row[] {
  // Keep this small — the UI page just needs a few example rows and totals.
  return [
    { category: "Location", subcategory: "Affitto sala", amount: 1200, spend_type: "common" },
    { category: "Catering", subcategory: "Buffet pranzo", amount: 35, spend_type: "common" },
    { category: "Programma", subcategory: "Intrattenimento", amount: 400, spend_type: "common" },
    { category: "Ricordi", subcategory: "Foto e stampa", amount: 250, spend_type: "common" },
  ];
}

type SupaResponse<T> = { data: T | null; error: unknown };

async function findUserRetirementEvent(db: ReturnType<typeof getServiceClient>, userId: string): Promise<SupaResponse<EventRow>> {
  const res = await db.from("events").select("id, name, total_budget, owner").eq("owner", userId).eq("event_type", "retirement").limit(1).maybeSingle();
  return res as unknown as SupaResponse<EventRow>;
}

async function loadExpensesForEvent(db: ReturnType<typeof getServiceClient>, eventId: string): Promise<SupaResponse<ExpenseRow[]>> {
  const res = await db.from("expenses").select("id, category, subcategory, supplier, amount, spend_type, notes").eq("event_id", eventId);
  return res as unknown as SupaResponse<ExpenseRow[]>;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // If no JWT, return demo rows
  if (!jwt) {
    const rows = generateDemoRows();
    return NextResponse.json({ demo: true, rows });
  }

  const db = getServiceClient();
  const { data: userData, error: userErr } = await db.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;
  const eventRes = await findUserRetirementEvent(db, userId);
  if (eventRes.error) {
    return NextResponse.json({ error: "DB error finding event" }, { status: 500 });
  }

  const event = eventRes.data;
  if (!event) {
    // No real event yet; return demo but mark demo=false so client can show CTA to create event
    const rows = generateDemoRows();
    return NextResponse.json({ demo: false, hasEvent: false, rows });
  }

  const expensesRes = await loadExpensesForEvent(db, event.id);
  if (expensesRes.error) {
    return NextResponse.json({ error: "DB error loading expenses" }, { status: 500 });
  }

  const expenses = expensesRes.data ?? [];
  return NextResponse.json({ demo: false, hasEvent: true, event, rows: expenses });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  const db = getServiceClient();
  const { data: userData, error: userErr } = await db.auth.getUser(jwt);
  if (userErr || !userData?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = userData.user.id;
  // Find or create a retirement event for the user (very small helper behaviour)
  const eventCheckRes = await db.from("events").select("id").eq("owner", userId).eq("event_type", "retirement").limit(1).maybeSingle() as unknown as { data?: { id?: string } | null; error?: unknown };
  if (eventCheckRes.error) return NextResponse.json({ error: "DB error" }, { status: 500 });

  let eventId = eventCheckRes.data?.id as string | undefined;
  if (!eventId) {
    const insertRes = await db.from("events").insert([{ name: "Festa di Pensionamento", owner: userId, event_type: "retirement", total_budget: body?.total_budget || 0 }]).select("id").maybeSingle() as unknown as { data?: { id?: string } | null; error?: unknown };
    if (insertRes.error) return NextResponse.json({ error: "DB error creating event" }, { status: 500 });
    if (!insertRes.data?.id) return NextResponse.json({ error: "DB error creating event (no id)" }, { status: 500 });
    eventId = insertRes.data.id;
  }

  // If the payload contains expenses array, upsert them (simple approach: insert new rows)
  if (Array.isArray(body.expenses) && body.expenses.length > 0) {
    const toInsert = body.expenses.map((r: Partial<ExpenseRow>) => ({ event_id: eventId, category: r.category, subcategory: r.subcategory, supplier: r.supplier ?? null, amount: r.amount ?? 0, spend_type: r.spend_type ?? 'common', notes: r.notes ?? null }));
    const insertExp = await db.from("expenses").insert(toInsert) as unknown as { data?: unknown; error?: unknown };
    if (insertExp.error) return NextResponse.json({ error: "DB error inserting expenses" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
