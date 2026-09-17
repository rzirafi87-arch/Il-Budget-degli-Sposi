import { confirmationSubject, confirmationTemplate, sendMail, siteUrl, type EmailLocale } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { generatePublicId } from "@/lib/publicId";
import { validateEventTypeForRegistration } from "@/lib/eventTypeCapabilities";
import { safeInternalPath } from "@/lib/auth";
import { randomUUID } from "node:crypto";
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

const REGISTRATION_MARKER_KEY = "registration_request_id";

type ServiceClient = ReturnType<typeof getServiceClient>;
type CreatedRegistration = {
  eventId?: string;
  ownerId: string;
  publicId?: string;
  requestId: string;
  startedAt: number;
};

function registrationError(code: string, status: number) {
  return NextResponse.json({ ok: false, code, error: code }, { status });
}

function isOwnedByRequest(user: {
  id?: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
} | null | undefined, registration: CreatedRegistration, email: string) {
  const createdAt = Date.parse(user?.created_at || "");
  return user?.id === registration.ownerId
    && normalizeEmail(user?.email) === email
    && user?.user_metadata?.[REGISTRATION_MARKER_KEY] === registration.requestId
    && Number.isFinite(createdAt)
    && createdAt >= registration.startedAt - 300_000
    && createdAt <= Date.now() + 300_000;
}

