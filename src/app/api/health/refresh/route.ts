import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase environment variables are not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.rpc("app_health_refresh");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const { data, error: latestError } = await supabase
    .from("app_health_latest")
    .select("*")
    .order("event_type");

  if (latestError) {
    return NextResponse.json({ ok: false, error: latestError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
}
