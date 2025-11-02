export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// GET: restituisce le idee di budget salvate (come spese "planned" da Idea di Budget)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    // Demo: righe vuote per UI
    return NextResponse.json({ data: [] });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Recupera l'evento dell'utente
  const { data: eventData, error: evErr } = await db
    .from("events")
    .select("id")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .single();
  if (evErr || !eventData) return NextResponse.json({ error: "No event found" }, { status: 404 });

  // Recupera spese "planned" salvate dall'Idea di Budget (flag from_dashboard)
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
    .eq("subcategory.category.event_id", eventData.id)
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
      subcategory: {
        name: string;
        category: { name: string };
      };
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

// POST: salva/aggiorna idee di budget come spese "planned" (from_dashboard=true)
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

  // Recupera l'evento dell'utente
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .single();
  if (evErr || !ev?.id) return NextResponse.json({ error: "No event found" }, { status: 404 });
  const eventId = ev.id as string;

  // Elimina le spese "planned" create dall'Idea per questo evento
  const { error: delErr } = await db
    .from("expenses")
    .delete()
    .eq("status", "planned")
    .eq("from_dashboard", true)
    .in(
      "subcategory_id",
      (
        await db
          .from("subcategories")
          .select("id, category:categories!inner(event_id)")
          .eq("category.event_id", eventId)
      ).data?.map((r: { id: string }) => r.id) || []
    );
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  // Prepara mapping categorie/sottocategorie e inserimenti
  const toInsert: Array<{
    subcategory_id: string;
    supplier: string | null;
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
    const spendType = (r.spendType || "common") as string;
    if (!categoryName || !subcategoryName) continue;

    // Trova o crea categoria
    let { data: cat } = await db
      .from("categories")
      .select("id")
      .eq("event_id", eventId)
      .eq("name", categoryName)
      .single();
    if (!cat) {
      const { data: newCat } = await db
        .from("categories")
        .insert({ event_id: eventId, name: categoryName })
        .select("id")
        .single();
      cat = newCat;
    }
    if (!cat?.id) continue;

    // Trova o crea sottocategoria
    let { data: sub } = await db
      .from("subcategories")
      .select("id")
      .eq("category_id", cat.id)
      .eq("name", subcategoryName)
      .single();
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
      subcategory_id: sub.id,
      supplier: r.supplier || null,
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
