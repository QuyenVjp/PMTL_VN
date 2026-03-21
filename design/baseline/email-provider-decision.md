# EMAIL_PROVIDER_DECISION — Provider + Delivery Failure Policy

File này chốt quyết định về email provider, cấu hình, và chính sách xử lý thất bại.
Email là dependency thật ở Phase 1 (password reset, email verification).

> **Env vars**: `tracking/env-inventory.md` — SMTP_* group
> **Auth flow**: `01-identity/use-cases/manage-auth-session.md`
> **Notification**: `08-notification/` (push là separate concern)

---

## Quyết định: SMTP-first, không lock-in provider

**Phase 1 provider**: Generic SMTP (self-configured)
**Recommended provider**: Brevo (formerly Sendinblue) — free tier 300 emails/day, Vietnamese support
**Alternative**: Mailgun, SendGrid (sau khi volume tăng)
**Forbidden**: Không dùng Gmail SMTP trên production (rate limit 500/day, TLS issues)

**Lý do SMTP-first:**
- Không vendor lock-in — `SMTP_HOST` có thể thay bất kỳ lúc nào
- Brevo free tier đủ cho launch (300 emails/day, ~9,000/month)
- Hỗ trợ tiếng Việt UTF-8 không có vấn đề
- `nodemailer` đã là industry standard cho Node.js

---

## Email types và volume estimates

| Email type | Trigger | Estimated volume/day |
|---|---|---|
| Email verification | Register mới | 5–20 (launch phase) |
| Password reset | Forgot password | 2–10 |
| Password changed | Reset success | 2–10 |
| Account locked | Too many failures | 0–5 |
| **Total** | | **< 50/day at launch** |

**Push notification** (welcome, practice reminders) → Web Push (VAPID), NOT email. Xem `08-notification/push-notification-architecture.md`.
Email KHÔNG được dùng cho marketing/bulk.

---

## Provider configuration

### Brevo (recommended Phase 1)

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo_login_email>
SMTP_PASS=<brevo_smtp_key>
SMTP_FROM_NAME=PMTL_VN
SMTP_FROM_EMAIL=noreply@pmtl.vn
```

**DKIM/SPF setup** (bắt buộc để không bị spam):
- SPF: Add `include:spf.brevo.com` to DNS TXT record for pmtl.vn
- DKIM: Brevo dashboard → Senders → Domain authentication
- DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@pmtl.vn`
- Verify: `mail-tester.com` score > 8/10 trước khi launch

---

## Email service contract

Owner: `apps/api/src/platform/notification/email.service.ts`

```typescript
interface EmailService {
  sendEmailVerification(to: string, token: string): Promise<EmailResult>;
  sendPasswordReset(to: string, token: string): Promise<EmailResult>;
  sendPasswordChanged(to: string): Promise<EmailResult>;
  sendAccountLocked(to: string, reason: string): Promise<EmailResult>;
}

type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};
```

**Template strategy**: Plain HTML templates in `apps/api/src/platform/notification/templates/`
- Vietnamese only, no i18n
- Inline CSS (email client compatibility)
- Text fallback always included
- No external image dependencies (avoid tracking pixel issues)

---

## Delivery failure policy

### Retry semantics

| Failure type | Action | Max retries | Final action |
|---|---|---|---|
| SMTP connection timeout | Retry with backoff | 3 | Log error, user sees error message |
| SMTP auth failure | No retry | 0 | Alert on-call (config issue) |
| Recipient address rejected | No retry | 0 | Mark email as undeliverable, log |
| Rate limit from provider | Retry after 60s | 2 | Queue if BullMQ enabled |
| Invalid template render | No retry | 0 | Alert on-call (code bug) |

### Phase 1 (no queue): Inline retry
```
Email send attempt
  → Fail → wait 2s → retry
  → Fail → wait 10s → retry
  → Fail → log error + return error to caller
  → Caller returns safe error response to user (no email leak)
```

### Phase 2+ (with BullMQ): Queue-based retry
- Email jobs enqueue to `pmtl:email-send` queue
- BullMQ handles retry with exponential backoff
- Dead-letter after 3 failures → admin visible in queue ops

### Anti-enumeration requirement
Email delivery failure MUST NOT tell user whether email exists:
```
// CORRECT: Always return same response
{ message: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn." }

// WRONG: Leaks account existence
{ message: "Email này không tồn tại trong hệ thống." }
```

---

## Audit requirements

| Event | Audit action | Required fields |
|---|---|---|
| Verification email sent | `email.verification.sent` | actorUserId, to (hashed), messageId |
| Password reset email sent | `email.reset.sent` | actorUserId, to (hashed), messageId |
| Email delivery failed | `email.delivery.failed` | to (hashed), error_code, attempt_count |

**IP/Email hashing**: log hashed email for audit, not raw — `sha256(email + EMAIL_HASH_SALT)`

---

## Monitoring

| Metric | Type | Alert threshold |
|---|---|---|
| `pmtl_email_sent_total` | Counter | — |
| `pmtl_email_failed_total` | Counter | > 5 failures in 10 min → alert |
| `pmtl_email_delivery_latency_seconds` | Histogram | p95 > 10s → warn |

---

## Provider upgrade path

When to upgrade from Brevo free:
- Volume > 250 emails/day consistently
- Need transactional analytics (delivery rates, opens)
- Need dedicated sending IP

Upgrade options (no code change — just SMTP env vars):
1. **Brevo paid** — same SMTP credentials, just higher limit
2. **Mailgun** — change SMTP_HOST + credentials
3. **SendGrid** — change SMTP_HOST + credentials

Code is provider-agnostic by design.

---

## Env vars (complete)

| Env | Owner | Required | Purpose |
|---|---|---|---|
| `SMTP_HOST` | notification | yes | SMTP server hostname |
| `SMTP_PORT` | notification | yes | SMTP port (587 for STARTTLS) |
| `SMTP_SECURE` | notification | no | `true` for port 465 (TLS), `false` for 587 |
| `SMTP_USER` | notification | yes | SMTP auth username |
| `SMTP_PASS` | notification | yes | SMTP auth password |
| `SMTP_FROM_NAME` | notification | yes | Sender display name |
| `SMTP_FROM_EMAIL` | notification | yes | Sender email address |
| `EMAIL_HASH_SALT` | notification | yes | Salt for hashing emails in audit logs |

---

## Code locations

| Artifact | Location |
|---|---|
| Email service | `apps/api/src/platform/notification/email.service.ts` |
| Email templates | `apps/api/src/platform/notification/templates/*.html` |
| Email config | `apps/api/src/platform/config/email.config.ts` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| Provider configured | DKIM/SPF/DMARC pass on mail-tester.com |
| Verification email works | Register → email received → link verifies account |
| Reset email works | Forgot password → email received → reset completes |
| Anti-enumeration | Same response regardless of email existence |
| Delivery failure logged | Intentional fail → audit log entry present |
| Retry works | SMTP timeout → retry logged → eventual success or structured failure |
