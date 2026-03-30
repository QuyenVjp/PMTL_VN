# PMTL_VN — Hướng Dẫn Chi Tiết 11 Module (Pháp Môn Tâm Linh)

> **Mục đích file này**: Giải thích từng module theo góc nhìn người dùng thực tế, dùng đúng ngôn ngữ pháp môn Tâm Linh (Guanyin Citta / 心灵法门).
> Đây là file hiểu sản phẩm — không phải tài liệu kỹ thuật.
> Nguồn chính thống: lujunhong2or.com, xlch.org, guanyincitta.com, orientalradio.com.sg

---

## Bức Tranh Tổng Thể

Hệ thống PMTL_VN xây xung quanh **5 đại pháp bảo** của pháp môn:

| # | Pháp bảo | Người thực hành dùng để làm gì |
|---|---|---|
| 1 | **Niệm kinh** | Trì tụng bài kinh/chú hàng ngày, đếm số biến, theo dõi công khóa |
| 2 | **Phát nguyện** | Lập cam kết tu học cụ thể có thời hạn và mục tiêu lượng hóa |
| 3 | **Phóng sanh** | Thực hiện nghi thức phóng sanh đúng pháp, ghi lại nhật ký |
| 4 | **Bạch Thoại Phật Pháp** | Đọc/nghe lời dạy của Sư Phụ Lư Quân Hoành bằng tiếng Việt |
| 5 | **Hỏi đáp / Huyền học** | Tra cứu câu trả lời chính thống cho câu hỏi đời sống theo pháp môn |

11 module kỹ thuật là xương sống để phục vụ 5 pháp bảo đó.

---

## Vòng Tu Học Hàng Ngày (Core Loop)

```
[Sáng mở app]
      ↓
Xem ngày âm lịch hôm nay là mùng mấy?
Hôm nay có phải lục trai nhật không? (1, 8, 14, 15, 23, 29, 30)
Dashboard hiện advisory: "Hôm nay mùng 1 — nên tăng cường trì Chuẩn Đề Thần Chú"
      ↓
Mở Practice Sheet "Kinh Bài Tập Hằng Ngày"
      ↓
Trì tụng bài kinh/chú theo kế hoạch, đếm số biến bằng tay (nút 52px)
      ↓
Lưu buổi tu → toast "Đã lưu buổi tu #47"
      ↓
[Tùy chọn]: Đọc Bạch Thoại · Tra Huyền Học · Ghi nguyện · Sổ phóng sanh
      ↓
[Tối]: Ghi Ngôi Nhà Nhỏ nếu hôm nay có phần Ngôi Nhà Nhỏ
```

---

## 11 MODULE — DIỄN GIẢI CHI TIẾT

---

### MODULE 01 — IDENTITY (Định Danh)
**Vai trò**: Cổng ra vào duy nhất của cả hệ thống.

#### Người dùng trải nghiệm gì?

**Bước đầu vào**: Chú Quang 62 tuổi, mới nghe người quen giới thiệu pháp môn Tâm Linh. Vào web, bấm "Đăng ký", nhập email, đặt mật khẩu. Hệ nhận email xác nhận, click xác nhận → thẳng vào dashboard. **Không hỏi điền profile trước, không bắt khai báo pháp danh ngay** — chú có thể bổ sung sau ở `/tai-khoan`.

**Đăng nhập hàng ngày**: Cô Mai đã là hội viên 2 năm. Mở tab, đăng nhập email/mật khẩu → vào thẳng dashboard. Nếu dùng Google, bấm "Đăng nhập bằng Google" → hệ map về cùng tài khoản cũ, không tạo account mới.

**Pháp danh / Dharma name**: User nhập tên pháp trong phần hồ sơ. Đây là thông tin cá nhân, không công khai tự động.

#### Dữ liệu module giữ
- Tài khoản (email, mật khẩu hash, pháp danh, số điện thoại, avatar)
- Phiên đăng nhập (session cookie, thời hạn)
- Vai trò: `guest` (khách) → `member` (hội viên) → `admin` (phụng sự viên) → `super-admin`
- Trạng thái tài khoản: bình thường / bị khóa / bị chặn

#### Quy tắc cứng
- Một email = một tài khoản duy nhất
- Đăng xuất toàn bộ thiết bị: logout-all cho tất cả session
- Đổi vai trò phải có admin làm và để lại audit log

---

### MODULE 02 — CONTENT (Kho Tàng Nội Dung)
**Vai trò**: Thư viện kinh sách và tài liệu pháp môn chuẩn. Admin biên soạn, người dùng đọc.

#### Người dùng trải nghiệm gì?

