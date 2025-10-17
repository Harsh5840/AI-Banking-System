# 🔗 Frontend-Backend Connection Guide

## 📍 Where Backend URLs Are Configured

### **Main Configuration Files:**

#### 1. **`frontend/.env.local`** ✅
This is where you set the backend URL for the entire frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXTAUTH_URL=http://localhost:3000
```

#### 2. **`frontend/lib/config.ts`** ✅
Centralized config that reads from `.env.local`:
```typescript
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const config = {
  apiUrl: BACKEND_URL,
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000',
  auth: {
    google: `${BACKEND_URL}/api/auth/google`,
    github: `${BACKEND_URL}/api/auth/github`,
  },
  frontend: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
};
```

#### 3. **`frontend/lib/api-endpoints.ts`** ✅
All API endpoints in one place:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/users/register`,
    LOGIN: `${API_BASE_URL}/api/users/login`,
    ME: `${API_BASE_URL}/api/users/me`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GITHUB: `${API_BASE_URL}/api/auth/github`,
  },
  TRANSACTIONS: {
    ALL: `${API_BASE_URL}/api/transactions/all`,
    CREATE: `${API_BASE_URL}/api/transactions/create`,
  },
  // ... more endpoints
};
```

---

## ✅ Fixed Pages (Using Config)

### **1. Login Page** - `frontend/app/login/page.tsx` ✅
**Now connects to real backend API:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
import { config } from "@/lib/config"

// Email/Password login
const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })

// OAuth login
window.location.href = config.auth.google  // Google
window.location.href = config.auth.github  // GitHub
```

---

## ⚠️ Pages That Still Need Fixing

These pages have **hardcoded URLs** and should use the config instead:

### **2. Register Page** - `frontend/app/register/page.tsx`
**Current (hardcoded):**
```typescript
axios.post("http://localhost:5000/api/users/register", ...)
axios.get("http://localhost:5000/api/users/me", ...)
```

**Should use:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
axios.post(API_ENDPOINTS.AUTH.REGISTER, ...)
axios.get(API_ENDPOINTS.AUTH.ME, ...)
```

### **3. Transactions Page** - `frontend/app/transactions/page.tsx`
**Current (hardcoded):**
```typescript
axios.post("http://localhost:5000/api/transactions/create", ...)
axios.get("http://localhost:5000/api/transactions/all", ...)
axios.get("http://localhost:5000/api/accounts/me", ...)
```

**Should use:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
axios.post(API_ENDPOINTS.TRANSACTIONS.CREATE, ...)
axios.get(API_ENDPOINTS.TRANSACTIONS.ALL, ...)
axios.get(API_ENDPOINTS.ACCOUNTS.ME, ...)
```

### **4. Dashboard Page** - `frontend/app/dashboard/page.tsx`
**Current (hardcoded):**
```typescript
fetch("http://localhost:5000/api/transactions/all", ...)
```

**Should use:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
fetch(API_ENDPOINTS.TRANSACTIONS.ALL, ...)
```

### **5. NLP Page** - `frontend/app/nlp/page.tsx`
**Current (hardcoded):**
```typescript
fetch("http://localhost:5000/api/nlp/query", ...)
```

**Should use:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
fetch(API_ENDPOINTS.NLP.QUERY, ...)
```

---

## 🎯 Why Use Config Files?

### **Benefits:**
1. ✅ **Single source of truth** - Change URL once, affects entire app
2. ✅ **Environment flexibility** - Easy to switch between dev/prod
3. ✅ **No hardcoded values** - Cleaner, more maintainable code
4. ✅ **Type safety** - TypeScript autocomplete for all endpoints
5. ✅ **Easy deployment** - Just change `.env.local` for different environments

---

## 🚀 How to Use the Config

### **Import the config:**
```typescript
import { API_ENDPOINTS } from "@/lib/api-endpoints"
import { config } from "@/lib/config"
```

### **Make API calls:**
```typescript
// Auth
axios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
axios.post(API_ENDPOINTS.AUTH.REGISTER, { email, password, name })

// Transactions
axios.get(API_ENDPOINTS.TRANSACTIONS.ALL)
axios.post(API_ENDPOINTS.TRANSACTIONS.CREATE, payload)

// OAuth
window.location.href = config.auth.google  // Redirect to Google OAuth
window.location.href = config.auth.github  // Redirect to GitHub OAuth
```

---

## 🔧 Changing Backend URL

### **For Development:**
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **For Production:**
Update environment variables in your hosting platform:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### **For Docker:**
Pass as environment variable:
```bash
docker run -e NEXT_PUBLIC_API_URL=http://backend:5000 ...
```

---

## 📝 Quick Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `.env.local` | Set backend URL | When backend URL changes |
| `lib/config.ts` | Global config | Add new config values |
| `lib/api-endpoints.ts` | API endpoints | Add new API routes |
| Page components | Use the config | Always import and use config |

---

## ✅ Current Status

### **Login Page:** ✅ FIXED
- Now uses `API_ENDPOINTS.AUTH.LOGIN`
- OAuth buttons redirect to backend OAuth routes
- Saves JWT token to localStorage
- Redirects based on user role

### **Other Pages:** ⚠️ Need updating
Would you like me to fix the remaining pages to use the centralized config?

---

## 🎯 Best Practice

**Always use the config:**
```typescript
// ✅ GOOD
import { API_ENDPOINTS } from "@/lib/api-endpoints"
axios.post(API_ENDPOINTS.AUTH.LOGIN, data)

// ❌ BAD
axios.post("http://localhost:5000/api/users/login", data)
```

This makes your code:
- Easier to maintain
- Easier to deploy
- More professional
- Less error-prone
