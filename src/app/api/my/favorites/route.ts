export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

type Favorite = {
  id?: string;
  item_type: "supplier" | "location" | "church";
  item_id: string;
  notes?: string;
  rating?: number;
};

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ favorites: [] });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Fetch user favorites
  const { data: favorites, error: favError } = await db
    .from("user_favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favError) {
    console.error("Favorites GET error:", favError);
    return NextResponse.json({ error: favError.message }, { status: 500 });
  }

  return NextResponse.json({ favorites: favorites || [] });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;

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
    console.error("Favorite INSERT error:", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ favorite }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const jwt = authHeader?.split(" ")[1];

  if (!jwt) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = userData.user.id;
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
    console.error("Favorite DELETE error:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
