# TERMINOLOGY (Thuật ngữ và quy tắc ghi chú)

File này hợp nhất các ghi chú cũ về terminology và `English (Việt)` notation.

Mục tiêu:

- thống nhất thuật ngữ PMTL_VN
- giữ format `English (Việt)` cho người học
- tránh AI tự chế tên module hoặc dịch lệch nghĩa

## Notation rules (Quy tắc ghi chú)

- thuật ngữ kỹ thuật quan trọng nên theo mẫu `English (Việt)`
- đoạn giải thích dài ưu tiên tiếng Việt
- identifier như field, route, enum giữ nguyên
- heading có thể song ngữ nhưng phải đọc tự nhiên

Ví dụ đúng:

- `owner module (mô-đun sở hữu)`
- `canonical record (bản ghi chuẩn gốc)`
- `read model (mô hình dữ liệu đọc)`
- `fallback (đường dự phòng)`
- `async (bất đồng bộ)`

## Standard technical vocabulary (Bộ thuật ngữ kỹ thuật chuẩn)

- `owner module (mô-đun sở hữu)`
- `canonical (chuẩn gốc)`
- `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)`
- `read model (mô hình dữ liệu đọc)`
- `derived read model (mô hình đọc được tính ra từ dữ liệu gốc)`
- `contract (hợp đồng dữ liệu/nghiệp vụ)`
- `schema (lược đồ dữ liệu)`
- `service (lớp xử lý nghiệp vụ)`
- `boundary (ranh giới trách nhiệm)`
- `control-plane (lớp điều phối hệ thống)`
- `preconditions (điều kiện tiên quyết)`
- `write path (thứ tự ghi dữ liệu chuẩn)`
- `offline bundle (gói tải ngoại tuyến)`
- `source provenance (nguồn gốc dữ liệu)`

## Standard PMTL vocabulary (Bộ thuật ngữ PMTL chuẩn)

| Khái niệm | Tên chuẩn trong app/docs | Thuật ngữ gốc | Ghi chú |
|---|---|---|---|
| 小房子 | `Ngôi Nhà Nhỏ` | `小房子` | Không dùng `Tiểu Phòng Tử` làm tên chính |
| 心灵法门 | `Pháp môn Tâm Linh` | `心灵法门` | Dùng cho phần giới thiệu pháp môn |
| 初学者须知 | `Hướng dẫn sơ học` | `初学者须知` | Surface cho người mới |
| 功课 | `Bài tập hằng ngày` | `功课` | Không đổi thành `habit`/`challenge` |
| 许愿 | `Phát nguyện` | `许愿` | Lời nguyện có cam kết rõ |
| 还愿 | `Hoàn nguyện` | `还愿` | Không gộp với phát nguyện |
| 放生 | `Phóng sanh` | `放生` | Thực hành và sổ tay thực hành |
| 白话佛法 | `Bạch thoại Phật pháp` | `白话佛法` | Có thể thêm mô tả dễ hiểu |
| 玄学问答 | `Huyền học vấn đáp` | `玄学问答` | Không đổi thành chatbot |
| 开示 | `Khai thị` | `开示` | Giữ sắc thái chỉ dạy |
| 心香 | `Tâm hương` | `心香` | Dùng đúng ngữ cảnh khấn cầu |

## Search/index rule (Quy tắc cho search)

Search nên index cả:

- thuật ngữ Việt chuẩn
- thuật ngữ Hoa gốc
- alias thường gặp

Ví dụ:

- `Ngôi Nhà Nhỏ`, `小房子`
- `Bạch thoại Phật pháp`, `白话佛法`
- `Huyền học vấn đáp`, `玄学问答`

## Naming anti-rules (Những tên không được dùng)

- không gọi `Ngôi Nhà Nhỏ` là `paper card`, `ritual sheet`, `Tiểu Phòng Tử`
- không gọi `Bạch thoại Phật pháp` là `blog`
- không gọi `Huyền học vấn đáp` là `AI hỏi đáp`

## Notes for AI/codegen

- UI chính phải ưu tiên tiếng Việt có dấu, dễ hiểu
- thuật ngữ gốc dùng để đối chiếu và search
- không startup-hoá, game-hoá, mạng xã hội hoá thuật ngữ tu học
- nếu cần giải thích feature surface lấy từ source chính thức, dùng thêm `overview/source-analysis.md`; file này chỉ chốt terminology, không thay file source-analysis
