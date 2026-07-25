import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";
import { requireUser } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const body = await req.json().catch(() => null);
  const currency = body?.currency as string | undefined;

  const { data: existingBudget, error: existingError } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("event_key", ENGAGEMENT_PARTY_META.key)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingBudget) {
    return NextResponse.json({ data: existingBudget });
  }

  const payload = {
    user_id: userId,
    event_key: ENGAGEMENT_PARTY_META.key,
    currency: currency ?? ENGAGEMENT_PARTY_META.defaultCurrency,
    lines: [] as unknown[],
  };

  const { data, error } = await supabaseAdmin
    .from("budgets")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
