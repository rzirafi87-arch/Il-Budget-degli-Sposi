const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockResolveCurrentEvent = jest.fn();
const mockRpc = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
      cookies: { set: jest.fn(), delete: jest.fn() },
    }),
  },
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ auth: { getUser: mockGetUser }, from: mockFrom, rpc: mockRpc }),
}));
jest.mock("@/lib/currentEvent", () => ({
  CURRENT_EVENT_COOKIE: "app-current-event",
  resolveCurrentEvent: (...args: unknown[]) => mockResolveCurrentEvent(...args),
}));

describe("direct event creation type guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "owner-id" } }, error: null });
    mockResolveCurrentEvent.mockResolvedValue({ status: "NO_EVENT" });
    mockRpc.mockResolvedValue({ error: null });
  });

  async function post(eventType: unknown, authenticated = true, createAdditional = false) {
    const { POST } = await import("../api/event/ensure-default/route");
    return POST({
      url: "http://localhost/api/event/ensure-default",
      headers: new Headers(authenticated ? { authorization: "Bearer token" } : {}),
      json: async () => ({ eventType, createAdditional }),
    } as unknown as import("next/server").NextRequest);
  }

  it.each([
    ["baptism", 409, "EVENT_TYPE_COMING_SOON"],
    ["internal-preview", 400, "EVENT_TYPE_INTERNAL_ONLY"],
    ["not-registered", 400, "EVENT_TYPE_UNKNOWN"],
  ])("rejects direct %s creation without touching events", async (eventType, status, code) => {
    const response = await post(eventType);
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ ok: false, code });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns 401 for an anonymous request without touching events", async () => {
    const response = await post("wedding", false);
    expect(response.status).toBe(401);
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("does not alter the type of an existing legacy event", async () => {
    const update = jest.fn();
    mockResolveCurrentEvent.mockResolvedValue({
      status: "RESOLVED",
      currentEvent: { eventId: "legacy-event", eventType: "baptism" },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({
          data: { language: "it", country: "it", event_type: "baptism" }, error: null,
        }) }),
      }),
      update,
    });

    const response = await post("wedding");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ eventId: "legacy-event", eventType: "baptism", legacy: true });
    expect(update).not.toHaveBeenCalled();
  });

  it("creates an additional owner event instead of returning the resolved event", async () => {
    mockResolveCurrentEvent.mockResolvedValue({
      status: "RESOLVED",
      currentEvent: { eventId: "existing-event", eventType: "wedding", accessRole: "owner" },
    });
    const single = jest.fn().mockResolvedValue({ data: { id: "new-event" }, error: null });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockFrom.mockReturnValue({ insert });

    const response = await post("wedding", true, true);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ eventId: "new-event", eventType: "wedding" });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ owner_id: "owner-id", event_type: "wedding" }));
  });

  it("rejects additional event creation from a partner-only context", async () => {
    mockResolveCurrentEvent.mockResolvedValue({
      status: "RESOLVED",
      currentEvent: { eventId: "partner-event", eventType: "wedding", accessRole: "partner" },
    });
    const response = await post("wedding", true, true);
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: "EVENT_CREATE_FORBIDDEN" });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
