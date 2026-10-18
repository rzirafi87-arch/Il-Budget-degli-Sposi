import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { checkAuthRateLimit } from "@/lib/authRateLimit";
import { getServiceClient } from "@/lib/supabaseServer";

/** Community submissions per user/IP scope and window (B57). */
const SUBMISSION_LIMIT = 5;
const SUBMISSION_WINDOW_SECONDS = 3600;
const MAX_SHORT_FIELD = 200;
const MAX_LONG_FIELD = 5000;

type Table = "wedding_planners" | "musica_cerimonia" | "musica_ricevimento";

/**
 * Inserts a community-submitted catalog entry.
 * Requires a session, applies a rate limit, whitelists fields, and always
 * stores the row as pending/unverified and attributed to the session user.
 */
export async function submitCommunityEntry(
  req: NextRequest,
  table: Table,
  optionalFields: readonly string[],
): Promise<NextResponse> {
  let userId: string;
  try {
    ({ userId } = await requireUser(req));
  } catch {
    return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }

  const limit = await checkAuthRateLimit(req, `community-submission:${table}`, SUBMISSION_LIMIT, SUBMISSION_WINDOW_SECONDS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "INVALID_BODY" }, { status: 400 });
  }

  const row: Record<string, string | null> = {};
  for (const field of ["name", "region", "province", "city"]) {
    const value = body[field];
    if (typeof value !== "string" || !value.trim()) {
      return NextResponse.json({ error: "MISSING_REQUIRED_FIELDS" }, { status: 400 });
    }
    if (value.length > MAX_SHORT_FIELD) return NextResponse.json({ error: "FIELD_TOO_LONG" }, { status: 400 });
    row[field] = value.trim();
  }
  for (const field of optionalFields) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      row[field] = null;
      continue;
    }
    if (typeof value !== "string") return NextResponse.json({ error: "INVALID_FIELD" }, { status: 400 });
    const max = field === "description" || field === "services" ? MAX_LONG_FIELD : MAX_SHORT_FIELD;
    if (value.length > max) return NextResponse.json({ error: "FIELD_TOO_LONG" }, { status: 400 });
    row[field] = value.trim();
  }

  const { error } = await getServiceClient().from(table).insert({
    ...row,
    submitted_by: userId,
    verified: false,
    status: "pending",
  });
  if (error) {
    console.error("COMMUNITY_SUBMISSION_FAILED", { table, code: error.code });
    return NextResponse.json({ error: "SUBMISSION_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** 405 for endpoints that are read-only reference data. */
export function readOnlyEndpoint(): NextResponse {
  return NextResponse.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405, headers: { Allow: "GET" } });
}
