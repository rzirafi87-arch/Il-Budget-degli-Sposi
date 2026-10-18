import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

/** Raised when the request carries no valid session. Callers map it to 401. */
export class AuthError extends Error {
  constructor(message: "Missing JWT" | "Invalid JWT") {
    super(message);
    this.name = "AuthError";
  }
}

/** 401 response for authentication failures; null for any other error. */
export function authErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof AuthError)) return null;
  return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
}

export type AuthResult = { userId: string };
export type AdminAuthResult = AuthResult & { role: string };

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) throw new AuthError("Missing JWT");

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user?.id) throw new AuthError("Invalid JWT");
  return { userId: userData.user.id };
}

export async function requireAdminUser(req: NextRequest): Promise<AdminAuthResult> {
  const jwt = getBearer(req);
  if (!jwt) throw new AuthError("Missing JWT");

  const db = getServiceClient();
  const { data, error } = await db.auth.getUser(jwt);
  const user = data?.user;
  if (error || !user?.id) throw new AuthError("Invalid JWT");

  const role = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "";
  if (role !== "admin") throw new Error("Forbidden");

  return { userId: user.id, role };
}

export function getBearer(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}
