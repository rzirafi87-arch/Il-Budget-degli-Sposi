import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Branch 39 production readiness", () => {
  it("ships conservative security headers", () => {
    const config = read("next.config.ts");
    for (const header of ["Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) expect(config).toContain(header);
  });
  it("gates analytics behind explicit consent", () => {
    expect(read("src/app/[locale]/layout.tsx")).toContain("ConsentAwareAnalytics");
    expect(read("src/components/ConsentAwareAnalytics.tsx")).toContain('consent === "granted"');
  });
  it("uses a distributed rate-limit RPC for sensitive auth endpoints", () => {
    expect(read("src/lib/authRateLimit.ts")).toContain('rpc("consume_rate_limit"');
    for (const route of ["register", "resend", "recovery"]) expect(read(`src/app/api/auth/${route}/route.ts`)).toContain("await checkAuthRateLimit");
  });
  it("provides a guarded cancellable deletion request", () => {
    const route = read("src/app/api/my/account-deletion/route.ts");
    expect(route).toContain('body?.confirmation !== "DELETE"');
    expect(route).toContain("7 * 24 * 60 * 60 * 1000");
    expect(route).toContain("export async function DELETE");
  });
  it("rebuilds Branch 38 and Branch 39 migrations", () => {
    const workflow = read(".github/workflows/database-rebuild.yml");
    expect(workflow).toContain("20260903111500_branch_38_expense_runtime_alignment.sql");
    expect(workflow).toContain("20260908090000_branch_39_production_readiness.sql");
  });
});
