export {};

const mockGetUser = jest.fn();

jest.mock("@/lib/supabaseServer", () => ({
  getServiceClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

import { requireAdminUser, requireUser } from "@/lib/apiAuth";

function request(authorization?: string) {
  return {
    headers: new Headers(authorization ? { authorization } : {}),
  } as import("next/server").NextRequest;
}

describe("requireUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a request without a bearer token before calling Supabase", async () => {
    await expect(requireUser(request())).rejects.toThrow("Missing JWT");
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns only the user id verified by Supabase", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "verified-user" } },
      error: null,
    });

    await expect(requireUser(request("Bearer valid-jwt"))).resolves.toEqual({
      userId: "verified-user",
    });
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockGetUser).toHaveBeenCalledWith("valid-jwt");
  });

  it("rejects a token that Supabase does not validate", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });

    await expect(requireUser(request("Bearer invalid-jwt"))).rejects.toThrow(
      "Invalid JWT"
    );
    expect(mockGetUser).toHaveBeenCalledWith("invalid-jwt");
  });
});

describe("requireAdminUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts an admin role only from verified app metadata", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "admin-user", app_metadata: { role: "admin" } } },
      error: null,
    });

    await expect(requireAdminUser(request("Bearer valid-jwt"))).resolves.toEqual({
      userId: "admin-user",
      role: "admin",
    });
  });

  it("rejects authenticated users without the admin app role", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "regular-user",
          app_metadata: {},
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });

    await expect(requireAdminUser(request("Bearer valid-jwt"))).rejects.toThrow("Forbidden");
  });
});
