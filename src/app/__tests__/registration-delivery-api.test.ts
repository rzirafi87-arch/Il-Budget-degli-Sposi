const mockSendMail = jest.fn();
const mockGetServiceClient = jest.fn();

jest.mock("@/lib/authRateLimit", () => ({
  checkAuthRateLimit: async () => ({ allowed: true, resetAt: Date.now() + 1000 }),
}));
jest.mock("@/lib/mailer", () => ({
  siteUrl: () => "https://app.example.test",
  confirmationSubject: () => "Confirm account",
  confirmationTemplate: (link: string) => `<a href="${link}">confirm</a>`,
  sendMail: (...args: unknown[]) => mockSendMail(...args),
}));
jest.mock("@/lib/publicId", () => ({ generatePublicId: () => "request-public-id" }));
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => mockGetServiceClient() }));

type User = {
  id: string;
  email: string;
  created_at: string;
  user_metadata: Record<string, unknown>;
};
type EventRow = { id: string; owner_id: string; public_id: string; event_type: string };

function createHarness(options: {
  failDeleteUser?: boolean;
  failEventInsert?: boolean;
  failSeed?: boolean;
  preexistingUser?: boolean;
} = {}) {
  const users = new Map<string, User>();
  const profiles = new Set<string>();
  const memberships = new Set<string>();
  const events = new Map<string, EventRow>();
  const deleteUser = jest.fn(async (id: string) => {
    if (options.failDeleteUser) return { data: null, error: { code: "delete_failed" } };
    users.delete(id);
    profiles.delete(id);
    memberships.delete(id);
    return { data: null, error: null };
  });
  const preexistingId = "preexisting-owner";
  if (options.preexistingUser) {
    users.set(preexistingId, {
      id: preexistingId,
      email: "qa@example.com",
      created_at: "2025-01-01T00:00:00.000Z",
      user_metadata: { registration_request_id: "older-request" },
    });
    profiles.add(preexistingId);
  }

  const matching = <T extends Record<string, unknown>>(row: T, filters: Array<[string, unknown]>) =>
    filters.every(([key, value]) => row[key] === value);

  const selectBuilder = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    const builder = {
      eq(key: string, value: unknown) { filters.push([key, value]); return builder; },
      async maybeSingle() {
        if (table === "events") {
          const row = [...events.values()].find(item => matching(item, filters));
          return { data: row || null, error: null };
        }
        if (table === "profiles") {
          const id = String(filters.find(([key]) => key === "id")?.[1] || "");
          return { data: profiles.has(id) ? { id } : null, error: null };
        }
        const userId = String(filters.find(([key]) => key === "user_id")?.[1] || "");
        return { data: memberships.has(userId) ? { id: `membership-${userId}` } : null, error: null };
      },
    };
    return builder;
  };

  const db = {
    auth: {
      admin: {
        generateLink: jest.fn(async (input: {
          email: string;
          options?: { data?: Record<string, unknown> };
        }) => {
          const existing = [...users.values()].find(user => user.email === input.email);
          if (existing) {
            return {
              data: { user: existing, properties: { action_link: "https://auth.example.test/existing-secret" } },
              error: null,
            };
          }
          const user: User = {
            id: "new-owner",
            email: input.email,
            created_at: new Date().toISOString(),
            user_metadata: input.options?.data || {},
          };
          users.set(user.id, user);
          profiles.add(user.id);
          return {
            data: { user, properties: { action_link: "https://auth.example.test/token-secret" } },
            error: null,
          };
        }),
        getUserById: jest.fn(async (id: string) => ({
          data: { user: users.get(id) || null },
          error: users.has(id) ? null : { code: "user_not_found" },
        })),
        deleteUser,
      },
    },
    from: jest.fn((table: string) => ({
      insert: (payload: Record<string, unknown>) => ({
        select: () => ({
          single: async () => {
            if (options.failEventInsert) return { data: null, error: { code: "insert_failed" } };
            const event: EventRow = {
              id: "new-event",
              owner_id: String(payload.owner_id),
              public_id: String(payload.public_id),
              event_type: String(payload.event_type),
            };
            events.set(event.id, event);
            memberships.add(event.owner_id);
            return { data: { id: event.id }, error: null };
          },
        }),
      }),
      select: () => selectBuilder(table),
      delete: () => {
        const filters: Array<[string, unknown]> = [];
        const deleteBuilder = {
          eq(key: string, value: unknown) { filters.push([key, value]); return deleteBuilder; },
          async select() {
            const deleted = [...events.values()].filter(item => matching(item, filters));
            for (const event of deleted) {
              events.delete(event.id);
              memberships.delete(event.owner_id);
            }
            return { data: deleted.map(({ id }) => ({ id })), error: null };
          },
        };
        return deleteBuilder;
      },
    })),
    rpc: jest.fn(async () => ({ error: options.failSeed ? { code: "seed_failed" } : null })),
  };

  return { db, deleteUser, events, memberships, preexistingId, profiles, users };
}

