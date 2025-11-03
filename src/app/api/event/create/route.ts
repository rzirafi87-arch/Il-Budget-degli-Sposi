/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type CreateBody = {
  name?: string;
  currency?: string;
  total_budget?: number;
  wedding_card?: {
    bride_name?: string;
    groom_name?: string;
    wedding_date?: string; // YYYY-MM-DD
  } | null;
};

export async function POST(req: NextRequest) {
  const db = getServiceClient();

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Missing JWT" }, { status: 401 });

  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user?.id) return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });

  // If user already has an event, return it (idempotent create)
  const { data: existing } = await db
    .from("events")
    .select("id, name, currency, total_budget")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, event: existing });
  }

  const body = (await req.json().catch(() => ({}))) as CreateBody;
  const payload = {
    owner_id: userData.user.id,
    name: body.name || "Il nostro matrimonio",
    currency: body.currency || "EUR",
    total_budget: body.total_budget ?? 0,
  };

  const { data: inserted, error } = await db.from("events").insert(payload).select("id, name, currency, total_budget").single();
  if (error || !inserted) return NextResponse.json({ error: error?.message || "Create failed" }, { status: 500 });

  // Optionally create wedding card
  if (body.wedding_card && (body.wedding_card.bride_name || body.wedding_card.groom_name || body.wedding_card.wedding_date)) {
    const wc = {
      event_id: inserted.id,
      bride_name: body.wedding_card.bride_name || null,
      groom_name: body.wedding_card.groom_name || null,
      wedding_date: body.wedding_card.wedding_date || null,
    } as any;
    await db.from("wedding_cards").insert(wc).select("event_id").maybeSingle();
  }

  return NextResponse.json({ ok: true, event: inserted });
}

