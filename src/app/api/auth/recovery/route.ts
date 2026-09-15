import { recoveryTemplate, sendMail, siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const limit = await checkAuthRateLimit(req, "password-recovery", 5);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const redirectTo = `${siteUrl(req)}/auth/callback?next=/it/reset-password`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const localMail = process.env.PLAYWRIGHT_LOCAL_SUPABASE === "1" && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(supabaseUrl);
    if (localMail) {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!anonKey) throw new Error("Missing local Supabase anonymous key.");
      await createClient(supabaseUrl, anonKey, { auth: { persistSession: false } }).auth.resetPasswordForEmail(email, { redirectTo });
    } else {
      const db = getServiceClient();
      const result = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo } });
      const link = result.data?.properties?.action_link;
      if (!result.error && link) await sendMail(email, "Reimposta la password – Il Budget degli Sposi", recoveryTemplate(link)).catch(() => undefined);
    }
  }
  return NextResponse.json({ ok: true, message: "Se l’indirizzo è associato a un account, riceverai le istruzioni." });
}
