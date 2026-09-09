import fs from "node:fs";
import path from "node:path";

describe("Branch 41 authenticated mobile header", () => {
  const shell = fs.readFileSync(path.join(process.cwd(), "src/components/ClientLayoutShell.tsx"), "utf8");
  const userMenu = fs.readFileSync(path.join(process.cwd(), "src/components/UserMenu.tsx"), "utf8");

  it("keeps the mobile brand and authenticated actions inside the viewport", () => {
    expect(shell).toContain("hidden truncate text-lg");
    expect(shell).toContain("flex min-w-0 shrink-0 items-center");
    expect(userMenu).toContain('className="truncate"');
    expect(userMenu).toContain('className: "max-w-40 sm:max-w-60"');
  });
});
