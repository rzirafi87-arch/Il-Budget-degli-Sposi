import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const db = getServiceClient();
    
    const { data: packages, error } = await db
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      console.error("PACKAGES GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ packages: packages || [] });
  } catch (e: any) {
    console.error("PACKAGES GET uncaught:", e);
    return NextResponse.json({ error: e?.message || "Unexpected" }, { status: 500 });
  }
}
