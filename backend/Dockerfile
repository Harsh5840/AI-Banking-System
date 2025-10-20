# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema (needed before install due to postinstall script)
COPY prisma ./prisma

# Install dependencies with pnpm (handles peer dependencies better)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build TypeScript (prisma generate is now included in build script)
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Install pnpm in runtime stage
RUN npm install -g pnpm

# Copy built application and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/server.js"]
