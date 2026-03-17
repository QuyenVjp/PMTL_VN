FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable

FROM base AS dev
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --filter @pmtl/cms... --frozen-lockfile=false

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/cms/package.json apps/cms/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --filter @pmtl/cms... --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter @pmtl/cms build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app ./ 
EXPOSE 3001
CMD ["pnpm", "--filter", "@pmtl/cms", "start"]
