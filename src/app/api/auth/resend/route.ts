import { siteUrl } from "@/lib/mailer";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { rateLimitResponse } from "@/lib/publicApiGuard";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const limit = checkAuthRateLimit(req, "resend-confirmation");
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (EMAIL.test(email)) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const db = createClient(url, key, { auth: { persistSession: false } });
      await db.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/it/dashboard` } });
    }
  }
  return NextResponse.json({ ok: true, message: "Se l’account può essere confermato, riceverai una nuova email." });
}
