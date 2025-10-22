import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

type Expense = {
  id?: string;
  category: string;
  subcategory: string;
  supplier: string;
  description: string;
  amount: number;
  spendType: "common" | "bride" | "groom";
  status: "pending" | "approved" | "rejected";
  date: string;
  notes: string;
  fromDashboard: boolean;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati
      return NextResponse.json({
        expenses: [
          {
            id: "demo-1",
            category: "Location & Catering",
            subcategory: "Catering / Banqueting",
            supplier: "Catering Gourmet",
            description: "Acconto catering",
            amount: 2000,
            spendType: "common",
            status: "approved",
            date: "2025-10-15",
            notes: "Pagato con bonifico",
            fromDashboard: true,
          },
          {
            id: "demo-2",
            category: "Foto & Video",
            subcategory: "Servizio fotografico",
            supplier: "Studio Foto Arte",
            description: "Saldo fotografo",
            amount: 1500,
            spendType: "common",
            status: "pending",
            date: "2025-10-20",
            notes: "Da pagare entro fine mese",
            fromDashboard: true,
          },
        ],
      });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (!ev?.id) {
      return NextResponse.json({ expenses: [] });
    }

    const eventId = ev.id;

    // Carica tutte le spese con join a categorie/sottocategorie
    const { data: expensesData, error } = await db
      .from("expenses")
      .select(`
        id,
        supplier,
        description,
        committed_amount,
        paid_amount,
        spend_type,
        status,
        expense_date,
        notes,
        from_dashboard,
        subcategory:subcategories!inner(
          name,
          category:categories!inner(name, event_id)
        )
      `)
      .eq("subcategory.category.event_id", eventId)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("EXPENSES GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const expenses: Expense[] = (expensesData || []).map((e: any) => ({
      id: e.id,
      category: e.subcategory?.category?.name || "",
      subcategory: e.subcategory?.name || "",
      supplier: e.supplier || "",
      description: e.description || "",
      amount: Number(e.paid_amount || e.committed_amount || 0),
      spendType: e.spend_type || "common",
      status: e.status || "pending",
      date: e.expense_date || new Date().toISOString().split("T")[0],
      notes: e.notes || "",
      fromDashboard: e.from_dashboard || false,
    }));

    return NextResponse.json({ expenses });
  } catch (e: any) {
    console.error("EXPENSES GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const body = await req.json();
    const expense = body as Expense;

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Prendi il primo evento dell'utente
    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (!ev?.id) {
      return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });
    }

    const eventId = ev.id;

    // Trova o crea categoria
    let { data: cat } = await db
      .from("categories")
      .select("id")
      .eq("event_id", eventId)
      .eq("name", expense.category)
      .single();

    if (!cat) {
      const { data: newCat } = await db
        .from("categories")
        .insert({ event_id: eventId, name: expense.category })
        .select("id")
        .single();
      cat = newCat;
    }

    if (!cat?.id) {
      return NextResponse.json({ error: "Impossibile creare categoria" }, { status: 500 });
    }

    const categoryId = cat.id;

    // Trova o crea sottocategoria
    let { data: sub } = await db
      .from("subcategories")
      .select("id")
      .eq("category_id", categoryId)
      .eq("name", expense.subcategory)
      .single();

    if (!sub) {
      const { data: newSub } = await db
        .from("subcategories")
        .insert({ category_id: categoryId, name: expense.subcategory })
        .select("id")
        .single();
      sub = newSub;
    }

    if (!sub?.id) {
      return NextResponse.json({ error: "Impossibile creare sottocategoria" }, { status: 500 });
    }

    const subcategoryId = sub.id;

    // Inserisci la spesa
    const { error: insertError } = await db.from("expenses").insert({
      subcategory_id: subcategoryId,
      supplier: expense.supplier,
      description: expense.description,
      committed_amount: expense.amount,
      paid_amount: expense.status === "approved" ? expense.amount : 0,
      spend_type: expense.spendType,
      status: expense.status,
      expense_date: expense.date,
      notes: expense.notes,
      from_dashboard: expense.fromDashboard,
    });

    if (insertError) {
      console.error("EXPENSES POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("EXPENSES POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
