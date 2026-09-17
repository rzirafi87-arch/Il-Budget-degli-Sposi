const mockExchangeCodeForSession = jest.fn();
const mockCreateServerClient = jest.fn(() => ({
  auth: { exchangeCodeForSession: mockExchangeCodeForSession },
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

function request(url: string) {
  return {
    url,
    cookies: { getAll: () => [] },
  } as unknown as import("next/server").NextRequest;
}

describe("PKCE auth callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.test";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
  });

  it("exchanges a valid code and preserves a safe internal destination", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const { GET } = await import("../auth/callback/route");
    const response = await GET(request("https://app.example.test/auth/callback?code=valid-code&next=%2Fen%2Fdashboard"));
    expect(response.status).toBe(302);
    expect(String(response.headers.get("location"))).toBe("https://app.example.test/en/dashboard");
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("valid-code");
  });

  it.each([
    ["missing", "https://app.example.test/auth/callback"],
    ["expired", "https://app.example.test/auth/callback?code=expired-code"],
    ["altered", "https://app.example.test/auth/callback?code=altered-code"],
  ])("rejects a %s confirmation code", async (kind, url) => {
    mockExchangeCodeForSession.mockResolvedValue({ error: kind === "missing" ? null : { code: "invalid_grant" } });
    const { GET } = await import("../auth/callback/route");
    const response = await GET(request(url));
    expect(response.status).toBe(302);
    expect(String(response.headers.get("location"))).toBe("https://app.example.test/it/auth?authError=invalid_link");
  });

  it("blocks an external redirect even when the code is valid", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const { GET } = await import("../auth/callback/route");
    const response = await GET(request("https://app.example.test/auth/callback?code=valid-code&next=https%3A%2F%2Fevil.example"));
    expect(String(response.headers.get("location"))).toBe("https://app.example.test/it/auth?confirmed=1");
  });
});
