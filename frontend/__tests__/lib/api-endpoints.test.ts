import { describe, it, expect, vi } from 'vitest';
import { API_ENDPOINTS } from '../../lib/api-endpoints';

describe('API Endpoints', () => {
  it('should have correct base URL', () => {
    expect(API_ENDPOINTS.BASE_URL).toBeDefined();
  });

  it('should have auth endpoints', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toContain('/auth/login');
    expect(API_ENDPOINTS.AUTH.REGISTER).toContain('/auth/register');
    expect(API_ENDPOINTS.AUTH.LOGOUT).toContain('/auth/logout');
  });

  it('should have transaction endpoints', () => {
    expect(API_ENDPOINTS.TRANSACTIONS.GET_ALL).toContain('/transactions');
    expect(API_ENDPOINTS.TRANSACTIONS.CREATE).toContain('/transactions');
  });

  it('should have account endpoints', () => {
    expect(API_ENDPOINTS.ACCOUNTS.GET_ALL).toContain('/accounts');
    expect(API_ENDPOINTS.ACCOUNTS.CREATE).toContain('/accounts');
  });

  it('should have analytics endpoints', () => {
    expect(API_ENDPOINTS.ANALYTICS.DASHBOARD).toContain('/analytics');
  });
});