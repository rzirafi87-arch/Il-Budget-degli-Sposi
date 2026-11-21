import {compareBudgetItems} from "../budgetComparison";
test("reconciles legacy names with category/subcategory expenses",()=>{
  expect(compareBudgetItems([{name:" Fedi nuziali ",amount:1200}],[{category:"Accessori",subcategory:"Fedi nuziali",budget:1150}],"Voce","it"))
    .toEqual([{key:"Accessori - Fedi nuziali",planned:1200,actual:1150}]);
});
test("does not arbitrarily match a name shared by different categories",()=>{
  const rows=compareBudgetItems([{name:"Altro",amount:500}],[{category:"Sposa",subcategory:"Altro",budget:100},{category:"Sposo",subcategory:"Altro",budget:200}],"Voce","it");
  expect(rows).toHaveLength(3);
  expect(rows.find(x=>x.key==="Altro")).toEqual({key:"Altro",planned:500,actual:0});
});
test("an explicit category resolves ambiguous subcategory names",()=>{
  const rows=compareBudgetItems([{name:"Altro",category:"Sposo",subcategory:"Altro",amount:500}],[{category:"Sposa",subcategory:"Altro",budget:100},{category:"Sposo",subcategory:"Altro",budget:200}],"Voce","it");
  expect(rows).toHaveLength(2);
  expect(rows.find(x=>x.key==="Sposo - Altro")).toEqual({key:"Sposo - Altro",planned:500,actual:200});
});
