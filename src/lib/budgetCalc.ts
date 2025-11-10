// Utility per calcoli budget multipli (totali, differenze, split)

/**
 * Calcola il totale di una lista di valori numerici.
 */
export function calculateTotal(values: number[]): number {
  return values.reduce((sum, v) => sum + (Number(v) || 0), 0);
}

/**
 * Calcola la differenza tra budget pianificato e speso reale.
 * Positivo = sopra budget, negativo = sotto budget.
 */
export function calculateDifference(budget: number, paid: number): number {
  return paid - budget;
}

/**
 * Calcola la suddivisione del budget tra sposo, sposa e comune.
 * Restituisce un oggetto con i totali per ciascun tipo.
 */
export function splitBudgetByType(rows: Array<{ budget: number; spendType: "common"|"bride"|"groom" }>) {
  let common = 0, bride = 0, groom = 0;
  for (const row of rows) {
    if (row.spendType === "bride") bride += row.budget;
    else if (row.spendType === "groom") groom += row.budget;
    else common += row.budget;
  }
  return { common, bride, groom, total: common + bride + groom };
}
