import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export type AuthResult = { userId: string };
export type AdminAuthResult = AuthResult & { role: string };

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) throw new Error("Missing JWT");

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user?.id) throw new Error("Invalid JWT");
  return { userId: userData.user.id };
}

export async function requireAdminUser(req: NextRequest): Promise<AdminAuthResult> {
  const jwt = getBearer(req);
  if (!jwt) throw new Error("Missing JWT");

  const db = getServiceClient();
  const { data, error } = await db.auth.getUser(jwt);
  const user = data?.user;
  if (error || !user?.id) throw new Error("Invalid JWT");

  const role = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "";
  if (role !== "admin") throw new Error("Forbidden");

  return { userId: user.id, role };
}

export function getBearer(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}
