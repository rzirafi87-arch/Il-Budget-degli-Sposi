import type { SupabaseClient } from "@supabase/supabase-js";

const EVENT_CACHE_KEYS = ["eventType", "currentEventChangedAt"] as const;

type LogoutDependencies = {
  supabase: SupabaseClient;
  accessToken?: string;
  fetchImpl?: typeof fetch;
  storage?: Pick<Storage, "removeItem">;
};

/**
 * Ends only the session on this browser and removes every client/server current
 * event selector. Cookie cleanup is best-effort: an unavailable API must never
 * leave an otherwise valid Supabase session active.
 */
export async function logoutCurrentSession({
  supabase,
  accessToken,
  fetchImpl,
  storage = window.localStorage,
}: LogoutDependencies) {
  if (accessToken) {
    try {
      await (fetchImpl ?? fetch)("/api/my/current-event", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // Continue: Supabase sign-out is the security-critical operation.
    }
  }

  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;

  for (const key of EVENT_CACHE_KEYS) storage.removeItem(key);
}
