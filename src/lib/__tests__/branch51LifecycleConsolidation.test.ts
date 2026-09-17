import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Branch 51 lifecycle and legacy endpoint consolidation", () => {
  it("keeps one canonical event creator and three thin compatibility aliases", () => {
    expect(read("src/app/api/event/create/route.ts")).toContain('export { POST } from "../ensure-default/route"');
    expect(read("src/app/api/event-core/new/route.ts")).toContain('export { POST } from "../../event/ensure-default/route"');
    expect(read("src/app/api/event/new/route.ts")).toContain('canonicalCreate');
    expect(read("src/app/api/event/new/route.ts")).toContain('status: 405');
  });

  it.each([
    ["baby-shower", "BABY_SHOWER_META"],
    ["birthday", "BIRTHDAY_META"],
    ["engagement-party", "ENGAGEMENT_PARTY_META"],
  ])("uses the shared typed get/init core for %s", (family, meta) => {
    const getRoute = read(`src/app/api/events/${family}/get/route.ts`);
    const initRoute = read(`src/app/api/events/${family}/init/route.ts`);
    expect(getRoute).toContain("getLegacyEventBudget");
    expect(initRoute).toContain("initializeLegacyEventBudget");
    expect(initRoute).toContain(meta);
    expect(getRoute).not.toContain('select("*")');
    expect(initRoute).not.toContain('select("*")');
  });

  it("centralizes auth, validation, idempotent conflict handling and explicit response fields", () => {
    const core = read("src/lib/legacyEventBudget.ts");
    expect(core).toContain("requireSession(req)");
    expect(core).toContain("INVALID_CURRENCY");
    expect(core).toContain('onConflict: "user_id,event_key"');
    expect(core).toContain("ignoreDuplicates: true");
    expect(core).toContain("id,user_id,event_key,currency,lines,created_at,updated_at");
    expect(core).not.toContain('select("*")');
    expect(core).not.toContain("as any");
  });

  it("does not introduce browser callers for legacy budget aliases", () => {
    const browserFiles = ["src/components", "src/app"].flatMap((base) =>
      fs.readdirSync(path.join(root, base), { recursive: true })
        .filter((entry): entry is string => typeof entry === "string" && /\.(ts|tsx)$/.test(entry))
        .map((entry) => path.join(root, base, entry)),
    );
    const routePattern = /\/api\/events\/(baby-shower|birthday|engagement-party)\/(get|init)/;
    const callers = browserFiles.filter((file) =>
      fs.statSync(file).isFile() && routePattern.test(fs.readFileSync(file, "utf8")),
    );
    expect(callers).toEqual([]);
  });
});
