export type CanonicalBudgetApplyItem = { name: string; amount: number; spend_type: string; canonical_key: string | null };

/** Keeps one accounting row per standard canonical identity; custom rows remain independent. */
export function deduplicateCanonicalBudgetItems(items: CanonicalBudgetApplyItem[]) {
  const seen = new Set<string>();
  return items.filter((item, index) => {
    const identity = item.canonical_key || `custom:${index}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
