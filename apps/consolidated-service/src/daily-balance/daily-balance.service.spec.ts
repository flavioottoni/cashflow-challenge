import { EntryType, calculateBalanceDelta, computeBalance } from '@cashflow/shared';

describe('DailyBalance domain logic', () => {
  it('should accumulate credits and debits correctly', () => {
    let totalCredits = 0;
    let totalDebits = 0;

    const credit = calculateBalanceDelta(EntryType.CREDIT, 500);
    totalCredits += credit.creditDelta;
    totalDebits += credit.debitDelta;

    const debit = calculateBalanceDelta(EntryType.DEBIT, 150);
    totalCredits += debit.creditDelta;
    totalDebits += debit.debitDelta;

    expect(computeBalance(totalCredits, totalDebits)).toBe(350);
  });
});

describe('EntryConsumerService processEntryCreated', () => {
  it('should compute balance delta from event', () => {
    const event = {
      type: EntryType.CREDIT,
      amount: 200,
    };
    const { creditDelta, debitDelta } = calculateBalanceDelta(
      event.type,
      event.amount,
    );
    expect(creditDelta).toBe(200);
    expect(debitDelta).toBe(0);
    expect(computeBalance(creditDelta, debitDelta)).toBe(200);
  });
});
