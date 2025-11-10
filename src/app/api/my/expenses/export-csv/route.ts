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
      { categoria: "Sposa", voce: "Abito", importo: 1200, tipo: "comune" },
      { categoria: "Location", voce: "Catering", importo: 3500, tipo: "comune" }
    ];
    const parser = new Parser();
    const csv = parser.parse(demoRows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=spese.csv"
      }
    });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = userData.user.id;

  // Recupera le spese dell'utente
  const { data: expenses, error: err } = await db
    .from("expenses")
    .select("id, category, subcategory, amount, spend_type, notes")
    .eq("user_id", userId);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  // Prepara CSV
  const parser = new Parser();
  const csv = parser.parse(expenses || []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=spese.csv"
    }
  });
}
