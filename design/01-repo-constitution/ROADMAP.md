# PMTL_VN Design Roadmap (Lộ trình thiết kế)

> Phase definitions và baseline stack: xem [README.md](../README.md) + [DECISIONS.md](../01-repo-constitution/DECISIONS.md)
> Coding waves: xem [CODING_READINESS.md](../04-execution-overlay/repo/CODING_READINESS.md) phần 8
> File này chỉ giữ `exit criteria` per phase, không lặp full stack/scope

## Phase 1 — Foundation

- [ ] root docs không mâu thuẫn nhau
- [ ] `apps/api` bootstrap + platform modules trong `PLATFORM_MODULES.md` hoạt động theo owner chain đã chốt
- [ ] `01-identity` auth/session + restore drill pass
- [ ] implementation mapping rõ ràng
- [ ] launch blockers ghi rõ trong `README.md` và `IMPLEMENTATION_MAPPING.md`

## Phase 2 — Core Module Contracts

- [ ] mỗi module (01→05) có `module-map`, `contracts`, `schema`, `use-cases`
- [ ] owner module và data boundary không nhập nhằng
- [ ] `02-content` publish + upload flow tested
- [ ] `03-community` submit + moderation flow tested

## Phase 3 — Search, Calendar, Notification

- [ ] search có phase rule rõ (`SQL fallback` vs `Meilisearch`)
- [ ] calendar giữ đúng ownership events/lunar
- [ ] advisory composition tested (`Calendar -> Wisdom-QA sourceRefs`)
- [ ] notification giữ đúng async control-plane role

## Phase 4 — Extended Practice

- [ ] vow lifecycle (`create -> progress -> fulfill/void`) tested
- [ ] assisted entry workflow với audit tested
- [ ] Wisdom-QA ingestion + offline bundle delta sync tested
- [ ] side-effects quan trọng đều có replay/recompute path

## Phase 5 — Implementation Handoff

- [ ] link: decision -> module -> route -> schema -> migration -> service
- [ ] `design != runtime` maintained via `IMPLEMENTATION_MAPPING.md`
- [ ] AI/dev code theo design mà không tự đoán boundary nguy hiểm
- [ ] launch gate và restore drill evidence có chỗ ghi rõ

## Anti-goals

- không dùng roadmap để hợp thức hóa stack cũ
- không mở module mới nếu chưa có owner + use case rõ
- không bật optional infra chỉ vì "trông chuyên nghiệp"
