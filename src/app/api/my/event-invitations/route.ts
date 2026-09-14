import { createHash, randomBytes } from "node:crypto";
import { requireUser } from "@/lib/apiAuth";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { requireServerCurrentEvent } from "@/lib/currentEvent";
import { isEventOwnerForUser } from "@/lib/eventOwnership";
import { sendMail, siteUrl } from "@/lib/mailer";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const copy = {
  it: ["Invito al tuo evento", "ti invita a pianificare", "Apri l’invito"], en: ["Your event invitation", "invites you to plan", "Open invitation"],
  es: ["Invitación a tu evento", "te invita a planificar", "Abrir invitación"], fr: ["Invitation à votre événement", "vous invite à organiser", "Ouvrir l’invitation"],
  de: ["Einladung zu deinem Ereignis", "lädt dich zur Planung ein", "Einladung öffnen"],
} as const;
type Locale = keyof typeof copy;

function verifiedOrigin(req: NextRequest) {
  const origin = siteUrl(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL ? undefined : req);
  const parsed = new URL(origin);
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") throw new Error("INVITATION_ORIGIN_INVALID");
  return parsed.origin;
}
function invitationHtml(locale: Locale, link: string, eventName: string, ownerName: string) {
  const text = copy[locale];
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5"><h2>${escapeHtml(text[0])}</h2><p><strong>${escapeHtml(ownerName)}</strong> ${escapeHtml(text[1])} <strong>${escapeHtml(eventName)}</strong>.</p><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 16px;background:#7d5960;color:#fff;border-radius:8px;text-decoration:none">${escapeHtml(text[2])}</a></p></div>`;
}
async function ownerContext(req: NextRequest) {
  const { userId } = await requireUser(req); const current = await requireServerCurrentEvent(userId);
  if (!(await isEventOwnerForUser(current.eventId, userId))) throw new Error("OWNER_REQUIRED");
  return { userId, current };
}
function failure(error: unknown, fallback: string) {
  const code = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: code === "OWNER_REQUIRED" ? code : "NOT_AUTHENTICATED" }, { status: code === "OWNER_REQUIRED" ? 403 : 401 });
}

export async function GET(req: NextRequest) {
  try {
    const { current } = await ownerContext(req);
    const { data, error } = await getServiceClient().from("event_invitations").select("id,event_id,invited_email_normalized,role,status,expires_at,created_at,accepted_at,revoked_at,rejected_at,sent_at,last_sent_at,delivery_status,delivery_error_code").eq("event_id", current.eventId).order("created_at", { ascending: false });
    if (error) throw error; return NextResponse.json({ invitations: data || [] });
  } catch (error) { return failure(error, "INVITATIONS_READ_FAILED"); }
}

async function deliver(req: NextRequest, id: string, email: string, token: string, locale: Locale, eventName: string, ownerName: string) {
  const db = getServiceClient(); const link = `${verifiedOrigin(req)}/${locale}/invitation?token=${encodeURIComponent(token)}`;
  try {
    const result = await sendMail(email, copy[locale][0], invitationHtml(locale, link, eventName, ownerName));
    if (!result || result.id === "skipped-local") throw new Error("EMAIL_PROVIDER_UNAVAILABLE");
    const now = new Date().toISOString(); await db.from("event_invitations").update({ delivery_status: "sent", sent_at: now, last_sent_at: now, delivery_error_code: null }).eq("id", id); return true;
  } catch { await db.from("event_invitations").update({ delivery_status: "failed", delivery_error_code: "PROVIDER_REJECTED" }).eq("id", id); return false; }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, current } = await ownerContext(req);
    const limit = await checkAuthRateLimit(req, `partner-invite:${userId}:${current.eventId}`, 5, 3600);
    if (!limit.allowed) return NextResponse.json({ error: "INVITATION_RATE_LIMITED" }, { status: 429 });
    const body = await req.json() as { email?: string }; const email = normalizeEmail(body.email || "");
    if (!EMAIL.test(email)) return NextResponse.json({ error: "EMAIL_INVALID" }, { status: 400 });
    const db = getServiceClient();
    const [{ data: owner }, { data: active }, { data: pending }, { data: event }] = await Promise.all([
      db.auth.admin.getUserById(userId), db.from("event_members").select("id").eq("event_id", current.eventId).eq("role", "partner").eq("status", "active").maybeSingle(),
      db.from("event_invitations").select("id").eq("event_id", current.eventId).eq("status", "pending").maybeSingle(), db.from("events").select("name,language").eq("id", current.eventId).single(),
    ]);
    if (normalizeEmail(owner.user?.email || "") === email) return NextResponse.json({ error: "CANNOT_INVITE_SELF" }, { status: 409 });
    if (active) return NextResponse.json({ error: "PARTNER_ALREADY_ACTIVE" }, { status: 409 });
    if (pending) return NextResponse.json({ error: "INVITATION_ALREADY_PENDING" }, { status: 409 });
    const token = randomBytes(32).toString("base64url"), tokenHash = createHash("sha256").update(token).digest("hex"), expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
    const { data, error } = await db.from("event_invitations").insert({ event_id: current.eventId, invited_by: userId, invited_email_normalized: email, role: "partner", token_hash: tokenHash, status: "pending", expires_at: expiresAt, delivery_status: "pending" }).select("id,event_id,invited_email_normalized,role,status,expires_at,created_at,delivery_status").single();
    if (error) return NextResponse.json({ error: error.code === "23505" ? "INVITATION_ALREADY_PENDING" : "INVITATION_CREATE_FAILED" }, { status: error.code === "23505" ? 409 : 500 });
    const locale = (["it","en","es","fr","de"].includes(event?.language || "") ? event?.language : "it") as Locale;
    const delivered = await deliver(req, data.id, email, token, locale, event?.name || current.name || copy[locale][0], owner.user?.user_metadata?.full_name || owner.user?.email?.split("@")[0] || "Owner");
    return NextResponse.json({ invitation: { ...data, delivery_status: delivered ? "sent" : "failed" }, delivered }, { status: delivered ? 201 : 502 });
  } catch (error) { return failure(error, "INVITATION_CREATE_FAILED"); }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, current } = await ownerContext(req); const limit = await checkAuthRateLimit(req, `partner-resend:${userId}:${current.eventId}`, 3, 3600);
    if (!limit.allowed) return NextResponse.json({ error: "INVITATION_RATE_LIMITED" }, { status: 429 });
    const { invitationId } = await req.json() as { invitationId?: string }; if (!invitationId) return NextResponse.json({ error: "INVITATION_INVALID" }, { status: 400 });
    const db = getServiceClient();
    const token = randomBytes(32).toString("base64url"), tokenHash = createHash("sha256").update(token).digest("hex"), expiresAt = new Date(Date.now() + 7 * 86400_000).toISOString();
    const [{ data: event }, { data: owner }] = await Promise.all([db.from("events").select("name,language").eq("id", current.eventId).single(), db.auth.admin.getUserById(userId)]);
    const { data: invitedEmail, error } = await db.rpc("rotate_event_invitation_token", { p_invitation_id: invitationId, p_event_id: current.eventId, p_user_id: userId, p_token_hash: tokenHash, p_expires_at: expiresAt });
    if (error || !invitedEmail) { const cooldown=/COOLDOWN/.test(error?.message||""); return NextResponse.json({ error: cooldown ? "INVITATION_RESEND_COOLDOWN" : "INVITATION_NOT_PENDING" }, { status: cooldown ? 429 : 409 }); }
    const locale = (["it","en","es","fr","de"].includes(event?.language || "") ? event?.language : "it") as Locale;
    const delivered = await deliver(req, invitationId, invitedEmail, token, locale, event?.name || current.name || copy[locale][0], owner.user?.user_metadata?.full_name || owner.user?.email?.split("@")[0] || "Owner");
    return NextResponse.json({ ok: delivered, delivered }, { status: delivered ? 200 : 502 });
  } catch (error) { return failure(error, "INVITATION_RESEND_FAILED"); }
}
