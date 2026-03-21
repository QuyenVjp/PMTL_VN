# Core Practice Constitution — PMTL_VN

> **Mục đích**: Chốt vòng hỗ trợ tu học cốt lõi ở cấp sản phẩm.
> Đây là tài liệu AI/dev đọc trước khi implement bất kỳ feature nào liên quan đến hành trình tu học.
> Nếu một feature không map được vào vòng này → hỏi lại trước khi build.
>
> **Authority**: File này chốt **product intent và core loop** ở tầng sản phẩm. Khi có mâu thuẫn về *ý định sản phẩm*, file này là nguồn tham chiếu. Khi có mâu thuẫn về *route, schema, contract, hay implementation detail* — ưu tiên module doc và `DECISIONS.md` theo thứ tự trong `ROOT_DOC_OWNERSHIP.md`.
> **Ref**: `overview/five-treasures.md`, `ui/USER_FLOWS.md`, `ui/SPIRITUAL_APP_SCREENS.md`

---

## Vòng Tu Học Cốt Lõi (The Core Practice Loop)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   [1] NHẬP MÔN         Đăng ký → chọn bài đầu tiên │
│         ↓                                            │
│   [2] NHẬN HƯỚNG DẪN   Advisory + Lịch âm           │
│         ↓                                            │
│   [3] THỰC HÀNH        Công khóa + Ngôi Nhà Nhỏ     │
│         ↓                                            │
│   [4] GHI LẠI          Lưu buổi tu + số biến        │
│         ↓                                            │
│   [5] HỌC SÂU HƠN      Bạch Thoại + Hỏi Đáp         │
│         ↓                                            │
│   [6] PHÁT NGUYỆN      Tạo và theo dõi nguyện lực   │
│         ↓                                            │
│   [7] PHÓNG SANH       Hướng dẫn + Ghi nhật ký      │
│         ↓                                            │
│   [8] CHIA SẺ          Sổ lưu niệm (tùy chọn)       │
│         ↓                                            │
│   [loop] → trở lại [2] mỗi ngày                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Core loop = bước 2 → 3 → 4, lặp hàng ngày.**
Các bước 1, 5, 6, 7, 8 là enrichment — quan trọng nhưng không blocking hàng ngày.

---

## 8 Bước Chi Tiết

### Bước 1 — Nhập Môn

**Trigger**: Đăng ký thành công + xác nhận email.
**Goal**: Người mới hiểu được hệ thống và bắt đầu được buổi tu đầu tiên.

**Owner modules**: `01-identity` (auth), `02-content` (guide)

**Luật sản phẩm**:
- Sau register thành công → PHẢI redirect `/dashboard`, không phải `/`
- Dashboard lần đầu PHẢI hiện onboarding banner
- Banner KHÔNG blocking — dismissible, không modal
- Người mới tìm được "bài tập cho người mới" trong tối đa 2 tap từ dashboard
- Không bắt buộc điền profile trước khi tu học

**Acceptance**:
- [ ] User đăng ký xong → đến dashboard trong 1 request
- [ ] Dashboard có hướng dẫn người mới rõ ràng
- [ ] User tìm được `/kinh-bai-tap/cho-nguoi-moi` từ dashboard trong ≤ 2 tap

---

### Bước 2 — Nhận Hướng Dẫn

**Trigger**: Mở app hàng ngày (sáng hoặc tối).
**Goal**: Biết hôm nay là ngày gì (âm lịch), nên tu tập gì, có gì đặc biệt không.

**Owner modules**: `07-calendar` (advisory + lunar), `10-wisdom-qa` (advisory sourceRefs)

**Luật sản phẩm**:
- Advisory PHẢI hiện trên dashboard ngay khi load — không cần tap thêm
- Advisory là read-only guidance, không phải task list bắt buộc
- Lunar date PHẢI hiện trên dashboard hàng ngày
- Advisory cho ngày đặc biệt (mùng 1, rằm) PHẢI khác advisory ngày thường
- Advisory KHÔNG thay thầy dạy — chỉ là gợi ý hướng dẫn

**Acceptance**:
- [ ] Dashboard load → advisory visible trong viewport (không cần scroll)
- [ ] Lunar date accurate
- [ ] Mùng 1 / rằm: advisory khác ngày thường về nội dung

---

### Bước 3 — Thực Hành

**Trigger**: User click "Bắt đầu buổi tu" từ dashboard.
**Goal**: Thực hiện công khóa hàng ngày — niệm bài, đếm số biến.

