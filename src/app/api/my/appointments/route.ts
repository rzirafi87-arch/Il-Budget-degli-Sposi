import { getBearer, requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type WeddingAgendaParams = {
  country?: string;
  event?: string;
};

type WeddingAgendaRow = {
  timeline: string[] | null;
  location_styles?: string[] | null;
  country_name?: string | null;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

async function buildWeddingAgenda(
  client: SupabaseClient,
  params: WeddingAgendaParams = {},
): Promise<Appointment[]> {
  const country = (params.country || "IT").toUpperCase();
  const event = params.event || "matrimonio";

  try {
    const { data, error } = await client
      .schema("app")
      .from("v_country_event_wedding")
      .select("timeline, location_styles, country_name")
      .eq("iso2", country)
      .eq("event_slug", event)
      .limit(1);

    if (error) {
      console.error("appointments GET – fallback wedding agenda error", error);
      return demoAppointments();
    }

    const row = (data?.[0] ?? null) as WeddingAgendaRow | null;
    const timeline = Array.isArray(row?.timeline)
      ? row!.timeline.filter((step): step is string => typeof step === "string" && step.trim().length > 0)
      : [];

    if (timeline.length === 0) {
      return demoAppointments();
    }

    const locationStyles = Array.isArray(row?.location_styles)
      ? row!.location_styles.filter((loc): loc is string => typeof loc === "string" && loc.trim().length > 0)
      : [];

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    baseDate.setHours(11, 0, 0, 0);

    const contextNote = row?.country_name
      ? `Ispirato a un matrimonio in ${row.country_name}`
      : "Esempio di agenda per il matrimonio";

    return timeline.map((step, index) => {
      const entryDate = new Date(baseDate.getTime());
      const offsetHours = index * 2;
      const offsetMinutes = index % 2 === 0 ? 0 : 30;
      entryDate.setHours(baseDate.getHours() + offsetHours, offsetMinutes, 0, 0);

      const location = locationStyles[index] ?? locationStyles[locationStyles.length - 1] ?? undefined;

      return {
        title: step,
        date: formatDate(entryDate),
        location,
        notes: `${contextNote}. Orario indicativo: ${formatTime(entryDate)}`,
      };
    });
  } catch (err) {
    console.error("appointments GET – unexpected fallback error", err);
    return demoAppointments();
  }
}

function demoAppointments(): Appointment[] {
  const inTenDays = new Date();
  inTenDays.setDate(inTenDays.getDate() + 10);
  const inTwentyDays = new Date();
  inTwentyDays.setDate(inTwentyDays.getDate() + 20);

  return [
    {
      title: "Sopralluogo Location",
      date: formatDate(inTenDays),
      location: "Villa Aurora",
      notes: "Confermare capienza e menu",
    },
    {
      title: "Prova Abito",
      date: formatDate(inTwentyDays),
      location: "Atelier Roma",
      notes: "Portare scarpe definitive",
    },
  ];
}

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
    const db = getServiceClient();
    const appointments = await buildWeddingAgenda(db);
    return NextResponse.json({ appointments });
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

    if (!ev?.id) {
      const appointments = await buildWeddingAgenda(db);
      return NextResponse.json({ appointments });
    }

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

    if (result.length === 0) {
      const appointments = await buildWeddingAgenda(db);
      return NextResponse.json({ appointments });
    }

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
