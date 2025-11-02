import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabaseServer";

export type AuthResult = { userId: string };

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) throw new Error("Missing JWT");

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user?.id) throw new Error("Invalid JWT");
  return { userId: userData.user.id };
}

export function getBearer(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}

