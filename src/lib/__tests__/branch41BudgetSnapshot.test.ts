import fs from "node:fs";
import path from "node:path";

describe("Branch 41 budget snapshot contract", () => {
  const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/idea-di-budget/route.ts"), "utf8");
  const migration = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/20260909042500_branch_41_budget_snapshot.sql"), "utf8");

  it("replaces the N+1 delete/insert chain with one transactional RPC", () => {
    expect(route).toContain('db.rpc("save_budget_idea_snapshot"');
    expect(route).not.toMatch(/from\("expenses"\)\s*\.delete/);
    expect(migration).toContain("create or replace function public.save_budget_idea_snapshot");
  });

  it("reports a localizable failure without claiming that partial data was saved", () => {
    expect(route).toContain("if (snapshotError)");
    expect(route).toContain('{ error: "BUDGET_IDEA_SAVE_FAILED", code: snapshotError.code || null }');
    expect(route).not.toContain("nessun dato è stato modificato");
  });

  it("keeps the privileged RPC service-role-only and validates couple access", () => {
    expect(migration).toContain("security definer");
    expect(migration).toContain("e.owner_id = p_user_id");
    expect(migration).toContain("e.bride_email");
    expect(migration).toContain("e.groom_email");
    expect(migration).toContain("from public, anon, authenticated");
    expect(migration).toContain("to service_role");
  });
});
