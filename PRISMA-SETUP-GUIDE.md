# Prisma Database Setup Guide

## ✅ Files Fixed Successfully

All TypeScript errors have been resolved in:
- ✅ `backend/src/core/ledger.ts` - Added Transaction type and createTransaction function
- ✅ `backend/src/db/client.ts` - Added Prisma type exports and function re-exports
- ✅ `backend/src/controllers/reversalController.ts` - Fixed import paths
- ✅ `backend/src/controllers/transactionController.ts` - Fixed classifyCategory usage
- ✅ `backend/src/services/transactionService.ts` - Fixed import paths

## 🗄️ Database Setup Instructions

### Step 1: Update DATABASE_URL

Open `backend/.env` and update the DATABASE_URL with your actual database credentials:

```env
# Replace these values with your actual database details:
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT/YOUR_DATABASE?schema=public"
```

**Examples:**

**Local PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/ledgerx?schema=public"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Neon.tech:**
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Railway/Render:**
```env
DATABASE_URL="postgresql://user:password@containers-us-west-xxx.railway.app:7600/railway"
```

### Step 2: Run Prisma Commands

Once you've updated the DATABASE_URL, run these commands:

#### Option A: Fresh Database Setup (Recommended)
```bash
cd backend

# 1. Generate Prisma Client (Already done ✅)
npx prisma generate

# 2. Push schema to database (creates tables)
npx prisma db push

# 3. (Optional) Seed database with sample data if you have a seed file
npm run seed
```

#### Option B: Use Migrations (Production-ready)
```bash
cd backend

# 1. Generate Prisma Client (Already done ✅)
npx prisma generate

# 2. Apply all migrations
npx prisma migrate deploy

# Or create a new migration if you made schema changes
npx prisma migrate dev --name init
```

### Step 3: Verify Database Connection

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a browser at `http://localhost:5555` where you can view and edit your database tables.

---

## 📊 Your Database Schema

Your Prisma schema includes these models:

### **User**
- Authentication (email, password, OAuth)
- Roles (USER, ADMIN, AUDITOR)
- Relations to accounts, transactions, and ledger entries

### **Account**
- Types: WALLET, SAVINGS, BUSINESS
- Belongs to a user
- Has multiple ledger entries

### **Transaction**
- Tracks all financial transactions
- Risk scoring and fraud detection
- Supports reversals (parent-child relationship)
- Links to ledger entries

### **LedgerEntry**
- Double-entry bookkeeping
- Blockchain-style hashing (hash, prevHash, originalHash)
- Categories and risk scores
- Indexed for performance

---

## 🔧 Common Database Providers

### **Option 1: Local PostgreSQL**

**Install PostgreSQL:**
- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

**Start PostgreSQL:**
```bash
# Windows (run as service or)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# Mac/Linux
brew services start postgresql
# or
sudo service postgresql start
```

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE ledgerx;
\q
```

**Update .env:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ledgerx?schema=public"
```

---

### **Option 2: Supabase (Free Tier Available)**

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings > Database
4. Copy the connection string (pooler connection)
5. Paste in `.env` as `DATABASE_URL`

**Advantages:**
- Free tier with 500MB database
- Built-in Auth, Storage, Realtime
- Hosted, no local setup needed

---

### **Option 3: Neon.tech (Free Serverless Postgres)**

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create new project
3. Copy connection string
4. Paste in `.env`

**Advantages:**
- Serverless (autoscaling)
- Free tier with 0.5GB storage
- Fast setup

---

### **Option 4: Railway/Render (Free Tier)**

**Railway:**
1. Go to [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy DATABASE_URL from variables
4. Paste in `.env`

**Render:**
1. Go to [render.com](https://render.com)
2. Create PostgreSQL database
3. Copy External Database URL
4. Paste in `.env`

---

## 🚀 Next Steps After Database Setup

Once your database is configured and migrations are applied:

### 1. Start the Backend
```bash
cd backend
npm run dev
# or
pnpm dev
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# or
pnpm dev
```

### 3. Test the API
Visit `http://localhost:5000/api/` to test your backend

### 4. Access the App
Visit `http://localhost:3000` to use your application

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"
- ✅ Check if DATABASE_URL is correct
- ✅ Verify database server is running
- ✅ Check firewall/network settings
- ✅ Ensure database exists

### Error: "Authentication failed"
- ✅ Verify username and password in DATABASE_URL
- ✅ Check if user has proper permissions

### Error: "Database does not exist"
- ✅ Create the database first: `CREATE DATABASE ledgerx;`
- ✅ Or use `prisma db push` which creates it automatically

### Error: "SSL connection error"
- Add `?sslmode=require` or `?sslmode=disable` to connection string
- For local development: `?sslmode=disable`
- For production: `?sslmode=require`

---

## 📝 Prisma Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema without migrations (dev)
npx prisma db push

# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull
```

---

## ✅ Checklist

- [ ] Update DATABASE_URL in `backend/.env`
- [ ] Start your database server (if local)
- [ ] Run `npx prisma generate` ✅ (Already done)
- [ ] Run `npx prisma db push` or `npx prisma migrate deploy`
- [ ] Verify with `npx prisma studio`
- [ ] Start backend server: `npm run dev`
- [ ] Start frontend server: `cd frontend && npm run dev`
- [ ] Test the application

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Update DATABASE_URL in backend/.env with your credentials

# 2. Setup database
cd backend
npx prisma generate          # ✅ Already done
npx prisma db push          # Creates all tables

# 3. Start servers
npm run dev                 # Backend on :5000
cd ../frontend && npm run dev  # Frontend on :3000
```

---

**Need help?** Check the [Prisma Documentation](https://www.prisma.io/docs) or the error messages - they're usually very helpful!
