import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 51 Milestone 2 route hardening", () => {
  it.each([
    "src/app/api/event/update/route.ts",
    "src/app/api/event/update-budget/route.ts",
    "src/app/api/ceremony/route.ts",
  ])("uses canonical collaborative event access and sanitized failures: %s", (file) => {
    const source = read(file);
    expect(source).toContain('requireEventAccess(req, "owner-or-partner")');
    expect(source).not.toContain("auth.getUser(");
    expect(source).not.toMatch(/error:\s*(?:upErr|wcErr|e2|error)\.message/);
  });

  it("makes public share-token creation owner-only and binds the RPC to the authorized event", () => {
    const source = read("src/app/api/share/new/route.ts");
    expect(source).toContain('requireEventAccess(req, "owner-only", explicitEventId)');
    expect(source).toContain("public_id: event.public_id");
    expect(source).toContain("p_token: null");
    expect(source).not.toContain('role !== "editor"');
    expect(source).not.toMatch(/error:\s*error\.message/);
  });

  it("binds every persisted gift-list operation to the resolved event", () => {
    const source = read("src/app/api/my/gift-list/route.ts");
    expect(source.match(/requireEventAccess\(req, "owner-or-partner"\)/g)).toHaveLength(4);
    expect(source.match(/\.eq\("event_id", currentEvent\.eventId\)/g)?.length).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain('.eq("user_id", userId)');
    expect(source).not.toMatch(/error:\s*error\.message/);
  });

  it("never accepts owner_id from any hardened route payload", () => {
    for (const file of [
      "src/app/api/event/update/route.ts",
      "src/app/api/event/update-budget/route.ts",
      "src/app/api/ceremony/route.ts",
      "src/app/api/my/gift-list/route.ts",
      "src/app/api/share/new/route.ts",
    ]) {
      expect(read(file)).not.toMatch(/body\.owner_id|owner_id:\s*body/);
    }
  });
});
