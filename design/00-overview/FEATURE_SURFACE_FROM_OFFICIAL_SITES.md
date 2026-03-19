# Feature Surface From Official Sites

File này chốt bộ chức năng nên phát triển của PMTL_VN dựa trên các web chính thức đã tham chiếu.
Mục tiêu:

- không build sai trọng tâm của pháp môn
- không biến app thành mạng xã hội hoặc chatbot
- giúp AI biết ưu tiên sản phẩm nào là lõi thật

## Nguồn chính thức dùng để suy ra bề mặt chức năng

- `https://lujunhong2or.com/`
- `https://xlch.org/`
- `https://guanyincitta.com/`

## Nguyên tắc rút ra

- `Giới thiệu pháp môn` và `sơ học` là cửa vào bắt buộc, không phải phần phụ.
- `Bạch thoại Phật pháp`, `khai thị`, `Huyền học vấn đáp`, `Phật học vấn đáp` là lõi tri thức.
- `Ngôi Nhà Nhỏ`, `bài tập hằng ngày`, `phát nguyện`, `phóng sanh` là lõi thực hành.
- `audio / video / offline / chữ lớn` là nhu cầu thực tế, nhất là với người lớn tuổi.
- `community` chỉ là lớp hỗ trợ và làm chứng, không được lấn lên làm trung tâm hệ thống.

## Bộ chức năng nên phát triển theo thứ tự

### 1. Giới thiệu pháp môn và sơ học

Mục tiêu:
- giúp người mới hiểu pháp môn là gì
- biết bắt đầu từ đâu
- không bị lạc giữa quá nhiều bài viết

Surface nên có:
- `Giới thiệu pháp môn`
- `Hướng dẫn sơ học`
- `Bắt đầu công khóa`
- `Cách lập Phật đài`
- `Cách lễ Phật / tâm hương`
- `Giới thiệu ba đại pháp bảo / năm đại pháp bảo`
- `Các bước khởi đầu cho người mới`

Owner module:
- chủ yếu `01-content`

### 2. Thư viện trí huệ chính thống

Mục tiêu:
- tra cứu đúng nguồn chỉ dạy
- đọc học có cấu trúc
- không để AI tự bịa câu trả lời

Surface nên có:
- `Bạch thoại Phật pháp`
- `Khai thị`
- `Phật ngôn Phật ngữ`
- `Huyền học vấn đáp`
- `Phật học vấn đáp`
- `Tra cứu theo vấn đề đời sống`

Owner module:
- chủ yếu `09-wisdom-qa`
- `01-content` chỉ giữ content/hub/reference bổ trợ

### 3. Hỗ trợ tu học thực tế hằng ngày

Mục tiêu:
- hỗ trợ người dùng thật sự đang niệm kinh, làm công khóa, theo dõi tiến độ

Surface nên có:
- `Bài tập hằng ngày`
- `Practice Sheets / Bảng công phu`
- `Ngôi Nhà Nhỏ`
- `Công khóa cá nhân`
- `Tiến độ đọc kinh`
- `Checklist nghi thức`

Owner module:
- `03-engagement`
- đọc reference từ `01-content`

### 4. Nguyện lực và công đức

Mục tiêu:
- biến `phát nguyện` và `phóng sanh` thành support surfaces nghiêm túc

Surface nên có:
- `Phát nguyện`
- `Tiến độ nguyện`
- `Hoàn nguyện`
- `Sổ tay phóng sanh`
- `Checklist đọc trước khi phóng sanh`
- `Liên kết với lịch và nhắc việc`

Owner module:
- `08-vows-merit`

### 5. Lịch tu học cá nhân

Mục tiêu:
- biến lịch âm và ngày đặc biệt thành lịch tu học có ý nghĩa thực hành

Surface nên có:
- `Ngày vía`
- `Ngày trai giới`
- `Khung giờ gợi ý`
- `Lịch tu học cá nhân`
- `Hook phát nguyện`
- `Hook phóng sanh`
- `Hook bài tập hằng ngày`

