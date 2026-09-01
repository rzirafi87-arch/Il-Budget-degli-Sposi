import { checkPublicRateLimit } from "@/lib/publicApiGuard";

export function checkAuthRateLimit(request: Request, scope: string) {
  return checkPublicRateLimit(request, `auth:${scope}`);
}
