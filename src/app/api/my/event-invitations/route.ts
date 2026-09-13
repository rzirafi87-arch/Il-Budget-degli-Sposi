import { createHash, randomBytes } from "node:crypto";
import { requireUser } from "@/lib/apiAuth";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { isEventOwnerForUser } from "@/lib/eventOwnership";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export async function GET(req: NextRequest) {
  const { userId } = await requireUser(req);
  const { eventId } = await requireServerCurrentEvent(userId);
  if (!(await isEventOwnerForUser(eventId, userId))) {
    return NextResponse.json({ error: "OWNER_REQUIRED" }, { status: 403 });
  }
  const { data, error } = await getServiceClient()
    .from("event_invitations")
    .select("id,event_id,invited_email_normalized,role,status,expires_at,created_at,accepted_at,revoked_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "INVITATIONS_READ_FAILED" }, { status: 500 });
  return NextResponse.json({ invitations: data || [] });
}

export async function POST(req: NextRequest) {
  const { userId } = await requireUser(req);
  const { eventId } = await requireServerCurrentEvent(userId);
  if (!(await isEventOwnerForUser(eventId, userId))) {
    return NextResponse.json({ error: "OWNER_REQUIRED" }, { status: 403 });
  }
  const body = (await req.json()) as { email?: string; expiresInHours?: number };
  const email = normalizeEmail(body.email || "");
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "EMAIL_INVALID" }, { status: 400 });
  }
  const hours = Math.min(Math.max(Number(body.expiresInHours) || 168, 1), 720);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const db = getServiceClient();

  const { data: owner } = await db.auth.admin.getUserById(userId);
  if (normalizeEmail(owner.user?.email || "") === email) {
    return NextResponse.json({ error: "CANNOT_INVITE_SELF" }, { status: 409 });
  }

  const { data, error } = await db.from("event_invitations").insert({
    event_id: eventId,
    invited_by: userId,
    invited_email_normalized: email,
    role: "partner",
    token_hash: tokenHash,
    status: "pending",
    expires_at: expiresAt,
  }).select("id,event_id,invited_email_normalized,role,status,expires_at,created_at").single();
  if (error) return NextResponse.json({ error: "INVITATION_CREATE_FAILED" }, { status: 500 });

  // The raw secret exists only in this response so an email delivery layer can
  // embed it. It is never logged or stored in the database.
  return NextResponse.json({ invitation: data, token }, { status: 201 });
}
