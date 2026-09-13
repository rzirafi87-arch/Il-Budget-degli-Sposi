import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 47 first user experience", () => {
  it("blocks accidental event switches until explicit confirmation", () => {
    const source = read("src/components/CurrentEventSelector.tsx");
    expect(source).toContain('role="dialog"');
    expect(source).toContain("pendingEventId");
    expect(source).toContain("confirmSwitch");
    expect(source).toContain('localStorage.setItem("currentEventChangedAt"');
  });

  it("derives progressive setup from persisted current-event data", () => {
    const source = read("src/components/dashboard/ProgressiveSetup.tsx");
    expect(source).toContain('/api/event/resolve');
    expect(source).toContain("total_budget");
    expect(source).toContain("has_guests");
    expect(source).toContain("has_suppliers");
  });

  it("provides editable percentage and euro-based advisor output without zero-state noise", () => {
    const source = read("src/components/dashboard/BudgetAdvisor.tsx");
    expect(source).toContain('type="number"');
    expect(source).toContain("totalBudget <= 0");
    expect(source).toContain("reserve");
    expect(source).toContain("available");
  });

  it("keeps the honeymoon advisor interactive and localized", () => {
    const source = read("src/components/honeymoon/HoneymoonAdvisor.tsx");
    expect(source).toContain("branch47.honeymoon");
    expect(source).toContain("setBudget");
    expect(source).toContain("setDays");
    expect(source).toContain("setStyle");
  });
});
