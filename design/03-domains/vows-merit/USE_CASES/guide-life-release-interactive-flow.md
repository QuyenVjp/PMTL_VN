# Hướng Dẫn Phóng Sinh Tương Tác — Interactive Life Release Ritual Companion

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức phóng sinh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đây là use-case cho **luồng hướng dẫn tương tác** (ritual companion) khi người dùng thực hiện phóng sinh.
Khác với `log-life-release.md` chỉ là ghi nhận hậu kỳ, use-case này mô hình hóa toàn bộ hành trình:
chuẩn bị → di chuyển → thực hành tại chỗ → xử lý sự cố → đóng phiên và ghi nhận công đức.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thực hiện phóng sinh
- `system` — tính toán và cập nhật `KarmicDebtLedger` khi có con vật chết

---

## Trigger

User bấm **[Bắt đầu phóng sinh]** từ `Sổ tay Phóng sanh` hoặc từ `Reminder` calendar ngày Rằm/Mùng 1.

---

## Preconditions

- Có session hợp lệ.
- User đã chọn loại vật, số lượng dự kiến, địa điểm (tối thiểu là tỉnh thành).
- Nếu user phóng sinh thay người khác (`dedicationType = PROXY`), phải nhập tên người nhận.

---

## Input contract

```
{
  animalType:       "fish" | "crab" | "shrimp" | "bird" | "turtle" | "other"
  estimatedQty:     number  // > 0
  locationNote:     string  // tên địa điểm hoặc sông/hồ
  dedicationType:   "SELF" | "PROXY" | "GROUP"
  dedicateTo?:      string  // bắt buộc nếu dedicationType = PROXY
  linkedVowId?:     string  // nếu phóng sinh phục vụ một vow cụ thể
  isEmergency?:     boolean // true = bỏ qua advisory time/weather block
}
```

---

## Read set

- session + actor role
- `LifeReleaseJournal` hiện có để tránh duplicate cùng ngày/địa điểm
- Vow record nếu có `linkedVowId`
- Calendar context: ngày Rằm / Mùng 1 / ngày vía đặc biệt
- Content references: `LIFE-RELEASE-RITUAL-CHECKLIST.md`, `NIEM-KINH-CORE-RULES.md`

---

## Write path — 5 Phase Flow

### Phase 1: Pre-departure Advisory (Trước khi đi)

1. Validate input.
2. Kiểm tra thời gian và thời tiết (advisory — **không hard-block mặc định**):
   - Ban đêm (sau sunset hoặc trước 5:00 AM): hiển thị advisory card màu cam, đề xuất dời sang sáng mai.
   - Mưa lớn / bão: hiển thị advisory card nhẹ về điều kiện an toàn cho sinh vật.
   - Nếu `isEmergency = true`: bỏ qua advisory, ghi log `emergencyOverride = true`.
3. Tạo `LifeReleaseSession` với trạng thái `PREPARING`.
4. Render checklist chuẩn bị:
   - [ ] Mua vật tại nơi sẽ bị giết (chợ, hàng cá).
   - [ ] Chuẩn bị tâm thanh tịnh.
   - [ ] Mang theo nước sạch để ngâm vật nếu đường xa.

### Phase 2: In-transit Chanting Companion (Trên đường di chuyển)

5. User bấm **[Đang di chuyển]** → chuyển trạng thái `TRANSIT`.
6. Render chanting card: *Chú Đại Bi* (niệm liên tục trên đường đi, số lượng không giới hạn).
7. Hiển thị counter đơn giản (số biến đã niệm tùy chọn).
8. Emergency card hiển thị nếu user báo có vật chết trong thùng → chuyển sang `Dead Animal Handler` sớm.

### Phase 3: On-site Ritual Checklist (Tại điểm thả)

9. User bấm **[Đã đến nơi thả]** → chuyển trạng thái `ON_SITE`.
10. Render checklist bắt buộc theo thứ tự:
    - [ ] Bước 1 — Niệm 3 lần lời cảm ân Quán Thế Âm Bồ Tát.
    - [ ] Bước 2 — Niệm 1 biến *Chú Đại Bi*.
    - [ ] Bước 3 — Niệm 1 biến *Tâm Kinh*.
    - [ ] Bước 4 — Niệm 7 biến *Thất Phật Diệt Tội Chân Ngôn*.
    - [ ] Bước 5 — Đọc Lời Khấn (xem mục Lời Khấn bên dưới).
    - [ ] Bước 6 — Thả sinh vật nhẹ nhàng, giảm tối đa thương tổn.
11. Lời Khấn tự động render theo `dedicationType`:
    - `SELF`: "Con [Tên], xin dâng công đức phóng sinh hôm nay để hồi hướng cho oan gia trái chủ của con…"
    - `PROXY`: "Con [Tên cầu thay], thay mặt [Tên người nhận] xin dâng công đức phóng sinh…"
    - `GROUP`: Render template dạng lần lượt cho từng người trong nhóm.

### Phase 4: Dead Animal Handler — Thuật toán Siêu Độ (Nếu có vật chết)

12. Sau khi thả, hệ thống hỏi: *"Có sinh vật nào bị chết trong quá trình di chuyển hoặc thả không?"*
13. User nhập số lượng theo loại:
    ```
    deadFish:   number   // 1 con cá chết = 7 biến Vãng Sinh Chú
    deadCrabs:  number   // 1 con cua chết = 7 biến Vãng Sinh Chú
    deadShrimps: number  // 1 con tôm chết = 3 biến Vãng Sinh Chú
    deadOther:  number   // các loại khác = 7 biến Vãng Sinh Chú mặc định
    ```
