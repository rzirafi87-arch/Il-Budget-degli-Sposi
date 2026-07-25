export {};

import { requireAdminSync } from "@/lib/adminSyncAuth";

function request(authorization?: string) {
  return {
    headers: new Headers(authorization ? { authorization } : {}),
  } as import("next/server").NextRequest;
}

describe("requireAdminSync", () => {
  const originalSecret = process.env.ADMIN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ADMIN_SYNC_SECRET = "test-admin-secret";
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.ADMIN_SYNC_SECRET;
    } else {
      process.env.ADMIN_SYNC_SECRET = originalSecret;
    }
  });

  it("rejects a missing authorization header", () => {
    expect(() => requireAdminSync(request())).toThrow("Unauthorized");
  });

  it("rejects an invalid bearer secret", () => {
    expect(() => requireAdminSync(request("Bearer wrong-secret"))).toThrow(
      "Unauthorized",
    );
  });

  it("rejects requests when the server secret is not configured", () => {
    delete process.env.ADMIN_SYNC_SECRET;
    expect(() =>
      requireAdminSync(request("Bearer test-admin-secret")),
    ).toThrow("Unauthorized");
  });

  it("accepts the exact configured bearer secret", () => {
    expect(() =>
      requireAdminSync(request("Bearer test-admin-secret")),
    ).not.toThrow();
  });
});
