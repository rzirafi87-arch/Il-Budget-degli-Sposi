export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";
import { requireUser, getBearer } from "@/lib/apiAuth";
import { logger } from "@/lib/logger";

type Favorite = {
  id?: string;
  item_type: "supplier" | "location" | "church";
  item_id: string;
  notes?: string;
  rating?: number;
};

export async function GET(req: NextRequest) {
  const jwt = getBearer(req);
  if (!jwt) return NextResponse.json({ favorites: [] });

  const db = getServiceClient();
  const { userId } = await requireUser(req);

  // Fetch user favorites
  const { data: favorites, error: favError } = await db
    .from("user_favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favError) {
    logger.error("Favorites GET error", { error: favError });
    return NextResponse.json({ error: favError.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: favorites || [] });
}

export async function POST(req: NextRequest) {
  const { userId } = await requireUser(req);
  const db = getServiceClient();

  let body: Favorite;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.item_type || !body.item_id) {
    return NextResponse.json({ error: "item_type and item_id are required" }, { status: 400 });
  }

  const { data: favorite, error: insertError } = await db
    .from("user_favorites")
    .insert({
      user_id: userId,
      item_type: body.item_type,
      item_id: body.item_id,
      notes: body.notes || null,
      rating: body.rating || null,
    })
    .select()
    .single();

  if (insertError) {
    logger.error("Favorite INSERT error", { error: insertError });
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await requireUser(req);
  const db = getServiceClient();
  const { searchParams } = new URL(req.url);
  const favoriteId = searchParams.get("id");

  if (!favoriteId) {
    return NextResponse.json({ error: "Favorite ID required" }, { status: 400 });
  }

  const { error: deleteError } = await db
    .from("user_favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", userId);

  if (deleteError) {
    logger.error("Favorite DELETE error", { error: deleteError });
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