**Owner modules**: `02-content` (bài niệm definitions), `04-engagement` (practice state)

**Luật sản phẩm**:
- Practice screen PHẢI load danh sách bài niệm phù hợp với ngày (mùng 1 khác ngày thường)
- Companion guide PHẢI available cho từng bài (không bắt buộc đọc)
- Audio guide (nếu có) PHẢI accessible từ practice screen — 1 tap
- Practice screen KHÔNG auto-save — user control khi nào lưu
- Số biến tally: elderly-safe (52px buttons, haptic if available)
- KHÔNG có timer, KHÔNG countdown, KHÔNG score

**Acceptance**:
- [ ] Practice screen load bài phù hợp với ngày hiện tại
- [ ] Companion guide accessible cho ít nhất 1 bài
- [ ] Tally counter responsive, 52px minimum tap target
- [ ] Không có gamification elements

---

### Bước 4 — Ghi Lại

**Trigger**: User tap "Lưu buổi tu".
**Goal**: Buổi tu được ghi lại, user thấy xác nhận rõ ràng.

**Owner modules**: `04-engagement`

**Luật sản phẩm**:
- Save PHẢI respond trong 2s (loading state nếu chậm hơn)
- Sau save thành công: toast "Đã lưu buổi tu #N" — đủ để confirm, không overdone
- Sau save: KHÔNG tự động redirect — user quyết định đi đâu tiếp
- Nếu ngày đặc biệt (mùng 1/15): nhắc nhẹ Ngôi Nhà Nhỏ — không bắt buộc
- Practice log là **dữ liệu private** của user — không hiển thị cho người khác
- Số biến lưu với ngày + session — không tổng hợp làm "achievement"

**Audit bắt buộc**:
- LOG: actor, action=practice_log_created, resource=practice_log_id, timestamp
- Không cần approval workflow — user tự lưu dữ liệu của mình

**Acceptance**:
- [ ] Save success → toast visible
- [ ] Save failure → error state rõ ràng, data không mất
- [ ] Practice log accessible trong lịch sử của user
- [ ] Data không visible cho member khác

---

### Bước 5 — Học Sâu Hơn

**Trigger**: User muốn hiểu thêm về một chủ đề — từ dashboard, search, hoặc direct browse.
**Goal**: Đọc / nghe Bạch Thoại Phật Pháp, tra cứu Hỏi Đáp.

**Owner modules**: `10-wisdom-qa`, `02-content`, `06-search`

**Luật sản phẩm**:
- Nội dung PHẢI accessible không cần đăng nhập (public)
- Bookmark yêu cầu đăng nhập — soft gate (không hard redirect)
- Audiobook player PHẢI có: play/pause, progress, skip ±15s
- Offline download (Phase 2+): chỉ cho member+
- Search kết quả PHẢI có snippet từ content, không chỉ title
- Source attribution (tên sách, tập, trang) PHẢI hiện rõ dưới mọi trích dẫn

**Acceptance**:
- [ ] Guest đọc được Bạch Thoại đầy đủ
- [ ] Audiobook player functional với đủ controls
- [ ] Source attribution present trên tất cả wisdom content

---

### Bước 6 — Phát Nguyện

**Trigger**: User muốn lập một cam kết tu học cụ thể.
**Goal**: Tạo nguyện, theo dõi tiến độ, nhận nhắc khi đến hạn.

**Owner modules**: `09-vows-merit`, `08-notification`

**Luật sản phẩm**:
- Tạo nguyện: member+ only
- Nguyện là **private** — không hiển thị cho người khác
- Progress tracking: số liệu, không phải "achievement"
- Deadline reminder: notification 7 ngày trước hạn, 1 ngày trước hạn
- Void/hủy nguyện: 2-step confirm + ghi audit log
- Không có "penalty" khi không hoàn thành — chỉ trạng thái "Đã quá hạn"
- Assisted entry (admin nhập hộ): phải có audit trail đầy đủ

**Audit bắt buộc**:
- LOG: vow_created, vow_progress_updated, vow_fulfilled, vow_voided
- Assisted entry: LOG actor=admin, on_behalf_of=member_id

**Acceptance**:
- [ ] Tạo nguyện, update tiến độ, fulfill — full lifecycle hoạt động
- [ ] Audit log có đủ cho vow_voided với actor
- [ ] Void yêu cầu 2-step confirm

