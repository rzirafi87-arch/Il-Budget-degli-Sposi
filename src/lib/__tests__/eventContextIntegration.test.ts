import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const criticalRoutes = [
  "src/app/api/my/dashboard/route.ts",
  "src/app/api/budget-items/route.ts",
  "src/app/api/budget-ideas/route.ts",
  "src/app/api/idea-di-budget/route.ts",
  "src/app/api/my/guests/route.ts",
  "src/app/api/my/expenses/route.ts",
  "src/app/api/my/incomes/route.ts",
  "src/app/api/my/churches/route.ts",
  "src/app/api/my/locations/route.ts",
  "src/app/api/my/suppliers/route.ts",
  "src/app/api/my/timeline/route.ts",
  "src/app/api/my/appointments/route.ts",
  "src/app/api/my/tables/route.ts",
  "src/app/api/wedding-card/route.ts",
];

describe("private module event-context integration", () => {
  test.each(criticalRoutes)("%s uses the authoritative resolver", (relativePath) => {
    const source = fs.readFileSync(path.join(root, relativePath), "utf8");
    expect(source).toMatch(/require(CurrentEvent|ServerCurrentEvent)/);
    expect(source).not.toMatch(/\.eq\(["']owner_id["'][\s\S]{0,220}\.limit\(1\)/);
  });

  it("keeps the localized compatibility endpoint current-event aware for authenticated calls", () => {
    const source = fs.readFileSync(path.join(root, "src/app/api/my/wedding/localized/route.ts"), "utf8");
    expect(source).toContain("requireCurrentEvent(req, userId)");
    expect(source).toContain("EVENT_COMING_SOON");
  });

  it("does not retain a normal owner_id to first-event resolver", () => {
    const apiRoot = path.join(root, "src/app/api");
    const files: string[] = [];
    const visit = (directory: string) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(target);
        else if (entry.name.endsWith(".ts")) files.push(target);
      }
    };
    visit(apiRoot);
    const violations = files.filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      return /\.from\(["']events["']\)[\s\S]{0,500}\.eq\(["']owner_id["'][\s\S]{0,500}\.limit\(1\)/.test(source);
    });
    expect(violations).toEqual([]);
  });
});
