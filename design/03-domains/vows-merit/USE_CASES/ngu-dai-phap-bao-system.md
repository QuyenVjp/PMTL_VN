# Ngũ Đại Pháp Bảo — Five Golden Practices System

> **Nguồn:** Giáo lý cốt lõi Pháp Môn Tâm Linh (Guan Yin Citta Dharma Door)
> **Trạng thái:** Verified source — human review required
> **Cập nhật:** 2026-04-04

---

## 1. Overview

Pháp Môn Tâm Linh được xây dựng dựa trên **Ngũ Đại Pháp Bảo** (Năm thực hành vàng):

| # | Pháp Bảo | English | Module Owner | Existing? |
|---|---------|---------|-------------|-----------|
| 1 | Niệm Kinh | Sutra Recitation | Chanting / Engagement | Yes |
| 2 | Hứa Nguyện (Phát Nguyện) | Making Great Vows | Vows-Merit | Yes (Vow model) |
| 3 | Phóng Sinh | Life Liberation | Vows-Merit | Yes (LifeReleaseJournal) |
| 4 | Bạch Thoại Phật Pháp | Buddhism in Plain Terms | Wisdom-QA | Yes (WisdomEntry) |
| 5 | Đại Sám Hối | Great Repentance | Engagement | Yes (RepentanceLog) |

---

## 2. Phát Đại Nguyện (Making Great Vows)

### Existing Model: `Vow`
Already supports: vowType, description, targetCount, currentCount, status, startDate, endDate.

### Business Rules to Add

**Nguyện phổ biến (Common Vow Types):**
- Ăn chay mùng 1 & ngày rằm
- Ăn chay trường (full vegetarian)
- Không sát sinh trọn đời
- Phát nguyện độ nhân (giới thiệu Phật pháp cho mọi người)
- Niệm kinh X biến mỗi ngày suốt đời
- Phóng sinh X con/tháng

**Suggested Features:**
- Bộ đếm ngày ăn chay (vegetarian day counter)
- Nhắc nhở giữ lời thề nguyện (vow reminder)
- Milestone tracking: 7 ngày, 30 ngày, 100 ngày, 1 năm
- Warning: Phát nguyện rồi không giữ sẽ tạo nghiệp → hệ thống nhắc nhở nếu user miss

**Admin Features Needed:**
- Quản lý danh sách VowType chuẩn (enum mở rộng)
- Theo dõi aggregate vow statistics (anonymized)
- Assisted entry cho phụng sự viên giúp đồng tu ghi nhận

---

## 3. Phóng Sinh (Life Liberation)

### Existing Model: `LifeReleaseJournal`
Already supports: journalDate, animalType, quantity, location, note, actorUserId.

### Business Rules to Add

**Kinh văn khi phóng sinh:**
- Chú Đại Bi (trước khi thả)
- Tâm Kinh (cầu trí tuệ cho chúng sinh)
- Thất Phật Diệt Tội Chân Ngôn (tiêu nghiệp cho chúng sinh)
- Vãng Sinh Chú (siêu độ nếu có cá bị chết trong quá trình thả)

**Ritual Checklist:**
1. Mua cá / tôm / cua tại chợ sắp bị giết
2. Niệm kinh tại chỗ hoặc trên đường đi
3. Đến sông / hồ / biển thả
4. Nếu có cá chết → niệm Vãng Sinh Chú siêu độ
5. Hồi hướng công đức

**Admin Features Needed:**
- Quản lý ritual checklist templates
- Bản đồ điểm phóng sinh (location references)
- Gợi ý kinh văn theo context

---

## 4. Bạch Thoại Phật Pháp (Buddhism in Plain Terms)

### Existing Model: `WisdomEntry`
Already supports: multiple entry types, bilingual text, source references.

### Business Rules to Add

**Thực hành hàng ngày:**
- Khuyến khích đọc 1 bài Bạch Thoại mỗi ngày
- Audio companion cho người lớn tuổi / không đọc được
- Thảo luận cộng đồng sau khi đọc

**Admin Features Needed:**
- Đã có đầy đủ trong Wisdom-Baihoa workspace
- Bổ sung: daily reading scheduler (gợi ý bài đọc hàng ngày)

---

## 5. Tiểu Phương Tử (Little Houses) — Cross-cutting

### Existing Model: `LittleHouse`
Already supports: recipient, sheetsCount, status (DRAFT/SIGNED/CHANTED/BURNED), burnDate, postBurnNote.

### Business Rules to Add

**4 đối tượng nhận:**
1. Oan gia trái chủ của bản thân
2. Trẻ siêu sản / thai nhi (Child of [Mother's Name])
3. Người thân quá cố ([Tên người quá cố])
4. Oan gia trái chủ của ngôi nhà ([Địa chỉ nhà])

**Hướng dẫn ghi chú chuẩn:**
- "Kính tặng" (người nhận) bằng bút xanh/đen TRƯỚC khi niệm
- "Tặng" (người niệm) ghi tên đầy đủ

**Nghi thức đốt:**
- Có bàn thờ: thắp hương, đọc lời khấn, đốt trên đĩa sứ trắng
- Không có bàn thờ: dâng Tâm Hương (quán tưởng), đốt trên đĩa sứ trắng
- Đốt từ dưới lên trên hoặc từ góc "Kính tặng"
- Xử lý tro: gói giấy báo, vứt thùng rác bình thường

**Admin Features Needed:**
- Quản lý hướng dẫn ritual instructions (CMS content)
- Nhật ký tiến độ aggregate: NNN đã niệm/đã đốt/tuần/tháng
- Risk alert: user đốt SCS Lễ Phật nhưng NNN = 0

---

## 6. Integration Map

```
┌─────────────────────────────────────────────────────┐
│                 Ngũ Đại Pháp Bảo                    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Niệm     │  │ Phát     │  │ Phóng            │  │
│  │ Kinh     │──│ Nguyện   │──│ Sinh             │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘  │
│       │              │              │                │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────────────┐  │
│  │ Bạch     │  │ Đại Sám  │  │ Tiểu Phương Tử   │  │
│  │ Thoại    │  │ Hối      │  │ (cross-cutting)   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                     │
│  Counters: ALL separate. NEVER merge.               │
└─────────────────────────────────────────────────────┘
```

---

## 7. Non-Negotiables

- Tất cả counter riêng biệt hoàn toàn — không tính gộp
- Không gamification công khai — chỉ private progress
- Assisted entry luôn có audit trail
- Source updates không rewrite historical records
- Ritual truth thuộc Content module — user state thuộc Engagement
