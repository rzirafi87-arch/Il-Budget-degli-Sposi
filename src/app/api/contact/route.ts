export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
  }

  // Branch 53 truthfulness guard: support persistence/delivery is intentionally
  // fail-closed until the Branch 56 support queue exists.
  return NextResponse.json(
    { ok: false, error: "CONTACT_UNAVAILABLE" },
    { status: 503 },
  );
}
