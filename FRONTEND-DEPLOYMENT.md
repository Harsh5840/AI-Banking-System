# 🚀 Frontend Deployment Guide

## Backend Already Deployed ✅
- **Backend URL**: https://ledgerx-backend-l794.onrender.com
- **Status**: Live and running

---

## Option 1: Deploy Frontend to Vercel (Recommended for Next.js)

### **Step 1: Update Backend CORS Settings**

Before deploying frontend, update backend environment variables on Render:

1. Go to Render Dashboard → Your Backend Service
2. Environment → Add these variables:
   ```bash
   CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
3. Save Changes → Backend will redeploy automatically

### **Step 2: Deploy to Vercel**

#### **Option A: Via Vercel Dashboard (Easiest)**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

5. **Environment Variables** (Add these in Vercel):
   ```
   NEXT_PUBLIC_API_URL=https://ledgerx-backend-l794.onrender.com
   NEXT_PUBLIC_WS_URL=wss://ledgerx-backend-l794.onrender.com
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

6. Click "Deploy"

#### **Option B: Via Vercel CLI**

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

**Set environment variables:**
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://ledgerx-backend-l794.onrender.com

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://ledgerx-backend-l794.onrender.com

vercel env add NEXTAUTH_URL production
# Enter: https://your-app-name.vercel.app
```

---

## Option 2: Deploy Frontend to Render

### **Step 1: Create Web Service on Render**

1. Go to Render Dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: ledgerx-frontend
   - **Region**: Same as backend (for lower latency)
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `pnpm start`

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://ledgerx-backend-l794.onrender.com
   NEXT_PUBLIC_WS_URL=wss://ledgerx-backend-l794.onrender.com
   NEXTAUTH_URL=https://your-frontend-name.onrender.com
   NODE_ENV=production
   PORT=3000
   ```

6. Click "Create Web Service"

### **Step 2: Update Backend CORS**

After frontend is deployed, update backend environment variables:
```bash
CORS_ORIGIN=https://your-frontend-name.onrender.com,http://localhost:3000
FRONTEND_URL=https://your-frontend-name.onrender.com
```

---

## Troubleshooting Vercel Error

### Error: "An unexpected error happened when running this build"

**Possible Causes:**
1. ❌ Missing environment variables
2. ❌ Package.json issues
3. ❌ Build command failure
4. ❌ Vercel config issues

**Solutions:**

### 1. **Add vercel.json Configuration**

Create `frontend/vercel.json`:
```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 2. **Check package.json Scripts**

Ensure these scripts exist in `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 3. **Add Next.js Config**

Check `frontend/next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker/Render
  // Remove 'standalone' for Vercel
  eslint: {
    ignoreDuringBuilds: true, // Optional: skip ESLint during build
  },
  typescript: {
    ignoreBuildErrors: false, // Set to true if you have type errors
  },
};

export default nextConfig;
```

### 4. **Environment Variables**

Make sure ALL required env vars are set in Vercel:
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXT_PUBLIC_WS_URL`
- ✅ `NEXTAUTH_URL`

---

## Local Testing Before Deploy

```bash
cd frontend

# Set production backend URL
export NEXT_PUBLIC_API_URL=https://ledgerx-backend-l794.onrender.com

# Build locally
pnpm run build

# Test production build
pnpm start

# Visit http://localhost:3000
```

---

## Post-Deployment Checklist

### ✅ **After Frontend Deploys:**

1. **Update Backend CORS**:
   - Add your frontend URL to `CORS_ORIGIN` on Render
   - Backend will automatically redeploy

2. **Update Frontend Environment**:
   - Set `NEXTAUTH_URL` to your actual frontend URL
   - Redeploy frontend if needed

3. **Test Authentication**:
   - Try login/register
   - Check OAuth flows (Google/GitHub)
   - Verify JWT tokens work

4. **Test API Calls**:
   - Dashboard loads correctly
   - Transactions display
   - Analytics charts render
   - NLP queries work

---

## Environment Variables Reference

### **Backend (Render)**
```bash
# Required
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_jwt_secret_here
BACKEND_URL=https://ledgerx-backend-l794.onrender.com
FRONTEND_URL=https://your-frontend-url
CORS_ORIGIN=https://your-frontend-url,http://localhost:3000

# Optional (AI features)
GOOGLE_API_KEY=your_google_gemini_key
HUGGINGFACE_API_TOKEN=your_huggingface_token

# Optional (OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# System Accounts
SYSTEM_USER_ID=your_system_user_id
SYSTEM_INCOME_ACCOUNT_ID=your_income_account_id
SYSTEM_EXPENSE_ACCOUNT_ID=your_expense_account_id
```

### **Frontend (Vercel/Render)**
```bash
# Required
NEXT_PUBLIC_API_URL=https://ledgerx-backend-l794.onrender.com
NEXT_PUBLIC_WS_URL=wss://ledgerx-backend-l794.onrender.com
NEXTAUTH_URL=https://your-frontend-url

# Optional
NODE_ENV=production
PORT=3000
```

---

## Quick Deploy Commands

### **Vercel:**
```bash
cd frontend
vercel --prod
```

### **Render:**
```bash
# Just push to GitHub
git add .
git commit -m "chore: update frontend for production"
git push origin main

# Render will auto-deploy
```

---

## Comparison: Vercel vs Render

| Feature | Vercel | Render |
|---------|--------|--------|
| **Best For** | Next.js (optimized) | Docker deployments |
| **Speed** | ⚡ Fastest | Fast |
| **Price** | Free tier generous | Free tier limited |
| **CDN** | Global edge network | Regional |
| **Setup** | Easiest | Easy |
| **Build Time** | ~1-2 min | ~3-5 min |
| **Auto Deploy** | ✅ Yes | ✅ Yes |

**Recommendation**: Use **Vercel** for frontend (better Next.js support) and keep backend on Render.

---

## Need Help?

1. **Check Vercel Logs**: https://vercel.com/your-username/your-project/deployments
2. **Check Render Logs**: https://dashboard.render.com → Your service → Logs
3. **Test Backend**: Visit https://ledgerx-backend-l794.onrender.com/health

---

**Last Updated**: October 20, 2025  
**Backend**: ✅ Live on Render  
**Frontend**: 🚀 Ready to Deploy
