# PMTL_VN Design Alignment Roadmap

> Ghi chú cho sinh viên:
> Đây không phải roadmap làm sản phẩm từ đầu.
> Đây là roadmap để kéo tài liệu thiết kế về khớp code đang có.

## Mục tiêu

Roadmap này dùng để kéo design về khớp repo truth hiện tại.
Nó không phải kế hoạch xây lại hệ thống từ đầu.
Ưu tiên là làm cho:
- `design/*`
- `docs/*`
- schema (lược đồ dữ liệu)/flows/decisions

không còn mâu thuẫn với implementation đang chạy.

## Nguyên tắc thực hiện

- Không phá implementation hiện tại.
- Không rename folder hàng loạt.
- Không thêm module ngoài danh sách hiện có.
- Không giữ decision cũ nếu repo đã đi hướng khác.
- Mọi artifact phải text-based và AI-friendly.

## Phase 1. Fix Overview

### Files
- `design/00-overview/architecture-principles.md`
- `design/00-overview/domain-map.md`
- `design/00-overview/ROADMAP.md`

### Mục tiêu
- cập nhật stack truth
- chốt Payload auth là auth authority duy nhất
- loại wishlist khỏi current scope
- bỏ các decision đã sai như "single posts table"

### Exit criteria
- overview không còn mâu thuẫn với repo
- current scope và future candidates được tách rõ

## Phase 2. Core Foundation

### Files
- `design/CORE_DECISIONS.md`
- `design/MODULE_INTERACTIONS.md`

### Mục tiêu
- chốt 10 quyết định cắt ngang toàn hệ thống
- chốt owner, reference, sync/async (bất đồng bộ), side effects giữa các module

### Exit criteria
- module-level design sau đó có thể bám foundation này

## Phase 3. Refactor Content

### Files
- `design/01-content/module-map.md`
- `design/01-content/flows.mmd`
- `design/01-content/schema.dbml`
- `design/01-content/decisions.md`

### Mục tiêu
- đưa content về đúng repo truth dạng split collections
- bỏ user state khỏi content
- giữ publish workflow, taxonomy, search fields, public identity

### Exit criteria
- content design không còn giả định single-table
- content boundary (ranh giới trách nhiệm) tách sạch khỏi engagement và moderation ownership

## Phase 4. Identity Module

### Files
- `design/00-00-identity/module-map.md`
- `design/00-00-identity/flows.mmd`
- `design/00-00-identity/schema.dbml`
- `design/00-00-identity/decisions.md`

### Mục tiêu
- ghi rõ auth model hiện tại
- ghi rõ role model
- ghi rõ public/profile identity contract (hợp đồng dữ liệu/nghiệp vụ)

### Exit criteria
- auth/authz design đủ rõ để AI generate code đúng boundary (ranh giới trách nhiệm) web/cms

## Phase 5. Remaining Modules

### Community
- `design/02-community/module-map.md`
- `design/02-community/flows.mmd`
- `design/02-community/schema.dbml`
- `design/02-community/decisions.md`

### Moderation
- `design/04-moderation/module-map.md`
- `design/04-moderation/flows.mmd`
- `design/04-moderation/schema.dbml`
- `design/04-moderation/decisions.md`

### Engagement
- `design/03-engagement/module-map.md`
- `design/03-engagement/flows.mmd`
- `design/03-engagement/schema.dbml`
- `design/03-engagement/decisions.md`

### Search
- `design/05-search/module-map.md`
- `design/05-search/flows.mmd`
- `design/05-search/schema.dbml`
- `design/05-search/decisions.md`

### Notification
- `design/07-notification/module-map.md`
- `design/07-notification/flows.mmd`
- `design/07-notification/schema.dbml`
- `design/07-notification/decisions.md`

### Calendar
- `design/06-calendar/module-map.md`
- `design/06-calendar/flows.mmd`
- `design/06-calendar/schema.dbml`
- `design/06-calendar/decisions.md`

### Exit criteria
- mọi module chính đều có:
  - module map
  - flows
  - schema (lược đồ dữ liệu)
  - decisions
- các file phản ánh owner thật, contract (hợp đồng dữ liệu/nghiệp vụ) thật, side effects thật

## Sau khi hoàn tất design

### Docs sync cần rà lại
- `docs/architecture/domains.md`
- `docs/api/contracts.md`
- `docs/cms/content-model.md`

### Mục tiêu cuối
- design khớp implementation
- AI có thể generate code đúng boundary (ranh giới trách nhiệm)
- docs không còn phủ định nhau

## File structure mục tiêu

```text
design/
  00-overview/
    architecture-principles.md
    architecture.mmd
    architecture-flows.mmd
    domain-map.md
    ROADMAP.md
  01-content/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  02-community/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  03-engagement/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  04-moderation/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  05-search/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  06-calendar/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  07-notification/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  00-identity/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  CORE_DECISIONS.md
  MODULE_INTERACTIONS.md
```

## Success checklist

- [x] Overview phản ánh repo truth
- [ ] Core decisions được chốt
- [ ] Module interactions được chốt
- [ ] Content refactor xong
- [ ] Identity module được mô tả
- [ ] Community / Moderation / Engagement / Search / Notification / Calendar được mô tả
- [ ] Docs sync không còn mâu thuẫn


