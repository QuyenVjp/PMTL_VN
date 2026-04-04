# DHARMA-TREASURE-HANDLING

## Owner
- `content` (canonical rules + reading experience)
- `engagement` (optional reading session tracking)

## Purpose
Quy định cực kỳ nghiêm khắc về việc ứng xử với kinh sách (sách giấy, PDF, eBook) theo giáo lý PMTL.

## Canonical Rules (PMTL Sutra/Dharma Book Etiquette)

### Rule 1 - Digital Bookmark Feature (Bắt buộc)
**Nghiệp vụ:**
- Luật PMTL nghiêm cấm việc **gấp mép trang sách kinh** hoặc **úp ngược mặt sách xuống bàn** (hình chữ Nhân - 人).
- Hệ thống đọc E-book/PDF kinh văn **bắt buộc** phải có tính năng Bookmark (Kẹp giấy) rõ ràng.

**Logic App:**
- UI phải có nút `[Bookmark/Đánh dấu trang]` dễ thấy, dễ bấm.
- Tooltip nhắc nhở: *"Luật PMTL cấm gấp mép hoặc úp sách. Dùng tính năng đánh dấu trang này."*
- Lưu bookmark theo `userId + bookId + pageNumber`.

---

### Rule 2 - Pre-Reading Validation Modal (Cảnh báo trước khi đọc)
**Nghiệp vụ:**
Khi user click vào mở file PDF Kinh văn/sách giáo lý, hệ thống hiện Pop-up nhắc nhở các giới luật:

**Nội dung cảnh báo (Checklist):**
1. ✋ **Không đọc kinh khi đang ăn.** Nuốt xong mới được đọc.
2. 🚫 **Không nói chuyện phiếm lúc đọc.** Giữ tâm tôn kính.
3. 🚽 **Cấm mang điện thoại/iPad vào nhà vệ sinh để đọc kinh.**
4. 💧 **Không lật trang bằng cách dùng ngón tay chấm nước bọt.**
5. 🙏 **Khi cầm thiết bị đọc kinh, không được để thấp hơn thắt lưng hoặc kẹp dưới nách.**

**Logic App:**
- Hiện modal với checkbox: `[ ] Tôi đã đọc và hiểu các quy tắc`.
- Nút `[Không hiện lại]` nếu user đã tick → lưu vào `SutraPreReadingConsent` table.
- User phải tick checkbox mới được bấm `[Bắt đầu đọc]`.

---

### Rule 3 - Placement Rule (Vị trí đặt để)
**Nghiệp vụ:**
Trong phần hướng dẫn, nhắc nhở user:
- 🛏️ **Không đặt thiết bị đang chứa sách kinh lên giường.**
- 💺 **Không đặt lên ghế ngồi hoặc dưới chân giường.**
- 📱 **Nếu đọc trên điện thoại, không được để điện thoại nơi thấp hoặc bất kính.**

**UI:**
- Banner nhắc nhở trong màn hình thư viện kinh: *"Khi tải sách kinh về, không được đặt thiết bị ở nơi thấp hoặc bất kính."*

---

## UX Flow

### Flow 1: Mở Kinh lần đầu
```
User click [Mở kinh X]
  ↓
Check: SutraPreReadingConsent cho user + kinh này?
  ↓ NO
  ↓ Hiện PreReadingConsentModal
  ↓   - Checklist 5 điều
  ↓   - [ ] Tôi đã hiểu
  ↓   - [x] Không hiện lại (optional)
  ↓   - [Bắt đầu đọc]
  ↓ YES (nếu đã consent trước đó)
  ↓ Mở reader trực tiếp
  ↓
Show PDF/eBook reader với Bookmark button rõ ràng
```

### Flow 2: Đánh dấu trang
```
User đang đọc trang 45
  ↓
Click [Bookmark icon]
  ↓
Save: userId + bookPublicId + pageNumber = 45
  ↓
Toast: "Đã đánh dấu trang 45"
```

### Flow 3: Quay lại đọc tiếp
```
User click [Tiếp tục đọc kinh X]
  ↓
Query bookmark cuối: userId + bookPublicId → pageNumber = 45
  ↓
Mở reader tại trang 45
```

---

## Schema Hints

### Table: SutraReadingSession (Optional tracking)
```prisma
model SutraReadingSession {
  id              String   @id @default(cuid())
  publicId        String   @unique @map("public_id")
  userId          String   @map("user_id")
  bookPublicId    String   @map("book_public_id")  // ref to Download or Post
  bookmarkPage    Int?     @map("bookmark_page")
  lastReadAt      DateTime @map("last_read_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation("sutraReadingSessions", fields: [userId], references: [id])

  @@unique([userId, bookPublicId])
  @@index([userId])
  @@map("sutra_reading_sessions")
}
```

### Table: SutraPreReadingConsent
```prisma
model SutraPreReadingConsent {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  bookPublicId String?  @map("book_public_id")  // NULL = consent for all sutras
  consentedAt  DateTime @map("consented_at")
  dontShowAgain Boolean @default(false) @map("dont_show_again")

  user User @relation("sutraConsents", fields: [userId], references: [id])

  @@unique([userId, bookPublicId])
  @@index([userId])
  @@map("sutra_pre_reading_consents")
}
```

---

## UI Components

### 1. PreReadingConsentModal
**Props:**
- `bookTitle: string`
- `onConsent: () => void`
- `onCancel: () => void`

**Content:**
```
┌─────────────────────────────────────────┐
│  Quy tắc đọc Kinh văn / Sách Phật pháp  │
├─────────────────────────────────────────┤
│  Trước khi đọc, xin lưu ý:              │
│                                         │
│  ✋ Không đọc khi đang ăn               │
│  🚫 Không nói chuyện phiếm lúc đọc     │
│  🚽 Cấm mang vào nhà vệ sinh           │
│  💧 Không dùng nước bọt lật trang      │
│  🙏 Không để thiết bị thấp hơn thắt lưng│
│                                         │
│  [x] Tôi đã đọc và hiểu                │
│  [ ] Không hiện lại lần sau            │
│                                         │
│  [Hủy]              [Bắt đầu đọc] ✓   │
└─────────────────────────────────────────┘
```

### 2. SutraBookmarkButton
**Props:**
- `currentPage: number`
- `onBookmark: (page: number) => void`

**Tooltip:**
```
Đánh dấu trang số {currentPage}

⚠️ Luật PMTL cấm gấp mép hoặc úp sách.
Dùng tính năng này thay thế.
```

### 3. PlacementWarningBanner (Thư viện Kinh)
```
┌────────────────────────────────────────────────────┐
│ ⚠️ Lưu ý: Khi tải kinh về điện thoại/máy tính bảng │
│    không được đặt thiết bị lên giường, ghế ngồi,   │
│    hoặc dưới chân giường.                          │
└────────────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/content/REFERENCES/NIEM-KINH-CORE-RULES.md`
- `design/03-domains/content/REFERENCES/PRACTICE-SUPPORT-REFERENCE.MD`
- External source: Wenda recordings về ứng xử với kinh sách
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 7
