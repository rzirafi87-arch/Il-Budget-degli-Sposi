import { authErrorKey, safeInternalPath } from "../auth";

describe("auth safety helpers", () => {
  it("allows only internal redirect paths", () => {
    expect(safeInternalPath("/it/dashboard")).toBe("/it/dashboard");
    expect(safeInternalPath("//evil.example")).toBe("/");
    expect(safeInternalPath("https://evil.example")).toBe("/");
    expect(safeInternalPath("/\\evil.example")).toBe("/");
  });

  it("maps Supabase errors without exposing raw details", () => {
    expect(authErrorKey("Email not confirmed")).toBe("emailNotConfirmed");
    expect(authErrorKey("Invalid login credentials")).toBe("invalidCredentials");
    expect(authErrorKey("internal database detail")).toBe("generic");
  });
});
