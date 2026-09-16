export const runtime = "nodejs";

import { getBearer } from "@/lib/apiAuth";
import { apiSecurityErrorResponse, parseUuid, requireEventAccess } from "@/lib/apiSecurity";
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

  try {
  const { currentEvent } = await requireEventAccess(req, "owner-or-partner");
  const db = getServiceClient();

  // Fetch gift list items
  const { data: items, error } = await db
    .from("gift_list")
    .select("*")
    .eq("event_id", currentEvent.eventId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.debug("GIFT LIST GET error", { code: error.code });
    return NextResponse.json({ error: "GIFT_LIST_READ_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ items: items || [] });
  } catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_READ_FAILED"); }
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

  let access;
  try { access = await requireEventAccess(req, "owner-or-partner"); }
  catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_CREATE_FAILED"); }
  const { userId, currentEvent } = access;
  const db = getServiceClient();

  // Insert gift item
  const { data: item, error } = await db
    .from("gift_list")
    .insert({
      event_id: currentEvent.eventId,
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
    logger.debug("GIFT LIST POST error", { code: error.code });
    return NextResponse.json({ error: "GIFT_LIST_CREATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let currentEvent;
  try { ({ currentEvent } = await requireEventAccess(req, "owner-or-partner")); }
  catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_UPDATE_FAILED"); }
  const db = getServiceClient();

  let body: GiftItem & { id: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let itemId: string;
  try { itemId = parseUuid(body?.id, "INVALID_GIFT_ITEM_ID"); }
  catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_UPDATE_FAILED"); }

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
    .eq("id", itemId)
    .eq("event_id", currentEvent.eventId)
    .select()
    .maybeSingle();

  if (error) {
    logger.debug("GIFT LIST PUT error", { code: error.code });
    return NextResponse.json({ error: "GIFT_LIST_UPDATE_FAILED" }, { status: 500 });
  }

  if (!item) return NextResponse.json({ error: "GIFT_ITEM_NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let currentEvent;
  try { ({ currentEvent } = await requireEventAccess(req, "owner-or-partner")); }
  catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_DELETE_FAILED"); }
  const db = getServiceClient();

  const { searchParams } = new URL(req.url);
  let itemId: string;
  try { itemId = parseUuid(searchParams.get("id"), "INVALID_GIFT_ITEM_ID"); }
  catch (error) { return apiSecurityErrorResponse(error, "GIFT_LIST_DELETE_FAILED"); }

  // Delete gift item (RLS ensures user owns it)
  const { data, error } = await db
    .from("gift_list")
    .delete()
    .eq("id", itemId)
    .eq("event_id", currentEvent.eventId)
    .select("id")
    .maybeSingle();

  if (error) {
    logger.debug("GIFT LIST DELETE error", { code: error.code });
    return NextResponse.json({ error: "GIFT_LIST_DELETE_FAILED" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "GIFT_ITEM_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ success: true });
}
