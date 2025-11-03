/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

type Body = {
  event_id?: string;
  public_id?: string;
  expires_in_days?: number;
  token?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;

    const db = getServiceClient();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    if (!jwt) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const { data: authData, error: authErr } = await db.auth.getUser(jwt);
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 });
    }
    const userId = authData.user.id as string;

    // Resolve event id
    let eventId = body.event_id || null;
    if (!eventId && body.public_id) {
      const { data: evs, error: e1 } = await db
        .from("events")
        .select("id")
        .eq("public_id", body.public_id)
        .limit(1);
      if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
      eventId = evs?.[0]?.id ?? null;
    }
    if (!eventId) {
      return NextResponse.json({ error: "Specificare event_id o public_id" }, { status: 400 });
    }

    // Authorization: user must be owner/editor of the event
    const { data: mems, error: mErr } = await db
      .from("event_members")
      .select("role")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .limit(1);
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
    const role = mems?.[0]?.role as string | undefined;
    if (!role || (role !== "owner" && role !== "editor")) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Create token (RPC ensures uniqueness and returns token + expiry)
    const expires = typeof body.expires_in_days === "number" ? body.expires_in_days : 7;
    const { data, error } = await db.rpc("create_share_token", {
      public_id: body.public_id ?? null,
      expires_in_days: expires,
      p_token: body.token ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Supabase returns either object or array depending on function; normalize
    const row = Array.isArray(data) ? data[0] : (data as any);
    return NextResponse.json({ token: row?.token, expires_at: row?.expires_at }, { status: 200 });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("SHARE/NEW – Uncaught:", error);
    return NextResponse.json({ error: error?.message || "Unexpected" }, { status: 500 });
  }
}
