import { calculateResidual } from '../budgetUtils';

describe('calculateResidual', () => {
  it('restituisce la differenza se positiva', () => {
    expect(calculateResidual(1000, 400)).toBe(600);
    expect(calculateResidual(500, 0)).toBe(500);
    expect(calculateResidual(200, 199)).toBe(1);
  });

  it('restituisce 0 se paid >= budget', () => {
    expect(calculateResidual(1000, 1000)).toBe(0);
    expect(calculateResidual(1000, 1200)).toBe(0);
    expect(calculateResidual(0, 0)).toBe(0);
  });

  it('gestisce valori negativi di budget o paid', () => {
    expect(calculateResidual(-100, 50)).toBe(0);
    expect(calculateResidual(100, -50)).toBe(150);
    expect(calculateResidual(-100, -50)).toBe(0);
  });
});
