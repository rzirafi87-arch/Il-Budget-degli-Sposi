export const runtime = "nodejs";
import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.split(" ")[1];
    const body = (await req.json()) as ContactPayload;

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Parametri mancanti" },
        { status: 400 }
      );
    }

    // If no JWT, accept in demo mode without persisting
    if (!jwt) {
      return NextResponse.json({ ok: true, demo: true });
    }

    // Verify JWT
    const db = getServiceClient();
    const { data: userData, error } = await db.auth.getUser(jwt);
    if (error || !userData?.user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Persist logic (table may not exist yet) — best-effort insert
    try {
      // Attempt to insert into a future table `contact_messages`
      await db.from("contact_messages").insert({
        user_id: userData.user.id,
        name,
        email,
        message,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Ignore persistence errors (table might not exist yet)
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
