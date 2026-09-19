import { confirmationSubject, confirmationTemplate, emailLocaleFromRequest, sendMail, siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_PAGE_SIZE = 200;

async function findUserByEmail(
  db: ReturnType<typeof getServiceClient>,
  email: string,
) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: USER_PAGE_SIZE });
    if (error) return undefined;
    const users = data?.users ?? [];
    const user = users.find(candidate => candidate.email?.toLowerCase() === email);
    if (user || users.length < USER_PAGE_SIZE) return user;
  }
}

export async function POST(req: NextRequest) {
  const limit = await checkAuthRateLimit(req, "resend-confirmation", 5);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (EMAIL.test(email)) {
    const db = getServiceClient();
    const locale = emailLocaleFromRequest(req);
    const redirectTo = `${siteUrl(req)}/auth/callback?next=/${locale}/dashboard`;
    const user = await findUserByEmail(db, email);
    if (user && !user.email_confirmed_at) {
      const result = await db.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } });
      const tokenHash = result.data?.properties?.hashed_token;
      if (!result.error && tokenHash) {
        const confirmationUrl = new URL(redirectTo);
        confirmationUrl.searchParams.set("token_hash", tokenHash);
        confirmationUrl.searchParams.set("type", "email");
        await sendMail(email, confirmationSubject(locale), confirmationTemplate(confirmationUrl.href, locale)).catch(() => undefined);
      }
    }
  }
  return NextResponse.json({ ok: true, message: "Se l’account può essere confermato, riceverai una nuova email." });
}