---

### Bước 7 — Phóng Sanh

**Trigger**: User chuẩn bị cho buổi phóng sanh, hoặc sau khi phóng sanh.
**Goal**: Có đủ hướng dẫn (bài đọc, lời khấn, checklist) + ghi lại nhật ký.

**Owner modules**: `09-vows-merit` (journal), `02-content` (guides), `07-calendar` (ngày tốt)

**Luật sản phẩm**:
- Guide nội dung (bài đọc, lời khấn): public, từ `02-content`
- Nhật ký phóng sanh: member+ only, private
- Lịch ngày tốt phóng sanh: từ `07-calendar`, public
- Guide PHẢI offline-accessible (Phase 2+: bundle vào offline download)
- KHÔNG suggest "ngày tốt" bằng AI — chỉ hiển thị lịch được soạn bởi nội dung có thẩm quyền

**Acceptance**:
- [ ] Guest xem được guide phóng sanh
- [ ] Member ghi nhật ký phóng sanh, lưu thành công
- [ ] Ngày phóng sanh tốt lấy từ calendar module, không hardcode

---

### Bước 8 — Chia Sẻ (Tùy Chọn)

**Trigger**: User muốn để lại lời chia sẻ trong cộng đồng.
**Goal**: Gửi guestbook entry, đọc entries của người khác.

**Owner modules**: `03-community`, `05-moderation`

**Luật sản phẩm**:
- Guestbook: opt-in, không bắt buộc trong vòng tu học
- Entry được duyệt trước khi public (moderation queue)
- KHÔNG hiển thị số biến, progress, hay bất kỳ practice stats — tu học là riêng tư
- Chia sẻ PHẢI là văn bản — không có "reaction", "like", "score"
- Report mechanism: member có thể report entry vi phạm

**Acceptance**:
- [ ] Guestbook submission đi qua moderation queue
- [ ] Public entries không leak bất kỳ practice private data
- [ ] Report flow hoạt động

---

## Những Gì App Không Làm — Luật Cứng

Đây là các luật **không thương lượng**. Bất kỳ feature nào vi phạm phải bị từ chối ngay ở design phase.

### Không gamify tu tập

```
❌ Streak counter với "penalty" khi bỏ ngày
❌ Badge / achievement khi đạt mốc biến
❌ Leaderboard hay so sánh giữa các member
❌ "Level" người tu học
❌ XP, điểm, coins, hay bất kỳ virtual currency
❌ Celebration animation khi hoàn thành vow (animation nhẹ OK — nổ confetti KHÔNG)
```

### Không biến tu tập thành social performance

```
❌ Public practice logs (số biến, số buổi hiển thị cho người khác)
❌ "Bạn bè cũng đang tu học" prompts
❌ Activity feed theo kiểu social media
❌ Public vow progress (ai phát nguyện gì là riêng tư)
❌ "Share your progress" CTA để dụ user public data của họ
```

### Không thay thế thầy bằng AI

```
❌ AI trả lời câu hỏi Phật pháp theo real-time
❌ AI "đánh giá" buổi tu học của user
❌ AI gợi ý "ngày tốt/xấu" theo thuật toán
❌ Chatbot hỗ trợ tinh thần tự động
✅ Search trong kho tàng lời dạy có thẩm quyền: OK
✅ Advisory được soạn bởi nội dung có thẩm quyền: OK
```

### Không tự nâng cấp kiến trúc

```
❌ Thêm Valkey/Redis trước khi Phase 2
❌ Thêm BullMQ queue trước khi Phase 2
❌ Thêm Meilisearch trước khi Phase 2
❌ Thêm role editor/moderator trước khi có use case thật
❌ Outbox events trước khi Phase 2
Ref chi tiết: PHASE_GOVERNOR.md (nếu tồn tại) hoặc baseline/infra.md
```

---

## Module Ownership Map cho Core Loop

| Bước | Owner module | Dữ liệu chính | Private? |
|---|---|---|---|
| 1. Nhập môn | `01-identity` | user account, session | Yes |
| 2. Nhận hướng dẫn | `07-calendar` | advisory, lunar date | No (public) |
| 3. Thực hành | `04-engagement` + `02-content` | practice state, bài niệm | Mixed |
| 4. Ghi lại | `04-engagement` | practice log, số biến | Yes |
| 5. Học sâu | `10-wisdom-qa` + `06-search` | wisdom entries, QA | No (public) |
| 6. Phát nguyện | `09-vows-merit` | vow, progress | Yes |
| 7. Phóng sanh | `09-vows-merit` + `02-content` | journal + guide | Mixed |
| 8. Chia sẻ | `03-community` | guestbook entry | No (after moderation) |

