import fs from "node:fs";
import path from "node:path";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      body, status: init?.status ?? 200, headers: init?.headers ?? {},
    }),
  },
}));

describe("Branch 48 lifecycle endpoint foundation", () => {
  it("keeps GET read-only and rejects it with the stable method code", async () => {
    const route = await import("./new/route");
    const response = await route.GET();
    expect(response).toMatchObject({
      status: 405,
      body: { ok: false, code: "METHOD_NOT_ALLOWED", error: "METHOD_NOT_ALLOWED" },
      headers: { Allow: "POST" },
    });
  });

  it("makes every legacy creation route an alias of the canonical POST", async () => {
    const canonical = await import("./ensure-default/route");
    const legacyNew = await import("./new/route");
    const legacyCreate = await import("./create/route");
    const coreNew = await import("../event-core/new/route");
    expect(legacyNew.POST).toBe(canonical.POST);
    expect(legacyCreate.POST).toBe(canonical.POST);
    expect(coreNew.POST).toBe(canonical.POST);
  });

  it("has no unsafe any cast in lifecycle endpoints", () => {
    const roots = [
      "src/app/api/event/ensure-default/route.ts",
      "src/app/api/event/new/route.ts",
      "src/app/api/event/create/route.ts",
      "src/app/api/event/update/route.ts",
      "src/app/api/event-core/new/route.ts",
    ];
    for (const relative of roots) {
      expect(fs.readFileSync(path.join(process.cwd(), relative), "utf8")).not.toMatch(/\bas any\b|no-explicit-any/);
    }
  });

  it("uses only the canonical endpoint from the event-type UI", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/app/[locale]/(routes)/select-event-type/page.tsx"), "utf8",
    );
    expect(source).toContain('fetch("/api/event/ensure-default"');
    expect(source).not.toMatch(/\/api\/event\/(?:new|create)/);
  });

  it("adds an additive row-preserving owner immutability trigger", () => {
    const migration = fs.readFileSync(
      path.join(process.cwd(), "supabase/migrations/20260914110000_branch_48_owner_immutability.sql"), "utf8",
    );
    expect(migration).toContain("before update of owner_id");
    expect(migration).toContain("EVENT_OWNER_IMMUTABLE");
    expect(migration).not.toMatch(/\b(?:delete|truncate)\s+from\s+public\.(?:events|suppliers)\b/i);
  });
});
