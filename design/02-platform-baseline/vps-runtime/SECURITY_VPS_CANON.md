# Security VPS Canon

File này chốt security posture cho VPS self-host PMTL_VN.
Extends `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` với VPS-specific hardening.

---

## VPS OS hardening (Ubuntu 22.04)

```bash
# 1. Tắt SSH password auth, chỉ dùng key
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 2. Firewall — chỉ mở 22, 80, 443
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Caddy redirect → HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 443/udp   # HTTP/3
sudo ufw enable

# 3. Fail2ban — chặn brute force SSH
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# 4. Tự động security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Docker security rules

```yaml
# Trong docker-compose.prod.yml — áp dụng cho tất cả services
services:
  api:
    # Không chạy root trong container
    user: "1001:1001"
    # Read-only filesystem nếu có thể
    read_only: true
    tmpfs:
      - /tmp
    # Resource limits
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    # Không cho container escalate privileges
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # chỉ thêm lại nếu cần
```

---

## NestJS security headers (Helmet)

```typescript
// apps/api/src/main.ts
import helmet from '@fastify/helmet';  // hoặc helmet cho Express adapter

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // CORS — chỉ allow domain thật
  app.enableCors({
    origin: [process.env.WEB_URL, process.env.ADMIN_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
}
```

---

## Rate limit policy (NestJS app-layer, Phase 1)

Phase 1 dùng Postgres `rate_limit_records` table. Trigger chuyển Valkey khi p95 > 100ms.

```typescript
// apps/api/src/platform/rate-limit/rate-limit.guard.ts
// Pattern: check rate_limit_records table trước mỗi request nhạy cảm
// Áp dụng cho: /auth/*, /search/*, write paths, /upload/*
```

Limits mặc định theo endpoint type:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /auth/login` | 5 requests | 15 phút per IP |
| `POST /auth/register` | 3 requests | 1 giờ per IP |
| `GET /search/*` | 30 requests | 1 phút per IP |
| `POST /upload/*` | 10 requests | 1 giờ per user |
| `POST /community/*` | 20 requests | 1 giờ per user |

---

## Upload security (MIME sniffing bắt buộc)

```typescript
// apps/api/src/modules/content/upload.controller.ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/ogg', 'audio/mp4',  // audio kinh, chú
  'application/pdf',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Bắt buộc: magic bytes check (không chỉ trust extension)
import { fileTypeFromBuffer } from 'file-type';

async validateFile(buffer: Buffer, declaredMime: string) {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
    throw new BadRequestException('File type not allowed');
  }
  if (detected.mime !== declaredMime) {
    throw new BadRequestException('MIME type mismatch');
  }
}
```

---

## Secrets management trên VPS

```bash
# .env.production KHÔNG commit vào git
# Lưu tại: /opt/pmtl/infra/docker/.env.production
# Permission chỉ owner đọc được
chmod 600 /opt/pmtl/infra/docker/.env.production

# Generate strong secrets
openssl rand -base64 64 | tr -d '\n'  # dùng cho JWT_SECRET, SESSION_SECRET
```

```bash
# .gitignore phải có:
infra/docker/.env.production
infra/docker/.env*.local
*.pem
*.key
```

---

## OWASP Top 10 checklist cho VPS

| # | Threat | PMTL mitigation |
|---|---|---|
| A01 | Broken Access Control | NestJS guards + role check + deny-by-default |
| A02 | Cryptographic Failures | HTTPS everywhere (Caddy), bcrypt passwords, JWT rotation |
| A03 | Injection | Prisma ORM (parameterized), Zod input validation |
| A04 | Insecure Design | Domain boundaries, write-path audit trail |
| A05 | Security Misconfiguration | Helmet headers, no exposed ports (Postgres/Meili) |
| A06 | Vulnerable Components | pnpm audit + Dependabot/Renovate |
| A07 | Auth Failures | Session rotation, refresh token revoke, rate limit auth |
| A08 | Software Integrity | Docker image hash pinning, lockfile committed |
| A09 | Logging Failures | Pino structured logs, audit_logs table |
| A10 | SSRF | Không fetch external URL theo user input without allowlist |

---

## Không được làm

- Không expose Postgres `:5432` hay Meilisearch `:7700` ra public
- Không chạy containers với `privileged: true` trên prod
- Không commit `.env.production` vào git
- Không trust client-declared MIME type mà không sniff magic bytes
- Không để admin panel truy cập public mà không có bảo vệ thêm
