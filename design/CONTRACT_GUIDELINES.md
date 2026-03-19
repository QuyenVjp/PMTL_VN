# CONTRACT_GUIDELINES

PMTL_VN đã có hợp đồng route ở `docs/api/contracts.md`.
File này bổ sung quy tắc thiết kế contract trong lớp `design/` để AI không bị lệch giữa:

- raw Payload document
- compatibility DTO
- use-case write-path

## Nguồn ưu tiên

1. `packages/shared/src/schemas/*` cho input validation
2. `docs/api/contracts.md` cho route và DTO public/BFF
3. `design/*/contracts.md` cho business meaning của contract theo module
4. raw Payload REST chỉ là implementation detail, không phải public contract mặc định

## Quy tắc bắt buộc

- Input từ user phải map được về Zod schema rõ ràng.
- Public route ưu tiên dùng `publicId`; `slug` chủ yếu cho SEO/read route.
- DTO public không expose field hệ thống nhạy cảm như:
  - `spamScore`
  - `submittedByIpHash`
  - raw moderation internals
  - internal job payload
- Nếu route ghi dữ liệu, file contract phải nói rõ:
  - canonical record tạo ở đâu
  - summary field nào được cập nhật
  - side-effect nào async

## Error contract tối thiểu

Mọi contract write quan trọng nên mô tả tối thiểu:

- `400` dữ liệu không hợp lệ
- `401` chưa đăng nhập hoặc thiếu session
- `403` không đủ quyền
- `404` entity không tồn tại
- `409` duplicate hoặc state conflict
- `500` lỗi hệ thống / downstream failure

## Cách ghi contract trong module docs

- Không cần chép lại toàn bộ code schema.
- Chỉ cần nêu:
  - route chính
  - schema chính
  - response shape cốt lõi
  - field nào canonical
  - field nào chỉ là DTO convenience

## Notes for AI/codegen

- Đừng lấy raw Payload document rồi coi như public contract ổn định.
- Đừng expose field moderation hoặc audit nội bộ cho route public.
- Đừng dùng search document làm response source of truth nếu route cần correctness cao.
