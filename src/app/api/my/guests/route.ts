import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

type MenuPreference = "carne" | "pesce" | "baby" | "animazione" | "vegetariano" | "posto_tavolo";

type Guest = {
  id?: string;
  name: string;
  guestType: "bride" | "groom" | "common";
  isMainContact: boolean;
  invitationDate: string;
  rsvpDeadline: string;
  rsvpReceived: boolean;
  attending: boolean;
  menuPreferences: MenuPreference[];
  receivesBomboniera: boolean;
  notes: string;
};

type NonInvitedRecipient = {
  id?: string;
  name: string;
  receivesBomboniera: boolean;
  receivesConfetti: boolean;
  notes: string;
};

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      // Dati demo per utenti non autenticati
      return NextResponse.json({
        guests: [],
        nonInvitedRecipients: [],
        defaultRsvpDeadline: "",
      });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Ottieni l'evento dell'utente
    const { data: events, error: eventError } = await db
      .from("events")
      .select("id, default_rsvp_deadline")
      .eq("owner_id", userId)
      .limit(1);

    if (eventError || !events || events.length === 0) {
      return NextResponse.json({
        guests: [],
        nonInvitedRecipients: [],
        defaultRsvpDeadline: "",
      });
    }

    const eventId = events[0].id;
    const defaultRsvpDeadline = events[0].default_rsvp_deadline || "";

    // Carica i gruppi famiglia
    const { data: familyGroupsData, error: familyError } = await db
      .from("family_groups")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    // Carica gli invitati con informazioni famiglia
    const { data: guestsData, error: guestsError } = await db
      .from("guests")
      .select(`
        *,
        family_groups (
          family_name
        )
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    // Mappa i dati per includere familyGroupName
    const mappedGuests = (guestsData || []).map((g: any) => ({
      ...g,
      familyGroupName: g.family_groups?.family_name,
    }));

    // Carica i non invitati
    const { data: nonInvitedData, error: nonInvitedError } = await db
      .from("non_invited_recipients")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      guests: mappedGuests,
      familyGroups: familyGroupsData || [],
      nonInvitedRecipients: nonInvitedData || [],
      defaultRsvpDeadline,
    });
  } catch (err: any) {
    console.error("GET /api/my/guests error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];

    if (!jwt) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getServiceClient();
    const { data: userData, error: authError } = await db.auth.getUser(jwt);

    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Ottieni l'evento dell'utente (o crealo se non esiste)
    let { data: events, error: eventError } = await db
      .from("events")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);

    if (eventError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    let eventId: string;

    if (!events || events.length === 0) {
      // Crea un evento se non esiste
      const { data: newEvent, error: createError } = await db
        .from("events")
        .insert({ owner_id: userId, name: "Il nostro matrimonio" })
        .select("id")
        .single();

      if (createError || !newEvent) {
        return NextResponse.json({ error: "Could not create event" }, { status: 500 });
      }

      eventId = newEvent.id;
    } else {
      eventId = events[0].id;
    }

    const body = await req.json();
    const { guests, familyGroups, nonInvitedRecipients, defaultRsvpDeadline } = body;

    // Aggiorna la deadline RSVP nell'evento
    await db
      .from("events")
      .update({ default_rsvp_deadline: defaultRsvpDeadline || null })
      .eq("id", eventId);

    // Salva i gruppi famiglia
    if (familyGroups && Array.isArray(familyGroups)) {
      // Elimina tutti i gruppi famiglia esistenti per questo evento
      await db.from("family_groups").delete().eq("event_id", eventId);

      // Inserisci i nuovi gruppi famiglia
      const familyGroupsToInsert = familyGroups
        .filter((f: any) => f.familyName?.trim())
        .map((f: any) => ({
          event_id: eventId,
          family_name: f.familyName,
          main_contact_guest_id: f.mainContactGuestId || null,
          notes: f.notes || "",
        }));

      if (familyGroupsToInsert.length > 0) {
        await db.from("family_groups").insert(familyGroupsToInsert);
      }
    }

    // Salva gli invitati
    if (guests && Array.isArray(guests)) {
      // Elimina tutti gli invitati esistenti per questo evento
      await db.from("guests").delete().eq("event_id", eventId);

      // Inserisci i nuovi invitati
      const guestsToInsert = guests.map((g: any) => ({
        event_id: eventId,
        name: g.name,
        guest_type: g.guestType,
        is_main_contact: g.isMainContact,
        family_group_id: g.familyGroupId || null,
        invitation_date: g.invitationDate || null,
        rsvp_deadline: g.rsvpDeadline || null,
        rsvp_received: g.rsvpReceived,
        attending: g.attending,
        menu_preferences: g.menuPreferences,
        receives_bomboniera: g.receivesBomboniera,
        notes: g.notes || "",
      }));

      if (guestsToInsert.length > 0) {
        await db.from("guests").insert(guestsToInsert);
      }
    }

    // Salva i non invitati
    if (nonInvitedRecipients && Array.isArray(nonInvitedRecipients)) {
      // Elimina tutti i non invitati esistenti per questo evento
      await db.from("non_invited_recipients").delete().eq("event_id", eventId);

      // Inserisci i nuovi non invitati
      const recipientsToInsert = nonInvitedRecipients.map((r: NonInvitedRecipient) => ({
        event_id: eventId,
        name: r.name,
        receives_bomboniera: r.receivesBomboniera,
        receives_confetti: r.receivesConfetti,
        notes: r.notes || "",
      }));

      if (recipientsToInsert.length > 0) {
        await db.from("non_invited_recipients").insert(recipientsToInsert);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/my/guests error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
