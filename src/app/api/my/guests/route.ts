import { getBearer, requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

function fail(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const jwt = getBearer(req);
    if (!jwt) {
      return NextResponse.json({ guests: [], familyGroups: [], nonInvitedRecipients: [], defaultRsvpDeadline: "" });
    }
    const db = getServiceClient();
    const { userId } = await requireUser(req);
    const eventId = (await requireServerCurrentEvent(userId)).eventId;
    const [eventResult, familiesResult, guestsResult, recipientsResult] = await Promise.all([
      db.from("events").select("default_rsvp_deadline").eq("id", eventId).single(),
      db.from("family_groups").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
      db.from("guests").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
      db.from("non_invited_recipients").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
    ]);
    const firstError = eventResult.error || familiesResult.error || guestsResult.error || recipientsResult.error;
    if (firstError) throw firstError;

    return NextResponse.json({
      guests: (guestsResult.data || []).map((g: Record<string, unknown>) => ({
        id: g.id, name: g.name, guestType: g.guest_type, isMainContact: Boolean(g.is_main_contact),
        familyGroupId: g.family_group_id || undefined,
        excludeFromFamilyTable: Boolean(g.exclude_from_family_table),
        invitationDate: g.invitation_date || "", rsvpDeadline: g.rsvp_deadline || "",
        rsvpReceived: Boolean(g.rsvp_received), attending: Boolean(g.attending),
        menuPreferences: g.menu_preferences || [], receivesBomboniera: Boolean(g.receives_bomboniera),
        allergiesIntolerances: g.allergies_intolerances || "", notes: g.notes || "",
      })),
      familyGroups: (familiesResult.data || []).map((f: Record<string, unknown>) => ({
        id: f.id, familyName: f.family_name, mainContactGuestId: f.main_contact_guest_id || undefined,
        notes: f.notes || "",
      })),
      nonInvitedRecipients: (recipientsResult.data || []).map((r: Record<string, unknown>) => ({
        id: r.id, name: r.name, receivesBomboniera: Boolean(r.receives_bomboniera),
        receivesConfetti: Boolean(r.receives_confetti), notes: r.notes || "",
      })),
      defaultRsvpDeadline: eventResult.data?.default_rsvp_deadline || "",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    logger.error("GET /api/my/guests error", { message });
    return fail(message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getServiceClient();
    const { userId } = await requireUser(req);
    const eventId = (await requireServerCurrentEvent(userId)).eventId;
    const body = await req.json();
    if (!Array.isArray(body?.guests) || !Array.isArray(body?.familyGroups) || !Array.isArray(body?.nonInvitedRecipients)) {
      return fail("Payload invitati non valido", 400);
    }
    if (body.guests.length > 2000 || body.familyGroups.length > 1000 || body.nonInvitedRecipients.length > 2000) {
      return fail("Payload invitati troppo grande", 413);
    }
    const { data, error } = await db.rpc("save_event_guest_snapshot", {
      p_event_id: eventId,
      p_user_id: userId,
      p_default_rsvp_deadline: body.defaultRsvpDeadline || null,
      p_family_groups: body.familyGroups,
      p_guests: body.guests,
      p_non_invited: body.nonInvitedRecipients,
    });
    if (error) {
      logger.error("POST /api/my/guests transaction failed", { code: error.code, message: error.message, eventId });
      return fail("Salvataggio non riuscito: nessun dato è stato modificato");
    }
    return NextResponse.json(data || { success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    logger.error("POST /api/my/guests error", { message });
    return fail(message);
  }
}
