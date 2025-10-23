import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

// POST /api/auth/register
// Body: { primaryEmail, partnerEmail, password, brideBudget?: number, groomBudget?: number }
// Creates owner user, invites partner, creates default event with per-spouse budgets
export async function POST(req: NextRequest) {
  try {
    const { primaryEmail, partnerEmail, password, brideBudget, groomBudget } = await req.json();

    if (!primaryEmail || !partnerEmail || !password) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const db = getServiceClient();

    // 1) Create owner user (or error if exists)
    const { data: ownerRes, error: createErr } = await db.auth.admin.createUser({
      email: primaryEmail,
      password,
      email_confirm: false,
    });
    if (createErr || !ownerRes.user) {
      console.error("REGISTER create owner error:", createErr);
      return NextResponse.json({ ok: false, error: createErr?.message || "Cannot create owner" }, { status: 400 });
    }
    const ownerId = ownerRes.user.id;

    // 2) Invite partner (they will set their own password)
    const { error: inviteErr } = await db.auth.admin.inviteUserByEmail(partnerEmail);
    if (inviteErr) {
      console.error("REGISTER invite partner error:", inviteErr);
      // do not abort; continue creating event
    }

    // 3) Create event for the couple
    const publicId = Math.random().toString(36).slice(2, 10);
    const { data: ev, error: e2 } = await db
      .from("events")
      .insert({
        public_id: publicId,
        name: "Il nostro matrimonio",
        owner_id: ownerId,
        total_budget: (Number(brideBudget || 0) + Number(groomBudget || 0)) || 0,
        bride_initial_budget: Number(brideBudget || 0),
        groom_initial_budget: Number(groomBudget || 0),
        bride_email: primaryEmail,
        groom_email: partnerEmail,
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

    return NextResponse.json({ ok: true, eventId: ev.id });
  } catch (e: any) {
    console.error("REGISTER – Uncaught:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected" }, { status: 500 });
  }
}
