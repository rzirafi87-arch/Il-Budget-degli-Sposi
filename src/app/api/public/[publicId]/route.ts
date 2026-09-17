import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type PublicEventRow = {
  id: string;
  public_id: string;
  title?: string | null;
  name?: string | null;
  is_public?: boolean | null;
  created_at?: string | null;
  inserted_at?: string | null;
  type_id?: string | null;
};

// Public event lookup by public_id.
// Compatible with both existing schema (name/public_id) and the new core schema (title/is_public/public_id).
// Next.js 15+ may pass params as a Promise in the route context
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await context.params;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  const db = getServiceClient();

  // Try to fetch the event by public_id. We avoid selecting non-existent columns explicitly.
  const { data: events, error } = await db
    .from("events")
    .select("id,public_id,title,name,is_public,created_at,inserted_at,type_id")
    .eq("public_id", publicId)
    .limit(1);

  if (error) {
    console.error("public event lookup failed", error);
    return NextResponse.json({ error: "PUBLIC_EVENT_LOOKUP_FAILED" }, { status: 500 });
  }
  if (!events || events.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ev = events[0] as PublicEventRow;

  // Build a minimal, schema-agnostic response.
  const response = {
    id: ev.id,
    public_id: ev.public_id,
    title: ev.title ?? ev.name ?? null,
    is_public: typeof ev.is_public === "boolean" ? ev.is_public : true, // assume public when fetching by public_id if flag absent
    created_at: ev.created_at ?? ev.inserted_at ?? null,
    type_id: ev.type_id ?? null,
  };

  return NextResponse.json({ event: response }, { status: 200 });
}
