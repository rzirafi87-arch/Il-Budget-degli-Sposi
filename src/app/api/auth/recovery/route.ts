import { recoveryTemplate, sendMail, siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limit = checkAuthRateLimit(req, "password-recovery");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const db = getServiceClient();
    const result = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: `${siteUrl()}/auth/callback?next=/it/reset-password` } });
    const link = result.data?.properties?.action_link;
    if (!result.error && link) await sendMail(email, "Reimposta la password – Il Budget degli Sposi", recoveryTemplate(link)).catch(() => undefined);
  }
  return NextResponse.json({ ok: true, message: "Se l’indirizzo è associato a un account, riceverai le istruzioni." });
}
