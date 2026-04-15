# ---- base image (common) ----
FROM public.ecr.aws/docker/library/node:18-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat openssl

# ---- deps ----
FROM base AS deps
COPY package*.json ./
# Schema must exist before npm ci (postinstall runs prisma generate)
COPY prisma ./prisma
RUN npm ci

# ---- build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client for runtime usage
RUN npx prisma generate
# Build Next.js (standalone output)
RUN npm run build

# ---- runtime (standalone) ----
FROM public.ecr.aws/docker/library/node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy Next.js standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Include prisma schema and node_modules if needed by runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
