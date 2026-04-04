# Docker Prod Compose Canon

File này chốt `docker-compose.prod.yml` template cho VPS self-host PMTL_VN.

> Owner file này là source of truth cho prod compose structure.
> File thật sống tại `infra/docker/docker-compose.prod.yml`.

---

## Production compose template

```yaml
# infra/docker/docker-compose.prod.yml
name: pmtl-prod

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"   # HTTP/3
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    networks: [pmtl]
    depends_on: [web, api, admin]

  web:
    image: ghcr.io/${GITHUB_ORG}/pmtl-web:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    networks: [pmtl]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  api:
    image: ghcr.io/${GITHUB_ORG}/pmtl-api:${IMAGE_TAG:-latest}
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_ENV=production
    volumes:
      - media_data:/data/media
    networks: [pmtl]
    depends_on:
      postgres:
        condition: service_healthy
      meilisearch:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/health/live"]
      interval: 30s
      timeout: 10s
      retries: 5

  admin:
    image: ghcr.io/${GITHUB_ORG}/pmtl-admin:${IMAGE_TAG:-latest}
    restart: unless-stopped
    networks: [pmtl]

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-pmtl_prod}
      POSTGRES_USER: ${POSTGRES_USER:-pmtl}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    networks: [pmtl]
    # KHÔNG expose port 5432 ra ngoài trên prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-pmtl}"]
      interval: 10s
      timeout: 5s
      retries: 5

  meilisearch:
    image: getmeili/meilisearch:v1.12
    restart: unless-stopped
    environment:
      MEILI_ENV: production
      MEILI_MASTER_KEY: ${MEILISEARCH_MASTER_KEY}
      MEILI_NO_ANALYTICS: "true"
    volumes:
      - meili_data:/meili_data
    networks: [pmtl]
    # KHÔNG expose :7700 ra ngoài — chỉ internal
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    ports:
      - "127.0.0.1:3003:3001"   # chỉ bind localhost
    volumes:
      - kuma_data:/app/data
    networks: [pmtl]

volumes:
  pg_data:
  meili_data:
  media_data:
  caddy_data:
  caddy_config:
  kuma_data:

networks:
  pmtl:
    driver: bridge
```

---

## Multi-stage Dockerfile cho apps/api

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pmtl/api build
RUN pnpm --filter @pmtl/api exec prisma generate

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3002/health/live || exit 1

CMD ["node", "dist/main.js"]
```

---

## .dockerignore (dùng chung cho tất cả apps)

```
node_modules
.next
dist
.git
.env*
*.log
coverage
.turbo
```

---

## Deploy update command (zero-downtime rolling)

```bash
# Pull images mới, restart từng service, không down toàn bộ cùng lúc
IMAGE_TAG=v1.2.3 docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --no-deps --build api
docker compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d --no-deps web admin

# Verify
docker compose ps
curl https://pmtl.vn/health/live
```

---

## Rules

- Không commit `.env.production` vào git
- Không expose Postgres `:5432` hoặc Meilisearch `:7700` ra public interface
- `restart: unless-stopped` bắt buộc cho tất cả services production
- `healthcheck` bắt buộc cho api, postgres, meilisearch
- Media data mount vào named volume `media_data`, không bind-mount thư mục host tùy tiện
