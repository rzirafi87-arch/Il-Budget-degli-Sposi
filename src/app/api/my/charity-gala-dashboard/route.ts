export const runtime = "nodejs";

import { getCharityGalaTemplate } from "@/data/templates/charity-gala";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Dashboard Charity/Gala
 * GET: restituisce categorie e spese
 * POST: salva spese
 */

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo data per utenti non autenticati
  if (!jwt) {
    const template = getCharityGalaTemplate();
    const demoRows = template.map((cat) => ({
      category: cat.category,
      subcategories: cat.subcategories,
      expenses: [],
    }));
    return NextResponse.json({ categories: demoRows });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Trova evento charity-gala dell'utente
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "charity-gala")
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Charity/Gala event not found" }, { status: 404 });
  }

  // Carica categorie
  const { data: categories, error: catError } = await db
    .from("categories")
    .select("id, name")
    .eq("event_id", event.id)
    .order("display_order", { ascending: true });

  if (catError) {
    return NextResponse.json({ error: "Error loading categories" }, { status: 500 });
  }

  // Carica sottocategorie e spese per ogni categoria
  const result = [];
  for (const cat of categories) {
    const { data: subcats } = await db
      .from("subcategories")
      .select("id, name")
      .eq("category_id", cat.id)
      .order("display_order", { ascending: true });

    const { data: expenses } = await db
      .from("expenses")
      .select("*")
      .eq("event_id", event.id)
      .eq("category", cat.name);

    result.push({
      category: cat.name,
      subcategories: subcats?.map((s) => s.name) || [],
      expenses: expenses || [],
    });
  }

  return NextResponse.json({ categories: result });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Trova evento charity-gala
  const { data: event, error: eventError } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "charity-gala")
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Charity/Gala event not found" }, { status: 404 });
  }

  const body = await req.json();
  const { rows } = body;

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Elimina tutte le spese esistenti per questo evento
  await db.from("expenses").delete().eq("event_id", event.id);

  // Inserisci nuove spese
  const expensesToInsert = rows
    .filter((r: any) => r.amount > 0 || r.supplier || r.notes)
    .map((r: any) => ({
      event_id: event.id,
      category: r.category,
      subcategory: r.subcategory,
      supplier: r.supplier || "",
      amount: r.amount || 0,
      spend_type: "common", // Charity/Gala usa solo budget comune
      notes: r.notes || "",
    }));

  if (expensesToInsert.length > 0) {
    const { error: insertError } = await db
      .from("expenses")
      .insert(expensesToInsert);

    if (insertError) {
      return NextResponse.json(
        { error: "Error saving expenses" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
