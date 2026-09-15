import { budgetTotals, hasBudgetRowDuplicate, matchesBudgetSearch } from "@/lib/budgetIdea";

describe("configurable budget idea", () => {
  it("excludes disabled rows from planned and contingency totals", () => {
    expect(budgetTotals([{ amount: 100, enabled: true }, { amount: 900, enabled: false }], 10)).toEqual({ planned: 100, contingency: 10, total: 110 });
  });

  it.each([["Sposa", "Make-up Artist", "make"], ["Foto & Video", "Servizio fotografico", "FOTO"], ["Trasporti", "Autista", "autìsta"]])("finds %s / %s with %s", (category, subcategory, query) => {
    expect(matchesBudgetSearch(category, subcategory, query)).toBe(true);
  });

  it("prevents canonical and same-category custom duplicates without blocking valid custom rows", () => {
    const rows = [
      { category: "Foto & Video", subcategory: "Servizio fotografico", canonicalKey: "wedding.photo.service" },
      { category: "Cerimonia", subcategory: "Voce speciale", custom: true },
    ];
    expect(hasBudgetRowDuplicate(rows, { category: "Altro", subcategory: "Foto", canonicalKey: "wedding.photo.service" })).toBe(true);
    expect(hasBudgetRowDuplicate(rows, { category: "Cerimonia", subcategory: "  Vóce SPECIALE ", custom: true })).toBe(true);
    expect(hasBudgetRowDuplicate(rows, { category: "Ricevimento Location", subcategory: "Voce speciale", custom: true })).toBe(false);
    expect(hasBudgetRowDuplicate(rows, { category: "Cerimonia", subcategory: "Seconda voce", custom: true })).toBe(false);
  });
});
