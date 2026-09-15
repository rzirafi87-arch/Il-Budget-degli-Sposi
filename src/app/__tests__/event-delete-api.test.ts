const mockRequireUser = jest.fn();
const mockListOwnedEvents = jest.fn();
const mockMaybeSingle = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const response = {
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: async () => body,
        cookies: {
          delete: (name: string) =>
            response.headers.append(
              "set-cookie",
              `${name}=; Max-Age=0; Path=/`,
            ),
          set: (name: string, value: string) =>
            response.headers.append("set-cookie", `${name}=${value}; Path=/`),
        },
      };
      return response;
    },
  },
}));

jest.mock("@/lib/apiAuth", () => ({
  requireUser: (...args: unknown[]) => mockRequireUser(...args),
  getBearer: () => "jwt",
}));
jest.mock("@/lib/currentEvent", () => ({
  CURRENT_EVENT_COOKIE: "app-current-event",
  listOwnedEvents: (...args: unknown[]) => mockListOwnedEvents(...args),
}));
jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      delete: () => ({
        eq: () => ({ select: () => ({ maybeSingle: mockMaybeSingle }) }),
      }),
    }),
  }),
}));

import type { NextRequest } from "next/server";
import { DELETE } from "@/app/api/event/delete/route";

const EVENT_A = "11111111-1111-1111-1111-111111111111";
const EVENT_B = "22222222-2222-2222-2222-222222222222";
const owner = {
  id: EVENT_A,
  eventId: EVENT_A,
  ownerId: "user-a",
  name: "Nozze A",
  eventType: "wedding",
  date: null,
  locale: "it",
  country: "it",
  capability: {},
  accessRole: "owner",
};
const partner = { ...owner, ownerId: "owner-other", accessRole: "partner" };

function request(body: unknown, authenticated = true) {
  return {
    headers: new Headers(authenticated ? { authorization: "Bearer jwt" } : {}),
    json: async () => body,
  } as NextRequest;
}

describe("canonical event deletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public";
    mockRequireUser.mockResolvedValue({ userId: "user-a" });
    mockListOwnedEvents.mockResolvedValue([owner]);
    mockMaybeSingle.mockResolvedValue({ data: { id: EVENT_A }, error: null });
  });
  it("returns 401 for anonymous requests", async () => {
    mockRequireUser.mockRejectedValue(new Error());
    expect((await DELETE(request({}, false))).status).toBe(401);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it.each([
    ["partner", partner, 403],
    ["stranger", undefined, 404],
  ])("rejects %s without deleting", async (_label, target, status) => {
    mockListOwnedEvents.mockResolvedValue(target ? [target] : []);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(response.status).toBe(status);
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
  it("prevents owner A from deleting event B", async () => {
    expect(
      (await DELETE(request({ eventId: EVENT_B, confirmationName: "Nozze A" })))
        .status,
    ).toBe(404);
  });
  it("rejects altered or mismatched payloads", async () => {
    expect(
      (await DELETE(request({ eventId: EVENT_A, confirmationName: "wrong" })))
        .status,
    ).toBe(400);
    expect(
      (await DELETE(request({ eventId: "bad", confirmationName: "Nozze A" })))
        .status,
    ).toBe(400);
  });
  it("deletes the owner's event and clears transient cookies", async () => {
    mockListOwnedEvents
      .mockResolvedValueOnce([owner])
      .mockResolvedValueOnce([]);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(response.status).toBe(200);
    const cookies = response.headers.get("set-cookie") || "";
    expect(cookies).toContain("app-current-event=");
    expect(cookies).toContain("eventType=");
    expect(cookies).toContain("currentEventChangedAt=");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("deterministically selects the first remaining accessible event", async () => {
    const next = { ...owner, id: EVENT_B, eventId: EVENT_B, name: "Nozze B" };
    mockListOwnedEvents
      .mockResolvedValueOnce([owner])
      .mockResolvedValueOnce([next]);
    const response = await DELETE(
      request({ eventId: EVENT_A, confirmationName: "Nozze A" }),
    );
    expect(await response.json()).toMatchObject({
      remainingCount: 1,
      nextEvent: { id: EVENT_B },
    });
    expect(response.headers.get("set-cookie")).toContain(
      `app-current-event=${EVENT_B}`,
    );
  });
  it("defines repeated deletion as a safe 404", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    expect(
      (await DELETE(request({ eventId: EVENT_A, confirmationName: "Nozze A" })))
        .status,
    ).toBe(404);
  });
});