**Kinh Bài Tập Hằng Ngày — bài kinh/chú trì tụng**:
Đây là nội dung cốt lõi nhất. Module 02 lưu từng "chant item" (bài niệm) với đầy đủ: tên bài, script chữ, audio hướng dẫn, số biến khuyến nghị, hướng dẫn tư thế/thời gian/hoàn cảnh thích hợp, và **rule theo mức độ tu học**.

Điểm rất quan trọng: app không được hiểu sai rằng `7 biến` là chuẩn chung cho mọi người. Logic đúng là:
- `7` hoặc `9` biến là lane cho người mới bắt đầu
- với đồng tu đã có công khóa ổn định, nhất là khi đang赶念 **Ngôi Nhà Nhỏ**, `21` biến cho **Đại Bi** và **Tâm Kinh** là nền tảng cơ bản, không nên tự động hạ xuống thấp hơn

Rule support này hiện được đội ngũ chốt theo khai thị `Shuohua20180316 19:45`.

Nghĩa là Content giữ:
- bài niệm nào dành cho beginner lane
- bài nào có `foundation floor` cho người đã qua beginner phase
- rule nào chỉ là advisory, rule nào là guardrail

Ví dụ:
- *Đại Bi Tâm Đà La Ni* — có lane sơ học và lane nền tảng; không nên auto-downgrade xuống dưới `21` cho đồng tu đã có nền chỉ vì đang lo `Ngôi Nhà Nhỏ`
- *Bát Nhã Tâm Kinh* — tương tự, có `beginner lane` và `foundation lane`
- *Chuẩn Đề Thần Chú* — có preset theo ngày thường / ngày đặc biệt / advisory từ lịch
- *Tiêu Tai Kiết Tường Thần Chú* — có thể được advisory tăng cường vào ngày phù hợp
- *Công Đức Bảo Sơn Thần Chú* — là **support item có điều kiện**, không phải bài app được nhét mặc định cho mọi user mỗi ngày. Logic đúng là:
  - chỉ nên hiện như bài hỗ trợ khi user có ngữ cảnh rõ: vừa làm việc thiện, bố thí pháp, phóng sinh, gieo duyên pháp bảo, hoặc đang có lời cầu xin cụ thể
  - app có thể giữ wording tham khảo và note hỗ trợ, nhưng **không được tính toán “bao nhiêu công đức”, không dựng ví công đức, không bắt user nhập % chuyển công đức như field tính toán**
  - nếu việc thiện đã quá lâu trong quá khứ, app cũng không được mặc định coi là vẫn còn nguyên để chuyển thành công đức

Khi admin thêm bài mới hoặc chỉnh sửa script, hệ tự đồng bộ ra practice sheet và search.

**Ngôi Nhà Nhỏ (content side)**:
Module 02 giữ phần nội dung/hướng dẫn về Ngôi Nhà Nhỏ: giải thích mục đích, cách viết tên người thân cần hồi hướng, quy trình 4 bài cần niệm đủ để "hoàn thành một Ngôi Nhà Nhỏ", câu hỏi thường gặp, hình ảnh minh họa, file PDF in ra. Phần *tiến độ cá nhân* của từng Ngôi Nhà thì để ở Module 04 - Engagement.

**Phóng Sanh (content side)**:
Hub hướng dẫn phóng sanh, bao gồm: lời khấn trước khi phóng sanh, nghi thức đúng theo pháp môn, các biến thể theo loài vật (cá, chim, tôm cua), câu hỏi thường gặp, checklist in ra mang theo. Công khai cho cả khách chưa đăng nhập đọc được.

**Thư viện pháp môn**:
Album ảnh pháp hội, video khai thị được Admin chọn lọc và upload vào bộ sưu tập có chủ đề (không phải upload grid vô tổ chức).

**Sơ học / Giới thiệu pháp môn**:
Chuỗi bài dành riêng cho người mới: "Pháp môn Tâm Linh là gì?", "Bắt đầu từ đâu?", "Lập Phật đài như thế nào?", "Cúng thí thực là gì?". Đây là first-class content, không phải mấy post rời rạc.

#### Dữ liệu module giữ
- `posts`: bài viết biên tập có taxonomy/series
- `hubPages`: trang điều hướng (hub Niệm Kinh, hub Phóng Sanh, hub Ngôi Nhà Nhỏ...)
- `beginnerGuides`: tài liệu nhập môn và hướng dẫn dài
- `downloads`: tài nguyên PDF/audio có thể tải về
- `chantItems`: từng bài niệm/chú (script, audio ref, preset số biến)
- `chantPlans`: kế hoạch công khóa theo buổi/ngày/dịp đặc biệt
- `sutras / sutraVolumes / sutraChapters / sutraGlossary`: cây kinh đọc đầy đủ
- `mediaCollections`: bộ sưu tập ảnh/video curated

