# Stage 1: Build the Vite frontend + compile native modules
FROM node:20-alpine AS builder
WORKDIR /app

# Required for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Prune to production-only dependencies (retains compiled native binaries)
RUN npm prune --omit=dev

# Stage 2: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./

# Copy pre-compiled node_modules from builder (no recompilation needed)
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend from stage 1
COPY --from=builder /app/dist ./dist

# Copy server source and TypeScript config
COPY server ./server
COPY tsconfig.json ./

EXPOSE 8080
CMD ["npx", "tsx", "server/index.ts"]
