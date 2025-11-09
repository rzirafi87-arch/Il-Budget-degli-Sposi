import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase environment variables are not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("app_health_latest")
    .select("*")
    .order("event_type");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
