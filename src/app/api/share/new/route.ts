import { ApiSecurityError, apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  event_id?: unknown;
  public_id?: unknown;
  expires_in_days?: unknown;
};

type ShareTokenRow = { token: string; expires_at: string };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body || typeof body !== "object") throw new ApiSecurityError("INVALID_SHARE_PAYLOAD", 400);
    const db = getServiceClient();
    let explicitEventId: string | null = null;
    if (body.event_id !== undefined) {
      explicitEventId = parseUuid(body.event_id, "INVALID_EVENT_ID");
    } else if (typeof body.public_id === "string" && body.public_id.trim()) {
      const { data, error } = await db
        .from("events")
        .select("id")
        .eq("public_id", body.public_id.trim())
        .maybeSingle();
      if (error) throw new ApiSecurityError("SHARE_EVENT_LOOKUP_FAILED", 500);
      if (!data) throw new ApiSecurityError("EVENT_NOT_FOUND", 404);
      explicitEventId = data.id;
    } else throw new ApiSecurityError("EVENT_ID_REQUIRED", 400);

    const { currentEvent } = await requireEventAccess(req, "owner-only", explicitEventId);
    const { data: event, error: eventError } = await db.from("events").select("public_id")
      .eq("id", currentEvent.eventId).maybeSingle();
    if (eventError) throw new ApiSecurityError("SHARE_EVENT_LOOKUP_FAILED", 500);
    if (!event?.public_id) throw new ApiSecurityError("EVENT_NOT_FOUND", 404);

    // Create token (RPC ensures uniqueness and returns token + expiry)
    const expires = body.expires_in_days === undefined ? 7 : Number(body.expires_in_days);
    if (!Number.isInteger(expires) || expires < 1 || expires > 30) {
      throw new ApiSecurityError("INVALID_SHARE_EXPIRY", 422);
    }
    const { data, error } = await db.rpc("create_share_token", {
      public_id: event.public_id,
      expires_in_days: expires,
      p_token: null,
    });
    if (error) throw new ApiSecurityError("SHARE_TOKEN_CREATE_FAILED", 500);

    // Supabase returns either object or array depending on function; normalize
    const row = (Array.isArray(data) ? data[0] : data) as ShareTokenRow | null;
    if (!row?.token || !row.expires_at) throw new ApiSecurityError("SHARE_TOKEN_CREATE_FAILED", 500);
    return NextResponse.json({ token: row.token, expires_at: row.expires_at });
  } catch (error) {
    return apiSecurityErrorResponse(error, "SHARE_TOKEN_CREATE_FAILED");
  }
}
