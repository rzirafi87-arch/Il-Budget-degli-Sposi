import { getServiceClient } from "@/lib/supabaseServer";

export async function isEventOwnerForUser(eventId: string, userId: string): Promise<boolean> {
  const db = getServiceClient();
  const { data: membership } = await db
    .from("event_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();
  if (membership) return true;

  const { data: legacyOwner } = await db
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("owner_id", userId)
    .maybeSingle();
  return Boolean(legacyOwner);
}
