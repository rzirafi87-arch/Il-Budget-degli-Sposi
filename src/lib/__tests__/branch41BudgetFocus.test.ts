import fs from "node:fs";import path from "node:path";
describe("budget focus runtime compatibility",()=>{it("uses a public RPC instead of requesting an unexposed schema",()=>{const source=fs.readFileSync(path.join(process.cwd(),"src/app/api/my/wedding/budget-focus/route.ts"),"utf8");expect(source).toContain('rpc("get_wedding_budget_focus"');expect(source).not.toContain('.schema("app")');});});