async function register() {
  const { POST } = await import("../api/auth/register/route");
  return POST({
    json: async () => ({
      primaryEmail: "qa@example.com",
      password: "valid-pass-123",
      eventType: "wedding",
    }),
  } as unknown as import("next/server").NextRequest);
}

describe("registration delivery compensation", () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ id: "email-id" });
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("returns 200 only after user, event, seed and provider acceptance", async () => {
    const harness = createHarness();
    mockGetServiceClient.mockReturnValue(harness.db);
    const response = await register();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, confirmationRequired: true, eventId: "new-event" });
    expect(harness.users.size).toBe(1);
    expect(harness.events.size).toBe(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["provider 403", { name: "validation_error", message: "domain secret-detail" }],
    ["provider timeout", new Error("timeout token-secret")],
    ["provider 5xx", { name: "internal_server_error", message: "provider-secret" }],
  ])("compensates a new registration after %s", async (_label, providerError) => {
    const harness = createHarness();
    mockGetServiceClient.mockReturnValue(harness.db);
    mockSendMail.mockRejectedValueOnce(providerError);
    const response = await register();
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ok: false,
      code: "REGISTRATION_DELIVERY_FAILED",
      error: "REGISTRATION_DELIVERY_FAILED",
    });
    expect(harness.users.size).toBe(0);
    expect(harness.profiles.size).toBe(0);
    expect(harness.memberships.size).toBe(0);
    expect(harness.events.size).toBe(0);
    const logs = JSON.stringify([...errorSpy.mock.calls, ...warnSpy.mock.calls]);
    expect(logs).not.toMatch(/domain secret-detail|token-secret|provider-secret|validation_error/);
  });

  it("never deletes a pre-existing account and returns an enumeration-safe pending response", async () => {
    const harness = createHarness({ preexistingUser: true });
    mockGetServiceClient.mockReturnValue(harness.db);
    const response = await register();
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true, code: "REGISTRATION_PENDING", confirmationRequired: true });
    expect(harness.users.has(harness.preexistingId)).toBe(true);
    expect(harness.deleteUser).not.toHaveBeenCalled();
    expect(harness.events.size).toBe(0);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("does not touch a pre-existing event when new event creation fails", async () => {
    const harness = createHarness({ failEventInsert: true });
    harness.events.set("existing-event", {
      id: "existing-event",
      owner_id: "another-owner",
      public_id: "existing-public-id",
      event_type: "wedding",
    });
    mockGetServiceClient.mockReturnValue(harness.db);
    const response = await register();
    expect(response.status).toBe(500);
    expect(harness.events.has("existing-event")).toBe(true);
    expect(harness.users.size).toBe(0);
  });

  it("allows a clean retry after compensated provider failure without duplicate events", async () => {
    const harness = createHarness();
    mockGetServiceClient.mockReturnValue(harness.db);
    mockSendMail.mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce({ id: "accepted" });
    expect((await register()).status).toBe(502);
    expect((await register()).status).toBe(200);
    expect(harness.users.size).toBe(1);
    expect(harness.events.size).toBe(1);
  });

  it("keeps concurrent double submit idempotent", async () => {
    const harness = createHarness();
    mockGetServiceClient.mockReturnValue(harness.db);
    const [first, second] = await Promise.all([register(), register()]);
    expect([first.status, second.status].sort()).toEqual([200, 202]);
    expect(harness.users.size).toBe(1);
    expect(harness.events.size).toBe(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it("raises a stable alarm when verified compensation cannot finish", async () => {
    const harness = createHarness({ failDeleteUser: true });
    mockGetServiceClient.mockReturnValue(harness.db);
    mockSendMail.mockRejectedValueOnce(new Error("provider failure"));
    const response = await register();
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      ok: false,
      code: "REGISTRATION_COMPENSATION_FAILED",
      error: "REGISTRATION_COMPENSATION_FAILED",
    });
    expect(JSON.stringify(errorSpy.mock.calls)).toContain("REGISTRATION_COMPENSATION_FAILED");
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("provider failure");
  });
});
