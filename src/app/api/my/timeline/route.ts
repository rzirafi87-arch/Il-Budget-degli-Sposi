export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { getBearer, requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

type DbTimelineItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  completed: boolean | null;
  display_order: number | null;
  phase?: string | null;
  days_before?: number | null;
};

export async function GET(req: NextRequest) {
  try {
    const jwt = getBearer(req);
    // Demo-first: se non autenticato, restituisce lista vuota e lascia alla UI i template locali
    if (!jwt) return NextResponse.json({ items: [] });

    const db = getServiceClient();
    const { userId } = await requireUser(req);

    // Un solo evento per utente: prendi il più vecchio (creato per primo)
    const { data: ev, error: evErr } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();
    if (evErr) {
      logger.error("TIMELINE GET events error", { error: evErr.message });
      return NextResponse.json({ items: [] });
    }
    if (!ev?.id) return NextResponse.json({ items: [] });

    const eventId = ev.id;

    const { data, error } = await db
      .from("timeline_items")
      .select(
        "id, title, description, category, completed, display_order, phase, days_before"
      )
      .eq("event_id", eventId)
      .order("display_order", { ascending: true })
      .order("days_before", { ascending: true, nullsFirst: false });

    if (error) {
      logger.error("TIMELINE GET error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: (data || []) as DbTimelineItem[] });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("TIMELINE GET uncaught", { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const body = await req.json();

    // Risolve event_id
    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .order("inserted_at", { ascending: true })
      .limit(1)
      .single();
    if (!ev?.id) {
      return NextResponse.json({ error: "Nessun evento trovato" }, { status: 404 });
    }
    const eventId = ev.id;

    // Supporta singolo item o bulk array
    const items = Array.isArray(body) ? body : [body];

    // Normalizza campi
    const toInsert = items.map((it: any, idx: number) => ({
      event_id: eventId,
      title: String(it.title || ""),
      description: it.description ?? null,
      category: it.category ?? null,
      completed: Boolean(it.completed ?? false),
      display_order: it.display_order ?? idx,
      phase: it.phase ?? null,
      days_before:
        it.days_before ?? (typeof it.monthsBefore === "number" ? Math.round(it.monthsBefore * 30) : null),
    }));

    const { data, error } = await db
      .from("timeline_items")
      .insert(toInsert)
      .select();
    if (error) {
      logger.error("TIMELINE POST error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ items: data });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("TIMELINE POST uncaught", { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const body = await req.json();
    const { id, ...patch } = body as { id: string; [k: string]: unknown };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Autorizzazione: verifica che l'item appartenga all'evento dell'utente
    const { data: row } = await db
      .from("timeline_items")
      .select("id, event_id")
      .eq("id", id)
      .single();
    if (!row?.event_id) return NextResponse.json({ error: "Item non trovato" }, { status: 404 });

    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("id", row.event_id)
      .eq("owner_id", userId)
      .single();
    if (!ev) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

    const update: Record<string, unknown> = {};
    if (typeof patch.title === "string") update.title = patch.title;
    if (typeof patch.description === "string" || patch.description === null) update.description = patch.description;
    if (typeof patch.category === "string" || patch.category === null) update.category = patch.category;
    if (typeof patch.completed === "boolean") update.completed = patch.completed;
    if (typeof patch.display_order === "number") update.display_order = patch.display_order;
    if (typeof (patch as any).days_before === "number") update.days_before = (patch as any).days_before;
    if (typeof (patch as any).monthsBefore === "number") update.days_before = Math.round(((patch as any).monthsBefore as number) * 30);
    if (typeof (patch as any).phase === "string") update.phase = (patch as any).phase;

    const { data, error } = await db
      .from("timeline_items")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      logger.error("TIMELINE PUT error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ item: data });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("TIMELINE PUT uncaught", { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await requireUser(req);
    const db = getServiceClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: row } = await db
      .from("timeline_items")
      .select("id, event_id")
      .eq("id", id)
      .single();
    if (!row?.event_id) return NextResponse.json({ error: "Item non trovato" }, { status: 404 });

    const { data: ev } = await db
      .from("events")
      .select("id")
      .eq("id", row.event_id)
      .eq("owner_id", userId)
      .single();
    if (!ev) return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });

    const { error } = await db
      .from("timeline_items")
      .delete()
      .eq("id", id);
    if (error) {
      logger.error("TIMELINE DELETE error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    logger.error("TIMELINE DELETE uncaught", { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
