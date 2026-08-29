import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["considering", "contacted", "shortlisted", "selected", "discarded"]);

async function ownedEventId(userId: string) {
  const db = getServiceClient();
  const { data, error } = await db.from("events").select("id").eq("owner_id", userId)
    .order("inserted_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ savedChurches: [], eventId: null });
    const { data, error } = await getServiceClient().from("saved_churches")
      .select("id,event_id,church_id,status,favorite,contacted,selected,personal_notes,personal_contact_notes,quoted_price,created_at,updated_at")
      .eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ savedChurches: data || [], eventId });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as { church_id?: string };
    if (!body.church_id || !UUID.test(body.church_id)) return NextResponse.json({ error: "Invalid church id" }, { status: 400 });
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });
    const db = getServiceClient();
    const { data: church } = await db.from("churches").select("id").eq("id", body.church_id).maybeSingle();
    if (!church) return NextResponse.json({ error: "Church not found" }, { status: 404 });
    const { data, error } = await db.from("saved_churches").insert({ event_id: eventId, church_id: body.church_id })
      .select("id,event_id,church_id,status,favorite,contacted,selected").single();
    if (error?.code === "23505") return NextResponse.json({ error: "Church already saved" }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ savedChurch: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved church id" }, { status: 400 });
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });

    const updates: Record<string, string | boolean | number | null> = {};
    if (typeof body.favorite === "boolean") updates.favorite = body.favorite;
    if (typeof body.contacted === "boolean") updates.contacted = body.contacted;
    if (typeof body.selected === "boolean") { updates.selected = body.selected; if (body.selected) updates.status = "selected"; }
    if (typeof body.status === "string" && STATUSES.has(body.status)) updates.status = body.status;
    if (typeof body.personal_notes === "string") updates.personal_notes = body.personal_notes.trim().slice(0, 4000) || null;
    if (typeof body.personal_contact_notes === "string") updates.personal_contact_notes = body.personal_contact_notes.trim().slice(0, 4000) || null;
    if (body.quoted_price === null) updates.quoted_price = null;
    else if (typeof body.quoted_price === "number" && Number.isFinite(body.quoted_price) && body.quoted_price >= 0) updates.quoted_price = body.quoted_price;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid updates" }, { status: 400 });

    const { data, error } = await getServiceClient().from("saved_churches").update(updates)
      .eq("id", id).eq("event_id", eventId)
      .select("id,event_id,church_id,status,favorite,contacted,selected").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "Only one church can be selected" }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved church not found" }, { status: 404 });
    return NextResponse.json({ savedChurch: data });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved church id" }, { status: 400 });
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });
    const { data, error } = await getServiceClient().from("saved_churches").delete()
      .eq("id", id).eq("event_id", eventId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved church not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
