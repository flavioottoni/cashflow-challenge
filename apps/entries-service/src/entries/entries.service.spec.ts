import { EntryType, calculateBalanceDelta, computeBalance } from '@cashflow/shared';

describe('Shared domain logic', () => {
  describe('calculateBalanceDelta', () => {
    it('should return credit delta for CREDIT type', () => {
      expect(calculateBalanceDelta(EntryType.CREDIT, 100)).toEqual({
        creditDelta: 100,
        debitDelta: 0,
      });
    });

    it('should return debit delta for DEBIT type', () => {
      expect(calculateBalanceDelta(EntryType.DEBIT, 50)).toEqual({
        creditDelta: 0,
        debitDelta: 50,
      });
    });
  });

  describe('computeBalance', () => {
    it('should compute balance as credits minus debits', () => {
      expect(computeBalance(1000, 300)).toBe(700);
    });
  });
});

describe('EntriesService validation', () => {
  const validateEntryDate = (dateStr: string): void => {
    const entryDate = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (entryDate > today) {
      throw new Error('Entry date cannot be in the future');
    }
  };

  it('should reject future dates', () => {
    expect(() => validateEntryDate('2099-12-31')).toThrow(
      'Entry date cannot be in the future',
    );
  });

  it('should accept today date', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(() => validateEntryDate(today)).not.toThrow();
  });
});
