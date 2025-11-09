import { getServiceClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = getServiceClient();

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
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Supabase environment variables are not configured";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
