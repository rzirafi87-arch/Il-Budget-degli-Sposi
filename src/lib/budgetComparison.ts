export type PlannedBudgetItem = { name: string; amount: number; category?: string; subcategory?: string };
export type ActualBudgetItem = { category: string; subcategory: string; budget: number };

/** Match old name-only plans only when the expense subcategory is unambiguous. */
export function compareBudgetItems(planned: PlannedBudgetItem[], actual: ActualBudgetItem[], fallback: string, locale: string) {
  const fullName = (item: ActualBudgetItem) => [item.category, item.subcategory].filter(Boolean).join(" - ") || fallback;
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase(locale);
  const aliases = new Map<string, Set<string>>();
  const actualMap = new Map<string, number>();
  for (const item of actual) {
    const key = fullName(item);
    actualMap.set(key, (actualMap.get(key) ?? 0) + item.budget);
    for (const alias of [key, item.subcategory].filter(Boolean)) {
      const normalized = normalize(alias);
      const candidates = aliases.get(normalized) ?? new Set<string>();
      candidates.add(key);
      aliases.set(normalized, candidates);
    }
  }
  const plannedMap = new Map<string, number>();
  for (const item of planned) {
    const explicit = item.category && item.subcategory ? `${item.category} - ${item.subcategory}` : null;
    const label = explicit || item.name || fallback;
    const matches = aliases.get(normalize(label));
    const key = matches?.size === 1 ? [...matches][0] : label;
    plannedMap.set(key, (plannedMap.get(key) ?? 0) + item.amount);
  }
  return [...new Set([...plannedMap.keys(), ...actualMap.keys()])]
    .sort((a, b) => a.localeCompare(b, locale))
    .map(key => ({key, planned: plannedMap.get(key) ?? 0, actual: actualMap.get(key) ?? 0}));
}
