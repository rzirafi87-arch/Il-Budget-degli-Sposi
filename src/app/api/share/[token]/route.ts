import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type ShareEventRow = {
  id: string;
  public_id?: string | null;
  title?: string | null;
  name?: string | null;
  is_public?: boolean | null;
  created_at?: string | null;
  inserted_at?: string | null;
  type_id?: string | null;
};

// Share token resolver: returns event info when token is valid (not expired).
// Depends on table `event_share_tokens` from the new core schema.
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const db = getServiceClient();

  // Validate token (must exist and not be expired)
  const { data: tokens, error: tokErr } = await db
    .from("event_share_tokens")
    .select("id, event_id, expires_at")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  if (tokErr) {
    // Likely the table does not exist if schema not applied yet
    const isMissing = /relation .* does not exist/i.test(tokErr.message || "");
    if (isMissing) {
      console.error("event_share_tokens schema unavailable", tokErr);
      return NextResponse.json({ error: "SHARE_UNAVAILABLE" }, { status: 503 });
    }
    console.error("share token lookup failed", tokErr);
    return NextResponse.json({ error: "SHARE_LOOKUP_FAILED" }, { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  const t = tokens[0];

  // Fetch event minimal information
  const { data: events, error: evErr } = await db
    .from("events")
    .select("id,public_id,title,name,is_public,created_at,inserted_at,type_id")
    .eq("id", t.event_id)
    .limit(1);

  if (evErr) {
    console.error("shared event lookup failed", evErr);
    return NextResponse.json({ error: "SHARE_LOOKUP_FAILED" }, { status: 500 });
  }
  if (!events || events.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ev = events[0] as ShareEventRow;
  const payload = {
    id: ev.id,
    public_id: ev.public_id ?? null,
    title: ev.title ?? ev.name ?? null,
    is_public: typeof ev.is_public === "boolean" ? ev.is_public : null,
    created_at: ev.created_at ?? ev.inserted_at ?? null,
    type_id: ev.type_id ?? null,
    share_expires_at: t.expires_at,
  };

  return NextResponse.json({ event: payload }, { status: 200 });
}
