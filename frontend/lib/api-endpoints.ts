export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/users/register`,
    LOGIN: `${API_BASE_URL}/api/users/login`,
    ME: `${API_BASE_URL}/api/users/me`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GITHUB: `${API_BASE_URL}/api/auth/github`,
  },
  
  // User endpoints
  USERS: {
    ALL: `${API_BASE_URL}/api/users/all`,
  },
  
  // Transaction endpoints
  TRANSACTIONS: {
    ALL: `${API_BASE_URL}/api/transactions/all`,
    CREATE: `${API_BASE_URL}/api/transactions/create`,
    GET: (hash: string) => `${API_BASE_URL}/api/transactions/${hash}`,
  },
  
  // Analytics endpoints
  ANALYTICS: {
    TOTAL: `${API_BASE_URL}/api/analytics/total`,
    TOP_CATEGORIES: `${API_BASE_URL}/api/analytics/top-categories`,
    MONTHLY_TREND: `${API_BASE_URL}/api/analytics/monthly-trend`,
    FLAGGED: `${API_BASE_URL}/api/analytics/flagged`,
  },
  
  // NLP endpoints
  NLP: {
    QUERY: `${API_BASE_URL}/api/nlp/query`,
  },
  
  // Account endpoints
  ACCOUNTS: {
    ME: `${API_BASE_URL}/api/accounts/me`,
    CREATE: `${API_BASE_URL}/api/accounts`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/accounts/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/accounts/${id}`,
  },

  // Reversal endpoints
  REVERSAL: {
    REVERSE: (hash: string) => `${API_BASE_URL}/api/reversal/${hash}/reverse`,
  },
};