import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 40 public launch enablement", () => {
  it("resolves the canonical origin from deployment configuration", () => {
    const brand = read("config/brand.ts");
    expect(brand).toContain("VERCEL_PROJECT_PRODUCTION_URL");
    expect(read("src/app/[locale]/page.tsx")).toContain("getSiteUrl()");
    expect(read("src/app/robots.ts")).toContain("getSiteUrl()");
    expect(read("src/app/sitemap.ts")).toContain("getSiteUrl()");
  });

  it("keeps private localized routes out of crawling and the sitemap", () => {
    const robots = read("src/app/robots.ts");
    for (const route of ["/*/dashboard", "/*/profilo", "/*/select-event-type"]) {
      expect(robots).toContain(route);
    }
    expect(read("src/app/sitemap.ts")).not.toContain('"/save-the-date"');
  });

  it("allows analytics consent to be changed or revoked", () => {
    const consent = read("src/components/ConsentAwareAnalytics.tsx");
    expect(consent).toContain('consent === "granted"');
    expect(consent).toContain("open-cookie-preferences");
    expect(consent).toContain('value === "denied"');
    expect(read("src/components/CookiePreferencesButton.tsx")).toContain("COOKIE_PREFERENCES_EVENT");
  });

  it("documents non-invented launch prerequisites and safe operations", () => {
    const runbook = read("docs/branch-40-public-launch-go-live.md");
    for (const required of [
      "EXTERNAL ACTION REQUIRED",
      "onboarding@resend.dev",
      "Restore into an isolated recovery project",
      "No real account is used in tests",
      "CSP report-only inventory",
    ]) expect(runbook).toContain(required);
  });
});
