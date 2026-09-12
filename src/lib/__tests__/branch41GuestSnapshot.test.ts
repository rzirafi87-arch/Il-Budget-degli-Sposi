import fs from "node:fs";
import path from "node:path";

describe("Branch 41 guest snapshot contract", () => {
  const route = fs.readFileSync(path.join(process.cwd(), "src/app/api/my/guests/route.ts"), "utf8");
  const migration = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/20260908213000_branch_41_beta_feedback_stabilization.sql"), "utf8");
  const permissionFix = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/20260909035000_branch_41_guest_snapshot_permissions.sql"), "utf8");

  it("uses one transactional RPC and never delete/reinsert chains in the route", () => {
    expect(route).toContain('db.rpc("save_event_guest_snapshot"');
    expect(route).not.toMatch(/from\("family_groups"\)\.delete/);
    expect(route).not.toMatch(/from\("guests"\)\.delete/);
  });

  it("never returns success when the database reports an error", () => {
    expect(route).toContain("if (error)");
    expect(route).toContain('fail("GUEST_SNAPSHOT_SAVE_FAILED")');
    expect(route).not.toContain("nessun dato è stato modificato");
  });

  it("returns stable presentation-independent validation codes", () => {
    expect(route).toContain('fail("GUEST_SNAPSHOT_INVALID", 400)');
    expect(route).toContain('fail("GUEST_SNAPSHOT_TOO_LARGE", 413)');
  });

  it("preserves IDs, resolves temporary relations, partner access and event isolation", () => {
    expect(migration).toContain("family_map");
    expect(migration).toContain("guest_map");
    expect(migration).toContain("e.owner_id = p_user_id");
    expect(migration).toContain("e.bride_email");
    expect(migration).toContain("e.groom_email");
    expect(migration).toContain("where id=actual_id and event_id=p_event_id");
  });

  it("orders families, guests, main contacts and deletions safely", () => {
    const families = migration.indexOf("-- Families first");
    const guests = migration.indexOf("-- Guests second");
    const circular = migration.indexOf("-- Complete the circular reference");
    const deletion = migration.indexOf("-- Delete only rows omitted");
    expect(families).toBeLessThan(guests);
    expect(guests).toBeLessThan(circular);
    expect(circular).toBeLessThan(deletion);
  });

  it("maps structured allergies in both read and write paths", () => {
    expect(route).toContain("allergiesIntolerances: g.allergies_intolerances");
    expect(migration).toContain("allergies_intolerances=excluded.allergies_intolerances");
  });

  it("can read auth.users as the backend while remaining service-role-only", () => {
    expect(permissionFix).toContain("security definer");
    expect(permissionFix).toContain("from public, anon, authenticated");
    expect(permissionFix).toContain("to service_role");
  });
});
