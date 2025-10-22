import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");
    
    if (!publicId) {
      return NextResponse.json({ ok: false, error: "Missing publicId" }, { status: 400 });
    }

    const db = getServiceClient();
    const { data, error } = await db
      .from("events")
      .select("id, public_id")
      .eq("public_id", publicId)
      .order("inserted_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("EVENT RESOLVE – Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    
    if (!data?.id) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, event: data });
  } catch (e: any) {
    console.error("EVENT RESOLVE – Uncaught:", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unexpected" }, { status: 500 });
  }
}
