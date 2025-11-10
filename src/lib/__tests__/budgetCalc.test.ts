import { calculateDifference, calculateTotal, splitBudgetByType } from '../budgetCalc';

describe('calculateTotal', () => {
  it('somma una lista di numeri', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6);
    expect(calculateTotal([100, 200, 300])).toBe(600);
    expect(calculateTotal([0, 0, 0])).toBe(0);
    expect(calculateTotal([-1, 1])).toBe(0);
  });
  it('gestisce valori non numerici o null', () => {
    expect(calculateTotal([1, null as any, 2])).toBe(3);
    expect(calculateTotal([undefined as any, 5])).toBe(5);
    expect(calculateTotal([NaN, 2])).toBe(2);
  });
});

describe('calculateDifference', () => {
  it('calcola la differenza paid - budget', () => {
    expect(calculateDifference(1000, 800)).toBe(-200);
    expect(calculateDifference(1000, 1200)).toBe(200);
    expect(calculateDifference(0, 0)).toBe(0);
  });
});

describe('splitBudgetByType', () => {
  it('suddivide il budget tra common, bride e groom', () => {
    const rows = [
      { budget: 1000, spendType: 'common' },
      { budget: 500, spendType: 'bride' },
      { budget: 200, spendType: 'groom' },
      { budget: 300, spendType: 'common' },
    ];
    expect(splitBudgetByType(rows)).toEqual({ common: 1300, bride: 500, groom: 200, total: 2000 });
  });
  it('gestisce array vuoto', () => {
    expect(splitBudgetByType([])).toEqual({ common: 0, bride: 0, groom: 0, total: 0 });
  });
});
