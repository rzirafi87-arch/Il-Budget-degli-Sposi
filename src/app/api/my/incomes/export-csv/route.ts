export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { Parser } from "json2csv";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo: dati fittizi se non autenticato
  if (!jwt) {
    const demoRows = [
      { fonte: "Regalo parenti", importo: 5000, note: "Zii" },
      { fonte: "Risparmi personali", importo: 2000, note: "" }
    ];
    const parser = new Parser();
    const csv = parser.parse(demoRows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=entrate.csv"
      }
    });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = userData.user.id;

  // Recupera le entrate dell'utente
  const { data: incomes, error: err } = await db
    .from("incomes")
    .select("id, source, amount, notes")
    .eq("user_id", userId);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  // Prepara CSV
  const parser = new Parser();
  const csv = parser.parse(incomes || []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=entrate.csv"
    }
  });
}
