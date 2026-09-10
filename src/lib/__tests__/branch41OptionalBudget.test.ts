import fs from "node:fs";import path from "node:path";
describe("optional budget rows",()=>{
 const page=fs.readFileSync(path.join(process.cwd(),"src/app/[locale]/(routes)/idea-di-budget/page.tsx"),"utf8");
 const apply=fs.readFileSync(path.join(process.cwd(),"src/app/api/idea-di-budget/apply/route.ts"),"utf8");
 it("excludes disabled rows from totals and apply while retaining their values",()=>{
  const totals=fs.readFileSync(path.join(process.cwd(),"src/lib/budgetIdea.ts"),"utf8");
  expect(totals).toContain("row.enabled");
  expect(page).toContain("checked={row.enabled}");
  expect(apply).toContain("rows[index]?.enabled !== false");
 });
 it("provides a stacked mobile editor without mandatory horizontal scrolling",()=>{
  expect(page).toContain("inputMode=\"decimal\"");expect(page).toContain("min-w-0");expect(page).not.toContain("overflow-x-auto");
 });
});
