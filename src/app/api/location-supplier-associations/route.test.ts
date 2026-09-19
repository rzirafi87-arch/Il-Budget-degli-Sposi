jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({ json: async () => body, status: init?.status ?? 200, headers: init?.headers }) },
}));
export {};

const queryLog: Array<{ projection?: string; filters: Array<{ column: string; value: string }> }> = [];
const association = {
  supplier_id: "52330000-0000-4000-8000-000000000001",
  location_id: "52330000-0000-4000-8000-000000000002",
  relationship_type: "recommended",
  source: "curated",
  source_url: null,
  verified_at: null,
  created_at: "2026-09-19",
  supplier: { id: "52330000-0000-4000-8000-000000000001", name: "Supplier" },
  location: { id: "52330000-0000-4000-8000-000000000002", name: "Location" },
};

function mockQuery() {
  const record: { projection?: string; filters: Array<{ column: string; value: string }> } = { filters: [] };
  const chain: {
    select: jest.Mock;
    order: jest.Mock;
    eq: jest.Mock;
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => Promise<unknown>;
  } = {
    select: jest.fn((projection: string) => { record.projection = projection; return chain; }),
    order: jest.fn(() => chain),
    eq: jest.fn((column: string, value: string) => { record.filters.push({ column, value }); return chain; }),
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => {
      queryLog.push(record);
      const matches = record.filters.every(({ column, value }) => association[column as keyof typeof association] === value);
      return Promise.resolve(resolve({ data: matches ? [association] : [], error: null }));
    },
  };
  return chain;
}

jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({ from: () => mockQuery() }) }));

function request(url: string) { return { nextUrl: new URL(url) } as unknown as import("next/server").NextRequest; }

describe("global Location-Supplier associations API", () => {
  beforeEach(() => { queryLog.length = 0; });

  it("reads curated associations by location with an explicit projection", async () => {
    const route = await import("./route");
    const response = await route.GET(request(`http://localhost/api/location-supplier-associations?location_id=${association.location_id}`));
    expect(response.status).toBe(200);
    expect((await response.json()).associations).toHaveLength(1);
    expect(queryLog[0].projection).not.toContain("*");
    expect(queryLog[0].filters).toEqual([{ column: "location_id", value: association.location_id }]);
  });

  it("requires and validates filters before database access", async () => {
    const route = await import("./route");
    expect((await route.GET(request("http://localhost/api/location-supplier-associations"))).status).toBe(400);
    expect((await route.GET(request("http://localhost/api/location-supplier-associations?supplier_id=invalid"))).status).toBe(400);
    expect(queryLog).toHaveLength(0);
  });

  it("keeps global associations read-only for the normal client", async () => {
    const route = await import("./route");
    expect((await route.POST()).status).toBe(405);
    expect((await route.PATCH()).status).toBe(405);
    expect((await route.DELETE()).status).toBe(405);
  });
});
