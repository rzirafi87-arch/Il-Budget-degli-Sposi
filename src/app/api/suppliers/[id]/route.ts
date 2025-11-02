export const runtime = "nodejs";

import { getBearer } from "@/lib/apiAuth";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// Public fields exposed for a supplier profile
const PUBLIC_COLUMNS = `id, name, category, region, province, city, address, phone, email, website, verified, description, photo_urls, video_urls, discount_info`;

type SupplierPublic = {
  id: string;
  name: string;
  category: string | null;
  region: string;
  province: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  verified: boolean;
  description: string | null;
  photo_urls: string[] | null;
  video_urls: string[] | null;
  discount_info: string | null;
};

type SupplierUpdate = Partial<Pick<SupplierPublic, "description" | "photo_urls" | "video_urls" | "discount_info">>;
type SupplierRow = SupplierPublic & {
  user_id: string | null;
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
};

type CtxId = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: CtxId) {
  const { id } = await ctx.params;
  const jwt = getBearer(req);
  const db = getServiceClient();

  // Try to fetch supplier by id
  const { data: raw, error } = await db
    .from("suppliers")
    .select(PUBLIC_COLUMNS + ", user_id")
    .eq("id", id)
    .single();

  // If not found, return demo placeholder when unauthenticated
  if (error || !raw) {
    if (!jwt) {
      return NextResponse.json({
        id,
        name: "Fornitore demo",
        category: "Generico",
        region: "",
        province: "",
        city: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        verified: false,
        description: "Aggiungi qui una descrizione del tuo servizio per gli sposi.",
        photo_urls: [],
        video_urls: [],
        discount_info: "",
        canEdit: false,
      });
    }
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }

  const data = (raw as unknown) as SupplierRow;
  let canEdit = false;
  if (jwt && data.user_id) {
    const { data: userData } = await db.auth.getUser(jwt);
    if (userData?.user?.id && userData.user.id === data.user_id) {
      canEdit = true;
    }
  }

  // Expose only public columns + canEdit flag
  const publicData: SupplierPublic = {
    id: data.id,
    name: data.name,
    category: data.category ?? null,
    region: data.region,
    province: data.province,
    city: data.city,
    address: data.address ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    verified: Boolean(data.verified),
    description: data.description ?? null,
    photo_urls: Array.isArray(data.photo_urls) ? data.photo_urls : null,
    video_urls: Array.isArray(data.video_urls) ? data.video_urls : null,
    discount_info: data.discount_info ?? null,
  };

  return NextResponse.json({ ...publicData, canEdit });
}

export async function PUT(req: NextRequest, ctx: CtxId) {
  const { id } = await ctx.params;
  const jwt = getBearer(req);
  if (!jwt) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload = await req.json().catch(() => ({}));
  const { description, photo_urls, video_urls, discount_info } = payload ?? {};

  const db = getServiceClient();
  const { data: userData, error: authError } = await db.auth.getUser(jwt);
  if (authError || !userData?.user?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Ensure the requester owns this supplier profile
  const { data: supplier, error: fetchErr } = await db
    .from("suppliers")
    .select("id, user_id, subscription_tier, subscription_expires_at")
    .eq("id", id)
    .single();

  if (fetchErr || !supplier) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }
  if (supplier.user_id !== userData.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Require an active paid subscription to edit rich content
  const tier = supplier.subscription_tier ?? "free";
  const exp = supplier.subscription_expires_at ? new Date(supplier.subscription_expires_at) : null;
  const isActive = tier === "free" ? false : exp ? exp > new Date() : false;
  if (!isActive) {
    return NextResponse.json({ error: "Abbonamento non attivo. Aggiorna il piano per modificare la tua pagina." }, { status: 402 });
  }

  const update: SupplierUpdate = {};
  if (typeof description === "string") update.description = description;
  if (Array.isArray(photo_urls)) update.photo_urls = photo_urls;
  if (Array.isArray(video_urls)) update.video_urls = video_urls;
  if (typeof discount_info === "string") update.discount_info = discount_info;

  const { error: updateErr } = await db
    .from("suppliers")
    .update(update)
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
