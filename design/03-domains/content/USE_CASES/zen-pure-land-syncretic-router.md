# Bộ Định Tuyến Thiền-Tịnh Dung Hội — Zen-Pure Land Syncretic Router

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Bạch Thoại Phật Pháp (BHFF) tích hợp hai tông phái: **Thiền Tông** (trí tuệ giải quyết vấn đề nhân gian) và **Tịnh Độ** (siêu thoát vãng sanh giai đoạn cuối). User phải tìm nội dung theo **trạng thái tâm lý và nhu cầu**, không phải theo thể loại kinh điển. Bộ định tuyến này phân chia nội dung thành 2 tuyến rõ ràng.

---

## Owner module

`content` — BHFFService / ContentSegmentation
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đọc BHFF theo nhu cầu tâm lý
- `system` — phân loại bài viết, định tuyến theo tab

---

## Trigger

Khi user mở BHFF E-Reader hoặc trang danh mục bài viết Bạch Thoại Phật Pháp.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User mở BHFF E-Reader | ✅ Hiển thị 2 tab chính |
| Tab 1: `[Trí Tuệ Nhân Gian]` | ✅ Filter: bài giải quyết vấn đề đời thường |
| Tab 2: `[Siêu Thoát Vãng Sanh]` | ✅ Filter: bài về cái chết, buông bỏ, vãng sanh |
| User chọn Tab 1 | ✅ Load: trầm cảm, gia đình, bệnh tật, tiền bạc |
| User chọn Tab 2 | ✅ Load: chuẩn bị chết, giúp người hấp hối, pháp vãng sanh |
| Bài viết thuộc cả 2 trường | ✅ Đặt theo tông phái chính, thêm tag phụ |
| User đọc xong 1 bài | ✅ Track `bhff.article_completed` với domain label |

---

## Input Contract

```typescript
interface BHFFContentQueryDto {
  tab: 'ZEN_WORLDLY' | 'PURE_LAND_TRANSCENDENCE'
  page?: number
  pageSize?: number
  keyword?: string
}
```

---

## Write Path

```
GET /api/content/bhff?tab=ZEN_WORLDLY&page=1
1. Validate tab ∈ ['ZEN_WORLDLY', 'PURE_LAND_TRANSCENDENCE']
2. Query WisdomEntry WHERE bhffTab = :tab AND published = true
3. Order by: relevanceScore DESC, publishedAt DESC
4. Return paginated list with tab label

POST /api/content/bhff/:articleId/complete
1. Log: bhff.article_completed with tab info
2. Update reading progress if merit quota enabled
```

---

## FE Behavior

```
BHFF (Bạch Thoại Phật Pháp) E-Reader

[ Trí Tuệ Nhân Gian ]  [ Siêu Thoát Vãng Sanh ]
        ^^^
      active tab (underline)

TAB 1 — Trí Tuệ Nhân Gian:
📚 Bài Viết Giải Quyết Vấn Đề Nhân Gian:
─────────────────────────────────────────
1. Tôi Bị Trầm Cảm Vì Công Việc
2. Gia Đình Cãi Vã Không Dứt
3. Làm Sao Sống Có Ý Nghĩa?
4. Bệnh Nan Y Có Lối Thoát?
5. Quản Lý Tiền Bạc & Nợ Nần

TAB 2 — Siêu Thoát Vãng Sanh:
📚 Chuẩn Bị Cho Giai Đoạn Cuối:
─────────────────────────────────────────
1. Chuẩn Bị Tâm Lý Đối Diện Cái Chết
2. Giúp Người Thân Trước Lúc Ra Đi
3. Pháp Môn Vãng Sanh & Tây Phương Cực Lạc
4. Buông Bỏ Tham Luyến Nhân Gian
```

---

## Schema Notes

```prisma
model WisdomEntry {
  // ... existing fields ...
  bhffTab BHFFTab? // NULL = không thuộc BHFF
  // Migration: ALTER TABLE "WisdomEntry" ADD COLUMN "bhffTab" TEXT
}

enum BHFFTab {
  ZEN_WORLDLY
  PURE_LAND_TRANSCENDENCE
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `bhff_reader.opened` | User truy cập BHFF |
| `bhff.zen_tab_selected` | Tab Trí Tuệ Nhân Gian được chọn |
| `bhff.pure_land_tab_selected` | Tab Siêu Thoát được chọn |
| `bhff.article_completed` | User đọc xong bài |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| tab không hợp lệ | `invalid_bhff_tab` | 422 |

---

## Notes for AI/codegen

- Covers cả Phase 20 Logic 8 (E-Reader routing) và Phase 23 Logic 6 (Syncretic Router) — hai specs này đều mô tả cùng một tính năng.
- Admin CMS phải có field `bhffTab` khi publish BHFF articles.
- Bài không có `bhffTab` không hiển thị trong cả hai tab — chỉ hiển thị trong general library.

---

## Related

- [bhff-quota-transfer-engine.md](./bhff-quota-transfer-engine.md) — merit quota từ BHFF
- [bhff-reading-merit-transfer-engine.md](./bhff-reading-merit-transfer-engine.md) — merit từ đọc BHFF
- [study-baihua.md](../../wisdom-qa/USE_CASES/study-baihua.md) — luồng học BHFF
