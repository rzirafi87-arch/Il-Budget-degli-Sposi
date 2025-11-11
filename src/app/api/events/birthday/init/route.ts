import { NextRequest, NextResponse } from "next/server";
import { BIRTHDAY_META } from "@/features/events/birthday/config";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const currency = body?.currency as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data: existingBudget, error: existingError } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("event_key", BIRTHDAY_META.key)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingBudget) {
    return NextResponse.json({ data: existingBudget });
  }

  const payload = {
    user_id: userId,
    event_key: BIRTHDAY_META.key,
    currency: currency ?? BIRTHDAY_META.defaultCurrency,
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
