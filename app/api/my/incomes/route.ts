import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type Income = {
  id?: string;
  name: string;
  type: "busta" | "bonifico" | "regalo";
  amount: number;
  notes: string;
  date: string;
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati
      return NextResponse.json({
        incomes: [
          {
            id: "demo-1",
            name: "Famiglia Rossi",
            type: "busta",
            amount: 200,
            notes: "",
            date: "2025-10-15",
          },
          {
            id: "demo-2",
            name: "Marco e Laura",
            type: "bonifico",
            amount: 300,
            notes: "Contributo viaggio di nozze",
            date: "2025-10-18",
          },
          {
            id: "demo-3",
            name: "Zia Maria",
            type: "regalo",
            amount: 0,
            notes: "Servizio piatti completo per 12 persone",
            date: "2025-10-20",
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
      return NextResponse.json({ incomes: [] });
    }

    const eventId = ev.id;

    // Carica tutte le entrate
    const { data: incomes, error } = await db
      .from("incomes")
      .select("*")
      .eq("event_id", eventId)
      .order("date", { ascending: false });

    if (error) {
      console.error("INCOMES GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedIncomes: Income[] = (incomes || []).map((i: any) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      amount: Number(i.amount || 0),
      notes: i.notes || "",
      date: i.date,
    }));

    return NextResponse.json({ incomes: formattedIncomes });
  } catch (e: any) {
    console.error("INCOMES GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const body = await req.json();
    const income = body as Income;

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

    // Inserisci l'entrata
    const { error: insertError } = await db.from("incomes").insert({
      event_id: eventId,
      name: income.name,
      type: income.type,
      amount: income.type === "regalo" ? 0 : income.amount,
      notes: income.notes,
      date: income.date,
    });

    if (insertError) {
      console.error("INCOMES POST error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("INCOMES POST uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
