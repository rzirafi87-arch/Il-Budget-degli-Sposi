import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ENGAGEMENT_PARTY_META } from "@/features/events/engagement-party/config";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const currency = body?.currency as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
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
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
