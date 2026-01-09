# LedgerX: Enterprise Treasury & Spend Management Platform

> **A Next-Generation Corporate Expense Engine** — Designed to process high-concurrency corporate transactions with real-time budget enforcement, AI fraud detection, and 100% ledger integrity.

## 🏢 What is LedgerX?

LedgerX is a **B2B SaaS backend** for managing corporate spend at scale. Think of it as the financial infrastructure behind platforms like **Brex**, **Ramp**, or internal treasury systems at companies like Uber and Airbnb.

### Core Value Proposition

- **Multi-Tenancy**: Organizations & Departments with hierarchical budget controls
- **Real-Time Budget Enforcement**: Block transactions that exceed department limits *before* funds leave
- **Distributed Architecture**: Handle thousands of concurrent employee transactions without database bottlenecks
- **Audit-Ready Ledger**: Immutable double-entry bookkeeping for compliance (SOX, GAAP)
- **AI Risk Orchestration**: Real-time anomaly detection using statistical models + rule-based fraud patterns

---

## 🚀 Engineering Highlights

This is not a CRUD app. It is an **event-driven financial processing engine** designed to solve the "Double-Spend" problem and handle high-velocity traffic spikes.

### Architecture Pillars

#### 1. **Multi-Tenant Budget Enforcement**
- Organizations have Departments with monthly spend limits
- Before processing a transaction, the worker checks: `currentMonthSpend + newAmount ≤ budgetLimit`
- Pessimistic locking ensures no race conditions (two employees can't overspend simultaneously)

#### 2. **Double-Entry Integrity**
- Implemented an immutable append-only ledger (Credits/Debits) ensuring zero-sum consistency
- Every transaction creates exactly 2 entries: `-$X` from source, `+$X` to destination
- Prevents floating-point errors and ensures audit trails

#### 3. **Concurrency Control**
- Solved the "Double-Spend" problem using database row-level locking (`SELECT ... FOR UPDATE`)
- Transactions are wrapped in Serializable isolation levels
- Ordered locking to prevent deadlocks

#### 4. **Event-Driven Architecture**
- Decoupled transaction ingestion from processing using **BullMQ (Redis)**
- API accepts transaction → queues it → returns instantly
- Background workers process asynchronously, handling traffic spikes without DB lock contention

#### 5. **Idempotency Layer**
- Custom middleware using Redis to cache request keys
- Network retries don't duplicate financial transactions
- Critical for preventing double-charges from client-side retries

#### 6. **Hybrid AI Fraud Detection**
- **Statistical Anomaly Detection**: Z-Score analysis flags outliers (transactions > 3σ from mean)
- **Rule-Based Velocity Checks**: Redis sliding windows detect rapid spending patterns
- **Event-Driven**: Fraud listeners run asynchronously without blocking payments

---

## 🛠 Tech Stack

**Backend:**
- Node.js, TypeScript, Express
- PostgreSQL (with row-level locking, PL/pgSQL functions)
- BullMQ (Redis-backed job queue)
- Prisma ORM
- Google Gemini AI (NLP query parsing)

**Frontend:**
- Next.js 14 (App Router)
- TailwindCSS + shadcn/ui
- Recharts (Financial dashboards)
- GSAP + Framer Motion (Animations)

**Infrastructure:**
- Docker, Redis, Nginx
- CI/CD Ready

---

## ⚡ Performance

Tested with **k6** to handle **500+ concurrent requests/sec** with zero data inconsistencies.

- **Queue Processing**: Asynchronous workers drain spikes in `<50ms` per job
- **Lock Contention**: Optimized via ordered row locking to prevent deadlocks
- **Budget Checks**: Sub-10ms aggregation queries (indexed on `departmentId` + `timestamp`)

---

## 🏃‍♂️ Quick Start

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Run Migrations & Seed
```bash
cd backend
npx prisma migrate deploy
npx tsx prisma/seed.ts  # Creates demo org "TechCorp" with departments
```

### 3. Start Services
```bash
# Backend (API + Worker)
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### 4. Login & Test
- Go to `http://localhost:3000`
- Login as `alice@techcorp.com` (Engineering dept, $50k budget)
- Try to spend $60k → See budget rejection in real-time ✅

---

## 📊 Demo Use Case

**Scenario**: TechCorp has 2 departments:
- **Engineering**: $50,000/month budget
- **Sales**: $25,000/month budget

**Test Flow**:
1. Alice (Engineering) swipes corporate card for $6,000 → ✅ Success
2. Bob (Engineering) tries $48,000 → ❌ Rejected  
   *"Department 'Engineering' budget exceeded. Limit: $50,000, Current: $6,000, Requested: $48,000"*
3. Finance Manager views org-wide dashboard → See real-time spend across all departments

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `backend/src/workers/transaction.worker.ts` | Core budget enforcement + locking logic |
| `backend/src/ai/model.ts` | Statistical anomaly detector (Z-Score) |
| `backend/src/ai/langchainParser.ts` | NLP query parser with Redis caching |
| `backend/src/queues/transaction.queue.ts` | BullMQ job queue setup |
| `backend/src/middleware/checkIdempotency.ts` | Redis-based idempotency |
| `frontend/components/system/DepartmentBudgetCard.tsx` | Real-time budget status UI |
| `frontend/app/admin/system/page.tsx` | System internals dashboard |

---

## 🎯 Enterprise Features

- ✅ **Multi-Organization Support** (Tenant isolation)
- ✅ **Department Budgets** with real-time enforcement
- ✅ **Role-Based Access Control** (Employee, Finance Manager, Org Admin, System Admin)
- ✅ **Transaction Reversals** (Compensating entries for audit compliance)
- ✅ **AI Query Interface** ("Show me top expenses this month")
- ✅ **Real-Time Infrastructure Monitoring** (Queue latency, DB health, transaction throughput)

---

## 🧪 Testing

```bash
# Unit Tests
npm test

# Load Testing (Backend)
k6 run tests/load/transaction-spike.js

# AI Features
npx tsx src/ai/test-ai-features.ts
```

---

## 📈 Roadmap

- [ ] Add SSO (SAML) for enterprise auth
- [ ] Implement approval workflows (multi-level)
- [ ] Add webhook support for external integrations
- [ ] Build mobile app (React Native)
- [ ] Add vendor payment automation

---

## 📄 License

MIT
