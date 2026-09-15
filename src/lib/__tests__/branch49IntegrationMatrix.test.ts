import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const locales = ["it", "en", "es", "fr", "de"] as const;
const locationRoles = ["reception", "ceremony", "accommodation", "party", "other"] as const;

describe("Branch 49 release-candidate integration matrix", () => {
  it("keeps every private planning route authenticated and current-event scoped", () => {
    for (const route of ["churches", "locations", "suppliers", "planning-selections"]) {
      const source = read(`src/app/api/my/${route}/route.ts`);
      expect(source).toContain("requirePlanningSelectionAccess");
      expect(source).toMatch(/\.eq\("event_id", (eventId|event\.id)\)/);
      expect(source).not.toMatch(/body\.event_id|searchParams\.get\(["']event_id/);
    }
  });

  it("covers owner, partner and preserved legacy collaboration roles", () => {
    const authorization = read("src/lib/planningSelectionAuthorization.ts");
    for (const role of ["owner", "partner", "legacy"]) {
      expect(authorization).toContain(`${role}: { read: true, mutate: true }`);
    }
  });

  it("uses only canonical event-private relations for Dashboard decisions", () => {
    const readModel = read("src/app/api/my/planning-selections/route.ts");
    expect(readModel).toContain('from("saved_churches")');
    expect(readModel).toContain('from("saved_locations")');
    expect(readModel).toContain('from("saved_suppliers")');
    expect(readModel).not.toContain('from("expenses")');
    for (const role of locationRoles) expect(readModel).toContain(`"${role}"`);
  });

  it("keeps the supplier setup decision independent of budget and payment data", () => {
    const resolve = read("src/app/api/event/resolve/route.ts");
    expect(resolve).toContain('from("saved_suppliers")');
    expect(resolve).toContain('.eq("status", "SELECTED")');
    expect(resolve).not.toContain('.not("supplier", "is", null)');
    const supplierPage = read("src/app/[locale]/(routes)/fornitori/page.tsx");
    expect(supplierPage).not.toMatch(/budget_items|timeline_items|payment_reminders/);
  });

  it("retains accessible responsive decision controls at release widths", () => {
    const dashboard = read("src/app/[locale]/(routes)/dashboard/page.tsx");
    const suppliers = read("src/app/[locale]/(routes)/fornitori/page.tsx");
    expect(dashboard).toContain("md:grid-cols-2 xl:grid-cols-3");
    expect(dashboard).toContain('aria-label={planningT("dashboard.label")}');
    expect(suppliers).toContain('aria-live="polite"');
    const playwright = read("playwright.config.ts");
    for (const width of [320, 390, 430]) expect(playwright).toContain(String(width));
  });

  it("keeps the complete planning vocabulary structurally identical in all locales", () => {
    const dictionaries = locales.map((locale) => JSON.parse(read(`src/messages/branch49Planning.${locale}.json`)).branch49Planning);
    const keys = (value: unknown, prefix = ""): string[] => Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      return child && typeof child === "object" ? keys(child, next) : [next];
    });
    const sourceKeys = keys(dictionaries[0]).sort();
    for (const dictionary of dictionaries.slice(1)) expect(keys(dictionary).sort()).toEqual(sourceKeys);
  });

  it("does not activate deferred event types or introduce a Branch 49 migration", () => {
    const changed = read("docs/branch-49-planning-selections-dashboard-integration-audit.md");
    expect(changed).toContain("No new event type activation");
    expect(changed).toContain("Schema/migrations/DML/Production/event types: unchanged.");
    const migrations = fs.readdirSync(path.join(root, "supabase/migrations"));
    expect(migrations.some((name) => name.includes("branch_49"))).toBe(false);
  });
});
