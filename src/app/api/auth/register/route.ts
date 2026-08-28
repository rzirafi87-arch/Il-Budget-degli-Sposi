import { magicLinkTemplate, sendMail, siteUrl } from "@/lib/mailer";
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

    // 1) Create owner user (or error if exists)
    const isProduction =
      process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
    const emailConfirm = !isProduction;
    const { data: ownerRes, error: createErr } = await db.auth.admin.createUser({
      email: primaryEmail,
      password,
      email_confirm: emailConfirm,
    });
    if (createErr || !ownerRes.user) {
      console.error("REGISTER create owner error:", createErr);
      return NextResponse.json({ ok: false, error: createErr?.message || "Cannot create owner" }, { status: 400 });
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
        wedding_date: weddingDate || null,
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

    // 5) Invia magic link via Resend (sia al primario, sia al partner se presente)
    try {
      const redirectUrl = siteUrl();
      const ownerLinkRes = await db.auth.admin.generateLink({
        type: "magiclink",
        email: primaryEmail,
        options: { redirectTo: redirectUrl },
      });
      const ownerLink = ownerLinkRes?.data?.properties?.action_link;
      if (ownerLink) {
        await sendMail(primaryEmail, "Il tuo link di accesso", magicLinkTemplate(ownerLink));
      }
    } catch (mlErr) {
      console.error("REGISTER send owner magic link error:", mlErr);
    }

    if (partnerEmail) {
      try {
        const redirectUrl = siteUrl();
        const partnerLinkRes = await db.auth.admin.generateLink({
          type: "magiclink",
          email: partnerEmail,
          options: { redirectTo: redirectUrl },
        });
        const partnerLink = partnerLinkRes?.data?.properties?.action_link;
        if (partnerLink) {
          await sendMail(partnerEmail, "Invito e link di accesso", magicLinkTemplate(partnerLink));
        }
      } catch (mlpErr) {
        console.error("REGISTER send partner magic link error:", mlpErr);
      }
    }

    return NextResponse.json({ ok: true, eventId: ev.id });
  } catch (e: unknown) {
    console.error("REGISTER Uncaught:", e);
    const err = (e && typeof e === "object" && "message" in e) ? (e as Error) : new Error(String(e));
    return NextResponse.json({ ok: false, error: err.message || "Unexpected" }, { status: 500 });
  }
}
