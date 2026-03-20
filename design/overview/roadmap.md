# PMTL_VN Design Roadmap (Lộ trình thiết kế)

> Phase definitions và baseline stack: xem `README.md` + `DECISIONS.md`
> Coding waves: xem `tracking/coding-readiness.md` Phần 8
> File này chỉ giữ **exit criteria** per phase — không lặp lại stack/scope.

---

## Phase 1 — Foundation

**Exit criteria:**
- [ ] Root docs không mâu thuẫn nhau
- [ ] `apps/api` bootstrap + 11 platform modules hoạt động
- [ ] `01-identity` auth/session + restore drill pass
- [ ] Implementation mapping rõ ràng
- [ ] Launch blockers ghi rõ trong `README.md`

---

## Phase 2 — Core Module Contracts

**Exit criteria:**
- [ ] Mỗi module (01→05) có: module-map, contracts, schema, use-cases
- [ ] Owner module và data boundary không nhập nhằng
- [ ] `02-content` publish + upload flow tested
- [ ] `03-community` submit + moderation flow tested

---

## Phase 3 — Search, Calendar, Notification

**Exit criteria:**
- [ ] Search có phase rule rõ (SQL fallback vs Meilisearch)
- [ ] Calendar giữ đúng ownership events/lunar
- [ ] Advisory composition tested (Calendar → Wisdom-QA sourceRefs)
- [ ] Notification giữ đúng async control-plane role

---

## Phase 4 — Extended Practice

**Exit criteria:**
- [ ] Vow lifecycle (create → progress → fulfill/void) tested
- [ ] Assisted entry workflow với audit tested
- [ ] Wisdom-QA ingestion + offline bundle delta sync tested
- [ ] Side-effects quan trọng đều có replay/recompute path

---

## Phase 5 — Implementation Handoff

**Exit criteria:**
- [ ] Link: decision → module → route → schema → migration → service
- [ ] `design != runtime` maintained via `implementation-mapping.md`
- [ ] AI/dev code theo design mà không tự đoán boundary nguy hiểm
- [ ] Launch gate và restore drill evidence có chỗ ghi rõ

---

## Anti-goals

- Không dùng roadmap để hợp thức hóa stack cũ
- Không mở module mới nếu chưa có owner + use case rõ
- Không bật optional infra chỉ vì "trông chuyên nghiệp"
