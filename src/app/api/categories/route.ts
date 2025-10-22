import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

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
  } catch (e: any) {
    console.error("Route /api/categories error:", e);
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
