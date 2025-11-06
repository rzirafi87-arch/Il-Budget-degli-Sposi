export const runtime = "nodejs";

import { getBearer, requireUser } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type GiftItem = {
  id?: string;
  event_id?: string;
  type: string;
  name: string;
  description?: string;
  price?: number;
  url?: string;
  priority?: "alta" | "media" | "bassa";
  status?: "desiderato" | "acquistato" | "ricevuto";
  notes?: string;
  image_url?: string;
  purchased_by?: string;
  purchased_at?: string;
};

export async function GET(req: NextRequest) {
  const jwt = getBearer(req);
  // Demo-first: unauthenticated returns placeholder
  if (!jwt) return NextResponse.json({ items: [] });

  const { userId } = await requireUser(req);

  const db = getServiceClient();
  
  // Get user's event
  const { data: event } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!event) {
    logger.debug("GIFT LIST GET: no event found", { userId });
    return NextResponse.json({ items: [] });
  }

  // Fetch gift list items
  const { data: items, error } = await db
    .from("gift_list")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (error) {
    logger.debug("GIFT LIST GET error", { userId, error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logger.debug("GIFT LIST GET success", { userId, count: items?.length || 0 });
  return NextResponse.json({ items: items || [] });
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
  const db = getServiceClient();

  // Get user's event
  const { data: event } = await db
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "No event found for user" }, { status: 404 });
  }

  // Insert gift item
  const { data: item, error } = await db
    .from("gift_list")
    .insert({
      event_id: event.id,
      user_id: userId,
      type: body.type,
      name: body.name,
      description: body.description || null,
      price: body.price || null,
      url: body.url || null,
      priority: body.priority || "media",
      status: body.status || "desiderato",
      notes: body.notes || null,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) {
    logger.debug("GIFT LIST POST error", { userId, error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logger.debug("GIFT LIST POST success", { userId, itemId: item.id });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { userId } = await requireUser(req);
  const db = getServiceClient();

  let body: GiftItem & { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.id) {
    return NextResponse.json({ error: "Item ID required" }, { status: 400 });
  }

  // Update gift item (RLS ensures user owns it)
  const { data: item, error } = await db
    .from("gift_list")
    .update({
      type: body.type,
      name: body.name,
      description: body.description || null,
      price: body.price || null,
      url: body.url || null,
      priority: body.priority || "media",
      status: body.status || "desiderato",
      notes: body.notes || null,
      image_url: body.image_url || null,
      purchased_by: body.purchased_by || null,
      purchased_at: body.purchased_at || null,
    })
    .eq("id", body.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    logger.debug("GIFT LIST PUT error", { userId, error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!item) {
    return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
  }

  logger.debug("GIFT LIST PUT success", { userId, itemId: item.id });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { userId } = await requireUser(req);
  const db = getServiceClient();

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("id");

  if (!itemId) {
    return NextResponse.json({ error: "Item ID required" }, { status: 400 });
  }

  // Delete gift item (RLS ensures user owns it)
  const { error } = await db
    .from("gift_list")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) {
    logger.debug("GIFT LIST DELETE error", { userId, error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  logger.debug("GIFT LIST DELETE success", { userId, itemId });
  return NextResponse.json({ success: true });
}

