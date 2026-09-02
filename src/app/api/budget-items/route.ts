import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";

export const runtime = "nodejs";

// GET: Restituisce tutti i budget_items per una country e/o tradition
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") || "mx";
  const traditionId = req.nextUrl.searchParams.get("tradition_id");
  const db = getServiceClient();

  // Se presente JWT, restituiamo le voci per l'evento dell'utente
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (jwt) {
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const ev = { id: (await requireServerCurrentEvent(userData.user.id)).eventId };

    let userQuery = db
      .from("budget_items")
      .select("*")
      .eq("country_code", country)
      .eq("event_id", ev.id);
    if (traditionId) userQuery = userQuery.eq("tradition_id", traditionId);
    const { data, error } = await userQuery;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data });
  }

  // Senza JWT: restituiamo solo template pubblici (event_id IS NULL)
  let publicQuery = db
    .from("budget_items")
    .select("*")
    .eq("country_code", country)
    .is("event_id", null);
  if (traditionId) publicQuery = publicQuery.eq("tradition_id", traditionId);
  const { data, error } = await publicQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

// POST: Aggiunge un nuovo budget_item
export async function POST(req: NextRequest) {
  const db = getServiceClient();
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await req.json();

  const ev = { id: (await requireServerCurrentEvent(userData.user.id)).eventId };

  // Inserisci forzando l'event_id all'evento dell'utente
  const insert = Array.isArray(body) ? body : [body];
  const payload = insert.map((row) => ({
    ...row,
    event_id: ev.id,
  }));

  const { data, error } = await db.from("budget_items").insert(payload).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data[0] });
}
