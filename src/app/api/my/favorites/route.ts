import { requireUser } from "@/lib/apiAuth";
import { UUID_PATTERN } from "@/lib/catalogSnapshotContracts";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const FAVORITE_PROJECTION = "id,user_id,item_type,item_id,notes,rating,created_at,updated_at";
const ITEM_TYPES = ["supplier", "location", "church"] as const;
type FavoriteType = (typeof ITEM_TYPES)[number];

function catalogTable(type: FavoriteType): "suppliers" | "locations" | "churches" {
  return type === "supplier" ? "suppliers" : type === "location" ? "locations" : "churches";
}

async function authenticate(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  try {
    return await requireUser(req);
  } catch {
    return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }
}

function isResponse(value: { userId: string } | NextResponse): value is NextResponse {
  return "status" in value;
}

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (isResponse(auth)) return auth;
  const { data, error } = await getServiceClient().from("user_favorites")
    .select(FAVORITE_PROJECTION)
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "FAVORITES_READ_FAILED" }, { status: 500 });
  return NextResponse.json({ favorites: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (isResponse(auth)) return auth;
  let body: unknown;
  try { body = await req.json(); } catch { body = null; }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_PAYLOAD" }, { status: 400 });
  }
  const payload = body as Record<string, unknown>;
  if (Object.keys(payload).some((key) => !["item_type", "item_id", "notes", "rating"].includes(key))) {
    return NextResponse.json({ error: "INVALID_FAVORITE_PAYLOAD" }, { status: 400 });
  }
  if (typeof payload.item_type !== "string" || !ITEM_TYPES.includes(payload.item_type as FavoriteType)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_TYPE" }, { status: 400 });
  }
  if (typeof payload.item_id !== "string" || !UUID_PATTERN.test(payload.item_id)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_ITEM" }, { status: 400 });
  }
  if (payload.notes !== undefined && payload.notes !== null && (typeof payload.notes !== "string" || payload.notes.length > 4_000)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_NOTES" }, { status: 400 });
  }
  if (payload.rating !== undefined && payload.rating !== null && (!Number.isInteger(payload.rating) || (payload.rating as number) < 1 || (payload.rating as number) > 5)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_RATING" }, { status: 400 });
  }

  const itemType = payload.item_type as FavoriteType;
  const itemId = payload.item_id;
  const db = getServiceClient();
  const { data: catalogRecord, error: lookupError } = await db.from(catalogTable(itemType))
    .select("id").eq("id", itemId).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "FAVORITE_LOOKUP_FAILED" }, { status: 500 });
  if (!catalogRecord) return NextResponse.json({ error: "FAVORITE_ITEM_NOT_FOUND" }, { status: 404 });

  const insert = {
    user_id: auth.userId,
    item_type: itemType,
    item_id: itemId,
    notes: typeof payload.notes === "string" ? payload.notes.trim() || null : null,
    rating: typeof payload.rating === "number" ? payload.rating : null,
  };
  const { data, error } = await db.from("user_favorites")
    .insert(insert).select(FAVORITE_PROJECTION).single();
  if (!error && data) return NextResponse.json({ favorite: data, idempotent: false }, { status: 201 });
  if (error?.code !== "23505") return NextResponse.json({ error: "FAVORITE_CREATE_FAILED" }, { status: 500 });

  const { data: existing, error: existingError } = await db.from("user_favorites")
    .select(FAVORITE_PROJECTION)
    .eq("user_id", auth.userId).eq("item_type", itemType).eq("item_id", itemId).maybeSingle();
  if (existingError || !existing) return NextResponse.json({ error: "FAVORITE_CREATE_FAILED" }, { status: 500 });
  return NextResponse.json({ favorite: existing, idempotent: true });
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticate(req);
  if (isResponse(auth)) return auth;
  const favoriteId = req.nextUrl.searchParams.get("id");
  if (!favoriteId || !UUID_PATTERN.test(favoriteId)) {
    return NextResponse.json({ error: "INVALID_FAVORITE_ID" }, { status: 400 });
  }
  const { data, error } = await getServiceClient().from("user_favorites")
    .delete().eq("id", favoriteId).eq("user_id", auth.userId).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "FAVORITE_DELETE_FAILED" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "FAVORITE_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ success: true });
}