#### Quy tắc cứng
- Chỉ admin mới được biên soạn/publish
- Nội dung chỉ public khi status = `published`
- Bookmark, tiến độ đọc, practice sheet của user **không** lưu vào đây — đó là việc của Module 04

---

### MODULE 03 — COMMUNITY (Cộng Đồng)
**Vai trò**: Mạng xã hội thu nhỏ có kiểm soát — để đồng tu quay lại thường xuyên, nhưng không trượt thành feed độc hại.

#### Người dùng trải nghiệm gì?

**Bình luận bài viết**:
Dưới bài hướng dẫn "Cách niệm Đại Bi Tâm Đà La Ni đúng pháp", hội viên có thể bình luận chia sẻ kinh nghiệm. Thread hiển thị dạng nested comment nông, dễ đọc, có `tim`, có báo cáo vi phạm, và nếu bị report dồn dập có thể auto-ẩn tạm thời.

**Sổ Lưu Niệm (Guestbook)**:
Trang nhẹ nhàng hơn forum. Hội viên gửi vài dòng cảm nhận tu học — ví dụ "Sau 3 tháng trì Đại Bi, bệnh đau lưng của con đã thuyên giảm, con xin cảm ơn Sư Phụ". Entry này phải qua duyệt của admin trước khi hiển thị công khai. Có thể có share/copy link cho entry đã duyệt nếu policy cho phép. **Không hiển thị số biến, không hiển thị progress** — tu học là riêng tư.

**Community Posts**:
Hội viên đăng bài trong cộng đồng (chia sẻ linh nghiệm, hỏi kinh nghiệm tu). Admin cũng có thể đăng bài như official voice. Đây không phải feed vô tận, nhưng vẫn có đủ mechanics để user muốn quay lại:
- bài mới
- bình luận / reply
- `tim` hiển thị dạng trái tim
- chia sẻ link
- thông báo khi có người trả lời hoặc bài được duyệt

#### Dữ liệu module giữ
- `postComments`: bình luận dưới bài viết editorial
- `communityPosts`: bài đăng trong cộng đồng
- `communityComments`: bình luận trong thread cộng đồng
- `guestbookEntries`: lời nhắn sổ lưu niệm

#### Quy tắc cứng
- Guestbook phải qua moderation trước khi public
- **Tuyệt đối không hiển thị progress tu tập của user** (số biến, số buổi, tiến độ nguyện)
- Chỉ có `tim` như appreciation signal nhẹ, không có reaction zoo
- Report vi phạm chuyển sang Module 05 xử lý, Community không tự giữ kết quả xử lý

---

### MODULE 04 — ENGAGEMENT (Sổ Tay Cá Nhân)
**Vai trò**: Mọi thứ riêng tư của một người tu học. Không ai khác nhìn thấy được.

#### Người dùng trải nghiệm gì?

**Practice Sheet — Bảng Công Khóa Hằng Ngày**:
Đây là trung tâm của vòng tu học ngày. Nhưng trước khi hiện sheet, app phải hiểu user thuộc nhóm nào:
- **người mới bắt đầu thật sự**
- **đã có công khóa ổn định**
- **tu lâu rồi nhưng mới tham gia PMTL_VN**

Ví dụ:
- Cô mới nhập môn có thể đi theo lane sơ học với preset nhẹ hơn như `7 biến`
- Bác đã tu lâu nhưng mới dùng app thì có thể chọn "đã có công khóa ổn định" để **skip beginner lane**
- Nếu một đồng tu đang赶念 **Ngôi Nhà Nhỏ**, app vẫn phải giữ warning đúng: với người đã qua beginner phase, `Đại Bi` và `Tâm Kinh` không nên bị gợi ý hạ dưới `21 biến`
- Nếu user muốn dùng `Công Đức Bảo Sơn Thần Chú`, app chỉ nên hỗ trợ ở mức:
  - card nhắc đây là bài hỗ trợ có điều kiện
  - chỗ ghi self-note riêng tư về việc thiện vừa làm / ngày đã làm / đang cầu cho ai
  - prayer template đã duyệt bởi content owner
  - tuyệt đối không biến feature này thành máy “quy đổi công đức” hay progress bar công đức

Sau đó user mới thấy danh sách bài hôm nay, bấm nút đếm biến (nút to 52px cho người lớn tuổi, có haptic nếu điện thoại hỗ trợ), rồi bấm "Lưu buổi tu" → ghi vào `practiceLogs`. **Không tự động save — user chủ động lưu khi thấy xong.**

