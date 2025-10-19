# syntax=docker/dockerfile:1.7-labs

# ==================================
# Base Stage
# ==================================
FROM node:22-alpine AS base

# Install OpenSSL, wget (for healthcheck), and other dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat wget

# Enable Corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# ==================================
# Dependencies Stage
# ==================================
FROM base AS dependencies

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Store production dependencies
RUN cp -R node_modules /prod_node_modules

# Install all dependencies (including dev dependencies for build)
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ==================================
# Build Stage
# ==================================
FROM base AS build

# Copy all dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN pnpm build

# ==================================
# Production Stage
# ==================================
FROM base AS production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=dependencies /prod_node_modules ./node_modules

# Copy Prisma schema and generated client
COPY --chown=nestjs:nodejs prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]

