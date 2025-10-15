# LedgerX Standalone Backend

This is the standalone backend for LedgerX, migrated from a monorepo to a single-folder structure for easier deployment and onboarding.

## Features
- Express.js REST API
- JWT authentication & OAuth (Google, GitHub)
- AI/ML integration for fraud detection and analytics
- Prisma/PostgreSQL ORM
- TypeScript, Zod validation, Vitest tests

## Setup
1. Copy `.env.example` to `.env` and fill in your secrets.
2. Run `npm install`.
3. Run `npm run dev` for development or `npm run build && npm start` for production.

## Docker
Build and run with Docker:
```
docker build -t ledgerx-backend .
docker run -p 5000:5000 --env-file .env ledgerx-backend
```
