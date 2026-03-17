@echo off
set DATABASE_URL=postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl
set MEILI_HOST=http://127.0.0.1:7700
set REDIS_URL=redis://127.0.0.1:6379
set PAYLOAD_DB_PUSH=false
set PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
set CMS_PUBLIC_URL=http://localhost:3001
set NEXT_PUBLIC_SITE_URL=http://localhost:3000
set PORT=3001
set PAYLOAD_SECRET=replace-with-dev-secret
set CSRF_SECRET=replace-with-dev-csrf-secret
set SENTRY_ENABLED=false
set NEXT_PUBLIC_SENTRY_ENABLED=false
pnpm.cmd --filter @pmtl/cms dev 1> tmp-runtime-logs\cms-stdout.log 2> tmp-runtime-logs\cms-stderr.log