**Ngôi Nhà Nhỏ — Tracker cá nhân**:
Ngôi Nhà Nhỏ là pháp môn hồi hướng công đức cho người thân đã mất hoặc cần thiện duyên. Mỗi "Ngôi Nhà" gồm 4 bài niệm với tổng số biến nhất định. Khi hoàn thành → Nhà trạng thái `self_stored` (tự giữ cúng) → rồi `offered` (đã cúng). Tracker này **user tự nhập — không tự động tổng hợp từ practice sheet** (vì tu học thật đòi hỏi sự có mặt, không phải click).

**Đánh dấu Kinh**:
Bác đang đọc bộ Kinh Địa Tạng, mới đọc đến Phẩm thứ 3. Hệ lưu vị trí đọc cuối vào `sutraReadingProgress`. Lần sau mở lại, hệ tự nhảy về đúng chỗ đang đọc.

**Bookmark**:
Đọc đến đoạn khai thị hay về nhân quả, đánh dấu lại để đọc lại sau, thêm ghi chú riêng.

#### Dữ liệu module giữ
- `sutraBookmarks`: bookmark kinh văn kèm ghi chú cá nhân
- `sutraReadingProgress`: vị trí đọc cuối cùng theo chương
- `chantPreferences`: bật/tắt bài nào, đặt mục tiêu riêng
- `practiceLogs`: lịch sử các buổi tu (ngày, bài, số biến, ghi chú)
- `practiceSheets`: bảng công phu điện tử theo ngày
- `ngoiNhaNhoSheets`: từng Ngôi Nhà Nhỏ — trạng thái 4 bài, lifecycle, hồi hướng

#### Quy tắc cứng
- Tất cả dữ liệu trong module này là **private tuyệt đối** — chỉ user chủ sở hữu thấy
- Admin KHÔNG được tự ý đọc/sửa engagement data của member (chỉ có assisted-entry flow có kiểm soát)
- Được phép có `private streak` / consistency summary để tạo động lực riêng tư, nhưng không được public, không leaderboard, không so sánh với người khác
- Không cross-user write nếu chưa có support lane canon

---

### MODULE 05 — MODERATION (Kiểm Duyệt)
**Vai trò**: Ban kiểm luật — xử lý nội dung vi phạm trong cộng đồng.

#### Người dùng trải nghiệm gì?

**Người report**: Chị Hoa đọc bình luận trong cộng đồng, thấy có người đăng link không liên quan đến pháp môn, mang tính thương mại. Chị bấm "Báo cáo" → chọn lý do "Nội dung không phù hợp" → gửi. Hệ ghi lại report vào `moderationReports`, ngay lập tức thông báo admin.

**Admin xử lý**: Admin Tuấn vào workspace kiểm duyệt, thấy report của chị Hoa. Đọc nội dung bình luận, quyết định "Ẩn bài" → ghi quyết định + lý do → hệ ẩn bình luận, thông báo chị Hoa là đã xử lý, gửi cảnh báo người đăng.

**Re-resolve**: Nếu sau đó admin Tuấn thấy mình xử lý sai, có thể mở lại và xử lý lại, nhưng lịch sử quyết định cũ vẫn giữ nguyên (không xóa được).

#### Dữ liệu module giữ
- `moderationReports`: nguồn chuẩn gốc — ai report, report cái gì, lý do, trạng thái, quyết định admin

#### Quy tắc cứng
- Moderation không xóa, chỉ ghi thêm (audit trail bất biến)
- Summary fields trên bài/comment (isHidden, reportCount) chỉ là read model — nguồn thật là moderationReports
- Khi có drift (số report sai), recovery là chạy recompute từ moderationReports, không patch tay

---

### MODULE 06 — SEARCH (Tìm Kiếm)
**Vai trò**: Bàn tra cứu — giúp tìm nhanh trong kho lời dạy và bài viết.

#### Người dùng trải nghiệm gì?

**Tra theo vấn đề đời sống**:
Bác Dũng đang khó ngủ, nghi là có vong linh quấy nhiễu. Vào ô tìm kiếm gõ "khó ngủ" → kết quả hiện các bài Huyền học vấn đáp từ Sư Phụ Lư liên quan đến giấc ngủ và tâm linh, các bài Bạch Thoại liên quan, kèm đoạn trích để đọc nhanh. Bác click vào bài phù hợp, đọc câu trả lời **từ nguồn chính thống — không phải AI tự nghĩ ra**.

