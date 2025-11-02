import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { magicLinkTemplate, sendMail, siteUrl } from "@/lib/mailer";

// POST /api/auth/register
// Body: { primaryEmail, password, partnerEmail?, weddingDate? }
// Creates owner user, optionally creates partner, creates default event with wedding date
export async function POST(req: NextRequest) {
  try {
    const { primaryEmail, password, partnerEmail, weddingDate } = await req.json();

    if (!primaryEmail || !password) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const db = getServiceClient();

    // 1) Create owner user (or error if exists)
    const emailConfirm = process.env.NEXT_PUBLIC_ENVIRONMENT !== "production";
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

    // 2) Partner opzionale
    if (partnerEmail) {
      const partnerConfirm = process.env.NEXT_PUBLIC_ENVIRONMENT !== "production";
      const { error: partnerCreateErr } = await db.auth.admin.createUser({
        email: partnerEmail,
        password,
        email_confirm: partnerConfirm,
      });
      if (partnerCreateErr) {
        console.error("REGISTER create partner error:", partnerCreateErr);
        // fallback: prova a inviare un invito (imposta password al click)
        const { error: inviteErr } = await db.auth.admin.inviteUserByEmail(partnerEmail);
        if (inviteErr) {
          console.error("REGISTER invite partner error:", inviteErr);
        }
      } else if (!partnerConfirm) {
        // In produzione: invia comunque un invito di conferma via email
        const { error: inviteErr } = await db.auth.admin.inviteUserByEmail(partnerEmail);
        if (inviteErr) {
          console.error("REGISTER invite partner after create error:", inviteErr);
        }
      }
    }

    // 3) Create event for the couple
    const publicId = Math.random().toString(36).slice(2, 10);
    const { data: ev, error: e2 } = await db
      .from("events")
      .insert({
        public_id: publicId,
        name: "Il nostro matrimonio",
        owner_id: ownerId,
        total_budget: 0,
        bride_email: primaryEmail,
        groom_email: partnerEmail || null,
        wedding_date: weddingDate || null,
      })
      .select("id")
      .single();

    if (e2 || !ev?.id) {
      console.error("REGISTER create event error:", e2);
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
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected" }, { status: 500 });
  }
}
