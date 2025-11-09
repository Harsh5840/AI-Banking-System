# 🚀 Quick Start Guide

Get LedgerX up and running in minutes!

## 📋 Prerequisites

- **Node.js** 20+ and **pnpm**
- **PostgreSQL** (or use Docker)
- **Git**

## 🐳 Docker Deployment (Recommended)

The easiest way to run the entire stack:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/LedgerX-standalone.git
cd LedgerX-standalone

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env with your secrets
# - Generate JWT_SECRET: openssl rand -base64 32
# - Add your Google/GitHub OAuth credentials
# - Add your Gemini API key

# 4. Start all services
docker-compose up -d

# 5. Run database migrations
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# 6. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

## 💻 Local Development Setup

### Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed

# Start development server
pnpm dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env - set NEXT_PUBLIC_API_URL to http://localhost:5000

# Start development server
pnpm dev
```

## 🌐 Production Deployment

### Current Deployment
- **Frontend**: https://ai-banking-system.vercel.app (Vercel)
- **Backend**: https://ledgerx-backend-l794.onrender.com (Render)
- **Database**: Neon PostgreSQL

### Deploy Your Own

#### Backend (Render/Railway/Fly.io)
1. Connect your GitHub repository
2. Set environment variables from `backend/.env.example`
3. Add build command: `pnpm install && pnpm build`
4. Add start command: `node dist/server.js`
5. Set `DATABASE_URL` to your PostgreSQL connection string
6. Update `CORS_ORIGIN` to include your frontend URL

#### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
   - `NEXT_PUBLIC_WS_URL`: Your backend WebSocket URL
   - `NEXTAUTH_URL`: Your frontend URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
4. Deploy!

## 🔑 Demo Credentials

```
Email: demo@ledgerx.com
Password: demo123
```

## 🛠️ Common Commands

### Database
```bash
# Create migration
pnpm prisma migrate dev --name migration_name

# Reset database (⚠️ development only)
pnpm prisma migrate reset

# Open Prisma Studio
pnpm prisma studio

# Generate Prisma Client
pnpm prisma generate
```

### Testing
```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test
```

### Docker
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U ledgerx -d ledgerx
```

## 🚨 Troubleshooting

### CORS Issues
If frontend can't connect to backend:
1. Check `CORS_ORIGIN` in backend `.env`
2. Should include your frontend URL: `http://localhost:3000,https://yourdomain.com`
3. Restart backend after changes

### Database Connection Failed
1. Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
2. Check database is running: `docker-compose ps`
3. Ensure migrations ran: `docker-compose exec backend npx prisma migrate deploy`

### Build Failures
1. Clear cache: `rm -rf node_modules dist .next`
2. Reinstall: `pnpm install`
3. Check Node version: `node --version` (should be 20+)

### OAuth Login Not Working
1. Register app with Google/GitHub OAuth
2. Set redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend.com/api/auth/google/callback`
3. Update `.env` with client ID and secret

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [OAUTH-SETUP-GUIDE.md](./OAUTH-SETUP-GUIDE.md) for OAuth configuration
- Review [PRISMA-SETUP-GUIDE.md](./PRISMA-SETUP-GUIDE.md) for database setup
- Explore the API at `http://localhost:5000/api/docs` (when implemented)

## 🤝 Need Help?

- **Issues**: Open an issue on GitHub
- **Documentation**: Check the README.md
- **Demo**: Try the live demo at https://ai-banking-system.vercel.app

---

**Built with ❤️ using Next.js, Node.js, PostgreSQL, and AI**
