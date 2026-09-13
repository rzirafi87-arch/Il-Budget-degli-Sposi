import { requireUser } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await requireUser(req);
  const { token } = (await req.json()) as { token?: string };
  if (!token || token.length < 32) {
    return NextResponse.json({ error: "INVITATION_INVALID" }, { status: 400 });
  }
  const { data: eventId, error } = await getServiceClient().rpc("accept_event_invitation", {
    p_token: token,
    p_user_id: userId,
  });
  if (error) {
    const code = /EMAIL_MISMATCH/.test(error.message) ? "INVITATION_EMAIL_MISMATCH"
      : /EXPIRED/.test(error.message) ? "INVITATION_EXPIRED"
      : /NOT_PENDING/.test(error.message) ? "INVITATION_ALREADY_USED"
      : "INVITATION_INVALID";
    return NextResponse.json({ error: code }, { status: code === "INVITATION_EMAIL_MISMATCH" ? 403 : 409 });
  }
  return NextResponse.json({ ok: true, eventId });
}
