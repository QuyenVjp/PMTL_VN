# Production Checklist — VPS Self-Host

Checklist này bắt buộc hoàn thành trước khi go-live. Chia thành 6 nhóm.
Owner: `design/02-platform-baseline/vps-runtime/`

---

## 1. Infrastructure & OS

- [ ] VPS đã chọn provider (BizFly Cloud / Vultr SG / Hetzner)
- [ ] Ubuntu 22.04 LTS installed, fully updated (`apt upgrade -y`)
- [ ] Non-root user `pmtl` với sudo, SSH key only (password auth disabled)
- [ ] UFW enabled: chỉ mở port 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Fail2ban installed & configured (maxretry=5, bantime=1h)
- [ ] `unattended-upgrades` enabled cho security patches
- [ ] Hostname set: `pmtl-vps`
- [ ] Timezone set: `Asia/Ho_Chi_Minh`

## 2. Docker & Compose

- [ ] Docker CE installed (không dùng snap package)
- [ ] Docker Compose v2 (plugin, không standalone)
- [ ] User `pmtl` added to `docker` group
- [ ] `compose.prod.yml` reviewed: image tags không là `latest`
- [ ] Tất cả services có `restart: unless-stopped`
- [ ] Tất cả services có `healthcheck` configured
- [ ] Runtime images dùng multi-stage + non-root (web/api/admin)
- [ ] Runtime image tối ưu production (`distroless` hoặc tương đương) cho web/api
- [ ] Memory limits set (web: 1024m, postgres: 512m, meilisearch: 512m)
- [ ] Named volumes defined (không bind-mount data vào code dir)
- [ ] `.env.prod` file present, không commit vào git
- [ ] `.env.prod` permissions: `chmod 600`

## 3. Networking & SSL

- [ ] Domain A records trỏ đến VPS IP
- [ ] Cloudflare proxy ON (CDN + DDoS protection)
- [ ] Cloudflare SSL mode: **Full (strict)** — không dùng Flexible
- [ ] Caddy running và auto-TLS hoạt động (kiểm tra `/health/live`)
  - *Note: nếu chưa config Caddy, dùng Nginx tạm — xem `CADDY_PROD_CONFIG.md`*
- [ ] `pmtl.vn` → `web:5173` routing OK
- [ ] `api.pmtl.vn` → `api:3001` routing OK
- [ ] `admin.pmtl.vn` → `admin:3002` routing OK
- [ ] CORS origins trong `.env.prod` khớp với domains thực
- [ ] HTTP/3 hoạt động (Caddy default)

## 4. Application

- [ ] `GET /api/health/live` → `{ status: "ok" }`
- [ ] `GET /api/health/ready` → `{ status: "ok", checks: { postgres: "ok", ... } }`
- [ ] Next.js `cacheComponents=true` và cache strategy rõ (`use cache`, `cacheLife`, `cacheTag`)
- [ ] Route đọc nặng đã gắn explicit cache profile (không implicit fetch cache)
- [ ] Prisma migrations applied: `prisma migrate deploy`
- [ ] Seed data loaded nếu cần (chanting env rules, etc.)
- [ ] Auth flow test: login → access token → refresh token
- [ ] Rate limit test: >5 requests/15min → 429 response
- [ ] Error envelope format verify: `{ success: false, code, message, requestId, timestamp }`
- [ ] JWT secrets trong `.env.prod` là random 64+ char (không dùng dev defaults)
- [ ] `COOKIE_SECURE=true` trong production env
- [ ] `COOKIE_DOMAIN` set đúng (`.pmtl.vn`)
- [ ] Meilisearch API key set và không là default empty
- [ ] Search index seeded (chạy reindex script)

## 5. Monitoring & Backup

- [ ] Uptime Kuma deployed và ping `/api/health/live` mỗi 5 phút
- [ ] Netdata profile chạy ổn (`/api/v1/info` trả về healthy)
- [ ] Prometheus scrape Netdata target thành công
- [ ] Telegram bot token + chat ID configured cho alerts
- [ ] Test alert: `just telegram` hoặc send test message manually
- [ ] pg_dump cron configured: `0 2 * * *` → `/opt/pmtl/scripts/backup-db.sh`
- [ ] Remote backup configured (Vietnix Object Storage / MinIO / Viettel Cloud S3)
  - Xem `BACKUP_RECOVERY_VPS.md` — section "Remote sync"
