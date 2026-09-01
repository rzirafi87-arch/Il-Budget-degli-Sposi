import { safeInternalPath } from "@/lib/auth";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeInternalPath(url.searchParams.get("next"), "/it/auth?confirmed=1");
  const redirect = NextResponse.redirect(new URL(next, url.origin));
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/it/auth?authError=invalid_link", url.origin));
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll: cookies => cookies.forEach(({ name, value, options }) => redirect.cookies.set(name, value, options)) } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/it/auth?authError=invalid_link", url.origin));
  return redirect;
}
