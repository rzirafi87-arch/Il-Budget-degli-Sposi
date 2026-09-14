const insert = jest.fn();
const mockGetServiceClient = jest.fn();

jest.mock("@/lib/authRateLimit", () => ({
  checkAuthRateLimit: async () => ({ allowed: true, resetAt: Date.now() + 1000 }),
}));
jest.mock("@/lib/mailer", () => ({
  siteUrl: () => "http://localhost",
  confirmationTemplate: () => "confirmation",
  sendMail: jest.fn(async () => undefined),
}));
jest.mock("@/lib/publicId", () => ({ generatePublicId: () => "public-id" }));
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => mockGetServiceClient() }));

describe("registration API event type guard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    insert.mockImplementation((payload) => ({
      select: () => ({ single: async () => ({ data: { id: "event-id" }, error: null }) }),
      payload,
    }));
    mockGetServiceClient.mockReturnValue({
      auth: { admin: {
        generateLink: async () => ({
          data: { user: { id: "owner-id" }, properties: { action_link: "http://localhost/confirm" } },
          error: null,
        }),
        inviteUserByEmail: jest.fn(),
        deleteUser: jest.fn(),
      } },
      from: () => ({ insert }),
      rpc: async () => ({ error: null }),
    });
  });

  async function post(eventType: unknown) {
    const { POST } = await import("../api/auth/register/route");
    return POST({
      json: async () => ({ primaryEmail: "qa@example.com", password: "valid-pass-123", eventType }),
    } as unknown as import("next/server").NextRequest);
  }

  it("accepts wedding and persists only the canonical slug", async () => {
    const response = await post("wedding");
    expect(response.status).toBe(200);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ event_type: "wedding" }));
  });

  it.each([
    ["baptism", 409, "EVENT_TYPE_COMING_SOON"],
    ["internal-preview", 400, "EVENT_TYPE_INTERNAL_ONLY"],
    ["invented-event", 400, "EVENT_TYPE_UNKNOWN"],
  ])("rejects %s before creating a user or event", async (eventType, status, code) => {
    const response = await post(eventType);
    expect(response.status).toBe(status);
    expect(await response.json()).toMatchObject({ ok: false, code });
    expect(mockGetServiceClient).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });
});
