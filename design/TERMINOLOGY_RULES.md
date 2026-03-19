# TERMINOLOGY_RULES

File này chốt quy tắc thuật ngữ cho PMTL_VN.
Mục tiêu là:

- không dịch lệch nghĩa các khái niệm cốt lõi
- AI không tự chế tên module hoặc tên tính năng
- thống nhất giữa UI, API, docs, search tags và nội dung dịch

## Nguyên tắc chung

- Ưu tiên thuật ngữ thực hành, dễ hiểu với người lớn tuổi.
- Nếu thuật ngữ gốc quá quen trong cộng đồng, giữ cả:
  - tên Việt chuẩn dùng trong app
  - tên gốc Hoa văn để đối chiếu dịch thuật
- Tránh các tên nghe "ảo", game hóa, startup hóa hoặc mạng xã hội hóa.
- App là công cụ hỗ trợ tu tập thực tế, không phải nền tảng ảo.

## Quy tắc hiển thị

- UI chính: dùng tiếng Việt có dấu, dễ hiểu.
- Screen/help/đối chiếu tài liệu: cho phép hiện thêm thuật ngữ gốc Hoa trong ngoặc khi cần.
- Search nội bộ: nên index cả
  - tiếng Việt
  - tiếng Hoa gốc
  - alias thường gặp

## Bảng thuật ngữ chuẩn

| Khái niệm | Tên chuẩn trong app/docs | Thuật ngữ gốc | Ghi chú |
|---|---|---|---|
| 小房子 | `Ngôi Nhà Nhỏ` | `小房子` | Không gọi là "tiểu phòng tử" trong UI chính; có thể ghi alias đối chiếu trong docs/search |
| 心灵法门 | `Pháp môn Tâm Linh` | `心灵法门` | Dùng cho phần giới thiệu pháp môn, không dịch thành tên app chung chung |
| 初学者须知 | `Hướng dẫn sơ học` | `初学者须知` | Dùng cho surface bắt đầu học |
| 经文组合小房子 | `Ngôi Nhà Nhỏ` / `Kinh văn tổ hợp Ngôi Nhà Nhỏ` | `经文组合小房子` | Dùng khi cần diễn giải đầy đủ |
| 功课 | `Bài tập hằng ngày` | `功课` | Không đổi thành "habit", "streak", "challenge" |
| 许愿 | `Phát nguyện` | `许愿` | Dùng cho lời nguyện có cam kết rõ |
| 还愿 | `Hoàn nguyện` | `还愿` | Không gộp chung với phát nguyện |
| 放生 | `Phóng sanh` | `放生` | Dùng như thực hành và sổ tay thực hành |
| 白话佛法 | `Bạch thoại Phật pháp` | `白话佛法` | Có thể thêm mô tả `bài giảng dễ hiểu` |
| 玄学问答 | `Huyền học vấn đáp` | `玄学问答` | Không đổi thành chatbot, AI answer, forum answer |
| 节目录音 | `Thu âm chương trình` | `节目录音` | Dùng cho audio chính thức |
| 法会文章 | `Bài pháp hội` | `法会文章` | Dùng cho bài giảng hoặc bài liên quan pháp hội |
| 佛学问答 | `Phật học vấn đáp` | `佛学问答` | Nhóm hỏi đáp rộng hơn |
| 念经 | `Niệm kinh` | `念经` | Dùng cho thực hành đọc tụng |
| 礼佛 | `Lễ Phật` | `礼佛` | Chỉ dùng khi đúng ngữ cảnh nghi thức |
| 自存经文 | `Tự tồn kinh văn` | `自存经文` | Không nhập nhằng với Ngôi Nhà Nhỏ |
| 共修 | `Cộng tu` | `共修` | Dùng cho zoom/nhóm học và đọc chung |
| 开示 | `Khai thị` | `开示` | Giữ sắc thái chỉ dạy, không đổi thành "blog post" |
| 佛言佛语 | `Phật ngôn Phật ngữ` | `佛言佛语` | Thư viện trích dẫn ngắn |
| 精彩反馈 | `Chia sẻ linh nghiệm` | `精彩反馈` | Dùng cho testimony/community reference |

## Quy tắc đặc biệt cho `Ngôi Nhà Nhỏ`

- Tên chuẩn trong app và docs nghiệp vụ:
  - `Ngôi Nhà Nhỏ`
- Thuật ngữ đối chiếu:
  - `小房子`
  - `kinh văn tổ hợp`
- Không dùng làm tên chính:
  - `Tiểu Phòng Tử`
  - `Xiaofangzi`
  - `paper card`
  - `ritual sheet`

## Quy tắc đặc biệt cho `Bạch thoại Phật pháp`

- Tên chuẩn:
  - `Bạch thoại Phật pháp`
- Không đổi thành:
  - `wisdom articles`
  - `mindset lessons`
  - `spiritual blog`

## Quy tắc đặc biệt cho `Huyền học vấn đáp`

- Đây là thư viện tra cứu hỏi đáp chính thống, không phải tính năng AI sinh câu trả lời.
- Tên chuẩn:
  - `Huyền học vấn đáp`
- Không đổi thành:
  - `AI hỏi đáp`
  - `trợ lý bói toán`
  - `oracle`

## Quy tắc đặt tên module

- Tên module trong docs có thể thiên về chức năng thực hành.
- Không đặt tên module theo kiểu sản phẩm mạng xã hội.

Ưu tiên:
- `Giới thiệu pháp môn`
- `Sơ học nhập môn`
- `Thư viện Phật pháp`
- `Hỗ trợ công phu`
- `Nguyện lực & Công đức`
- `Lịch tu học`
- `Bạch thoại & Vấn đáp`

## Quy tắc dịch thuật

- Bản dịch tiếng Việt phải trung tính, rõ nghĩa, không cường điệu.
- Khi chưa chắc nghĩa, ghi cả:
  - thuật ngữ gốc
  - bản Việt đề xuất
  - trạng thái cần human review
- Với kinh văn, bài khấn, nghi thức:
  - không paraphrase bừa
  - không "viết lại cho mượt"
  - chỉ chú thích hoặc trình bày hỗ trợ đọc

## Quy tắc search/index

- Search nên index các alias sau cho cùng một khái niệm:
  - `Ngôi Nhà Nhỏ`, `小房子`
  - `Bạch thoại Phật pháp`, `白话佛法`
  - `Huyền học vấn đáp`, `玄学问答`
  - `Phát nguyện`, `许愿`
  - `Phóng sanh`, `放生`

## Notes for AI/codegen

- Không tự đổi `Ngôi Nhà Nhỏ` thành `Tiểu Phòng Tử` trong UI chính.
- Không biến `Huyền học vấn đáp` thành chatbot AI.
- Không gọi `Bạch thoại Phật pháp` là "blog" hoặc "content feed".
