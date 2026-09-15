export type BudgetTotalRow = { amount: number; enabled: boolean };
export type BudgetSearchRow = { category: string; subcategory: string; aliases?: readonly string[]; contexts?: readonly string[] };
export type BudgetIdentityRow = { category: string; subcategory: string; canonicalKey?: string; custom?: boolean };

export function normalizeBudgetLabel(value: string) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it");
}

export function hasBudgetRowDuplicate(rows: BudgetIdentityRow[], candidate: BudgetIdentityRow) {
  if (candidate.canonicalKey) return rows.some((row) => row.canonicalKey === candidate.canonicalKey);
  return rows.some((row) =>
    row.custom === true
    && normalizeBudgetLabel(row.category) === normalizeBudgetLabel(candidate.category)
    && normalizeBudgetLabel(row.subcategory) === normalizeBudgetLabel(candidate.subcategory),
  );
}

export function budgetTotals(rows: BudgetTotalRow[], contingencyPct: number) {
  const planned = rows.reduce((sum, row) => sum + (row.enabled && Number.isFinite(Number(row.amount)) ? Math.max(0, Number(row.amount)) : 0), 0);
  const contingency = planned * Math.max(0, Number(contingencyPct) || 0) / 100;
  return { planned, contingency, total: planned + contingency };
}

export function matchesBudgetSearch(category: string, subcategory: string, query: string, aliases: readonly string[] = [], contexts: readonly string[] = []) {
  return normalizeBudgetLabel([category, subcategory, ...aliases, ...contexts].join(" ")).includes(normalizeBudgetLabel(query));
}
