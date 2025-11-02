export const runtime = "nodejs";

import { getBearer, requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

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
  const jwt = getBearer(req);
  // Demo-first: unauthenticated returns placeholder
  if (!jwt) return NextResponse.json({ items: [] });

  const { userId } = await requireUser(req);

  // TODO: Persist and fetch user's gift list from Supabase when table is available
  logger.debug("GIFT LIST GET user", { userId });
  return NextResponse.json({ items: [] });
}

export async function POST(req: NextRequest) {
  const jwt = getBearer(req);
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

  const { userId } = await requireUser(req);
  logger.debug("GIFT LIST POST user", { userId });

  // TODO: Insert into Supabase table when available; for now, echo back
  const item = { ...body, id: `id-${Date.now()}` };
  return NextResponse.json({ item }, { status: 201 });
}

