import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const event = searchParams.get("event");
    
    if (!event) {
      return NextResponse.json({ error: "Missing event parameter" }, { status: 400 });
    }

    const db = getServiceClient();
    const { data, error } = await db
      .from("categories")
      .select("id,name")
      .eq("event_id", event)
      .order("name");
    
    if (error) {
      console.error("Supabase categories query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data || [] });
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("Route /api/categories error:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
