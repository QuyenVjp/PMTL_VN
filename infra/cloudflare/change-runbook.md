# Cloudflare Change Runbook

File này chốt quy trình đổi Cloudflare rules cho PMTL_VN để:

- không sửa dashboard bừa
- có rollback rõ
- search/crawler/auth protection không drift khỏi canon

> Rule canon: `infra/cloudflare/waf-rules.md`
> Strategy canon: `design/baseline/waf-antibot-strategy.md`
> Search ops canon: `design/ui/ADMIN_MODULE_SPECS.md`

---

## Khi nào được đổi rule

Chỉ đổi khi có ít nhất một lý do:

- abuse wave thật
- crawl/search pressure vượt budget
- false positive đã xác minh
- thêm route/surface mới cần bảo vệ
- host/path thay đổi làm rule cũ không còn đúng

Không đổi chỉ vì “có vẻ nên mạnh hơn”.

## Change checklist trước khi apply

1. xác định rule family bị ảnh hưởng:
   - public read
   - search
   - auth
   - oversized request
   - admin optional
2. cập nhật [waf-rules.md](C:\Users\ADMIN\DEV2\PMTL_VN\infra\cloudflare\waf-rules.md) trước
3. nếu threshold/app fallback cũng đổi, cập nhật:
   - [design/baseline/waf-antibot-strategy.md](C:\Users\ADMIN\DEV2\PMTL_VN\design\baseline\waf-antibot-strategy.md)
   - [design/baseline/security.md](C:\Users\ADMIN\DEV2\PMTL_VN\design\baseline\security.md)
4. chuẩn bị rollback note:
   - previous threshold/action
   - rollback trigger
   - owner

## Safe rollout order

1. review expression và path scope
2. nếu có thể, apply ở mode nhẹ hơn trước:
   - `log` / `managed_challenge`
   - chưa `block` ngay
3. quan sát `15-30 phút`:
   - auth success/fail pattern
   - search fallback rate
   - crawler challenge rate
   - false positive từ admin/user flow
4. nếu ổn mới tăng từ `challenge` lên `block`

## Verification after change

Phải check tối thiểu:

- public site vẫn đọc được
- admin login không bị choke ngoài ý muốn
- `/api/search` vẫn hoạt động với traffic bình thường
- verified crawler budget không bị block sai
- oversized non-upload request bị edge chặn đúng
- `CF-Ray` header vẫn hiện

## Search-specific guardrails

Khi đổi rule liên quan search:

- đối chiếu [design/06-search/meilisearch-architecture.md](C:\Users\ADMIN\DEV2\PMTL_VN\design\06-search\meilisearch-architecture.md)
- đối chiếu admin screen `/admin/he-thong/tim-kiem`
- sau change phải theo dõi:
  - fallback rate
  - query rejected rate
  - p95 search latency
  - crawler challenge count

Không đổi WAF search thresholds mà không nhìn 4 tín hiệu này.

## Rollback triggers

Rollback ngay nếu có một trong các dấu hiệu:

- verified crawler bị challenge/block bất thường
- admin/auth flow fail tăng rõ sau change
- search traffic hợp lệ bị challenge quá mức
- support/admin xác minh false positive lặp lại
- fallback rate tăng bất thường ngay sau WAF change

## Change log template

| Field | Value |
|---|---|
| Date/time |  |
| Operator |  |
| Rule family |  |
| Old value |  |
| New value |  |
| Reason |  |
| Expected impact |  |
| Verification window |  |
| Rollback trigger |  |
| Rolled back? |  |

## Scope boundary

File này là runbook đổi edge rules, không thay:

- incident response runbook tổng
- search observability owner doc
- app-layer rate-limit canon
