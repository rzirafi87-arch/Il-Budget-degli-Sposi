import { getBearer, requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type Appointment = {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  location?: string;
  notes?: string;
};

export async function GET(req: NextRequest) {
  const jwt = getBearer(req);

  if (!jwt) {
    // Demo data for unauthenticated users
    return NextResponse.json({
      appointments: [
        {
          id: "demo-1",
          title: "Sopralluogo Location",
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          location: "Villa Aurora",
          notes: "Confermare capienza e menu",
        },
        {
          id: "demo-2",
          title: "Prova Abito",
          date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          location: "Atelier Roma",
          notes: "Portare scarpe definitive",
        },
      ],
    });
  }

  try {
    const db = getServiceClient();
    const { userId } = await requireUser(req);

    // Find user's first event
    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (!ev?.id) return NextResponse.json({ appointments: [] });

    const { data, error } = await db
      .from("appointments")
      .select("id, title, appointment_date, location, notes")
      .eq("event_id", ev.id)
      .order("appointment_date", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const result: Appointment[] = (data || []).map((a: { id: string; title: string; appointment_date: string; location?: string | null; notes?: string | null; }) => ({
      id: a.id,
      title: a.title,
      date: a.appointment_date,
      location: a.location || "",
      notes: a.notes || "",
    }));

    return NextResponse.json({ appointments: result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const body = (await req.json()) as Appointment;

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Titolo e data sono obbligatori" }, { status: 400 });
    }

    const db = getServiceClient();

    // Find user's first event
    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();

    if (!ev?.id) return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });

    const { error } = await db.from("appointments").insert({
      event_id: ev.id,
      title: body.title,
      appointment_date: body.date,
      location: body.location || null,
      notes: body.notes || null,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
