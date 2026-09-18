import { confirmationSubject, confirmationTemplate, emailLocaleFromRequest, sendMail, siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limit = await checkAuthRateLimit(req, "resend-confirmation", 5);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (EMAIL.test(email)) {
    const db = getServiceClient();
    const locale = emailLocaleFromRequest(req);
    const redirectTo = `${siteUrl(req)}/auth/callback?next=/${locale}/dashboard`;
    const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = users?.users.find(candidate => candidate.email?.toLowerCase() === email);
    if (user && !user.email_confirmed_at) {
      const result = await db.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } });
      const link = result.data?.properties?.action_link;
      if (!result.error && link) {
        await sendMail(email, confirmationSubject(locale), confirmationTemplate(link, locale)).catch(() => undefined);
      }
    }
  }
  return NextResponse.json({ ok: true, message: "Se l’account può essere confermato, riceverai una nuova email." });
}
