import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const db = getServiceClient();

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ event: null }, { status: 200 });
  }

  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user?.id) {
    return NextResponse.json({ event: null }, { status: 200 });
  }

  // Trova il primo evento creato dall'utente (logica coerente con altre API del repo)
  const { data: ev, error: evErr } = await db
    .from("events")
    .select("id, name, currency, total_budget, inserted_at")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (evErr || !ev) {
    return NextResponse.json({ event: null }, { status: 200 });
  }

  // Prova ad arricchire con dati carta nozze (data e nomi)
  const { data: card } = await db
    .from("wedding_cards")
    .select("bride_name, groom_name, wedding_date")
    .eq("event_id", ev.id)
    .maybeSingle();

  // Calcola spese totali dall'evento
  const { data: expenses } = await db
    .from("expenses")
    .select("amount")
    .eq("event_id", ev.id);

  const totalSpent = (expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Conta categorie di interesse per task tracking
  const { count: supplierCount } = await db
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("event_id", ev.id)
    .not("supplier", "is", null);

  const { count: guestCount } = await db
    .from("wedding_guests")
    .select("*", { count: "exact", head: true })
    .eq("event_id", ev.id);

  const couple_name = card?.bride_name && card?.groom_name
    ? `${card.bride_name} & ${card.groom_name}`
    : ev.name || undefined;

  return NextResponse.json({
    event: {
      id: ev.id,
      total_budget: ev.total_budget ?? 0,
      spent_amount: totalSpent,
      currency: ev.currency ?? "EUR",
      wedding_date: card?.wedding_date || null,
      couple_name: couple_name || null,
      has_suppliers: (supplierCount || 0) > 0,
      has_guests: (guestCount || 0) > 0,
    },
  });
}

