import { confirmationTemplate, sendMail, siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { generatePublicId } from "@/lib/publicId";
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// POST /api/auth/register
// Body: { primaryEmail, password, partnerEmail?, weddingDate? }
// Creates owner user, optionally creates partner, creates default event with wedding date
export async function POST(req: NextRequest) {
  try {
    const limit = checkAuthRateLimit(req, "register");
    if (!limit.allowed) return rateLimitResponse(limit.resetAt);
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    const primaryEmail = normalizeEmail("primaryEmail" in body ? body.primaryEmail : undefined);
    const partnerEmail = normalizeEmail("partnerEmail" in body ? body.partnerEmail : undefined);
    const password = "password" in body && typeof body.password === "string" ? body.password : "";
    const weddingDate =
      "weddingDate" in body && typeof body.weddingDate === "string" ? body.weddingDate : null;
    const eventType =
      "eventType" in body && typeof body.eventType === "string" && body.eventType.trim()
        ? body.eventType.trim().toLowerCase()
        : "wedding";

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

    // Generate a real signup-confirmation link. This creates an unconfirmed user
    // without sending Supabase's generic email because delivery is branded below.
    const callback = `${siteUrl()}/auth/callback?next=/it/dashboard`;
    const { data: ownerRes, error: createErr } = await db.auth.admin.generateLink({
      type: "signup",
      email: primaryEmail,
      password,
      options: { redirectTo: callback },
    });
    if (createErr || !ownerRes.user || !ownerRes.properties?.action_link) {
      console.error("REGISTER create owner error code:", createErr?.code || "missing_signup_link");
      return NextResponse.json({ ok: true, confirmationRequired: true });
    }
    const ownerId = ownerRes.user.id;

    // 2) Partner opzionale: non condividere mai la password del proprietario.
    if (partnerEmail) {
      const { error: inviteErr } = await db.auth.admin.inviteUserByEmail(partnerEmail, {
        redirectTo: siteUrl(),
      });
      if (inviteErr) {
        console.error("REGISTER invite partner error:", inviteErr);
      }
    }

    // 3) Create event for the couple
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
      console.error("REGISTER create event error:", e2);
      await db.auth.admin.deleteUser(ownerId).catch((cleanupError) => {
        console.error("REGISTER owner cleanup error:", cleanupError);
      });
      return NextResponse.json({ ok: false, error: e2?.message || "Cannot create event" }, { status: 500 });
    }

    // 4) Seed event
    const { error: seedErr } = await db.rpc("seed_full_event", { p_event: ev.id });
    if (seedErr) {
      console.error("REGISTER seed error:", seedErr);
      // Not fatal for registration, continue
    }

    // 5) Send confirmation to owner. Partner invitation remains a distinct flow.
    try {
      await sendMail(primaryEmail, "Conferma il tuo account – Il Budget degli Sposi", confirmationTemplate(ownerRes.properties.action_link));
    } catch (mlErr) {
      console.error("REGISTER send owner magic link error:", mlErr);
    }

    return NextResponse.json({ ok: true, confirmationRequired: true, eventId: ev.id });
  } catch (e: unknown) {
    console.error("REGISTER Uncaught:", e);
    const err = (e && typeof e === "object" && "message" in e) ? (e as Error) : new Error(String(e));
    console.error("REGISTER unexpected error type:", err.name);
    return NextResponse.json({ ok: false, error: "Registrazione non disponibile. Riprova." }, { status: 500 });
  }
}
