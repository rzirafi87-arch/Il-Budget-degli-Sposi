export type BudgetTotalRow = { amount: number; enabled: boolean };
export type BudgetSearchRow = { category: string; subcategory: string; aliases?: readonly string[]; contexts?: readonly string[] };

export function budgetTotals(rows: BudgetTotalRow[], contingencyPct: number) {
  const planned = rows.reduce((sum, row) => sum + (row.enabled && Number.isFinite(Number(row.amount)) ? Math.max(0, Number(row.amount)) : 0), 0);
  const contingency = planned * Math.max(0, Number(contingencyPct) || 0) / 100;
  return { planned, contingency, total: planned + contingency };
}

export function matchesBudgetSearch(category: string, subcategory: string, query: string, aliases: readonly string[] = [], contexts: readonly string[] = []) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it");
  return normalize([category, subcategory, ...aliases, ...contexts].join(" ")).includes(normalize(query.trim()));
}