---

## Màn Hình Phải Tồn Tại Cho Core Loop

> **Phân biệt**: "P1 BLOCKING" = thiếu thì không thể launch. "P1 EXISTS" = có trong codebase P1 nhưng không blocking launch date. "P2" = defer hoàn toàn.
> **Route authority**: `ui/PAGE_INVENTORY.md` — mọi route dưới đây phải khớp với file đó.

### P1 BLOCKING — Core loop (bước 2→3→4 hàng ngày + auth)

| Màn hình | Route (canonical) | Bước |
|---|---|---|
| Landing page | `/` | — |
| Đăng ký | `/dang-ky` | 1 |
| Đăng nhập | `/dang-nhap` | 1 |
| Email verification | `/xac-nhan-email` | 1 |
| Dashboard | `/dashboard` | 2 |
| Practice Sheet | `/tu-tap/bai-tap` | 3+4 |
| Ngôi Nhà Nhỏ | `/tu-tap/nha-nho` | 3+4 |
| Personal Calendar | `/lich-ca-nhan` | 2 |
| Profile/Account | `/tai-khoan` | 1 |

### P1 EXISTS — Enrichment, có trong P1 build nhưng không blocking launch

| Màn hình | Route (canonical) | Bước |
|---|---|---|
| Wisdom Reader (Bạch Thoại) | `/bai-hoa/[slug]` | 5 |
| Wisdom Library hub | `/bai-hoa` | 5 |
| Vow Tracker | `/phat-nguyen` | 6 |
| Create Vow | `/phat-nguyen/tao-moi` | 6 |
| Phóng Sanh guide (public) | `/huong-dan/phong-sanh` | 7 |
| Phóng Sanh journal (member) | `/phong-sanh` | 7 |
| Guestbook | `/so-luu-niem` | 8 |

### P2 — Defer hoàn toàn sang Phase 2+

| Màn hình | Route (canonical) | Lý do defer |
|---|---|---|
| Offline bundle | `/ngoai-tuyen` | Cần delta sync infra |
| Notifications settings | `/thong-bao` | Cần push subscription infra |
| Audiobook player (full) | embedded trong Reader | Cần audio streaming infra |
| Practice history export | `/tu-tap/lich-su` export | PDF gen phức tạp |

---

## Acceptance Constitution (Khi nào một bước được coi là "done")

### Một bước "done" nghĩa là:

1. **User có thể hoàn thành bước đó một mình** — không cần admin hỗ trợ, không cần workaround
2. **Happy path hoạt động end-to-end** — từ trigger đến success state
3. **3 failure cases phổ biến nhất có xử lý rõ** — không crash, không mất data, có hướng dẫn tiếp theo
4. **Privacy requirement được giữ** — data private không leak
5. **Audit requirement được đáp ứng** — nếu bước yêu cầu audit log, log phải tồn tại
6. **Elderly UX pass** — min 44px tap targets, 16px+ font, không có modal trap

### Một bước CHƯA done nếu:

- Happy path hoạt động nhưng error state crash app
- Data lưu được nhưng không xem lại được
- Chỉ test trên desktop, chưa test mobile
- Audit log thiếu cho write operations được đánh dấu "audit bắt buộc"
- Còn bất kỳ gamification element nào

---

## Notes cho AI khi implement

1. **Đọc file này trước khi hỏi "feature này thuộc module nào"** — ownership table ở trên trả lời hầu hết câu hỏi.

2. **Nếu feature không map vào 8 bước** → hỏi PM/tech lead trước khi tạo module mới.

3. **Practice data luôn là private** — không có ngoại lệ ở Phase 1.

4. **Advisory không phải AI** — nó là content được soạn sẵn từ Calendar module, không phải generated.

5. **"Lưu buổi tu" không có side effect ngoài engagement module** ở Phase 1 — không trigger notification, không trigger outbox, không ghi vào Ngôi Nhà Nhỏ tự động. User tự làm từng bước.

6. **Ngôi Nhà Nhỏ là manual update** — user tự nhập số biến, không tự động tổng hợp từ practice logs. Đây là thiết kế có chủ ý (tôn trọng hành vi tu học thật).
