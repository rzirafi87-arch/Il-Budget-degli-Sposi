jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({ json: async () => body, status: init?.status ?? 200, headers: init?.headers }) } }));

export {};

const calls: Array<[string, ...unknown[]]> = [];
function catalogQuery() {
  const query = {
    select: (value: string, options: unknown) => { calls.push(["select", value, options]); return query; },
    order: (column: string, options: unknown) => { calls.push(["order", column, options]); return query; },
    eq: (column: string, value: string) => { calls.push(["eq", column, value]); return query; },
    or: (value: string) => { calls.push(["or", value]); return query; },
    range: async (from: number, to: number) => { calls.push(["range", from, to]); return { data: [{ id: "location-1", name: "Villa Test" }], error: null, count: 25 }; },
  };
  return query;
}
const mockFrom = jest.fn(() => catalogQuery());
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({ from: mockFrom }) }));

describe("global location catalog API", () => {
  beforeEach(() => { calls.length = 0; mockFrom.mockClear(); });
  it("applies validated filters and bounded server pagination", async () => {
    const route = await import("./route");
    const response = await route.GET({ url: "http://localhost/api/locations?country=it&q=Villa%20Athena&type=resort&verification=VERIFIED&page=2&limit=999" } as never);
    const payload = await response.json() as { pagination: { page: number; limit: number; totalPages: number } };
    expect(response.status).toBe(200); expect(payload.pagination).toEqual(expect.objectContaining({ page: 2, limit: 24, totalPages: 2 }));
    expect(calls).toContainEqual(["eq", "country_code", "it"]); expect(calls).toContainEqual(["eq", "venue_type", "resort"]);
    expect(calls).toContainEqual(["eq", "verification_status", "VERIFIED"]); expect(calls).toContainEqual(["range", 24, 47]);
  });
  it("rejects invalid catalog filters before querying", async () => {
    const route = await import("./route"); const response = await route.GET({ url: "http://localhost/api/locations?country=italy" } as never);
    expect(response.status).toBe(400); expect(mockFrom).not.toHaveBeenCalled();
  });
  it("keeps global catalog writes server-only", async () => {
    const route = await import("./route"); const response = await route.POST(); expect(response.status).toBe(405); expect(response.headers).toEqual({ Allow: "GET" });
  });
});
