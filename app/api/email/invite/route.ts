import InviteEmail from "@/emails/Invite";
import { EMAIL_FROM, resend } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { to, name, link } = await req.json();
  if (!to || !link) return NextResponse.json({ error: "Missing to/link" }, { status: 400 });

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Il tuo invito su MYBUDGETEVENTO",
    react: InviteEmail({ name: name ?? "ospite", link }),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
