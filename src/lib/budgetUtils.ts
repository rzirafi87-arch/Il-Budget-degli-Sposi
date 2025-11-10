// Utility per calcolo residuo budget

/**
 * Calcola il residuo dato un budget pianificato e il totale pagato.
 * Il residuo non può mai essere negativo.
 */
export function calculateResidual(budget: number, paid: number): number {
  return Math.max(0, budget - paid);
}