**Tìm bài kinh**:
Gõ "Tiêu Tai" → ra bài Tiêu Tai Kiết Tường Thần Chú với hướng dẫn, audio, PDF đi kèm.

**Tìm chủ đề**:
Gõ "phóng sanh" → ra cả hướng dẫn nghi thức, bài khai thị liên quan, câu hỏi đáp về phóng sanh. Kết quả có snippet đoạn trích, không chỉ tiêu đề.

#### Hoạt động kỹ thuật ra sao?
- **Phase 1**: Tìm kiếm qua SQL/API thẳng vào Postgres — đủ dùng khi dữ liệu vừa phải
- **Phase 2+**: Khi tốc độ tìm chậm hơn ngưỡng SLO, chuyển sang Meilisearch với full-text index đa ngôn ngữ

#### Quy tắc cứng
- Search **không phải** nguồn dữ liệu gốc — chỉ là "bản chiếu" để tìm nhanh
- Bài chưa publish → không xuất hiện trong kết quả search
- Khi xóa/ẩn bài → tự động gỡ khỏi search index

---

### MODULE 07 — CALENDAR (Lịch Tu Học)
**Vai trò**: Ban lịch — cung cấp thông tin ngày âm lịch, ngày đặc biệt, advisory hàng ngày, sự kiện tổ chức.

#### Người dùng trải nghiệm gì?

**Dashboard daily advisory**:
6h sáng, chị Lan mở app. Dashboard ngay lập tức hiện:

```
📅 Thứ Ba, 01/03 Ất Tỵ — Mùng 1 Tháng 3 (Âm)
✨ Ngày mùng 1 — ngày vía đặc biệt
🙏 Gợi ý tu học hôm nay:
   • Tăng cường Chuẩn Đề Thần Chú (21 biến thay vì 7)
   • Nên tụng thêm bài Phổ Môn nếu có thể
   • Ngày tốt để phát nguyện hoặc hoàn nguyện
```

**Không cần chị Lan phải đọc lịch, tự tra ngày âm** — advisory đã tổng hợp sẵn. Advisory này **do người biên soạn từ lời dạy pháp môn, không phải AI tự sinh**.

**Lục trai nhật** (các ngày ăn chay/tăng cường tu học quan trọng của pháp môn):
Mùng 1, 8, 14, 15, 23, 29, 30 hàng tháng âm lịch. Module Calendar biết "rule family" này, tự động đánh dấu những ngày này trên lịch cá nhân của user mà không cần admin nhập từng ngày.

**Sự kiện tổ chức**:
Pháp hội Quán Thế Âm ngày 19/2 âm, khóa tu mùa hè tháng 7... Admin nhập sự kiện với đầy đủ: thời gian, địa điểm, chương trình theo giờ, diễn giả, poster, link đăng ký, livestream. Người dùng xem lịch sự kiện và nhận nhắc trước khi sự kiện bắt đầu.

**Lịch tu học cá nhân**:
Cô Bích vào trang `/lich-ca-nhan`, thấy cả tháng 3 với:
- Ngày âm từng ngày
- Các ngày lục trai nhật được đánh dấu xanh
- Ngày vía của chư Phật/Bồ Tát (vía Quán Âm, vía Di Lặc...)
- Sự kiện tổ chức sắp tới
- Ngày cô có kế hoạch phóng sanh (hook từ Module 09)
- Ngày cô đến deadline nguyện (hook từ Module 09)

#### Dữ liệu module giữ
- `events`: sự kiện tổ chức (pháp hội, khóa tu, webinar)
- `eventAgendaItems`, `eventSpeakers`, `eventCtas`: chi tiết chương trình sự kiện
- `lunarEvents`: định nghĩa ngày âm lịch lặp hàng tháng/năm (mùng 1, rằm, ngày vía)
- `lunarEventOverrides`: override riêng cho ngày đặc biệt
- `personalPracticeCalendarReadModel`: lịch tổng hợp có cá nhân hóa của từng user

#### Quy tắc cứng
- Calendar **không tự gửi notification** — chỉ cung cấp dữ liệu cho Module 08 đọc
- Advisory không phải AI sinh — là content được biên soạn theo lời dạy chính thống
- "Ngày tốt phóng sanh" lấy từ calendar rule, không do AI tính

---

### MODULE 08 — NOTIFICATION (Nhắc Nhở)
**Vai trò**: Phòng phát loa — gửi đúng nhắc, đúng người, đúng lúc. Không spam.

#### Người dùng trải nghiệm gì?

**Nhắc thực hành buổi sáng**:
Anh Bình đặt nhắc "6h sáng mỗi ngày". Đến giờ, điện thoại rung: *"Chào buổi sáng 🙏 Hôm nay mùng 14, ngày lục trai nhật — thời điểm tốt để trì kinh"*. Anh tap thẳng vào Practice Sheet.

