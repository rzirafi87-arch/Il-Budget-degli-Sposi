import { WEDDING_BUDGET_CATEGORIES } from "@/constants/budgetCategories";
const normalized=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
describe("wedding authoritative taxonomy",()=>{
 it("has unique normalized categories and rows",()=>{
  const categories=Object.keys(WEDDING_BUDGET_CATEGORIES).map(normalized);
  expect(new Set(categories).size).toBe(categories.length);
  for(const rows of Object.values(WEDDING_BUDGET_CATEGORIES)){
   const keys=rows.map(normalized); expect(new Set(keys).size).toBe(keys.length);
  }
 });
 it("models Wedding Bag as itemized flat-compatible subgroup",()=>{
  expect(WEDDING_BUDGET_CATEGORIES["Cerimonia/Chiesa Location"]).not.toContain("Wedding bag");
  expect(WEDDING_BUDGET_CATEGORIES["Cerimonia/Chiesa Location"]).not.toContain("Riso / Petali");
  expect(WEDDING_BUDGET_CATEGORIES["Wedding Bag"]).toHaveLength(9);
 });
 it("keeps Lista nozze out of travel costs",()=>expect(WEDDING_BUDGET_CATEGORIES["Viaggio di nozze"]).not.toContain("Lista nozze"));
});
