import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 48 authenticated invitation return", () => {
  const invitationPage = read("src/app/[locale]/(routes)/invitation/page.tsx");
  const saveRoute = read("src/app/api/invitations/return/route.ts");
  const resumeRoute = read("src/app/api/invitations/resume/route.ts");
  const acceptRoute = read("src/app/api/invitations/accept/route.ts");

  it.each([
    "a user with no event",
    "a user with a pre-existing membership",
  ])("prioritizes the same pending invitation after login for %s", () => {
    expect(invitationPage).toContain('fetch("/api/invitations/return"');
    expect(invitationPage).toContain("invitationResumePath(locale)");
    expect(resumeRoute).toContain("INVITATION_RETURN_COOKIE");
    expect(resumeRoute).toContain("/invitation?token=");
    expect(saveRoute).not.toMatch(/resolveCurrentEvent|event_members|owner_id/);
  });

  it("keeps the token out of the auth return URL and in a short-lived HTTP-only cookie", () => {
    expect(invitationPage).not.toContain("encodeURIComponent(here)");
    expect(invitationPage).toContain("encodeURIComponent(resume)");
    expect(saveRoute).toMatch(/httpOnly:\s*true/);
    expect(saveRoute).toMatch(/sameSite:\s*"lax"/);
    expect(saveRoute).toMatch(/maxAge:\s*10 \* 60/);
    expect(resumeRoute).toContain("cookies.delete(INVITATION_RETURN_COOKIE)");
  });

  it("rejects external, altered, used, revoked and expired returns", () => {
    expect(saveRoute).toContain("isInvitationToken(body.token)");
    expect(saveRoute).toContain('data.status !== "pending"');
    expect(saveRoute).toContain('"INVITATION_ALREADY_USED"');
    expect(saveRoute).toContain('"INVITATION_EXPIRED"');
    expect(resumeRoute).toContain('locales.includes');
    expect(resumeRoute).not.toMatch(/new URL\(requestedLocale/);
  });

  it("accepts through the canonical atomic flow and updates CurrentEvent only after success", () => {
    expect(invitationPage).toContain('/api/invitations/${action}');
    expect(acceptRoute).toContain('rpc("accept_event_invitation"');
    expect(acceptRoute).toContain("CURRENT_EVENT_COOKIE");
    expect(acceptRoute.indexOf('if (error)')).toBeLessThan(acceptRoute.indexOf("response.cookies.set"));
  });
});
