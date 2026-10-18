/** @jest-environment node */
/**
 * B57 contract: public catalog endpoints never write to the database on
 * behalf of an anonymous caller.
 * - checklist-modules and traditions are read-only reference data (POST → 405).
 * - Community submissions (wedding planners, ceremony/reception music) need a
 *   session, are rate limited, and are attributed to the submitting user.
 */

jest.mock("next/server", () => {
  class NextResponse {
    status: number;
    body: unknown;
    headers: Map<string, string>;
    constructor(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers ?? {}));
    }
    static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
      return new NextResponse(body, init);
    }
  }
  return { NextResponse, NextRequest: class {} };
});

const mockInserts: Array<{ table: string; row: unknown }> = [];
let mockSessionUserId: string | null = null;
let mockRateLimitAllowed = true;

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    auth: {
      getUser: async (jwt: string) =>
        mockSessionUserId && jwt === "valid-token"
          ? { data: { user: { id: mockSessionUserId } }, error: null }
          : { data: { user: null }, error: new Error("invalid") },
    },
    from: (table: string) => ({
      insert: (row: unknown) => {
        mockInserts.push({ table, row });
        const result = { data: [row], error: null };
        return { ...Promise.resolve(result), then: (f: (v: unknown) => unknown) => Promise.resolve(result).then(f), select: async () => result };
      },
    }),
  }),
}));

jest.mock("@/lib/authRateLimit", () => ({
  checkAuthRateLimit: async () => ({ allowed: mockRateLimitAllowed, remaining: mockRateLimitAllowed ? 1 : 0, resetAt: Date.now() + 60_000 }),
}));

function request(body: unknown, token?: string) {
  const headers = new Map<string, string>();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return {
    headers: { get: (name: string) => headers.get(name.toLowerCase()) ?? null },
    json: async () => body,
    nextUrl: new URL("https://app.example.test/api"),
    url: "https://app.example.test/api",
  } as never;
}

const VALID_SUBMISSION = { name: "Studio Test", region: "Campania", province: "NA", city: "Napoli", description: "x" };

beforeEach(() => {
  mockInserts.length = 0;
  mockSessionUserId = null;
  mockRateLimitAllowed = true;
});

describe.each([
  ["checklist-modules", () => import("./checklist-modules/route")],
  ["traditions", () => import("./traditions/route")],
])("%s is read-only", (_name, load) => {
  it("rejects POST with 405 and never inserts, even with a valid session", async () => {
    mockSessionUserId = "user-1";
    const route = (await load()) as unknown as Record<string, (req: never) => Promise<{ status: number; headers: Map<string, string> }>>;
    expect(typeof route.POST).toBe("function");
    const res = await route.POST(request({ name: "injected", country_code: "it" }, "valid-token"));
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET");
    expect(mockInserts).toHaveLength(0);
  });
});

describe.each([
  ["wedding-planner", "wedding_planners", () => import("./wedding-planner/route")],
  ["musica-cerimonia", "musica_cerimonia", () => import("./musica-cerimonia/route")],
  ["musica-ricevimento", "musica_ricevimento", () => import("./musica-ricevimento/route")],
])("%s submissions", (_name, table, load) => {
  const post = async (body: unknown, token?: string) => {
    const route = (await load()) as unknown as { POST: (req: never) => Promise<{ status: number; body: unknown }> };
    return route.POST(request(body, token));
  };

  it("answers 401 without a session and does not insert", async () => {
    const res = await post(VALID_SUBMISSION);
    expect(res.status).toBe(401);
    expect(mockInserts).toHaveLength(0);
  });

  it("answers 401 with an invalid token and does not insert", async () => {
    const res = await post(VALID_SUBMISSION, "forged-token");
    expect(res.status).toBe(401);
    expect(mockInserts).toHaveLength(0);
  });

  it("answers 429 when the submitter is rate limited", async () => {
    mockSessionUserId = "user-1";
    mockRateLimitAllowed = false;
    const res = await post(VALID_SUBMISSION, "valid-token");
    expect(res.status).toBe(429);
    expect(mockInserts).toHaveLength(0);
  });

  it("rejects oversized fields with 400", async () => {
    mockSessionUserId = "user-1";
    const res = await post({ ...VALID_SUBMISSION, description: "a".repeat(5001) }, "valid-token");
    expect(res.status).toBe(400);
    expect(mockInserts).toHaveLength(0);
  });

  it("stores a pending, unverified row attributed to the session user, ignoring client-supplied privileged fields", async () => {
    mockSessionUserId = "user-1";
    const res = await post({ ...VALID_SUBMISSION, status: "approved", verified: true, submitted_by: "someone-else" }, "valid-token");
    expect(res.status).toBe(200);
    expect(mockInserts).toHaveLength(1);
    expect(mockInserts[0].table).toBe(table);
    expect(mockInserts[0].row).toEqual(expect.objectContaining({ status: "pending", verified: false, submitted_by: "user-1", name: "Studio Test" }));
  });
});
