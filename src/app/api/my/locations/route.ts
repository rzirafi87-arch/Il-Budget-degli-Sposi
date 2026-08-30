import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["considering", "contacted", "visited", "shortlisted", "selected", "discarded"]);
const ROLES = new Set(["reception", "ceremony", "accommodation", "party", "other"]);

async function ownedEventId(userId: string) {
  const { data, error } = await getServiceClient().from("events").select("id").eq("owner_id", userId).order("inserted_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ savedLocations: [], eventId: null });
    const { data, error } = await getServiceClient().from("saved_locations").select("id,event_id,location_id,location_role,status,favorite,contacted,visited,shortlisted,selected,personal_notes,contact_notes,quote_amount,quote_currency,quote_received_at,agreed_cost,created_at,updated_at").eq("event_id", eventId).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ savedLocations: data || [], eventId });
  } catch { return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as { location_id?: string; location_role?: string };
    if (!body.location_id || !UUID.test(body.location_id)) return NextResponse.json({ error: "Invalid location id" }, { status: 400 });
    const role = body.location_role && ROLES.has(body.location_role) ? body.location_role : "reception";
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });
    const db = getServiceClient();
    const { data: location } = await db.from("locations").select("id").eq("id", body.location_id).maybeSingle();
    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });
    const { data, error } = await db.from("saved_locations").insert({ event_id: eventId, location_id: body.location_id, location_role: role }).select("id,event_id,location_id,location_role,status,favorite,contacted,visited,shortlisted,selected").single();
    if (error?.code === "23505") return NextResponse.json({ error: "Location already saved for this role" }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ savedLocation: data }, { status: 201 });
  } catch { return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id : "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved location id" }, { status: 400 });
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });
    const updates: Record<string, string | boolean | number | null> = {};
    for (const key of ["favorite", "contacted", "visited", "shortlisted", "selected"] as const) if (typeof body[key] === "boolean") updates[key] = body[key];
    if (body.selected === true) updates.status = "selected";
    if (typeof body.status === "string" && STATUSES.has(body.status)) updates.status = body.status;
    if (typeof body.location_role === "string" && ROLES.has(body.location_role)) updates.location_role = body.location_role;
    for (const key of ["personal_notes", "contact_notes"] as const) if (typeof body[key] === "string") updates[key] = body[key].trim().slice(0, 4000) || null;
    for (const key of ["quote_amount", "agreed_cost"] as const) {
      if (body[key] === null) updates[key] = null;
      else if (typeof body[key] === "number" && Number.isFinite(body[key]) && body[key] >= 0) updates[key] = body[key];
    }
    if (typeof body.quote_currency === "string" && /^[A-Za-z]{3}$/.test(body.quote_currency)) updates.quote_currency = body.quote_currency.toUpperCase();
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    const { data, error } = await getServiceClient().from("saved_locations").update(updates).eq("id", id).eq("event_id", eventId).select("id,event_id,location_id,location_role,status,favorite,contacted,visited,shortlisted,selected").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "Only one location can be selected for each role" }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved location not found" }, { status: 404 });
    return NextResponse.json({ savedLocation: data });
  } catch { return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid saved location id" }, { status: 400 });
    const eventId = await ownedEventId(userId);
    if (!eventId) return NextResponse.json({ error: "No event" }, { status: 404 });
    const { data, error } = await getServiceClient().from("saved_locations").delete().eq("id", id).eq("event_id", eventId).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Saved location not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Not authenticated" }, { status: 401 }); }
}
