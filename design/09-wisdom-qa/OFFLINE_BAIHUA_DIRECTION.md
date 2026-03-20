# Offline Baihua Direction

File này chốt hướng hỗ trợ `Bạch thoại Phật pháp` theo kiểu offline-first cho người lớn tuổi.

## Mục tiêu

- đọc không cần mạng
- nghe audio không cần mạng khi đã tải
- mở nhanh bài hay học ban đêm
- chữ to, rõ, ít thao tác

## Gói offline nên hỗ trợ

### 1. Single entry

- tải từng bài
- phù hợp khi user chỉ học một bài cụ thể

### 2. Series pack

- tải theo tập hoặc nhóm chủ đề
- phù hợp cho cộng tu hoặc học theo đợt

### 3. Night reading pack

- gói các bài hay dùng ban đêm
- có thể kèm audio chậm, rõ

## Dữ liệu nên lưu offline

- title gốc
- title tiếng Việt
- body text cần đọc
- audio metadata
- local asset refs
- version

## Dữ liệu không cần lưu toàn bộ ngay

- comments
- social reactions
- full unrelated media library

## Sync model

- tải lần đầu
- dùng lại offline
- khi có mạng thì check version mới
- chỉ tải delta nếu có thể

## UX rules

- nút `Tải về` rõ ràng
- có trạng thái:
  - chưa tải
  - đang tải
  - đã tải
  - cần cập nhật
- không đòi người lớn tuổi quản lý file thủ công

## Notes for AI/codegen

- offline bundle (gói tải ngoại tuyến) là projection phục vụ đọc, không thay source canonical.
- audio/video refs phải tôn trọng source mapping và storage policy.
