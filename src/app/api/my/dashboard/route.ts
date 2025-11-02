import { BUDGET_CATEGORIES } from "@/constants/budgetCategories";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

/**
 * GET: Carica i dati della dashboard (budget totale + spese)
 * POST: Salva i dati della dashboard
 */

type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: "common" | "bride" | "groom" | "gift";
  notes: string;
};

// Stesse categorie della dashboard, centralizzate nelle costanti condivise
const CATEGORIES_MAP: Record<string, string[]> = BUDGET_CATEGORIES;

const ALL_CATEGORIES = Object.keys(CATEGORIES_MAP);

// Genera tutte le righe base
const generateAllRows = (): SpendRow[] => {
  const allRows: SpendRow[] = [];
  let idCounter = 1;
  
  ALL_CATEGORIES.forEach((category) => {
    const subcategories = CATEGORIES_MAP[category] || [];
    subcategories.forEach((subcategory) => {
      allRows.push({
        id: `demo-${idCounter++}`,
        category,
        subcategory,
        supplier: "",
        amount: 0,
        spendType: "common",
        notes: "",
      });
    });
  });
  
  return allRows;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati - TUTTE le righe
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(),
      });
    }

    const db = getServiceClient();

    // Verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id, total_budget, bride_initial_budget, groom_initial_budget, wedding_date")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(), // Prima volta: genera tutte le righe vuote
      });
    }

  const eventId = ev.id;
  const totalBudget = ev.total_budget || 0;
  const brideBudget = ev.bride_initial_budget || 0;
  const groomBudget = ev.groom_initial_budget || 0;
  const weddingDate = ev.wedding_date || "";

    // Carica tutte le spese con categoria e sottocategoria
    const { data: expenses, error: e2 } = await db
      .from("expenses")
      .select(`
        id,
        supplier,
        committed_amount,
        spend_type,
        notes,
        subcategory:subcategories!inner(
          name,
          category:categories!inner(name, event_id)
        )
      `)
      .eq("subcategory.category.event_id", eventId)
      .order("inserted_at", { ascending: true });

    if (e2) {
      console.error("DASHBOARD GET error:", e2);
      return NextResponse.json({ error: e2.message }, { status: 500 });
    }

    const rows: SpendRow[] = (expenses || []).map((e: unknown) => {
      const expense = e as {
        id: string;
        supplier: string | null;
        committed_amount: number | null;
        spend_type: string | null;
        notes: string | null;
        subcategory: {
          name: string;
          category: { name: string; event_id: string };
        };
      };
      return {
        id: expense.id,
        category: expense.subcategory?.category?.name || "",
        subcategory: expense.subcategory?.name || "",
        supplier: expense.supplier || "",
        amount: Number(expense.committed_amount || 0),
        spendType: (expense.spend_type || "common") as SpendRow["spendType"],
        notes: expense.notes || "",
      };
    });

    // Merge con tutte le categorie disponibili
    const allRows = generateAllRows();
    const mergedRows: SpendRow[] = [];
    
    allRows.forEach((emptyRow) => {
      const existing = rows.find(
        (r) => r.category === emptyRow.category && r.subcategory === emptyRow.subcategory
      );
      if (existing) {
        mergedRows.push(existing);
      } else {
        mergedRows.push(emptyRow);
      }
    });

    return NextResponse.json({
      totalBudget,
      brideBudget,
      groomBudget,
      weddingDate,
      rows: mergedRows,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("DASHBOARD GET uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta per salvare" }, { status: 401 });
    }

  const body = await req.json();
  const { totalBudget, brideBudget, groomBudget, weddingDate, rows } = body as { totalBudget: number; brideBudget?: number; groomBudget?: number; weddingDate?: string; rows: SpendRow[] };

    const db = getServiceClient();

    // Verifica token
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev, error: e1 } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });
    }

    const eventId = ev.id;

    // 1. Aggiorna il budget totale e la data matrimonio nell'evento
    await db
      .from("events")
      .update({
        total_budget: totalBudget,
        bride_initial_budget: brideBudget ?? null,
        groom_initial_budget: groomBudget ?? null,
        wedding_date: weddingDate ?? null,
      })
      .eq("id", eventId);

    // 2. Per ogni riga, crea/aggiorna categoria, sottocategoria e spesa
    for (const row of rows) {
      if (!row.category || !row.subcategory) continue;

      // Trova o crea categoria
      let { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("event_id", eventId)
        .eq("name", row.category)
        .single();

      if (!cat) {
        const { data: newCat } = await db
          .from("categories")
          .insert({ event_id: eventId, name: row.category })
          .select("id")
          .single();
        cat = newCat;
      }

      if (!cat?.id) continue;
      const categoryId = cat.id;

      // Trova o crea sottocategoria
      let { data: sub } = await db
        .from("subcategories")
        .select("id")
        .eq("category_id", categoryId)
        .eq("name", row.subcategory)
        .single();

      if (!sub) {
        const { data: newSub } = await db
          .from("subcategories")
          .insert({ category_id: categoryId, name: row.subcategory })
          .select("id")
          .single();
        sub = newSub;
      }

      if (!sub?.id) continue;
      const subcategoryId = sub.id;

      // Se la riga ha un ID, aggiorna, altrimenti inserisci
      if (row.id && !row.id.startsWith("demo-")) {
        await db
          .from("expenses")
          .update({
            supplier: row.supplier,
            committed_amount: row.amount,
            spend_type: row.spendType,
            notes: row.notes,
            status: "planned",
          })
          .eq("id", row.id);
      } else {
        await db.from("expenses").insert({
          subcategory_id: subcategoryId,
          supplier: row.supplier,
          committed_amount: row.amount,
          spend_type: row.spendType,
          notes: row.notes,
          status: "planned",
          paid_amount: 0,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("DASHBOARD POST uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}
