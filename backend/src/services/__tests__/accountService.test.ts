import { describe, it, expect } from 'vitest';
import { createAccount } from '../accountService';
import { AccountType } from '../../core/types';

describe('Account Service', () => {
  it('should create an account successfully', async () => {
    const accountData = { name: 'Test Account', balance: 1000, type: AccountType.SAVINGS, userId: 'test-user' };
    const result = await createAccount(accountData.name, accountData.type, accountData.userId);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe(accountData.name);
    expect(result.type).toBe(accountData.type);
    expect(result.userId).toBe(accountData.userId);
  });
});