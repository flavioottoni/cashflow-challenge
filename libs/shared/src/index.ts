export enum EntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export const ENTRY_CREATED_EVENT = 'entry.created';
export const ENTRY_EXCHANGE = 'cashflow.entries';
export const ENTRY_QUEUE = 'cashflow.consolidated.entries';

export interface EntryCreatedEvent {
  eventId: string;
  entryId: string;
  merchantId: string;
  date: string;
  type: EntryType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface JwtPayload {
  sub: string;
  merchantId: string;
  scopes: string[];
}

export const SCOPES = {
  ENTRIES_WRITE: 'entries:write',
  ENTRIES_READ: 'entries:read',
  BALANCE_READ: 'balance:read',
} as const;

export function calculateBalanceDelta(type: EntryType, amount: number): {
  creditDelta: number;
  debitDelta: number;
} {
  if (type === EntryType.CREDIT) {
    return { creditDelta: amount, debitDelta: 0 };
  }
  return { creditDelta: 0, debitDelta: amount };
}

export function computeBalance(totalCredits: number, totalDebits: number): number {
  return totalCredits - totalDebits;
}
