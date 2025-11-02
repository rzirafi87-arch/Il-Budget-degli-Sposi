import { getServiceClient } from "@/lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

async function currentEventId(db: SupabaseClient, userId: string) {
  const { data: ev, error } = await db
    .from("events")
    .select("id")
    .eq("owner_id", userId)
    .order("inserted_at", { ascending: true })
    .limit(1)
    .single();
  if (error) throw error;
  return ev?.id as string;
}

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const eventId = await currentEventId(db, userData.user.id);
    if (!eventId) return NextResponse.json({ items: [] });
    const { data, error } = await db.from("budget_ideas").select("id, category_id, idea_amount").eq("event_id", eventId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data || [] });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { data: userData, error: authError } = await db.auth.getUser(jwt);
    if (authError || !userData?.user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    const eventId = await currentEventId(db, userData.user.id);
    if (!eventId) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    // Upsert per categoria
    const payload = items.map((it: { category_id: string; idea_amount: number }) => ({ event_id: eventId, category_id: it.category_id, idea_amount: Number(it.idea_amount || 0) }));
    const { error } = await db.from("budget_ideas").upsert(payload, { onConflict: "event_id,category_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    return NextResponse.json({ error: err.message || "Unexpected" }, { status: 500 });
  }
}

