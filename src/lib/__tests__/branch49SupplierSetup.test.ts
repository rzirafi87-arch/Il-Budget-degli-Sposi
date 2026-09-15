import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");

describe("Branch 49 supplier state and progressive setup", () => {
  it("lets users explicitly confirm or undo a saved supplier choice", () => {
    const source = read("src/app/[locale]/(routes)/fornitori/page.tsx");
    expect(source).toContain('method:"PATCH"');
    expect(source).toContain('current.status==="SELECTED"?"SAVED":"SELECTED"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('planningT("supplier.saveFirst")');
  });

  it("exposes selected suppliers in the current-event planning read model", () => {
    const source = read("src/app/api/my/planning-selections/route.ts");
    expect(source).toContain('from("saved_suppliers")');
    expect(source).toContain('.eq("status", "SELECTED")');
    expect(source).toContain('suppliers: suppliers.length > 0 ? "selected" : "undecided"');
  });

  it("derives progressive setup only from explicit event-private selection", () => {
    const source = read("src/app/api/event/resolve/route.ts");
    expect(source).toContain('from("saved_suppliers")');
    expect(source).toContain('.eq("status", "SELECTED")');
    expect(source).toContain('has_suppliers: (selectedSupplierCount || 0) > 0');
    expect(source).not.toContain('.not("supplier", "is", null)');
    expect(read("src/components/dashboard/ProgressiveSetup.tsx")).toContain('Boolean(event?.has_suppliers)');
  });

  it("renders supplier decision state on Dashboard without budget coupling", () => {
    const source = read("src/app/[locale]/(routes)/dashboard/page.tsx");
    expect(source).toContain("planningSelections.decision.suppliers");
    expect(source).toContain('planningT("supplier.selectedCount"');
    expect(source).toContain('href={`/${locale}/fornitori`}');
  });

  it.each(["it", "en", "es", "fr", "de"])("provides complete %s supplier vocabulary", (locale) => {
    const messages = JSON.parse(read(`src/messages/branch49Planning.${locale}.json`)).branch49Planning;
    expect(messages.supplier.selectedCount).toContain("{count");
    expect(messages.supplier.undecided).toBeTruthy();
    expect(messages.supplier.select).toBeTruthy();
    expect(messages.supplier.unselect).toBeTruthy();
    expect(messages.supplier.saveFirst).toBeTruthy();
    expect(messages.supplier.updateError).toBeTruthy();
    expect(messages.dashboard.suppliers).toBeTruthy();
    expect(messages.dashboard.openSuppliers).toBeTruthy();
  });
});
