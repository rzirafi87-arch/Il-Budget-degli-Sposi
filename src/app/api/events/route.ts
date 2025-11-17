export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) {
    // Demo fallback: elenco eventi statico
    return NextResponse.json({
      events: [
        { code: "wedding", name: "Matrimonio", description: "Evento di nozze" },
        { code: "birthday", name: "Compleanno", description: "Festa di compleanno" },
        { code: "baptism", name: "Battesimo", description: "Cerimonia di battesimo" },
        { code: "communion", name: "Comunione", description: "Cerimonia di comunione" },
        { code: "confirmation", name: "Cresima", description: "Cerimonia di cresima" },
        { code: "engagement-party", name: "Fidanzamento", description: "Festa di fidanzamento" },
        { code: "anniversary", name: "Anniversario", description: "Anniversario di matrimonio" },
        { code: "baby-shower", name: "Baby Shower", description: "Festa Baby Shower" },
        { code: "genderreveal", name: "Gender Reveal", description: "Festa Gender Reveal" },
        { code: "fifty", name: "Festa 50 anni", description: "Compleanno 50 anni" }
      ]
    });
  }
  const db = getServiceClient();
  const { error } = await db.auth.getUser(jwt);
  if (error) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { data, error: dbErr } = await db.from("event_types").select("code, name, description");
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ events: data });
}
