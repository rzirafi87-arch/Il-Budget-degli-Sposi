import { budgetTotals, matchesBudgetSearch } from "@/lib/budgetIdea";

describe("configurable budget idea", () => {
  it("excludes disabled rows from planned and contingency totals", () => {
    expect(budgetTotals([{ amount: 100, enabled: true }, { amount: 900, enabled: false }], 10)).toEqual({ planned: 100, contingency: 10, total: 110 });
  });

  it.each([["Sposa", "Make-up Artist", "make"], ["Foto & Video", "Servizio fotografico", "FOTO"], ["Trasporti", "Autista", "autìsta"]])("finds %s / %s with %s", (category, subcategory, query) => {
    expect(matchesBudgetSearch(category, subcategory, query)).toBe(true);
  });
});
