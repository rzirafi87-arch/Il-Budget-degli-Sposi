import { createHash } from "node:crypto";
import { getServiceClient } from "@/lib/supabaseServer";

type HeaderRequest = { headers?: { get(name: string): string | null } };

function clientKey(request: HeaderRequest, scope: string) {
  const forwarded = request.headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers?.get("x-real-ip") || "unknown";
  const secret = process.env.RATE_LIMIT_SALT || process.env.CRON_SECRET || "production-rate-limit";
  return createHash("sha256").update(`${secret}:${scope}:${ip}`).digest("hex");
}

export async function checkAuthRateLimit(request: HeaderRequest, scope: string, limit = 10) {
  const db = getServiceClient();
  const { data, error } = await db.rpc("consume_rate_limit", {
    p_key: clientKey(request, scope),
    p_limit: limit,
    p_window_seconds: 60,
  });
  if (error) {
    console.error("RATE_LIMIT backend unavailable", { scope, code: error.code });
    return { allowed: false, remaining: 0, resetAt: Date.now() + 60_000 };
  }
  const result = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(result?.allowed),
    remaining: Number(result?.remaining ?? 0),
    resetAt: new Date(result?.reset_at || Date.now() + 60_000).getTime(),
  };
}
