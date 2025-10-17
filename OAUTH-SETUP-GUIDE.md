# 🔐 OAuth Setup Guide - Google & GitHub

## ✅ Current Status

Your `.env` file now has the correct variable names:
- ✅ `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- ✅ `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- ✅ `BACKEND_URL` and `FRONTEND_URL` configured
- ✅ OAuth integration code is ready

---

## 🔧 OAuth Redirect URIs Setup

For OAuth to work, you **MUST** add these redirect URIs to your OAuth apps:

### 🟢 Google OAuth Setup

1. **Go to:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Select** your project (or create one)
3. **Navigate to:** APIs & Services → Credentials
4. **Click** on your OAuth 2.0 Client ID
5. **Add Authorized Redirect URIs:**
   ```
   http://localhost:5000/api/auth/google/callback
   ```
6. **For Production** (later), also add:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
7. **Save** changes

**Note:** Add your Google credentials to `.env`:
- Client ID: Get from Google Cloud Console
- Client Secret: Get from Google Cloud Console (Keep this secret!)

---

### 🟣 GitHub OAuth Setup

1. **Go to:** [GitHub Developer Settings](https://github.com/settings/developers)
2. **Click** on your OAuth App or create a new one
3. **Set Application name:** `LedgerX Banking System (Local)`
4. **Set Homepage URL:** `http://localhost:3000`
5. **Set Authorization callback URL:**
   ```
   http://localhost:5000/api/auth/github/callback
   ```
6. **Update** the application

**Note:** Add your GitHub credentials to `.env`:
- Client ID: Get from GitHub Developer Settings
- Client Secret: Get from GitHub Developer Settings (Keep this secret!)

---

## 🚀 How OAuth Works in Your App

### **User Flow:**

1. **User clicks** "Login with Google" or "Login with GitHub" on frontend
2. **Frontend redirects** to backend OAuth route:
   - Google: `http://localhost:5000/api/auth/google`
   - GitHub: `http://localhost:5000/api/auth/github`
3. **Backend redirects** user to OAuth provider (Google/GitHub)
4. **User authorizes** the app
5. **OAuth provider redirects** back to backend callback:
   - Google: `http://localhost:5000/api/auth/google/callback`
   - GitHub: `http://localhost:5000/api/auth/github/callback`
6. **Backend creates/finds** user in database
7. **Backend generates** JWT token
8. **Backend redirects** to frontend with token:
   - `http://localhost:3000/oauth?token=JWT_TOKEN_HERE`
9. **Frontend saves** token and logs user in

---

## 🔍 Testing OAuth

### **Step 1: Update Redirect URIs** (as shown above)

### **Step 2: Update Frontend OAuth Buttons**

The frontend should redirect to:
```javascript
// Google Login
window.location.href = 'http://localhost:5000/api/auth/google';

// GitHub Login
window.location.href = 'http://localhost:5000/api/auth/github';
```

### **Step 3: Test the Flow**

1. Click "Login with Google" → Should redirect to Google login
2. Authorize the app → Should redirect back with token
3. Check database → User should be created with Google ID

---

## 📋 Backend Routes Available

Your backend already has these routes configured:

### **Google OAuth:**
```
GET  /api/auth/google           - Initiates Google OAuth
GET  /api/auth/google/callback  - Handles Google callback
```

### **GitHub OAuth:**
```
GET  /api/auth/github           - Initiates GitHub OAuth
GET  /api/auth/github/callback  - Handles GitHub callback
```

### **Email/Password Auth:**
```
POST /api/auth/register         - Register new user
POST /api/auth/login            - Login with email/password
GET  /api/auth/logout           - Logout (redirects to frontend)
```

---

## 🐛 Troubleshooting

### **Error: "redirect_uri_mismatch"**
- ✅ Make sure redirect URI in OAuth app **exactly** matches:
  - `http://localhost:5000/api/auth/google/callback` (Google)
  - `http://localhost:5000/api/auth/github/callback` (GitHub)
- ✅ No trailing slashes
- ✅ Correct port (5000 for backend)
- ✅ Correct protocol (http for local, https for production)

### **Error: "Client authentication failed"**
- ✅ Check CLIENT_ID and CLIENT_SECRET in `.env`
- ✅ Regenerate secrets if needed
- ✅ Restart backend after changing `.env`

### **Error: "User not created"**
- ✅ Check database connection
- ✅ Check Prisma schema has `googleId` and `githubId` fields
- ✅ Check backend logs for errors

### **User redirected but not logged in**
- ✅ Check frontend OAuth callback page (`/oauth`)
- ✅ Verify token is being saved to localStorage
- ✅ Check browser console for errors

---

## 📝 Example Frontend Integration

### **Login Page Button:**
```typescript
// For Google
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

// For GitHub
const handleGitHubLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/github';
};
```

### **OAuth Callback Page (`/oauth`):**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      // No token, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  return <div>Processing login...</div>;
}
```

---

## ✅ Quick Checklist

Before testing OAuth, make sure:

- [ ] `.env` has correct variable names (GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID, etc.)
- [ ] Backend URL is `http://localhost:5000` in `.env`
- [ ] Frontend URL is `http://localhost:3000` in `.env`
- [ ] Google OAuth redirect URI added: `http://localhost:5000/api/auth/google/callback`
- [ ] GitHub OAuth redirect URI added: `http://localhost:5000/api/auth/github/callback`
- [ ] Backend server is running on port 5000
- [ ] Frontend has OAuth callback page at `/oauth`
- [ ] Database is connected and Prisma Client is generated

---

## 🎯 What Works Right Now

### ✅ **Email/Password Authentication**
- Fully functional
- No additional setup needed
- Test it immediately!

### ⚠️ **OAuth Authentication**
- Backend code: ✅ Ready
- Environment variables: ✅ Configured
- **Needs:** Redirect URIs to be added to OAuth apps
- **Then:** Will work immediately!

---

## 📚 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)

---

**Once you add the redirect URIs to your OAuth apps, the OAuth login will work perfectly! The backend is 100% ready.** 🚀
