import { authErrorKey, invitationResumePath, isInvitationToken, safeInternalPath } from "../auth";

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

  it("accepts only bounded opaque invitation tokens and builds an internal resume route", () => {
    expect(isInvitationToken("a".repeat(32))).toBe(true);
    expect(isInvitationToken("a".repeat(31))).toBe(false);
    expect(isInvitationToken("a".repeat(257))).toBe(false);
    expect(isInvitationToken("token/../../external.example".repeat(2))).toBe(false);
    expect(invitationResumePath("it")).toBe("/api/invitations/resume?locale=it");
    expect(safeInternalPath(invitationResumePath("it"))).toBe("/api/invitations/resume?locale=it");
  });
});
