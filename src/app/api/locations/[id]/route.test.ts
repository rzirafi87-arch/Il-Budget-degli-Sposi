jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({ json: async () => body, status: init?.status ?? 200, headers: init?.headers }) },
}));
export {};

const locationId = "52330000-0000-4000-8000-000000000010";
let mockLookupId = "";
let mockProjection = "";
jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    from: () => {
      const chain: { select: jest.Mock; eq: jest.Mock; maybeSingle: jest.Mock } = {
        select: jest.fn((value: string) => { mockProjection = value; return chain; }),
        eq: jest.fn((_column: string, value: string) => { mockLookupId = value; return chain; }),
        maybeSingle: jest.fn(async () => ({ data: mockLookupId === locationId ? { id: locationId, name: "Venue" } : null, error: null })),
      };
      return chain;
    },
  }),
}));

describe("global location detail API", () => {
  beforeEach(() => { mockLookupId = ""; mockProjection = ""; });

  it("returns a real location using only explicit schema columns", async () => {
    const route = await import("./route");
    const response = await route.GET({} as never, { params: Promise.resolve({ id: locationId }) });
    expect(response.status).toBe(200);
    expect((await response.json()).location.name).toBe("Venue");
    expect(mockProjection).not.toContain("*");
  });

  it("returns stable validation and not-found errors and blocks writes", async () => {
    const route = await import("./route");
    expect((await route.GET({} as never, { params: Promise.resolve({ id: "invalid" }) })).status).toBe(400);
    expect((await route.GET({} as never, { params: Promise.resolve({ id: "52330000-0000-4000-8000-000000000011" }) })).status).toBe(404);
    expect((await route.POST()).status).toBe(405);
    expect((await route.DELETE()).status).toBe(405);
  });
});
