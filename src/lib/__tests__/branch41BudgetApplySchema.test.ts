import fs from "node:fs";
import path from "node:path";

describe("Branch 41 Idea di Budget apply schema", () => {
  const applyRoute = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/idea-di-budget/apply/route.ts"),
    "utf8",
  );
  const migration = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/20260909040500_branch_41_budget_items_spend_type.sql"),
    "utf8",
  );

  it("persists the contributor field required by the apply route", () => {
    expect(applyRoute).toContain("spend_type: it.spend_type");
    expect(migration).toContain("add column if not exists spend_type text not null default 'common'");
  });

  it("continues to exclude optional rows before insertion", () => {
    expect(applyRoute).toContain("rows[index]?.enabled !== false");
  });
});

