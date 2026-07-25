import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export function requireAdminSync(request: NextRequest): void {
  const secret = process.env.ADMIN_SYNC_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || !authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const suppliedSecret = authHeader.slice("Bearer ".length);
  const expected = Buffer.from(secret);
  const supplied = Buffer.from(suppliedSecret);

  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new Error("Unauthorized");
  }
}
