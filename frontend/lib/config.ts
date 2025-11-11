export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const config = {
  apiUrl: BACKEND_URL,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000',
  auth: {
    google: `${BACKEND_URL}/api/auth/google`,
  },
  frontend: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
};