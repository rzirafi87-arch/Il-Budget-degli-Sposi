import fs from "node:fs";import path from "node:path";
describe("optional budget rows",()=>{
 const page=fs.readFileSync(path.join(process.cwd(),"src/app/[locale]/(routes)/idea-di-budget/page.tsx"),"utf8");
 const apply=fs.readFileSync(path.join(process.cwd(),"src/app/api/idea-di-budget/apply/route.ts"),"utf8");
 it("excludes disabled rows from totals and apply while retaining their values",()=>{
  expect(page).toContain("row.enabled ? toNumber(row.amount) : 0");
  expect(page).toContain("rows.filter((row) => row.enabled)");
  expect(page).toContain("enabled: row.enabled");
  expect(apply).toContain("rows[index]?.enabled !== false");
 });
 it("provides a stacked mobile editor without mandatory horizontal scrolling",()=>{
  expect(page).toContain("md:hidden");expect(page).toContain("inputMode=\"decimal\"");expect(page).toContain("md:block");
 });
});