**Nhắc deadline nguyện**:
Chị Hương phát nguyện niệm 3.000 biến Đại Bi trong 30 ngày, còn 7 ngày nữa là đến hạn. Hệ tự gửi nhắc: *"Nguyện lực của bạn còn 7 ngày — hiện tại đã hoàn thành 2.100/3.000 biến"*.

**Nhắc sự kiện**:
Trước pháp hội Quán Thế Âm 1 ngày, hệ gửi: *"Pháp hội ngày mai 19/2 âm — xem chương trình chi tiết"*.

**Giờ yên lặng (quiet hours)**:
User có thể đặt giờ không nhắc (ví dụ: 22h-6h sáng). Hệ tôn trọng tuyệt đối.

#### Dữ liệu module giữ
- `pushSubscriptions`: danh sách thiết bị đã đăng ký nhận push (địa chỉ gửi)
- `pushJobs`: phiếu công việc gửi push (không phải hộp thư của user)

#### Quy tắc cứng
- Notification gửi bất đồng bộ — không block request chính
- `pushJobs` là "phiếu việc", không phải inbox chuẩn gốc
- Module 08 không tự biết cần gửi gì — nó chỉ delivery theo tín hiệu từ Calendar, Vows, Moderation
- Quiet hours được tôn trọng tuyệt đối

---

### MODULE 09 — VOWS & MERIT (Nguyện Lực & Công Đức)
**Vai trò**: Sổ phát nguyện và nhật ký phóng sanh — đây là module của tâm nguyện và thực hành công đức.

#### Người dùng trải nghiệm gì?

**Phát Nguyện**:
Chú Tâm muốn phát nguyện hạn chế sát sinh trong 1 tháng. Vào `/phat-nguyen/tao-moi`, điền:
- Loại nguyện: "Ăn chay"
- Nội dung: "Ăn chay trường trong 30 ngày"
- Ngày bắt đầu: 01/03/2025
- Hạn hoàn thành: 31/03/2025
- Mục tiêu lượng hóa: 30 ngày (tùy chọn)

Hệ ghi lại `vow` với trạng thái `active`. Mỗi ngày chú có thể vào ghi tiến độ (đánh dấu ngày đã chay). Khi đến hạn mà chưa hoàn thành → trạng thái "Đã quá hạn", không có penalty, không có cảnh báo đỏ to. Khi hoàn thành → trạng thái `fulfilled`.

**Hủy nguyện**:
Vì lý do sức khỏe, chú cần hủy nguyện. Hệ yêu cầu xác nhận 2 bước (không bấm nhầm được), ghi lý do, ghi audit log. **Không có "hình phạt" hay cảnh báo tiêu cực nào.**

**Nhật Ký Phóng Sanh**:
Ngày rằm 15/2 âm, cô Bích đi phóng sanh cá tại sông. Trước khi đi, cô vào app đọc guide (Module 02 cung cấp): lời khấn, trình tự nghi thức, những điều cần chú ý. Sau khi phóng sanh xong, cô vào `/phong-sanh`, ghi nhật ký:
- Ngày: 15/02/Ất Tỵ
- Địa điểm: Sông Đồng Nai, Q.9
- Loài vật: Cá chép
- Số lượng: 500 con
- Hồi hướng: "Hồi hướng cho vong linh cha mẹ chú bác, cầu siêu thoát"

Nhật ký này **private**, chỉ cô thấy.

#### Dữ liệu module giữ
- `vows`: nguyện (loại, nội dung, thời hạn, mục tiêu, trạng thái)
- `vowProgressEntries`: từng lần cập nhật tiến độ
- `lifeReleaseJournal`: nhật ký phóng sanh (ngày, địa điểm, loài, số lượng, hồi hướng)

#### Quy tắc cứng
- Nguyện là **private** — không hiển thị cho ai khác
- Không có penalty khi không hoàn thành — chỉ có trạng thái trung lập
- Void nguyện: 2-step confirm + ghi audit log
- Ritual truth (lời khấn, nghi thức) ở Module 02; Module 09 chỉ giữ journal

---

### MODULE 10 — WISDOM-QA (Kho Trí Huệ Chính Thống)
**Vai trò**: Kho lưu trữ toàn bộ lời dạy, khai thị, hỏi đáp từ nguồn chính thống. Đây là trái tim tri thức của pháp môn.

#### Người dùng trải nghiệm gì?