Owner module:
- `06-calendar`
- notification chỉ đọc downstream

### 6. Nghe và xem để tu học

Mục tiêu:
- hỗ trợ người lớn tuổi và người thích nghe hơn đọc

Surface nên có:
- `Thu âm chương trình`
- `Audio Bạch thoại Phật pháp`
- `Video khai thị`
- `Bài pháp hội`
- `Offline bundle`
- `Chế độ chữ lớn / nghe lại / đọc đêm`

Owner module:
- `09-wisdom-qa`
- content/media làm reference và hosting metadata

### 7. Thông báo và tài nguyên chính thức

Mục tiêu:
- giữ cho người dùng biết thông báo quan trọng, tài liệu tải về, cập nhật chính thức

Surface nên có:
- `Thông báo chính thức`
- `Tài nguyên tải về`
- `Kinh văn và bản in`
- `Audio/video download hub`
- `Thông báo lịch cộng tu / pháp hội / tưởng niệm`

Owner module:
- `01-content`
- `07-notification` chỉ phụ trách delivery

### 8. Cộng đồng và chia sẻ linh nghiệm

Mục tiêu:
- tạo không gian chia sẻ kinh nghiệm thật
- không đè lên lớp tri thức chính thống

Surface nên có:
- `Guestbook`
- `Chia sẻ linh nghiệm`
- `Cảm nhận tu học`
- `Hỏi đáp cộng đồng`
- `Bình luận dưới bài viết`

Owner module:
- `02-community`
- moderation là lớp bắt buộc

### 9. Search hợp nhất

Mục tiêu:
- người dùng tìm một chỗ ra đúng tài liệu, bài dạy, hỏi đáp, audio, video, hướng dẫn

Surface nên có:
- `Kho Trí Huệ` hợp nhất
- search theo:
  - từ khóa
  - vấn đề đời sống
  - thuật ngữ Hoa/Việt
  - loại nội dung
  - media type

Owner module:
- `05-search`

### 10. Liên hệ và trợ giúp

Mục tiêu:
- người dùng có nơi tìm hỗ trợ chính thức, đặc biệt khi mới học

Surface nên có:
- `Liên hệ`
- `Câu hỏi thường gặp cho người mới`
- `Hướng dẫn dùng app/web`
- `Nơi bắt đầu nếu chưa biết gì`

Owner module:
- `01-content` hoặc `hubPages`

## Những gì không nên là trọng tâm

- feed vô tận kiểu mạng xã hội
- gamification kiểu streak/challenge/level-up
- chatbot tự sinh `khai thị`
- AI giải `Huyền học vấn đáp` thay cho nguồn chính thống
- dashboard phức tạp hơn nhu cầu thật của người tu

## Mapping nhanh sang module

| Surface | Module owner chính |
|---|---|
| Giới thiệu pháp môn | `01-content` |
| Sơ học | `01-content` |
| Bạch thoại Phật pháp | `09-wisdom-qa` |
| Khai thị / Phật ngôn | `09-wisdom-qa` |
| Huyền học vấn đáp | `09-wisdom-qa` |
| Bài tập hằng ngày | `03-engagement` + `01-content` refs |
| Ngôi Nhà Nhỏ | `03-engagement` + `01-content` refs |
| Phát nguyện / Phóng sanh | `08-vows-merit` |
| Lịch tu học cá nhân | `06-calendar` |
| Thông báo | `07-notification` |
| Download hub | `01-content` |
| Guestbook / chia sẻ linh nghiệm | `02-community` |
| Kho Trí Huệ search | `05-search` |

## Notes for AI/codegen

- Khi phải chọn giữa “thêm chức năng cộng đồng mới” và “hoàn thiện surface tu học lõi”, ưu tiên surface tu học lõi.
- Nếu một tính năng không giúp:
  - hiểu pháp môn
  - bắt đầu tu
  - tra đúng nguồn
  - thực hành hằng ngày
  - nghe/đọc thuận tiện
  thì cần xem lại trước khi đưa vào roadmap.
