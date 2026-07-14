# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/admin/package.json ./apps/admin/

RUN pnpm install --frozen-lockfile

# ─── Stage 2: build ───────────────────────────────────────────────────────────
FROM deps AS builder

COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

WORKDIR /repo/apps/admin
RUN pnpm run build

# ─── Stage 3: runtime (static SPA via Caddy) ──────────────────────────────────
FROM caddy:2.10-alpine AS runtime

# Serve static SPA — Caddy handles routing and compression
COPY --from=builder /repo/apps/admin/dist /srv
COPY apps/admin/Caddyfile /etc/caddy/Caddyfile

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3002/ || exit 1
