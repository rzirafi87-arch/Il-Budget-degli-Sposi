/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

// Public event lookup by public_id.
// Compatible with both existing schema (name/public_id) and the new core schema (title/is_public/public_id).
// Next.js 15+ may pass params as a Promise in the route context
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ publicId: string }> } | { params: { publicId: string } }
) {
  // Normalize params whether it's a Promise or a plain object
  const params = (context as any)?.params?.then ? await (context as any).params : (context as any).params;
  const publicId = params?.publicId as string | undefined;
  if (!publicId) {
    return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
  }

  const db = getServiceClient();

  // Try to fetch the event by public_id. We avoid selecting non-existent columns explicitly.
  const { data: events, error } = await db
    .from("events")
    .select("*")
    .eq("public_id", publicId)
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!events || events.length === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ev = events[0] as any;

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
