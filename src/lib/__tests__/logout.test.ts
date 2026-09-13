import type { SupabaseClient } from "@supabase/supabase-js";
import { logoutCurrentSession } from "../logout";

describe("logoutCurrentSession", () => {
  it("clears the server selector before signing out and removes event caches", async () => {
    const calls: string[] = [];
    const fetchImpl = jest.fn(async () => {
      calls.push("cookie");
      return new Response(null, { status: 200 });
    }) as unknown as typeof fetch;
    const signOut = jest.fn(async () => {
      calls.push("session");
      return { error: null };
    });
    const removeItem = jest.fn();

    await logoutCurrentSession({
      supabase: { auth: { signOut } } as unknown as SupabaseClient,
      accessToken: "jwt",
      fetchImpl,
      storage: { removeItem },
    });

    expect(calls).toEqual(["cookie", "session"]);
    expect(fetchImpl).toHaveBeenCalledWith("/api/my/current-event", {
      method: "DELETE",
      headers: { Authorization: "Bearer jwt" },
    });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(removeItem.mock.calls.map(([key]) => key)).toEqual([
      "eventType",
      "currentEventChangedAt",
    ]);
  });

  it("still ends the session if current-event cookie cleanup is unavailable", async () => {
    const signOut = jest.fn(async () => ({ error: null }));

    await logoutCurrentSession({
      supabase: { auth: { signOut } } as unknown as SupabaseClient,
      accessToken: "jwt",
      fetchImpl: jest.fn(async () => { throw new Error("offline"); }) as unknown as typeof fetch,
      storage: { removeItem: jest.fn() },
    });

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("does not report success or clear app caches when Supabase rejects sign-out", async () => {
    const error = new Error("sign-out failed");
    const removeItem = jest.fn();

    await expect(logoutCurrentSession({
      supabase: { auth: { signOut: jest.fn(async () => ({ error })) } } as unknown as SupabaseClient,
      storage: { removeItem },
    })).rejects.toThrow("sign-out failed");

    expect(removeItem).not.toHaveBeenCalled();
  });
});
