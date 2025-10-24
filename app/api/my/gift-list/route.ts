export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type GiftItem = {
  id?: string;
  type: string;
  name: string;
  description?: string;
  price?: number;
  url?: string;
  priority?: "alta" | "media" | "bassa";
  status?: "desiderato" | "acquistato";
  notes?: string;
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  // Demo-first: unauthenticated returns placeholder
  if (!jwt) {
    return NextResponse.json({ items: [] });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // TODO: Persist and fetch user's gift list from Supabase when table is available
  return NextResponse.json({ items: [] });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  let body: GiftItem;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Minimal validation
  if (!body?.name || !body?.type) {
    return NextResponse.json({ error: "'name' e 'type' sono obbligatori" }, { status: 400 });
  }

  // Demo-first: allow unauthenticated but do not persist
  if (!jwt) {
    const item = { ...body, id: `demo-${Date.now()}` };
    return NextResponse.json({ item }, { status: 201 });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // TODO: Insert into Supabase table when available; for now, echo back
  const item = { ...body, id: `id-${Date.now()}` };
  return NextResponse.json({ item }, { status: 201 });
}