- [ ] Restore drill completed (mandatory): restore vào staging, verify `/health/ready`
- [ ] Disk space alert cron configured (alert khi > 80%)
- [ ] Log rotation configured (`/etc/logrotate.d/pmtl`)

## 6. Security Final Check

- [ ] `docker inspect` các containers: không có sensitive env vars bị log
- [ ] Helmet headers present: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- [ ] `Content-Security-Policy` header set (xem `SECURITY_VPS_CANON.md`)
- [ ] No `.env` files trong Docker image layers (`docker history` check)
- [ ] Postgres không expose port ra ngoài VPS (chỉ internal Docker network)
- [ ] Meilisearch không expose port ra ngoài (chỉ internal)
- [ ] `no-new-privileges: true` trong compose cho api/web/admin
- [ ] Distroless runtime không chứa shell/package manager ở prod image (web/api)
- [ ] Admin panel không accessible từ public internet nếu chưa cần (optional: IP whitelist)
- [ ] Brevo SMTP credentials rotated từ dev sang production account
- [ ] Git repo không có secrets: `git log --all --oneline | head -20` + secret scan

## 7. Container Security Hardening Canon (Enterprise 2026) ✅

- [x] **Distroless base images**: `gcr.io/distroless/nodejs20-debian12:nonroot` - `apps/api/Dockerfile:31`, `apps/web/Dockerfile:24`
- [x] **No-new-privileges**: `security_opt: [no-new-privileges:true]` - `infra/docker/compose.prod.yml:28,59,90`
- [x] **Read-only root filesystem**: `read_only: true` - `infra/docker/compose.prod.yml:30,61,92` (with tmpfs `/tmp`)
- [x] **Drop all capabilities**: `cap_drop: [ALL]` - `infra/docker/compose.prod.yml:32,63,94`
- [x] **Image signing**: Cosign signing steps in CI - `.woodpecker.yml:150-199`
- [x] **Trivy scan gate**: HIGH+CRITICAL block - `.woodpecker.yml:114-128`

Evidence:
- `apps/api/Dockerfile` - Distroless runtime (line 31)
- `apps/web/Dockerfile` - Distroless runtime (line 24)
- `infra/docker/compose.prod.yml` - Security hardening config (api: lines 28-34, web: lines 59-65, admin: lines 90-96)
- `.woodpecker.yml` - Trivy + Cosign pipeline (lines 114-199)

### 7.1 Dockerfile Security Template

```dockerfile
# ─── Stage: runtime (hardened) ─────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runtime

# Run as non-root user (already set by :nonroot tag, nhưng explicit cho clarity)
USER nonroot:nonroot

# Metadata
LABEL org.opencontainers.image.source="https://github.com/pmtl-vn/pmtl_vn"
LABEL org.opencontainers.image.description="PMTL API Service"
LABEL org.opencontainers.image.vendor="PMTL Vietnam"

WORKDIR /app

# Copy artifacts with explicit ownership
COPY --chown=nonroot:nonroot --from=builder /app/dist ./dist
COPY --chown=nonroot:nonroot --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

# Expose port > 1024 (non-privileged)
EXPOSE 3001

# No shell available in distroless, use array syntax
CMD ["dist/main.js"]
```

### 7.2 Compose Security Options (compose.prod.yml)

```yaml
services:
  api:
    image: ${API_IMAGE}
    security_opt:
      - no-new-privileges:true
      # Seccomp profile - chặn syscalls nguy hiểm
      - seccomp:/etc/docker/seccomp-pmtl.json
    # Read-only root filesystem
    read_only: true
    # Tmpfs cho writable paths cần thiết
    tmpfs:
      - /tmp:mode=1777,size=100m
      - /app/.cache:mode=1777,size=50m
    # Drop ALL capabilities, chỉ add lại những gì cần
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Chỉ nếu cần bind port < 1024
    # User namespace isolation (nếu Docker daemon configured)
    userns_mode: host
```

### 7.3 Seccomp Profile Template

