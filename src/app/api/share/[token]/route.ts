/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Share token resolver: returns event info when token is valid (not expired).
// Depends on table `event_share_tokens` from the new core schema.
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> } | { params: { token: string } }
) {
  const params = (context as any)?.params?.then ? await (context as any).params : (context as any).params;
  const token = params?.token as string | undefined;
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
      return NextResponse.json(
        { error: "Missing table event_share_tokens. Run supabase-core-events-schema.sql.", code: "SCHEMA_NOT_APPLIED" },
        { status: 501 }
      );
    }
    return NextResponse.json({ error: tokErr.message }, { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  const t = tokens[0];

  // Fetch event minimal information
  const { data: events, error: evErr } = await db
    .from("events")
    .select("*")
    .eq("id", t.event_id)
    .limit(1);

  if (evErr) {
    return NextResponse.json({ error: evErr.message }, { status: 500 });
  }
  if (!events || events.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ev = events[0] as any;
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
