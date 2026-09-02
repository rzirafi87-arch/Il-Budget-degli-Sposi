/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { CURRENT_EVENT_COOKIE, resolveCurrentEvent } from "@/lib/currentEvent";

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

  const resolution = await resolveCurrentEvent(req, userData.user.id);
  if (resolution.status === "RESOLVED") {
    return NextResponse.json({ ok: true, event: resolution.currentEvent });
  }
  if (resolution.status === "SELECTION_REQUIRED") {
    return NextResponse.json({ ok: false, error: "EVENT_SELECTION_REQUIRED", events: resolution.events }, { status: 409 });
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

  const response = NextResponse.json({ ok: true, event: inserted });
  response.cookies.set(CURRENT_EVENT_COOKIE, inserted.id, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 31536000,
  });
  return response;
}