async function compensateRegistration(
  db: ServiceClient,
  registration: CreatedRegistration,
  email: string,
) {
  if (registration.eventId && registration.publicId) {
    const { data: event, error: lookupError } = await db
      .from("events")
      .select("id,owner_id,public_id")
      .eq("id", registration.eventId)
      .maybeSingle();
    if (lookupError
      || !event
      || event.owner_id !== registration.ownerId
      || event.public_id !== registration.publicId) {
      return false;
    }
    const { data: deleted, error: deleteError } = await db
      .from("events")
      .delete()
      .eq("id", registration.eventId)
      .eq("owner_id", registration.ownerId)
      .eq("public_id", registration.publicId)
      .select("id");
    if (deleteError || deleted?.length !== 1) return false;
  }

  const before = await db.auth.admin.getUserById(registration.ownerId);
  if (before.error || !isOwnedByRequest(before.data.user, registration, email)) return false;
  const removed = await db.auth.admin.deleteUser(registration.ownerId, false);
  if (removed.error) return false;

  const [ownerAfter, eventAfter, profileAfter, membershipAfter] = await Promise.all([
    db.auth.admin.getUserById(registration.ownerId),
    registration.eventId
      ? db.from("events").select("id").eq("id", registration.eventId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db.from("profiles").select("id").eq("id", registration.ownerId).maybeSingle(),
    db.from("event_members").select("id").eq("user_id", registration.ownerId).maybeSingle(),
  ]);
  return !ownerAfter.data.user
    && !eventAfter.data
    && !profileAfter.data
    && !membershipAfter.data;
}

async function failAndCompensate(
  db: ServiceClient,
  registration: CreatedRegistration,
  email: string,
  code: "REGISTRATION_DELIVERY_FAILED" | "REGISTRATION_INITIALIZATION_FAILED" | "REGISTRATION_UNAVAILABLE",
  status: 500 | 502 | 503,
) {
  const compensated = await compensateRegistration(db, registration, email).catch(() => false);
  if (!compensated) {
    console.error("REGISTER compensation alarm", { code: "REGISTRATION_COMPENSATION_FAILED" });
    return registrationError("REGISTRATION_COMPENSATION_FAILED", 500);
  }
  console.warn("REGISTER compensated", { code });
  return registrationError(code, status);
}

// POST /api/auth/register
// Body: { primaryEmail, password, partnerEmail?, weddingDate? }
// Creates an unconfirmed owner and default event, then sends one confirmation email.
export async function POST(req: NextRequest) {
  let activeRegistration: CreatedRegistration | undefined;
  let compensationClient: ServiceClient | undefined;
  let registrationEmail = "";
  try {
    const limit = await checkAuthRateLimit(req, "register", 10);
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    const primaryEmail = normalizeEmail("primaryEmail" in body ? body.primaryEmail : undefined);
    registrationEmail = primaryEmail;
    const partnerEmail = normalizeEmail("partnerEmail" in body ? body.partnerEmail : undefined);
    const password = "password" in body && typeof body.password === "string" ? body.password : "";
    const weddingDate =
      "weddingDate" in body && typeof body.weddingDate === "string" ? body.weddingDate : null;
    const next = safeInternalPath("next" in body && typeof body.next === "string" ? body.next : null, "/it/dashboard");
    const locale = (next.match(/^\/(it|en|es|fr|de)(?:\/|$)/)?.[1] || "it") as EmailLocale;
    const invitationSignup = /^\/(it|en|es|fr|de)\/invitation\?token=[A-Za-z0-9_-]{32,}$/.test(next);
    const eventTypeDecision = validateEventTypeForRegistration(
      "eventType" in body ? body.eventType : "wedding",
    );

    if (!eventTypeDecision.ok) {
      const status = eventTypeDecision.reason === "COMING_SOON" ? 409 : 400;
      return NextResponse.json(
        {
          ok: false,
          code: `EVENT_TYPE_${eventTypeDecision.reason}`,
          error: "EVENT_TYPE_NOT_AVAILABLE",
        },
        { status },
      );
    }
    const eventType = eventTypeDecision.eventType;

    if (!EMAIL_PATTERN.test(primaryEmail) || password.length < 10 || password.length > 128) {
      return NextResponse.json(
        { ok: false, error: "Email non valida o password inferiore a 10 caratteri" },
        { status: 400 },
      );
    }
    if (partnerEmail && (!EMAIL_PATTERN.test(partnerEmail) || partnerEmail === primaryEmail)) {
      return NextResponse.json({ ok: false, error: "Email partner non valida" }, { status: 400 });
    }

    const db = getServiceClient();
    compensationClient = db;
    const requestId = randomUUID();
    const startedAt = Date.now();

    // Generate a real signup-confirmation link. This creates an unconfirmed user
    // without sending Supabase's generic email because delivery is branded below.
    const callback = `${siteUrl(req)}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data: ownerRes, error: createErr } = await db.auth.admin.generateLink({
      type: "signup",
      email: primaryEmail,
      password,
      options: {
        redirectTo: callback,
        data: { [REGISTRATION_MARKER_KEY]: requestId },
      },
    });
    if (createErr || !ownerRes.user || !ownerRes.properties?.action_link) {
      console.error("REGISTER create owner error code:", createErr?.code || "missing_signup_link");
      return NextResponse.json(
        { ok: true, code: "REGISTRATION_PENDING", confirmationRequired: true },
        { status: 202 },
      );
    }
    const ownerId = ownerRes.user.id;
    const registration: CreatedRegistration = { ownerId, requestId, startedAt };
    if (!isOwnedByRequest(ownerRes.user, registration, primaryEmail)) {
      return NextResponse.json(
        { ok: true, code: "REGISTRATION_PENDING", confirmationRequired: true },
        { status: 202 },
      );
    }
    activeRegistration = registration;

    if (invitationSignup) {
      try {
        await sendMail(primaryEmail, confirmationSubject(locale), confirmationTemplate(ownerRes.properties.action_link, locale));
      } catch {
        return failAndCompensate(db, registration, primaryEmail, "REGISTRATION_DELIVERY_FAILED", 502);
      }
      activeRegistration = undefined;
      return NextResponse.json({ ok: true, confirmationRequired: true });
    }

    // Partner delivery is deliberately handled by the authenticated invitation
    // lifecycle after owner confirmation. Signup sends exactly one email.
    const publicId = generatePublicId();
    const { data: ev, error: e2 } = await db
      .from("events")
      .insert({
        public_id: publicId,
        name: "Il nostro matrimonio",
        owner_id: ownerId,
        event_type: eventType,
        total_budget: 0,
        bride_email: primaryEmail,
        groom_email: partnerEmail || null,
        event_date: weddingDate || null,
      })
      .select("id")
      .single();

    if (e2 || !ev?.id) {
      console.error("REGISTER create event error code:", e2?.code || "event_insert_failed");
      return failAndCompensate(db, registration, primaryEmail, "REGISTRATION_INITIALIZATION_FAILED", 500);
    }
    registration.eventId = ev.id;
    registration.publicId = publicId;

    // 4) Seed event
    const { error: seedErr } = await db.rpc("seed_full_event", { p_event: ev.id });
    if (seedErr) {
      console.error("REGISTER seed error code:", seedErr.code || "event_seed_failed");
      return failAndCompensate(db, registration, primaryEmail, "REGISTRATION_INITIALIZATION_FAILED", 500);
    }

    // 5) Send confirmation to owner. Partner invitation remains a distinct flow.
    try {
      await sendMail(primaryEmail, confirmationSubject(locale), confirmationTemplate(ownerRes.properties.action_link, locale));
    } catch {
      return failAndCompensate(db, registration, primaryEmail, "REGISTRATION_DELIVERY_FAILED", 502);
    }

    activeRegistration = undefined;
    return NextResponse.json({ ok: true, confirmationRequired: true, eventId: ev.id });
  } catch (e: unknown) {
    console.error("REGISTER unexpected error type:", e instanceof Error ? e.name : "unknown");
    if (activeRegistration && compensationClient) {
      return failAndCompensate(
        compensationClient,
        activeRegistration,
        registrationEmail,
        "REGISTRATION_UNAVAILABLE",
        503,
      );
    }
    return registrationError("REGISTRATION_UNAVAILABLE", 500);
  }
}
