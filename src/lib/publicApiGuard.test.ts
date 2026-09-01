import { checkPublicRateLimit, PUBLIC_CATALOG_CACHE } from "./publicApiGuard";

describe("public API hardening", () => {
  it("allows 60 requests and rejects the next one per scope and client", () => {
    const request = { headers: new Headers({ "x-forwarded-for": "203.0.113.33" }) };
    for (let i = 0; i < 60; i += 1) expect(checkPublicRateLimit(request, "test", 1_000).allowed).toBe(true);
    expect(checkPublicRateLimit(request, "test", 1_000).allowed).toBe(false);
  });

  it("isolates scopes and resets the window", () => {
    const request = { headers: new Headers({ "x-real-ip": "198.51.100.5" }) };
    expect(checkPublicRateLimit(request, "a", 10_000).allowed).toBe(true);
    expect(checkPublicRateLimit(request, "b", 10_000).allowed).toBe(true);
    expect(checkPublicRateLimit(request, "a", 71_000).allowed).toBe(true);
  });

  it("uses shared caching only for explicitly public catalog responses", () => {
    expect(PUBLIC_CATALOG_CACHE).toBe("public, s-maxage=30, stale-while-revalidate=120");
  });
});