**Bạch Thoại Phật Pháp (đọc/nghe)**:
Chị Ngọc muốn hiểu sâu hơn về nghiệp và nhân quả. Vào `/bach-thoai`, tìm sách "Bạch Thoại Phật Pháp quyển 1". Giao diện: chữ to, nền trắng/đen tùy chọn, đọc từng chương hoặc nghe audio. Mỗi bài có song ngữ: bản gốc Hoa ngữ + bản dịch tiếng Việt. **Ghi rõ nguồn**: "Bạch Thoại Phật Pháp quyển X, bài XX, nguồn: lujunhong2or.com". Không ai sửa được trừ admin đã được ủy quyền.

**Huyền Học Vấn Đáp**:
Đây là phần tra cứu câu trả lời của Sư Phụ Lư cho các câu hỏi về hiện tượng tâm linh, đời sống. Người dùng tìm theo chủ đề:
- "giấc mơ" → các bài Q&A về giải mộng theo pháp môn
- "bệnh tật" → lời dạy về nhân quả bệnh và cách tu học giải nghiệp
- "gia đình" → xử lý mâu thuẫn gia đình theo nhân quả
- "nhà cửa" → chọn nhà, đặt Phật đài đúng
- "phóng sanh" → các câu hỏi chi tiết về phóng sanh đúng pháp

Mỗi entry có: câu hỏi gốc → câu trả lời gốc → bản dịch Việt → link nguồn → mã bài tham chiếu. **Không AI self-generate — 100% từ nguồn chính thống**.

**Khai Thị và Phật Ngôn**:
Bộ sưu tập khai thị ngắn và trích đoạn Phật ngôn, phân loại theo chủ đề. Ví dụ: "Khai thị về hiếu đạo", "Câu Phật ngôn về từ bi". Song ngữ Hoa-Việt.

**Offline Bundle**:
Người dùng ở vùng sâu hoặc dự khóa tu offline, tải trước bộ bài Bạch Thoại để đọc không cần mạng.

**Authority Profile**:
Thông tin về Sư Phụ Lư Quân Hoành — tách rõ 3 loại: thông tin có nguồn chính thức, bản dịch cộng đồng, lời chứng ngôn linh nghiệm. Không trộn lẫn.

#### Dữ liệu module giữ
- `wisdomEntries`: bài Bạch Thoại, khai thị, Phật ngôn — có song ngữ, provenance, review status
- `qaEntries`: Huyền học vấn đáp và Phật học vấn đáp — có alias chủ đề, source mapping
- `authorityProfiles`: profile Sư Phụ/người dạy
- `baihuaAudiobook metadata`: cấu trúc sách/chương/track audio
- `offlineBundles`: metadata gói tải ngoại tuyến

#### Quy tắc cứng
- **Retrieval-first**: tra đúng nguồn, không AI sinh lời dạy mới
- Song ngữ gốc+dịch là first-class format — không phải ghi chú phụ
- Audio và offline là nhu cầu thật — không phải nice-to-have
- Bài phải ingest text trước, audio sau
- Source provenance bắt buộc cho mọi entry

---

### MODULE 11 — CONTACT (Liên Hệ & Phụng Sự Viên)
**Vai trò**: Bảng liên hệ và danh sách phụng sự viên hỗ trợ.

#### Người dùng trải nghiệm gì?

**Người mới cần hỏi**:
Chú Hải vừa đăng ký, đọc mãi vẫn chưa hiểu cách lập bàn Phật đúng theo pháp môn. Vào trang `/lien-he`, thấy danh sách phụng sự viên (PSV) với avatar, tên, vai trò (PSV khu vực mạnh), và nút "Nhắn qua Zalo". Chú click → mở Zalo, nhắn thẳng PSV phụ trách khu vực mình.

**Không có form liên hệ phức tạp**: Liên hệ trực tiếp qua Zalo link của từng PSV — đơn giản, nhanh, phù hợp người lớn tuổi.

**Admin quản lý PSV**:
PSV mới gia nhập → admin thêm vào danh sách: upload avatar, nhập tên, ghi vai trò, dán Zalo link. Khi PSV nghỉ → bấm inactive → tự ẩn khỏi trang.

**Thông tin liên hệ chung**:
Email tổ chức, hotline, Fanpage, Zalo OA — admin có thể cập nhật khi cần (chỉ 1 record duy nhất).

#### Dữ liệu module giữ
- `contactInfo`: singleton thông tin liên hệ chung (email, hotline, fanpage, Zalo OA)
- `volunteers`: danh sách PSV (avatar, tên, vai trò, Zalo link, sortOrder, isActive)

