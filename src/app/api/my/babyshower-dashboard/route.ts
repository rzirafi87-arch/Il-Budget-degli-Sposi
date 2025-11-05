export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// Baby Shower: evento single-budget
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo: dati placeholder se non autenticato
  if (!jwt) {
    return NextResponse.json({
      eventType: "babyshower",
      isSingleBudgetEvent: true,
      categories: [],
      expenses: [],
      incomes: [],
      timeline: [],
      totalBudget: 1800,
      colorTheme: ["#F8E8D8", "#A3B59D", "#E7B7D3"],
    });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = userData.user.id;

  // Trova evento Baby Shower
  const { data: event } = await db
    .from("events")
    .select("id, total_budget, color_theme")
    .eq("event_type", "babyshower")
    .eq("user_id", userId)
    .single();
  if (!event) {
    return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
  }

  // Categorie
  const { data: categories } = await db
    .from("categories")
    .select("id, name, icon, display_order")
    .eq("event_id", event.id)
    .order("display_order", { ascending: true });

  // Sottocategorie
  const { data: subcategories } = await db
    .from("subcategories")
    .select("id, category_id, name, estimated_cost, display_order, description")
    .in("category_id", (categories || []).map((c: any) => c.id));

  // Spese
  const { data: expenses } = await db
    .from("expenses")
    .select("id, subcategory_id, amount, supplier, notes, spend_type")
    .in("subcategory_id", (subcategories || []).map((s: any) => s.id));

  // Entrate
  const { data: incomes } = await db
    .from("incomes")
    .select("id, event_id, amount, source, notes")
    .eq("event_id", event.id);

  // Timeline
  const { data: timeline } = await db
    .from("timeline_items")
    .select("id, phase, title, description, days_before, category, completed, display_order")
    .eq("event_id", event.id)
    .order("display_order", { ascending: true });

  return NextResponse.json({
    eventType: "babyshower",
    isSingleBudgetEvent: true,
    categories,
    subcategories,
    expenses,
    incomes,
    timeline,
    totalBudget: event.total_budget,
    colorTheme: event.color_theme,
  });
}

export async function POST(req: NextRequest) {
  // Logica di salvataggio spese/entrate (single-budget)
  // ...implementazione standard come altri eventi single-budget...
  return NextResponse.json({ ok: true });
}
