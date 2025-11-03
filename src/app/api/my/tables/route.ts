/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// GET: Carica tavoli e invitati disponibili
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    // Demo mode: restituisci dati vuoti
    return NextResponse.json({
      tables: [],
      availableGuests: [],
    });
  }

  const db = getServiceClient();
  const { data: userData, error: userError } = await db.auth.getUser(jwt);
  if (userError) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = userData.user.id;

  // Ottieni event_id dell'utente
  const { data: events } = await db
    .from("events")
    .select("id")
    .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
    .limit(1);
  
  if (!events || events.length === 0) {
    return NextResponse.json({
      tables: [],
      availableGuests: [],
    });
  }
  const eventId = events[0].id;

  // Carica tavoli con le assegnazioni
  const { data: tablesData } = await db
    .from("tables")
    .select(`
      id,
      table_number,
      table_name,
      table_type,
      total_seats,
      notes,
      table_assignments (
        id,
        guest_id,
        seat_number,
        guests (
          id,
          name
        )
      )
    `)
    .eq("event_id", eventId)
    .order("table_number");

  const tables = (tablesData || []).map((t: any) => ({
    id: t.id,
    tableNumber: t.table_number,
    tableName: t.table_name || `Tavolo ${t.table_number}`,
    tableType: t.table_type,
    totalSeats: t.total_seats,
    notes: t.notes || "",
    assignedGuests: (t.table_assignments || []).map((ta: any) => ({
      id: ta.id,
      guestId: ta.guest_id,
      guestName: ta.guests?.name || "Sconosciuto",
      seatNumber: ta.seat_number,
    })),
  }));

  // Carica invitati confermati non ancora assegnati
  const assignedGuestIds = tables.flatMap((t: any) => 
    t.assignedGuests.map((ag: any) => ag.guestId)
  );

  const { data: guestsData } = await db
    .from("guests")
    .select(`
      id,
      name,
      guest_type,
      exclude_from_family_table,
      family_group_id,
      family_groups (
        family_name
      )
    `)
    .eq("event_id", eventId)
    .eq("attending", true)
    .not("id", "in", `(${assignedGuestIds.join(",") || "''"})`);

  const availableGuests = (guestsData || []).map((g: any) => ({
    id: g.id,
    name: g.name,
    guestType: g.guest_type,
    excludeFromFamilyTable: g.exclude_from_family_table === true,
    familyGroupId: g.family_group_id,
    familyName: g.family_groups?.family_name,
  }));

  return NextResponse.json({
    tables,
    availableGuests,
  });
}

// POST: Salva tavoli e assegnazioni
export async function POST(req: NextRequest) {
  const db = getServiceClient();
  const { userId } = await requireUser(req);

  // Ottieni event_id
  const { data: events } = await db
    .from("events")
    .select("id")
    .or(`user_id.eq.${userId},partner_user_id.eq.${userId}`)
    .limit(1);

  if (!events || events.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const eventId = events[0].id;

  const { tables } = await req.json();

  // Elimina tutti i tavoli esistenti per questo evento (CASCADE eliminerà anche le assegnazioni)
  await db.from("tables").delete().eq("event_id", eventId);

  // Inserisci nuovi tavoli
  for (const table of tables) {
    const { data: newTable, error: tableError } = await db
      .from("tables")
      .insert({
        event_id: eventId,
        table_number: table.tableNumber,
        table_name: table.tableName,
        table_type: table.tableType,
        total_seats: table.totalSeats,
        notes: table.notes,
      })
      .select()
      .single();

    if (tableError || !newTable) {
      logger.error("Errore inserimento tavolo", { error: tableError });
      continue;
    }

    // Inserisci assegnazioni per questo tavolo
    if (table.assignedGuests && table.assignedGuests.length > 0) {
      const assignments = table.assignedGuests.map((ag: any) => ({
        table_id: newTable.id,
        guest_id: ag.guestId,
        seat_number: ag.seatNumber,
      }));

      const { error: assignError } = await db
        .from("table_assignments")
        .insert(assignments);

      if (assignError) {
        logger.error("Errore inserimento assegnazioni", { error: assignError });
      }
    }
  }

  return NextResponse.json({ success: true });
}
