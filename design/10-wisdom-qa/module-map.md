# Wisdom & QA Module

> Ghi chú:
> Module này gom các bề mặt tri thức chính thống để người dùng tra đúng nguồn và học đúng cách.
> Nó không phải chatbot, cũng không phải blog feed chung chung.

---

markmap:
colorFreezeLevel: 2
initialExpandLevel: 3

---

# Wisdom & QA Module

## Mục tiêu

- hỗ trợ tra cứu nhanh lời dạy chính thống
- hỗ trợ đọc/nghe `Bạch thoại Phật pháp`
- hỗ trợ tìm câu trả lời theo vấn đề đời sống, không cần AI tự bịa
- hỗ trợ `khai thị`, `Phật ngôn Phật ngữ`, `Phật học vấn đáp`
- hỗ trợ audio/video/offline cho người lớn tuổi

## Dữ liệu module nên sở hữu

### Wisdom entries

- `Bạch thoại Phật pháp`
- `khai thị`
- `Phật ngôn Phật ngữ`
- `bài pháp hội`
- curated excerpts hoặc entry đã duyệt
- mỗi entry nên hỗ trợ cặp:
  - `nguyên văn gốc`
  - `bản dịch tiếng Việt`
  - `source URL`
  - `source provenance (tầng nguồn gốc dữ liệu)`
  - `ảnh chụp / screenshot nguồn`
  - `review status (trạng thái kiểm duyệt)`

### QA entries

- `Huyền học vấn đáp`
- `Phật học vấn đáp`
- alias theo chủ đề đời sống
- source mapping về bài gốc
- nên hỗ trợ format bài thực tế:
  - `mã bài / timestamp`
  - `question original`
  - `answer original`
  - `bản dịch Việt`
  - `link gốc`
  - `ảnh bài nếu có`
  - `practice rule extraction` nếu có rule cụ thể

### Teacher / authority profile

- metadata giới thiệu `Sư Phụ Lư Quân Hoành` hoặc authority profile liên quan
- phải tách rõ:
  - `official-source-backed facts`
  - `community-translated profile`
  - `doctrinal claims / testimonial claims`
- không trộn mọi loại claim vào một field văn xuôi duy nhất
- phải giữ provenance (nguồn gốc dữ liệu) rõ để tránh lẫn fact, translation, và testimony

### Media learning model

- audio entry metadata
- video entry metadata
- transcript/ref text nếu có
- relation giữa text, audio, video của cùng một chủ đề

### Offline bundles

- danh sách bài đã tải
- metadata phiên bản
- trạng thái đồng bộ

## Cốt lõi trải nghiệm

### Bạch thoại Phật pháp

- chữ to
- nền đơn giản
- chế độ đọc đêm
- audio rõ
- điều hướng theo tập / chủ đề / bài

### Huyền học vấn đáp

- tìm theo vấn đề:
  - giấc mơ
  - bệnh
  - gia đình
  - nhà cửa
  - niệm kinh
  - phát nguyện
  - phóng sanh
- hiển thị câu trả lời đã được index từ nguồn chính thống

### Khai thị và Phật ngôn

- surface đọc nhanh cho bài chỉ dạy ngắn hoặc trích đoạn quan trọng
- phân loại theo chủ đề, dịp, pháp hội, hoặc hoàn cảnh tu học
- cho phép song song:
  - bản gốc Hoa
  - bản dịch Việt
  - link bài nguồn để cộng đồng cùng kiểm duyệt

### Audio / video / offline

- nghe lại chương trình
- mở audio Bạch thoại
- mở video khai thị
- tải bundle offline
- ưu tiên font lớn, nút rõ, ít thao tác

## Boundaries

### Wisdom & QA owns

- curated retrieval records
- source mapping cho entry tri thức
- media metadata phục vụ học/tra cứu
- offline bundle (gói tải ngoại tuyến) metadata
- review state cho bản dịch và bài song ngữ
- source provenance (tầng nguồn gốc dữ liệu) cho bài gốc, official mirror, và web phụng sự viên

### Wisdom & QA does not own

- canonical beginner guide/hub pages
- canonical download hub điều hướng chung
- raw user practice state
- community testimony canonical records

## References ra ngoài module

### Content

- dùng `downloads`, `hubPages`, `beginnerGuides` làm cửa vào hoặc tài nguyên hỗ trợ
- media file hoặc external resource refs có thể do content/media layer giữ

### Search

- search index hợp nhất với `01-content` thành `Kho Trí Huệ`
- signal quan trọng nên phát qua `outbox_events`

### Notification

- có thể đọc context từ wisdom entry để tạo reminder học đêm hoặc nhắc đọc/nghe
- reminder/read-later signal quan trọng cũng nên đi qua outbox nếu feature bật

## Current rules (Quy tắc hiện tại)

- retrieval-first: tra đúng nguồn trước
- không dùng AI sinh lời giải mới
- audio/video là first-class learning surface, không phải phần phụ
- offline là nhu cầu thật, không phải nice-to-have
- bài song ngữ `gốc + dịch` là first-class format, không phải ghi chú phụ
- canonical source record đi trước; search/bundle/reminder signal đi sau qua outbox
- bundle/search drift phải có replay/rebuild path rõ