#### Quy tắc cứng
- Chỉ hiển thị PSV có `isActive = true`
- Không có form ticket — liên hệ qua Zalo link trực tiếp
- `contactInfo` là singleton — chỉ update, không tạo mới hay xóa

---

## Quy Tắc Vàng Toàn Hệ Thống

```
[FAIL] KHÔNG BAO GIỜ:
─────────────────────────────────────────────────────────
✗ Hiển thị số biến/progress tu học của người dùng công khai
✗ So sánh, leaderboard, điểm số giữa các thành viên
✗ Streak có penalty khi bỏ ngày tu
✗ Badge / thành tựu kiểu game khi hoàn thành nguyện
✗ AI tự đưa ra lời khuyên tu học (chỉ tra nguồn chính thống)
✗ AI sinh "khai thị", "lời Phật dạy" mới
✗ Advisory do AI tính theo thuật toán (advisory phải do người biên soạn)
✗ "Ngày tốt/xấu" do AI đoán mò (phải từ lịch pháp môn)
✗ Public practice log (tu học là riêng tư)
✗ "Share your progress" kêu gọi public hóa tiến độ tu học

[OK] LUÔN LUÔN:
─────────────────────────────────────────────────────────
✓ Advisory lấy từ lời dạy chính thống có người biên soạn
✓ "Ngày đặc biệt" lấy từ lịch âm + rule pháp môn
✓ Nguồn gốc mọi lời dạy phải ghi rõ (sách, tập, trang, URL)
✓ Practice data là private tuyệt đối
✓ Giao diện thân thiện người cao tuổi (chữ lớn, nút to 52px)
✓ Không bắt buộc điền profile trước khi tu học
✓ Người dùng chủ động lưu — không auto-save giật mình
✓ Search trả về đoạn trích, không chỉ tiêu đề
```

---

## Ai Làm Gì Được

| Hành động | Khách (chưa đăng nhập) | Hội viên | Admin (PSV) |
|---|---|---|---|
| Đọc bài hướng dẫn, Bạch Thoại, Q&A | [OK] | [OK] | [OK] |
| Đọc hướng dẫn phóng sanh | [OK] | [OK] | [OK] |
| Xem lịch sự kiện | [OK] | [OK] | [OK] |
| Lưu buổi tu, Practice Sheet | [FAIL] | [OK] | [OK] |
| Ngôi Nhà Nhỏ tracker | [FAIL] | [OK] | [OK] |
| Phát nguyện, nhật ký phóng sanh | [FAIL] | [OK] | [OK] |
| Bookmark kinh văn | [FAIL] (soft gate) | [OK] | [OK] |
| Gửi guestbook, bình luận | [FAIL] | [OK] | [OK] |
| Duyệt guestbook, kiểm duyệt | [FAIL] | [FAIL] | [OK] |
| Biên soạn nội dung (kinh, guide) | [FAIL] | [FAIL] | [OK] |

---

## Gợi Ý Feature Phù Hợp Pháp Môn

### Có thể thêm sớm (không cần infra mới)
| Feature | Ý nghĩa tâm linh |
|---|---|
| **Câu khai thị mỗi ngày** trên dashboard | Mỗi ngày mở app thấy 1 trích đoạn lời Sư Phụ — nhắc nhở nhẹ nhàng |
| **Nhắc tu học theo múi giờ cá nhân** | Người đặt "6h sáng" → đúng 6h push notification |
| **Hướng dẫn lập Phật đài chuẩn** | Bài guide ảnh/video cho người mới, step-by-step |
| **Landing "Bắt đầu từ đây"** cho người hoàn toàn mới | Tìm được trong tối đa 2 tap từ trang chủ |
| **Lịch chay hàng tháng** | Tự tính lục trai nhật và hiển thị trực quan theo tháng |

### Có thể thiết kế thêm (Phase sau)
| Feature | Ý nghĩa tâm linh |
|---|---|
| **Hồi hướng công đức** | Sau buổi tu, ghi "hồi hướng cho ai" — private record có ý nghĩa |
| **Nhóm tu học gia đình** | 3–5 người xem lịch tu chung (không public, không so sánh) |
| **"Tủ sách" cá nhân** | Danh sách Bạch Thoại/Q&A đã đọc và muốn đọc lại |
| **Offline toàn bộ Bạch Thoại** | Phục vụ khóa tu, vùng mạng yếu — nhu cầu thật |
| **Lịch phóng sanh theo vùng** | Gợi ý địa điểm phóng sanh uy tín theo khu vực |

> **Nguyên tắc thêm feature**: Nếu feature không giúp người tu học *hiểu đúng pháp môn*, *thực hành hằng ngày*, hoặc *tra đúng nguồn* — hỏi lại trước khi build.

