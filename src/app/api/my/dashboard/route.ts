import {
    EVENT_BUDGET_CATEGORIES,
    WEDDING_BUDGET_CATEGORIES,
} from "@/constants/budgetCategories";
import type { EventType } from "@/constants/eventConfigs";
import { calculateDifference, splitBudgetByType } from "@/lib/budgetCalc";
import { calculateResidual } from "@/lib/budgetUtils";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SpendRow = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  amount: number;
  spendType: string;
  notes: string;
  paid?: number;
  paymentMethod?: string;
  paymentDate?: string;
  paymentStatus?: string;
  paymentNotes?: string;
};

const DEFAULT_EVENT_TYPE: EventType = "wedding";

function getCategoriesForEvent(eventType?: string | null) {
  if (eventType && eventType in EVENT_BUDGET_CATEGORIES) {
    return EVENT_BUDGET_CATEGORIES[eventType as EventType];
  }
  return WEDDING_BUDGET_CATEGORIES;
}

function generateAllRows(
  categories: Record<string, string[]>,
  withDemoIds = false,
): SpendRow[] {
  const rows: SpendRow[] = [];
  let counter = 1;
  Object.entries(categories).forEach(([category, subs]) => {
    subs.forEach((subcategory) => {
      rows.push({
        id: withDemoIds ? `demo-${counter++}` : undefined,
        category,
        subcategory,
        supplier: "",
        amount: 0,
        spendType: "common",
        notes: "",
      });
    });
  });
  return rows;
}

function mergeExpenses(
  baseRows: SpendRow[],
  expenses: unknown[] | null,
): SpendRow[] {
  const rowsByKey = new Map(
    baseRows.map((row) => [
      `${row.category}|||${row.subcategory}`,
      { ...row },
    ]),
  );

  if (expenses) {
    for (const entry of expenses) {
      const expense = entry as {
        id: string;
        supplier: string | null;
        committed_amount: number | null;
        spend_type: string | null;
        notes: string | null;
        payment_method?: string | null;
        payment_date?: string | null;
        payment_status?: string | null;
        payment_notes?: string | null;
        subcategory: {
          name: string;
          category: { name: string; event_id: string };
        };
      };

      const categoryName = expense.subcategory?.category?.name || "";
      const subcategoryName = expense.subcategory?.name || "";
      if (!categoryName || !subcategoryName) continue;

      const key = `${categoryName}|||${subcategoryName}`;
  const updated: SpendRow = {
        id: expense.id,
        category: categoryName,
        subcategory: subcategoryName,
        supplier: expense.supplier || "",
        amount: expense.committed_amount || 0,
        spendType: expense.spend_type && expense.spend_type.length > 0
          ? expense.spend_type
          : "common",
        notes: expense.notes || "",
        paymentMethod: expense.payment_method || undefined,
        paymentDate: expense.payment_date || undefined,
        paymentStatus: expense.payment_status || undefined,
        paymentNotes: expense.payment_notes || undefined,
  paid: typeof (expense as any).paid_amount === 'number' ? (expense as any).paid_amount : 0,
      };

      if (rowsByKey.has(key)) {
        rowsByKey.set(key, { ...rowsByKey.get(key)!, ...updated });
      } else {
        rowsByKey.set(key, updated);
      }
    }
  }

  return Array.from(rowsByKey.values());
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      const categories = getCategoriesForEvent(DEFAULT_EVENT_TYPE);
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(categories, true),
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
      .select(
        "id, event_type, total_budget, bride_initial_budget, groom_initial_budget, wedding_date",
      )
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (e1 || !ev?.id) {
      const categories = getCategoriesForEvent(DEFAULT_EVENT_TYPE);
      return NextResponse.json({
        totalBudget: 0,
        rows: generateAllRows(categories, true),
      });
    }

    const eventId = ev.id;
    const eventType = (ev.event_type as string | null) ?? DEFAULT_EVENT_TYPE;
  const weddingDate = ev.wedding_date || "";

    const categoriesMap = getCategoriesForEvent(eventType);
    const baseRows = generateAllRows(categoriesMap);

    // Carica tutte le spese con categoria e sottocategoria
    const { data: expenses, error: e2 } = await db
      .from("expenses")
      .select(`
        id,
        supplier,
        committed_amount,
        spend_type,
        notes,
        payment_method,
        payment_date,
        payment_status,
        payment_notes,
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

    let rows = mergeExpenses(baseRows, expenses || null);
    // Calcola residual e difference per ogni riga
    rows = rows.map((row) => ({
      ...row,
      residual: calculateResidual(row.amount, row.paid ?? 0),
      difference: calculateDifference(row.amount, row.paid ?? 0),
    }));
    // Calcola split budget
    const split = splitBudgetByType(rows.map(r => ({ budget: r.amount, spendType: r.spendType as "common"|"bride"|"groom" })));
    return NextResponse.json({
      totalBudget: split.total,
      brideBudget: split.bride,
      groomBudget: split.groom,
      weddingDate,
      rows,
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
    const { totalBudget, brideBudget, groomBudget, weddingDate, rows } = body as {
      totalBudget: number;
      brideBudget?: number;
      groomBudget?: number;
      weddingDate?: string;
      rows: SpendRow[];
    };

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
            payment_method: row.paymentMethod || null,
            payment_date: row.paymentDate || null,
            payment_status: row.paymentStatus || null,
            payment_notes: row.paymentNotes || null,
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
          payment_method: row.paymentMethod || null,
          payment_date: row.paymentDate || null,
          payment_status: row.paymentStatus || null,
          payment_notes: row.paymentNotes || null,
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
