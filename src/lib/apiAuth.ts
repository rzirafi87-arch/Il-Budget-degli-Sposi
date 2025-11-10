import { getServiceClient } from "@/lib/supabaseServer";
import { NextRequest } from "next/server";

export type AuthResult = { userId: string };

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  if (!req.headers || typeof req.headers.get !== 'function') throw new Error("Missing headers");
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const jwt = authHeader?.split(" ")[1];
  if (!jwt) throw new Error("Missing JWT");

  const db = getServiceClient();
  const { data: userData, error } = await db.auth.getUser(jwt);
  if (error || !userData?.user?.id) throw new Error("Invalid JWT");
  return { userId: userData.user.id };
}

export function getBearer(req: NextRequest): string | null {
  if (!req.headers || typeof req.headers.get !== 'function') return null;
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
}

