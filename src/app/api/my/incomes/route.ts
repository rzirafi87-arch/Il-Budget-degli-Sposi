import { getBearer, requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type Income = {
  id?: string;
  name: string;
  type: "busta" | "bonifico" | "regalo";
  amount: number;
  notes: string;
  date: string;
};

export async function GET(req: NextRequest) {
  try {
    const jwt = getBearer(req);

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
    const { userId } = await requireUser(req);

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
      logger.error("INCOMES GET error", { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type IncomeRow = { id: string; name: string; type: "busta" | "bonifico" | "regalo"; amount: number; notes: string; date: string };
    const formattedIncomes: Income[] = (incomes || []).map((i: IncomeRow) => ({
      id: i.id,
      name: i.name,
      type: i.type,
      amount: Number(i.amount || 0),
      notes: i.notes || "",
      date: i.date,
    }));

    return NextResponse.json({ incomes: formattedIncomes });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("INCOMES GET uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);

    const body = await req.json();
    const income = body as Income;

    const db = getServiceClient();

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
    const { data: created, error: insertError } = await db.from("incomes").insert({
      event_id: eventId,
      name: income.name,
      type: income.type,
      amount: income.type === "regalo" ? 0 : income.amount,
      notes: income.notes,
      date: income.date,
    }).select().single();

    if (insertError) {
      logger.error("INCOMES POST error", { error: insertError });
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ income: created });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("INCOMES POST uncaught", { message: err.message });
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}
