/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

type UpdateBody = {
  name?: string | null;
  currency?: string | null;
  total_budget?: number | null;
  wedding_card?: {
    bride_name?: string | null;
    groom_name?: string | null;
    wedding_date?: string | null; // YYYY-MM-DD
  } | null;
};

export async function PATCH(req: NextRequest) {
  const db = getServiceClient();

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) return NextResponse.json({ error: "Missing JWT" }, { status: 401 });

  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user?.id) return NextResponse.json({ error: "Invalid JWT" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as UpdateBody;

  // Find user's event
  const { data: ev } = await db
    .from("events")
    .select("id, name, currency, total_budget")
    .eq("owner_id", userData.user.id)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!ev) return NextResponse.json({ error: "No event" }, { status: 404 });

  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.total_budget !== undefined) updates.total_budget = body.total_budget;
  if (Object.keys(updates).length > 0) {
    const { error: upErr } = await db.from("events").update(updates).eq("id", ev.id);
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  if (body.wedding_card) {
    // Upsert wedding card by event_id
    const wc = {
      event_id: ev.id,
      bride_name: body.wedding_card.bride_name ?? undefined,
      groom_name: body.wedding_card.groom_name ?? undefined,
      wedding_date: body.wedding_card.wedding_date ?? undefined,
    } as any;
    // Check if exists
    const { data: exists } = await db.from("wedding_cards").select("event_id").eq("event_id", ev.id).maybeSingle();
    if (exists) {
      const { error: wcErr } = await db.from("wedding_cards").update(wc).eq("event_id", ev.id);
      if (wcErr) return NextResponse.json({ error: wcErr.message }, { status: 500 });
    } else {
      const { error: wcErr } = await db.from("wedding_cards").insert(wc);
      if (wcErr) return NextResponse.json({ error: wcErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

