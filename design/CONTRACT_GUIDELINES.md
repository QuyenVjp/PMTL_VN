# CONTRACT_GUIDELINES

PMTL_VN đã có hợp đồng route ở `docs/api/contracts.md`.
File này bổ sung quy tắc thiết kế contract (hợp đồng dữ liệu/nghiệp vụ) trong lớp `design/` để AI không bị lệch giữa:

- raw Payload document
- compatibility DTO
- use-case (kịch bản sử dụng) write-path

## Nguồn ưu tiên

1. `packages/shared/src/schemas/*` cho input validation
2. `docs/api/contracts.md` cho route và DTO public/BFF
3. `design/*/contracts.md` cho business meaning của contract (hợp đồng dữ liệu/nghiệp vụ) theo module
4. raw Payload REST chỉ là implementation detail, không phải public contract (hợp đồng dữ liệu/nghiệp vụ) mặc định

## Quy tắc bắt buộc

- Input từ user phải map được về Zod schema (lược đồ dữ liệu) rõ ràng.
- Public route ưu tiên dùng `publicId`; `slug` chủ yếu cho SEO/read route.
- DTO public không expose field hệ thống nhạy cảm như:
  - `spamScore`
  - `submittedByIpHash`
  - raw moderation internals
  - internal job payload
- Nếu route ghi dữ liệu, file contract (hợp đồng dữ liệu/nghiệp vụ) phải nói rõ:
  - canonical record (bản ghi chuẩn gốc) tạo ở đâu
  - summary field nào được cập nhật
  - side-effect nào async (bất đồng bộ)

## Error contract (hợp đồng dữ liệu/nghiệp vụ) tối thiểu

Mọi contract (hợp đồng dữ liệu/nghiệp vụ) write quan trọng nên mô tả tối thiểu:

- `400` dữ liệu không hợp lệ
- `401` chưa đăng nhập hoặc thiếu session
- `403` không đủ quyền
- `404` entity không tồn tại
- `409` duplicate hoặc state conflict
- `500` lỗi hệ thống / downstream failure

## Cách ghi contract (hợp đồng dữ liệu/nghiệp vụ) trong module docs

- Không cần chép lại toàn bộ code schema (lược đồ dữ liệu).
- Chỉ cần nêu:
  - route chính
  - schema (lược đồ dữ liệu) chính
  - response shape cốt lõi
  - field nào canonical
  - field nào chỉ là DTO convenience

## Notes for AI/codegen

- Đừng lấy raw Payload document rồi coi như public contract (hợp đồng dữ liệu/nghiệp vụ) ổn định.
- Đừng expose field moderation hoặc audit nội bộ cho route public.
- Đừng dùng search document làm response source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) nếu route cần correctness cao.

