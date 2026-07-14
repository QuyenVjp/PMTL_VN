# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /repo

# Copy workspace manifests first (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM deps AS builder

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /repo/apps/api
RUN pnpm run build

# ─── Stage 3: prod deploy bundle ──────────────────────────────────────────────
FROM builder AS pruner
WORKDIR /repo
RUN pnpm deploy --filter @pmtl/api --prod --legacy /deploy/api

# ─── Stage 4: runtime ─────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime

WORKDIR /app

# Copy pruned prod deps
COPY --from=pruner /deploy/api/node_modules ./node_modules

# Copy compiled output
COPY --from=builder /repo/apps/api/dist ./dist
COPY --from=builder /repo/apps/api/prisma ./prisma
COPY --chown=nonroot:nonroot apps/api/.docker/uploads/.keep ./uploads/.keep

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["/nodejs/bin/node", "-e", "const http=require('http');const req=http.get('http://127.0.0.1:3001/api/health/live',res=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.setTimeout(5000,()=>{req.destroy();process.exit(1);});"]

CMD ["dist/main.js"]
