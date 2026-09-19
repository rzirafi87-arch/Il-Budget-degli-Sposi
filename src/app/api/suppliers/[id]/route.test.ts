jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      headers: init?.headers,
    }),
  },
}));
export {};

jest.mock("@/lib/publicApiGuard", () => ({
  PUBLIC_CATALOG_CACHE: "public, max-age=60",
  checkPublicRateLimit: jest.fn(() => ({ allowed: true, resetAt: Date.now() })),
  rateLimitResponse: jest.fn(),
}));

jest.mock("@/lib/monetizationCapability", () => ({
  requirePaymentsCapability: jest.fn(() => null),
}));

const supplierId = "52000000-0000-4000-8000-000000000001";
let row: Record<string, unknown> | null;
let projection = "";
let selectedId = "";
type DetailQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
};
const mockQuery: DetailQuery = {
  select: jest.fn((columns: string) => { projection = columns; return mockQuery; }),
  eq: jest.fn((_column: string, value: string) => { selectedId = value; return mockQuery; }),
  maybeSingle: jest.fn(async () => ({ data: row, error: null })),
};
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: jest.fn(() => mockQuery) }),
}));

describe("GET /api/suppliers/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    row = { id: supplierId, name: "Fiori 52", city: "Roma", province: "RM", region: "Lazio" };
    projection = "";
    selectedId = "";
  });

  it("returns a real supplier using only the explicit schema projection", async () => {
    const route = await import("./route");
    const response = await route.GET(
      { url: `http://localhost/api/suppliers/${supplierId}` } as never,
      { params: Promise.resolve({ id: supplierId }) },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ supplier: row });
    expect(selectedId).toBe(supplierId);
    expect(projection).toContain("verification_status");
    expect(projection).not.toMatch(/photo_urls|video_urls|discount_info|\*/);
  });

  it("rejects malformed UUIDs before querying", async () => {
    const route = await import("./route");
    const response = await route.GET(
      { url: "http://localhost/api/suppliers/not-a-uuid" } as never,
      { params: Promise.resolve({ id: "not-a-uuid" }) },
    );
    expect(response.status).toBe(400);
    expect(mockQuery.select).not.toHaveBeenCalled();
  });

  it("returns the same 404 contract for an absent catalog row", async () => {
    row = null;
    const route = await import("./route");
    const response = await route.GET(
      { url: `http://localhost/api/suppliers/${supplierId}` } as never,
      { params: Promise.resolve({ id: supplierId }) },
    );
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "SUPPLIER_NOT_FOUND" });
  });

  it("disables direct catalog mutations", async () => {
    const route = await import("./route");
    const response = route.PATCH();
    expect(response.status).toBe(405);
  });
});
