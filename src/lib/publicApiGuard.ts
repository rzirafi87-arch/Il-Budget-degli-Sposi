import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const LIMIT = 60;
const MAX_BUCKETS = 2_000;

type HeaderRequest = { headers?: { get(name: string): string | null } };

function clientKey(request: HeaderRequest) {
  const forwarded = request.headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers?.get("x-real-ip") || "unknown";
}

export function checkPublicRateLimit(request: HeaderRequest, scope: string, now = Date.now()) {
  if (buckets.size > MAX_BUCKETS) {
    for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
  }
  const key = `${scope}:${clientKey(request)}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  return { allowed: bucket.count <= LIMIT, remaining: Math.max(0, LIMIT - bucket.count), resetAt: bucket.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    { error: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))), "Cache-Control": "no-store" } },
  );
}

export const PUBLIC_CATALOG_CACHE = "public, s-maxage=30, stale-while-revalidate=120";
