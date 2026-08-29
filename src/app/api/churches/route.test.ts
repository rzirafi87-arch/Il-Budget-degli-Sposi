jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      json: async () => body,
      status: init?.status ?? 200,
      headers: init?.headers,
    }),
  },
}));

const calls: Array<[string, ...unknown[]]> = [];

function catalogQuery() {
  const query = {
    select: (value: string, options: unknown) => { calls.push(["select", value, options]); return query; },
    order: (column: string, options: unknown) => { calls.push(["order", column, options]); return query; },
    eq: (column: string, value: string) => { calls.push(["eq", column, value]); return query; },
    or: (value: string) => { calls.push(["or", value]); return query; },
    range: async (from: number, to: number) => {
      calls.push(["range", from, to]);
      return { data: [{ id: "church-1", name: "Cattedrale" }], error: null, count: 25 };
    },
  };
  return query;
}

const mockFrom = jest.fn(() => catalogQuery());
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({ from: mockFrom }),
}));

describe("global church catalog API", () => {
  beforeEach(() => { calls.length = 0; mockFrom.mockClear(); });

  it("validates filters and applies bounded server-side pagination", async () => {
    const route = await import("./route");
    const response = await route.GET({ url: "http://localhost/api/churches?country=it&q=Sant%27Agata&page=2&limit=999" } as never);
    const payload = await response.json() as { pagination: { page: number; limit: number; totalPages: number } };
    expect(response.status).toBe(200);
    expect(payload.pagination).toEqual(expect.objectContaining({ page: 2, limit: 24, totalPages: 2 }));
    expect(calls).toContainEqual(["eq", "country_code", "it"]);
    expect(calls).toContainEqual(["range", 24, 47]);
    expect(calls.find(([method]) => method === "or")?.[1]).toContain("sant agata");
  });

  it("rejects an invalid country before querying the database", async () => {
    const route = await import("./route");
    const response = await route.GET({ url: "http://localhost/api/churches?country=italy" } as never);
    expect(response.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("does not allow direct catalog submissions", async () => {
    const route = await import("./route");
    const response = await route.POST();
    expect(response.status).toBe(405);
    expect(response.headers).toEqual({ Allow: "GET" });
  });
});
