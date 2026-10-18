import { createHash, timingSafeEqual } from "node:crypto";

type HeaderRequest = { headers: { get(name: string): string | null } };

/**
 * Cron endpoints accept only `Authorization: Bearer <CRON_SECRET>`.
 * Vercel Cron sends exactly this header when CRON_SECRET is set.
 * Not accepted (B57): the `x-vercel-cron` header (any client can send it)
 * and the secret in the query string (it ends up in access logs).
 * Fails closed when CRON_SECRET is not configured.
 */
export function isAuthorizedCronRequest(req: HeaderRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header.slice("Bearer ".length)), digest(secret));
}
