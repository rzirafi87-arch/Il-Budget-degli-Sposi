jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      body,
      status: init?.status ?? 200,
      headers: new Headers(init?.headers),
    }),
  },
}));

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: jest.fn(() => { throw new Error("database must not be reached"); }),
}));

describe("subscription write boundary", () => {
  it("rejects client-authored completed transactions while payments are disabled", async () => {
    const { POST } = await import("./subscription-transactions/route");
    const response = await POST({} as never) as unknown as {
      body: unknown;
      status: number;
      headers: Headers;
    };
    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.body).toEqual({ error: "FEATURE_DISABLED", feature: "payments" });
  });
});
