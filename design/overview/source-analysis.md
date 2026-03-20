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
- `audio / video / offline / chữ lớn` là nhu cầu thật
- `community` chỉ là lớp hỗ trợ, không phải trung tâm

## Recommended feature surfaces (Các surface nên ưu tiên)

### 1. Giới thiệu pháp môn và sơ học

Owner:

- `01-content`

### 2. Thư viện trí huệ chính thống

Owner:

- `09-wisdom-qa`
- `01-content` chỉ giữ hub/reference bổ trợ

### 3. Hỗ trợ tu học thực tế hằng ngày

Owner:

- `03-engagement`
- đọc reference từ `01-content`

### 4. Nguyện lực và công đức

Owner:

- `08-vows-merit`

### 5. Lịch tu học cá nhân

Owner:

- `06-calendar`

### 6. Nghe và xem để tu học

Owner:

- `09-wisdom-qa`

### 7. Thông báo và tài nguyên chính thức

Owner:

- `01-content`
- `07-notification` chỉ phụ trách delivery

### 8. Cộng đồng và chia sẻ linh nghiệm

Owner:

- `02-community`

### 9. Search hợp nhất

Owner:

- `05-search`

## What should not become the product center (Những gì không được thành trung tâm sản phẩm)

- feed vô tận kiểu mạng xã hội
- gamification kiểu streak/challenge
- chatbot tự sinh `khai thị`
- AI trả lời thay nguồn chính thống

## Student note (Ghi chú cho sinh viên)

Mỗi khi phân vân có nên thêm tính năng không, tự hỏi:

- nó có giúp người dùng hiểu pháp môn không?
- nó có giúp tra đúng nguồn không?
- nó có giúp thực hành hằng ngày không?
- nó có giúp người lớn tuổi đọc/nghe dễ hơn không?

Nếu không, rất có thể đó không phải core surface.