14. **`calculateWangShengZhouDebt()`** — hàm hardcoded, không cho phép admin sửa công thức:
    ```
    debt = (deadFish * 7) + (deadCrabs * 7) + (deadShrimps * 3) + (deadOther * 7)
    ```
15. Render ngay `DebtCard`:
    - "Hệ thống ghi nhận [debt] biến Vãng Sinh Chú cần siêu độ cho các sinh vật đã mất."
    - User bấm **[Niệm ngay]** → mở chanting tracker Vãng Sinh Chú inline.
    - Hoặc **[Ghi nợ, niệm bù sau]** → append vào `KarmicDebtLedger`.
16. Nếu user chọn **[Niệm ngay]**, render counter Vãng Sinh Chú. Khi đủ số biến → đóng `DebtCard`, không tạo `KarmicDebtLedger` entry.
17. Nếu user chọn **[Ghi nợ]**, tạo `KarmicDebtLedger` record:
    ```
    {
      userId,
      debtType:   "WANG_SHENG_ZHOU",
      quantity:   debt,
      reason:     "Vật chết trong phóng sinh [sessionId]",
      status:     "OUTSTANDING",
      createdAt,
      dueAdvisory: createdAt + 7 days  // khuyến cáo trả trong 7 ngày
    }
    ```
18. Dashboard hiển thị `KarmicDebtLedger` entries dưới dạng `"Nợ kinh văn cần trả gấp"`.

### Phase 5: Close & Journal

19. User bấm **[Hoàn tất phóng sinh]**.
20. Hiển thị form ghi nhận thực tế: số lượng thả được, ghi chú.
21. Hồi hướng công đức: user chọn mức phần trăm transfer (theo `MERIT-TRANSFER-PERCENTAGE.md`).
22. Tạo `LifeReleaseJournal` record (canonical) với đầy đủ context của session.
23. Nếu có `linkedVowId`, append `VowProgressEntry` tương ứng.
24. Chuyển trạng thái `LifeReleaseSession` → `COMPLETED`.
25. Audit `life-release.guided-session-complete`.

---

## Async side-effects

- **Phase 1:** Nếu user có `KarmicDebtLedger` entries `OUTSTANDING > 3 ngày`, bắn reminder notification.
- **Phase 2+:** Outbox event `life-release.session.completed` → downstream notification / calendar refresh.

---

## Success result

- `LifeReleaseJournal` record được tạo với đầy đủ ritual context.
- Nếu có vật chết: `KarmicDebtLedger` được tạo hoặc debt đã được trả inline.
- Công đức được hồi hướng theo lựa chọn user.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `estimatedQty` < 1 | `invalid_body` | 400 | Nhập lại |
| `dedicationType = PROXY` mà thiếu `dedicateTo` | `invalid_body` | 400 | Bắt buộc nhập tên người nhận |
| `linkedVowId` không tồn tại hoặc không thuộc user | `not_found` | 404 | Bỏ link hoặc chọn vow khác |
| Duplicate session cùng ngày/địa điểm | `conflict` | 409 | Xác nhận có muốn tạo phiên thứ 2 không |
| Session timeout (> 6 giờ không hoàn tất) | `session_expired` | 400 | Vào lại Journal để log thủ công |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `life-release.session.start` | actorUserId | Phase 1 khởi tạo |
| `life-release.session.transit` | actorUserId | Bấm [Đang di chuyển] |
| `life-release.session.on-site` | actorUserId | Bấm [Đã đến nơi thả] |
| `life-release.debt.recorded` | actorUserId | `KarmicDebtLedger` entry được tạo |
| `life-release.debt.cleared-inline` | actorUserId | Niệm đủ Vãng Sinh Chú trong session |
| `life-release.session.completed` | actorUserId | Phase 5 journal được tạo |
| `life-release.emergency-override` | actorUserId | `isEmergency = true` được dùng |

---

## Rate-limit requirement

- Scope: per-account
- Limit: 5 sessions per day (soft limit — hiện warning nếu vượt)

---

## Outbox event

- Event type: `life-release.session.completed`
- Subscriber: `notification` (reminder calendar), `vows-merit` (vow progress)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu `KarmicDebtLedger` bị duplicate do retry: dedupe theo `sessionId`.
- Nếu `LifeReleaseSession` bị orphan (tạo mà không complete): cleanup job sau 12 giờ chuyển sang `ABANDONED`, không tạo Journal.

---

## Notes for AI/codegen

- `calculateWangShengZhouDebt()` là hàm **hardcoded trong service**, không phải cấu hình CMS. Admin không được chỉnh sửa công thức này.
- `KarmicDebtLedger` là entity mới. Phải thêm vào Prisma schema và vào `vows-merit` module. **Không gộp vào `LifeReleaseJournal`**.
- `LifeReleaseSession` là session tracking tạm thời (ephemeral state), tách với `LifeReleaseJournal` là canonical record vĩnh viễn.
- Advisory về thời tiết và giờ giấc là **soft warning**, **không hard-block** (khác với Little House burn validation). Chỉ `isEmergency = true` mới tắt cảnh báo.
- Lời Khấn template thuộc `content` module — render từ content CMS, không hardcode string trong service.
- Dead animal handler phải hiển thị ngay trong flow, không được để user đóng app mà chưa xử lý.
