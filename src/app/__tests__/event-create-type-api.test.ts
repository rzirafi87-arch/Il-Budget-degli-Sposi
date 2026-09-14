const mockFrom = jest.fn();
const mockGetUser = jest.fn();
const mockResolveCurrentEvent = jest.fn();

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ auth: { getUser: mockGetUser }, from: mockFrom }),
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
  });

  async function post(eventType: unknown, authenticated = true) {
    const { POST } = await import("../api/event/ensure-default/route");
    return POST({
      url: "http://localhost/api/event/ensure-default",
      headers: new Headers(authenticated ? { authorization: "Bearer token" } : {}),
      json: async () => ({ eventType }),
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
});
