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
- [ ] `pmtl.vn` → `web:3000` routing OK
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

## 7. Container Security Hardening Canon (Enterprise 2026)

Section này chốt container hardening requirements vượt qua baseline distroless.

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

### 7.6 Container Hardening Checklist

- [ ] Base image: `gcr.io/distroless/nodejs20-debian12:nonroot`
- [ ] Non-root user: `USER nonroot:nonroot`
- [ ] `security_opt: no-new-privileges:true`
- [ ] `cap_drop: ALL` trong compose
- [ ] `cap_add` chỉ những capabilities thật sự cần
- [ ] `read_only: true` + tmpfs cho writable paths
- [ ] Seccomp profile applied (`seccomp:/etc/docker/seccomp-pmtl.json`)
- [ ] Trivy scan pass (no CRITICAL/HIGH vulnerabilities)
- [ ] Image signed với Cosign
- [ ] Image digest pinned (không dùng floating tags)
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

*Owner: `design/02-platform-baseline/vps-runtime/` · Last updated: 2026-03-27*

