
# LedgerX: High-Scale Distributed Financial Ledger

> **Engineering Note**: This project demonstrates the architecture required to process financial transactions with strict ACID compliance, double-entry bookkeeping, and high concurrency without data loss.

![System Architecture](https://mermaid.ink/img/pako:eNptkE1Lw0AQhv9KmJNX05veFASL4kUsWBFvQ5LdbdCdkMyH1pD_7ibWgoceZ5j3fWZ23gl1whRjji_M1fLaaA-fW609XG_W4L3z0IMLIG_fP9fLVS7v4p2D7hS89cE77z0M4AIIpIeB1y6QHp1z0J0G73zwznsPA7gAAulhgNcukB6dc9CdBm_9e-chgAsgkB4GXu_4P8s4n_JpmsV5PsviLJ_PknwynY1H43E6no7TcCq1E6kdi9SOZWonMjuRqZ3K7FSmdiqzM5naqczOZGp_MruQqV3I7EKmdiGzC5nahcwuZGoXMrs4k7uUu1zuCrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr5a6Uu1LuSrkr)

## 🚀 Engineering Highlights

This is not a CRUD app. It is an event-driven financial processing engine designed to handle the "Double-Spend" problem and high-velocity traffic spikes.

### Core Architecture Pillars

-   **Double-Entry Integrity**: Implemented an immutable append-only ledger schema (Credits/Debits) to ensure zero-sum consistency, preventing floating point errors.
-   **Concurrency Control**: Solved the "Double-Spend" problem using database row-level locking (`SELECT ... FOR UPDATE`) within strict Serializable transactions.
-   **Event-Driven Architecture**: Decoupled transaction ingestion from processing using **BullMQ (Redis)** to handle traffic spikes without DB lock contention.
-   **Idempotency Layer**: Built a custom middleware using Redis to cache request keys, ensuring network retries do not duplicate financial transactions.
-   **Hybrid Anomaly Detection**:
    -   **Velocity Check**: Redis-based sliding window (sync).
    -   **Vector Analysis**: Asynchronous ML pipeline to flag semantic anomalies.

## 🛠 Tech Stack

-   **Core**: TypeScript, Node.js, PostgreSQL (PL/pgSQL functions).
-   **Infrastructure**: Docker, Redis (Caching & Queues), Nginx.
-   **Key Concepts**: ACID Compliance, Double-Entry Bookkeeping, Event Sourcing, Distributed Locking, Idempotency.
-   **Frontend**: Next.js, Tailwind CSS (System Internals UI).

## ⚡ Performance

Tested with **k6** to handle **500+ concurrent requests/sec** with zero data inconsistencies.

-   **Queue Processing**: Asynchronous workers drain spikes in `<50ms` per job.
-   **Lock Contention**: Optimized via ordered row locking to prevent deadlocks.

## 🏃‍♂️ How to Run

1.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```

2.  **Run Migrations**:
    ```bash
    cd backend && npx prisma migrate deploy
    ```

3.  **Start Services**:
    -   **Backend & Worker**: `npm run dev` (in backend)
    -   **Frontend**: `npm run dev` (in frontend)

4.  **Simulate Traffic**:
    -   Go to `http://localhost:3000/admin/system`
    -   Click **Dispatch Transaction** to see the lifecycle visualization in real-time.

## 📂 Project Structure

-   `/backend/src/workers/transaction.worker.ts`: The core locking logic.
-   `/backend/src/listeners/fraud.listener.ts`: Event-driven fraud detection.
-   `/backend/src/middleware/checkIdempotency.ts`: Redis-based idempotency.
-   `/frontend/src/app/admin/system`: The "System Internals" Dashboard.
