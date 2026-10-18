/** @jest-environment node */
jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: { status?: number }) => ({ json: async () => body, status: init?.status ?? 200 }) },
}));

const calls: Array<[string, unknown[]]> = [];
const builder: Record<string, unknown> = {};
for (const method of ["select", "or", "eq", "ilike", "gte", "order", "range"]) {
  builder[method] = (...args: unknown[]) => { calls.push([method, args]); return builder; };
}
builder.then = (resolve: (value: unknown) => unknown) => resolve({ data: [], error: null, count: 0 });
const mockFrom = jest.fn(() => builder);
jest.mock("@/lib/supabaseServer", () => ({ getServiceClient: () => ({ from: mockFrom, rpc: jest.fn() }) }));

import { GET } from "./route";

const request = (query: string) => ({ url: `http://localhost/api/vendors?${query}`, headers: new Headers() }) as never;

describe("public vendor explorer hides sources pending a terms review", () => {
  beforeEach(() => { calls.length = 0; mockFrom.mockClear(); });

  it("always excludes Google-sourced rows from the public view", async () => {
    const response = await GET(request("type=location&region=Sicilia"));
    expect(response.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith("vendors_with_places");
    expect(calls).toContainEqual(["or", ["source.is.null,source.not.in.(google)"]]);
  });

  it("returns nothing when Google rows are requested explicitly", async () => {
    const response = await GET(request("type=photographer&source=google"));
    const body = (await response.json()) as { data: unknown[]; pagination: { total: number } };
    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
