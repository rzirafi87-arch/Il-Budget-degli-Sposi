import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/apiAuth";

const EVENT_KEY = "birthday";

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("event_key", EVENT_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
