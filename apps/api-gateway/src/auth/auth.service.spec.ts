import { SCOPES } from '@cashflow/shared';

describe('Auth scopes', () => {
  it('should define required scopes', () => {
    expect(SCOPES.ENTRIES_WRITE).toBe('entries:write');
    expect(SCOPES.ENTRIES_READ).toBe('entries:read');
    expect(SCOPES.BALANCE_READ).toBe('balance:read');
  });
});
