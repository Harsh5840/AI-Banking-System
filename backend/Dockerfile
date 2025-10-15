# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy backend files
COPY . .

# Install dependencies
RUN npm install

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/server.js"]
