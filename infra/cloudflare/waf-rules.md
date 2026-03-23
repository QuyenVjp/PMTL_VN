# Cloudflare WAF Rules Plan

File này là `design/IaC plan` cho Cloudflare edge rules của PMTL_VN.
Mục tiêu:

- không config tay rồi drift
- có một canon rõ cho dashboard hoặc Terraform/API apply sau này
- tách rõ `edge rule` với `app-layer fallback`

> Canon chiến lược: `design/baseline/waf-antibot-strategy.md`
> App fallback canon: `design/baseline/security.md`
> Growth-safe launch: `design/baseline/high-traffic-resilience-plan.md`
> Change procedure: `infra/cloudflare/change-runbook.md`

---

## Zone assumptions

- primary zone: `pmtl.vn`
- public hosts:
  - `pmtl.vn`
  - `www.pmtl.vn`
  - `api.pmtl.vn`
  - `admin.pmtl.vn`

## Rule ordering

1. verified crawler allow/budget
2. auth/search abuse challenge
3. low-reputation / unknown bot challenge
4. managed WAF block
5. oversized request block
6. optional admin geo challenge

Rule priority phải giữ đúng thứ tự này để verified crawlers không bị ăn block trước.

---

## Rule Set

### CF-100 Verified crawler read budget

| Field | Value |
|---|---|
| action | `managed_challenge` khi vượt ngưỡng |
| threshold | `240 req / 1 phút / IP` |
| applies to | public content read surfaces |
| expression intent | verified crawler + path thuộc public content read set |

**Path scope**:
- `/`
- `/bai-viet*`
- `/bach-thoai*`
- `/hoi-dap*`
- `/huong-dan*`
- `/kinh-bai-tap*`
- `/ngoi-nha-nho*`
- `/lich`
- `/su-kien*`

### CF-110 Verified crawler search budget

| Field | Value |
|---|---|
| action | `managed_challenge` |
| threshold | `120 req / 1 phút / IP` |
| applies to | `/api/search` |
| purpose | không cho search endpoint thành free crawl amplifier |

### CF-120 Anonymous public read burst

| Field | Value |
|---|---|
| action | `managed_challenge` |
| threshold | `180 req / 1 phút / IP` |
| applies to | public content read surfaces |
| purpose | chặn scrape/browser automation burst |

### CF-130 Anonymous search burst

| Field | Value |
|---|---|
| action | `managed_challenge` |
| threshold | `60 req / 1 phút / IP` |
| applies to | `/api/search` |
| purpose | giảm DB/search pressure ngay ở edge |

### CF-140 Unknown bot search escalation

| Field | Value |
|---|---|
| action | `block` sau challenge repeat |
| threshold | `30 req / 1 phút / IP` |
| applies to | `/api/search` |
| classifier | bot/automation không thuộc verified crawler set |

### CF-150 Auth endpoint abuse gate

| Field | Value |
|---|---|
| action | `managed_challenge`, có thể `block 60s` nếu lặp lại |
| threshold | `20 req / 1 phút / IP` |
| applies to | `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` |
| purpose | chặn brute-force và signup spam từ edge |

### CF-160 Oversized request guard

| Field | Value |
|---|---|
| action | `block` |
| threshold | `request body > 256 KB` |
| applies to | non-upload API routes |
| exception | upload/media allowlist routes |

**Exception allowlist**:
- `/api/media/upload`
- route upload khác chỉ khi đã có owner doc + size contract rõ

### CF-170 Low OWASP score block

| Field | Value |
|---|---|
| action | `block` |
| threshold | `cf.waf.score < 30` |
| applies to | all proxied hosts |
| purpose | block request độc hại rõ ràng |

### CF-180 Admin geo challenge (optional)

| Field | Value |
|---|---|
| action | `managed_challenge` |
| threshold | none |
| applies to | `admin.pmtl.vn` non-VN |
| purpose | giảm noise vào admin |

**Note**:
- rule này là optional
- không được coi là primary security control

---

## Expression plan

Biểu thức exact có thể khác nhẹ theo plan Cloudflare hiện tại, nhưng intent phải giữ nguyên:

- verified crawler detection dùng `cf.verified_bot_category`
- low reputation / managed bot fields dùng khi plan hiện tại hỗ trợ
- path sets phải tách rõ:
  - public content read
  - search
  - auth mutation
  - upload allowlist

Nếu plan hiện tại không hỗ trợ một field nâng cao:
- fallback sang expression ít giàu hơn
- nhưng không nới lỏng threshold mà không cập nhật file này

---

## Change protocol

Mỗi lần đổi rule phải ghi:

| Field | Required |
|---|---|
| change date | yes |
| reason | yes |
| impacted hosts/paths | yes |
| threshold old/new | yes |
| rollback condition | yes |

## Verification checklist

- response có `CF-Ray`
- WAF managed rules active
- Bot Fight Mode active
- search burst test từ 1 IP bị challenge theo threshold
- auth burst test bị challenge trước khi app bị căng
- oversized non-upload request bị block ở edge
- verified crawler read path không bị block sai trong điều kiện budget bình thường

## Terraform/API later shape

Khi chuyển sang IaC thật, structure nên tách:

- `ruleset_public_read`
- `ruleset_search`
- `ruleset_auth`
- `ruleset_oversized_body`
- `ruleset_admin_optional`

Không gom tất cả vào một blob lớn khó review.
