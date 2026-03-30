# SOURCE_ANALYSIS (Phân tích nguồn chính thức và bề mặt chức năng)

File này hợp nhất các ghi chú cũ về nguồn chính thức và bề mặt chức năng.

Mục tiêu:

- chốt nguồn chính thức tham chiếu
- rút ra feature surface (bề mặt chức năng) đúng trọng tâm
- tránh biến PMTL_VN thành social feed hoặc chatbot

## Official sources (Nguồn chính thức)

- `https://lujunhong2or.com/`
- `https://xlch.org/`
- `https://guanyincitta.com/`
- `https://orientalradio.com.sg/`

## What these sources imply (Các nguồn này cho thấy điều gì)

- `Giới thiệu pháp môn` và `sơ học` là cửa vào bắt buộc
- `Bạch thoại Phật pháp`, `khai thị`, `Huyền học vấn đáp`, `Phật học vấn đáp` là lõi tri thức
- `Ngôi Nhà Nhỏ`, `bài tập hằng ngày`, `phát nguyện`, `phóng sanh` là lõi thực hành
- `佛台供设` và `各类升文` là hai beginner-family signals thật, không nên xem như note phụ nếu muốn bám official PMTL surface
- `精选开示` là curated surface; `现场图腾` và `同修分享` là family riêng có độ nhạy cảm khác nhau
- `audio / video / offline / chữ lớn` là nhu cầu thật
- `community` chỉ là lớp hỗ trợ, không phải trung tâm

## Recommended feature surfaces (Các surface nên ưu tiên)

### 1. Giới thiệu pháp môn và sơ học

Owner:

- `02-content`

### 2. Thư viện trí huệ chính thống

Owner:

- `10-wisdom-qa`
- `02-content` chỉ giữ hub/reference bổ trợ

### 3. Hỗ trợ tu học thực tế hằng ngày

Owner:

- `04-engagement`
- đọc reference từ `02-content`

### 4. Nguyện lực và công đức

Owner:

- `09-vows-merit`

### 5. Lịch tu học cá nhân

Owner:

- `07-calendar`

### 6. Nghe và xem để tu học

Owner:

- `10-wisdom-qa`

### 7. Thông báo và tài nguyên chính thức

Owner:

- `02-content`
- `08-notification` chỉ phụ trách delivery

### 8. Cộng đồng và chia sẻ linh nghiệm

Owner:

- `03-community`

### 9. Search hợp nhất

Owner:

- `06-search`

## What should not become the product center (Những gì không được thành trung tâm sản phẩm)

- feed vô tận kiểu mạng xã hội
- gamification kiểu streak/challenge
- chatbot tự sinh `khai thị`
- AI trả lời thay nguồn chính thống
- browser automation bám một GPT web riêng như canonical ingest path

## AI automation note

- AI hợp lý nhất khi làm:
  - source normalization
  - translation draft
  - tag/alias suggestion
  - duplicate-check assist
- AI không được làm:
  - doctrinal answer engine
  - auto-publish machine translation
  - canonical truth owner

## Encyclopedia Ingestion Rule
- Nếu nhận một bản tổng hợp dài (kiểu encyclopedia), phải tách ra 2 lane:
  - `implementation-safe`: workflow, checklist, owner mapping, data/UX guardrails
  - `research-only`: claim tranh cãi, cáo buộc chính trị/pháp lý, miracle/cure testimonials
- Không đưa nguyên khối encyclopedia vào public copy.
- Trước khi chuyển thành canon:
  - map vào file owner cụ thể ở `03-domains/*/REFERENCES`
  - gắn nhãn `advisory` hoặc `contested` khi cần
  - thêm disclaimer y tế/tâm linh cho nội dung nhạy cảm.
- Archive hiện tại:
  - `design/05-references/external-research/XLFM_ENCYCLOPEDIA_INPUT_2026-03-29.md`

## Student note (Ghi chú cho sinh viên)

Mỗi khi phân vân có nên thêm tính năng không, tự hỏi:

- nó có giúp người dùng hiểu pháp môn không?
- nó có giúp tra đúng nguồn không?
- nó có giúp thực hành hằng ngày không?
- nó có giúp người lớn tuổi đọc/nghe dễ hơn không?

Nếu không, rất có thể đó không phải core surface.