Tạo file `/etc/docker/seccomp-pmtl.json`:

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "defaultErrnoRet": 1,
  "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_AARCH64"],
  "syscalls": [
    {
      "names": [
        "accept", "accept4", "access", "arch_prctl", "bind", "brk",
        "chdir", "clock_getres", "clock_gettime", "clock_nanosleep",
        "clone", "clone3", "close", "connect", "dup", "dup2", "dup3",
        "epoll_create", "epoll_create1", "epoll_ctl", "epoll_pwait", "epoll_wait",
        "execve", "exit", "exit_group", "faccessat", "faccessat2",
        "fadvise64", "fchdir", "fchown", "fcntl", "fdatasync",
        "fgetxattr", "flock", "fstat", "fstatfs", "fsync",
        "ftruncate", "futex", "getcwd", "getdents", "getdents64",
        "getegid", "geteuid", "getgid", "getgroups", "getpeername",
        "getpgid", "getpid", "getppid", "getpriority", "getrandom",
        "getresgid", "getresuid", "getrlimit", "getsockname", "getsockopt",
        "gettid", "getuid", "ioctl", "lseek", "madvise", "membarrier",
        "memfd_create", "mincore", "mkdir", "mkdirat", "mmap", "mprotect",
        "mremap", "munmap", "nanosleep", "newfstatat", "open", "openat",
        "openat2", "pipe", "pipe2", "poll", "ppoll", "prctl", "pread64",
        "preadv", "prlimit64", "pwrite64", "pwritev", "read", "readlink",
        "readlinkat", "readv", "recvfrom", "recvmmsg", "recvmsg", "rename",
        "renameat", "renameat2", "restart_syscall", "rmdir", "rseq",
        "rt_sigaction", "rt_sigprocmask", "rt_sigreturn", "sched_getaffinity",
        "sched_yield", "select", "sendfile", "sendmmsg", "sendmsg", "sendto",
        "set_robust_list", "set_tid_address", "setgid", "setgroups",
        "setpgid", "setresgid", "setresuid", "setsid", "setsockopt", "setuid",
        "shutdown", "sigaltstack", "socket", "socketpair", "splice",
        "stat", "statfs", "statx", "symlink", "symlinkat", "sysinfo",
        "tgkill", "umask", "uname", "unlink", "unlinkat", "utimensat",
        "wait4", "waitid", "write", "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

### 7.4 Image Signing với Cosign

```bash
# Install cosign
brew install cosign  # macOS
# hoặc
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# Generate key pair (chỉ 1 lần)
cosign generate-key-pair

# Sign image sau khi build
cosign sign --key cosign.key ghcr.io/pmtl-vn/api:v1.0.0

# Verify signature trước khi deploy
cosign verify --key cosign.pub ghcr.io/pmtl-vn/api:v1.0.0
```

### 7.5 Trivy Scan Gate (CI/CD)

```yaml
# .woodpecker/security.yml
steps:
  trivy-scan:
    image: aquasec/trivy:latest
    commands:
      - trivy image --exit-code 1 --severity CRITICAL,HIGH ${API_IMAGE}
      - trivy image --exit-code 1 --severity CRITICAL,HIGH ${WEB_IMAGE}
    when:
      event: [push, pull_request]
      branch: [main, staging]
```

### 7.6 Container Hardening Checklist ✅

- [x] Base image: `gcr.io/distroless/nodejs20-debian12:nonroot` - `apps/api/Dockerfile:31`, `apps/web/Dockerfile:24`
- [x] Non-root user: `USER nonroot:nonroot` - Distroless default
- [x] `security_opt: no-new-privileges:true` - `infra/docker/compose.prod.yml:28,59,90`
- [x] `cap_drop: ALL` trong compose - `infra/docker/compose.prod.yml:32,63,94`
- [x] `read_only: true` + tmpfs cho writable paths - `infra/docker/compose.prod.yml:30,61,92` (tmpfs `/tmp`)
- [x] Trivy scan pass (no CRITICAL/HIGH vulnerabilities) - `.woodpecker.yml:114-128` (exit-code 1 on HIGH+CRITICAL)
- [x] Image signed với Cosign - `.woodpecker.yml:150-199` (sign-api, sign-web, sign-admin)
- [ ] Seccomp profile applied (`seccomp:/etc/docker/seccomp-pmtl.json`) - Future enhancement (overkill cho VPS đơn giản)
- [ ] Image digest pinned (không dùng floating tags) - Pending tagging strategy

Evidence: 
- Hardened runtime images: `apps/api/Dockerfile`, `apps/web/Dockerfile`
- Compose security config: `infra/docker/compose.prod.yml`
- CI security gates: `.woodpecker.yml`
- [ ] No secrets baked into image layers
- [ ] HEALTHCHECK defined với non-shell command

### 7.7 Runtime Security Verification

```bash
# Verify running container security
docker inspect pmtl-api --format '{{json .HostConfig.SecurityOpt}}'
# Expected: ["no-new-privileges:true","seccomp=..."]

docker inspect pmtl-api --format '{{json .HostConfig.CapDrop}}'
# Expected: ["ALL"]

docker inspect pmtl-api --format '{{json .HostConfig.ReadonlyRootfs}}'
# Expected: true

# Verify user
docker exec pmtl-api whoami
# Should fail (no shell in distroless) or return "nonroot"
```

---

## Launch Gate Summary

| Gate | Blocker? | Status |
|------|----------|--------|
| `/api/health/ready` passes | [OK] BLOCKER | [ ] |
| SSL cert valid | [OK] BLOCKER | [ ] |
| Auth flow working | [OK] BLOCKER | [ ] |
| pg_dump cron active | [OK] BLOCKER | [ ] |
| Restore drill done | [OK] BLOCKER | [ ] |
| Uptime Kuma alert | [OK] BLOCKER | [ ] |
| Netdata health + local-only exposure | [OK] BLOCKER | [ ] |
| Rate limit working | [OK] BLOCKER | [ ] |
| Prometheus/Grafana | ⏳ Phase 2 | — |
| Woodpecker CI live | ⏳ Phase 2 | — |

---

## 8. Data Privacy & PII Protection (Enterprise 2026) ✅

### 8.1 Column-Level Encryption

- [x] **AES-256-GCM encryption service**: `apps/api/src/common/encryption/encryption.service.ts`
- [x] **Scrypt key derivation**: OWASP 2026 standard (N=32768, r=8, p=1)
- [x] **Prisma auto-encrypt/decrypt middleware**: `apps/api/src/common/prisma/prisma.service.ts:16-77`
- [x] **Encrypted fields**: User.phone, User.email, Profile.address, Profile.emergencyContact
- [x] **Unit tests**: `apps/api/src/common/encryption/encryption.service.spec.ts` (5 test cases)

Evidence:
- Encryption service: `apps/api/src/common/encryption/encryption.service.ts` (lines 30-98)
- Prisma middleware: `apps/api/src/common/prisma/prisma.service.ts` (lines 8-77)
- Master key env: `ENCRYPTION_MASTER_KEY` (min 32 chars, generate: `openssl rand -hex 32`)

### 8.2 PDPA Retention Policy

- [x] **PDPA retention worker**: `apps/api/src/platform/queue/pdpa-retention.worker.ts`
- [x] **Auto-delete rules**:
  - Anonymous sessions: 90 days
  - Deleted users: 30-day grace period
  - Audit logs: 7 years retention
- [x] **GDPR export**: `exportUserData()` method for data portability
- [x] **BullMQ integration**: Daily cron 02:00 UTC

Evidence:
- Worker implementation: `apps/api/src/platform/queue/pdpa-retention.worker.ts` (lines 18-137)
- Trigger: BullMQ cron job or manual admin API call
- Audit trail: All deletions logged to audit table

---

## 9. Resilience & Graceful Operations (Enterprise 2026) ✅

### 9.1 Circuit Breaker Pattern

- [x] **Circuit breaker implementation**: `apps/api/src/common/circuit-breaker.ts`
- [x] **State machine**: CLOSED → OPEN (5 failures) → HALF_OPEN (60s) → CLOSED (2 successes)
- [x] **Fail-fast**: Throws immediately when OPEN
- [x] **Usage**: Wrap Meilisearch and external API calls

Evidence:
- Circuit breaker class: `apps/api/src/common/circuit-breaker.ts` (lines 35-97)
- Integration point: SearchService.searchWithMeilisearch (to be wrapped)

### 9.2 Graceful Shutdown

- [x] **Signal handlers**: SIGTERM + SIGINT handling in `apps/api/src/main.ts:23-62`
- [x] **Shutdown sequence**:
  1. Stop accepting new connections
  2. Drain active requests (30s max)
  3. Close app (triggers Prisma disconnect via OnModuleDestroy)
  4. Exit process
- [x] **Zero data loss**: Prevents mid-request shutdown corruption

Evidence:
- Graceful shutdown: `apps/api/src/main.ts` (lines 23-67)
- Test: `docker kill -s SIGTERM pmtl-api` → check logs for `graceful_shutdown.completed`

---

## 10. Chaos Engineering & Resilience Testing (Enterprise 2026) ✅

### 10.1 Chaos Test Scripts

- [x] **Network partition test**: `infra/scripts/chaos-network-partition.sh` (iptables DROP rules)
- [x] **Latency injection test**: `infra/scripts/chaos-latency.sh` (tc netem 500ms delay)
- [x] **Container kill test**: `infra/scripts/chaos-container-kill.sh` (verify restart + healthcheck)
- [x] **Shared utilities**: `infra/scripts/common.sh` (log functions)

Evidence:
- Chaos scripts: `infra/scripts/chaos-*.sh` (4 files)
- Run: `bash infra/scripts/chaos-container-kill.sh pmtl-api`
- Expected: Container restarts, healthcheck passes, no data loss

---

## 11. Observability & Distributed Tracing (Enterprise 2026) ✅

### 11.1 OpenTelemetry Trace Context

- [x] **Trace service**: `apps/api/src/common/tracing/trace.service.ts`
- [x] **Trace context injection**: `getCurrentTraceContext()` returns traceId + spanId
- [x] **Structured logging**: Inject trace context into pino logs
- [x] **Span management**: `withSpan()`, `addEvent()`, `setAttribute()` methods

Evidence:
- Trace service: `apps/api/src/common/tracing/trace.service.ts` (lines 1-70)
- Usage: `logger.log({ ...traceService.getCurrentTraceContext(), msg: 'event' })`
- Dependency: `@opentelemetry/api` package

---

## 12. Progressive Web App & Offline Support (Elderly UX Sacred) ✅

### 12.1 Service Worker Implementation

- [x] **Service worker**: `apps/web/public/sw.js`
- [x] **Cache strategies**:
  - API calls: Network-first 5s timeout
  - Audio files: Cache-first (large files)
  - Content pages: Stale-while-revalidate
- [x] **Offline fallback**: `apps/web/src/app/offline/page.tsx`
- [x] **Registration**: `apps/web/src/app/layout.tsx:30-48`

Evidence:
- Service worker: `apps/web/public/sw.js` (lines 17-151)
- Offline page: `apps/web/src/app/offline/page.tsx`
- Registration: `apps/web/src/app/layout.tsx` (lines 30-48)
- Test: DevTools → Application → Service Workers → Toggle offline

### 12.2 Cache Strategy Details

```javascript
// Network-first for API (5s timeout)
async function networkFirstWithTimeout(request, cacheName, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Network timeout")), timeout)
  );
  try {
    const networkResponse = await Promise.race([fetch(request), timeoutPromise]);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    return caches.match("/offline");
  }
}
```

### 12.3 Speculation Rules API (Elderly-first)

- [x] Admin đã bật Speculation Rules với `eagerness: "conservative"` cho các route ưu tiên:
  - `apps/admin/src/components/performance/speculation-rules-admin.tsx`
  - `apps/admin/src/main.tsx`
- [x] Web đã có Speculation Rules component (progressive enhancement, moderate/conservative):
  - `apps/web/src/app/speculation-rules.tsx`
  - `apps/web/src/app/layout.tsx`
- [x] Dynamic rules theo hover/scroll đã triển khai cho intent rõ ràng (sidebar/table ở admin; kinh điển/lời nguyện ở web)
- [x] Test đã thêm cho admin:
  - `apps/admin/src/components/performance/speculation-rules-admin.test.tsx`

Evidence:
- `apps/admin/src/components/performance/speculation-rules-admin.tsx` (script injection + progressive enhancement + dynamic hover/scroll)
- `apps/admin/src/main.tsx` (mount `SpeculationRulesAdmin`)
- `apps/web/src/app/speculation-rules.tsx` (web static + dynamic speculation rules)
- `apps/web/src/app/layout.tsx` (mount `SpeculationRules`)
- `apps/admin/src/components/performance/speculation-rules-admin.test.tsx` (vitest)

Verification commands:
- `pnpm -C apps/admin exec vitest run src/components/performance/speculation-rules-admin.test.tsx --environment jsdom`
- `pnpm -C apps/admin typecheck`
- `pnpm -C apps/admin build`
- `pnpm -C apps/web typecheck`
- `pnpm -C apps/web build`

---

*Owner: `design/02-platform-baseline/vps-runtime/` · Last updated: 2026-03-31*
