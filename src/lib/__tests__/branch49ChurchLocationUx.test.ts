import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const roles = ["reception", "ceremony", "accommodation", "party", "other"];

describe("Branch 49 Church and Location UX", () => {
  it("surfaces an accessible Church decision summary", () => {
    const source = read("src/app/[locale]/(routes)/chiese/page.tsx");
    expect(source).toContain('useTranslations("branch49Planning")');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('planningT(`church.${churchDecision}`)');
  });

  it("supports every canonical Location role without changing stored role names", () => {
    const source = read("src/app/[locale]/(routes)/location/page.tsx");
    for (const role of roles) expect(source).toContain(`"${role}"`);
    expect(source).toContain('location_role: locationRole');
    expect(source).toContain('get("role")');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain("setSaved({})");
  });

  it("renders current-event Church and all Location decisions on Dashboard", () => {
    const source = read("src/app/[locale]/(routes)/dashboard/page.tsx");
    expect(source).toContain("LOCATION_ROLES.map");
    expect(source).toContain("planningSelections.decision.church");
    expect(source).toContain("planningSelections.decision.locationsByRole[role]");
    expect(source).toContain("location?role=${role}");
    expect(source).toContain('aria-label={planningT("dashboard.label")}');
  });

  it.each(["it", "en", "es", "fr", "de"])("provides the complete %s planning vocabulary", (locale) => {
    const messages = JSON.parse(read(`src/messages/branch49Planning.${locale}.json`)).branch49Planning;
    expect(messages.status.undecided).toBeTruthy();
    expect(messages.status.selected).toBeTruthy();
    expect(messages.church.selected).toBeTruthy();
    expect(messages.church.undecided).toBeTruthy();
    expect(messages.location.roleLabel).toBeTruthy();
    for (const role of roles) expect(messages.location.roles[role]).toBeTruthy();
    expect(messages.dashboard.openChurches).toBeTruthy();
    expect(messages.dashboard.openLocations).toBeTruthy();
  });
});
