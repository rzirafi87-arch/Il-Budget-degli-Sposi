import { authErrorMessage, safeInternalPath } from "../auth";

describe("auth safety helpers", () => {
  it("allows only internal redirect paths", () => {
    expect(safeInternalPath("/it/dashboard")).toBe("/it/dashboard");
    expect(safeInternalPath("//evil.example")).toBe("/");
    expect(safeInternalPath("https://evil.example")).toBe("/");
    expect(safeInternalPath("/\\evil.example")).toBe("/");
  });

  it("maps Supabase errors without exposing raw details", () => {
    expect(authErrorMessage("Email not confirmed")).toBe("Devi prima confermare il tuo indirizzo email.");
    expect(authErrorMessage("Invalid login credentials")).toBe("Email o password non corretti.");
    expect(authErrorMessage("internal database detail")).not.toContain("database");
  });
});
