# SOURCE_NOTES_OFFICIAL

File này ghi lại các nguồn chính thức đã dùng để định hướng module cốt lõi.
Mục tiêu không phải sao chép nội dung nguồn, mà là chốt:

- các trục nội dung chính thức đang tồn tại
- từ đó suy ra module nào nên có trong PMTL_VN
- tránh thiết kế lệch sang mạng xã hội hoặc AI-answering

## Nguồn chính thức đã xem

- `https://lujunhong2or.com/`
- `https://xlch.org/`
- `https://guanyincitta.com/`

## Những trục nội dung nổi bật từ nguồn

### Từ `lujunhong2or.com`

Menu và chuyên mục công khai cho thấy các trục rất rõ:

- `小房子常识`
- `白话佛法`
- `佛学问答`
- `玄艺问答`
- `经文和整理稿`
- `音频下载`
- `视频下载`

Điều này củng cố rằng PMTL_VN không nên chỉ có:
- content chung chung
- engagement chung chung

Mà phải có các surface riêng cho:
- `Ngôi Nhà Nhỏ`
- `Bạch thoại Phật pháp`
- `Huyền học vấn đáp`
- audio/video hỗ trợ học và đọc

### Từ `xlch.org`

Site này cho thấy lớp nội dung học tập và media rõ ràng:

- `节目分类`
- `白话佛法`
- `玄艺综述`
- `师父开示`
- `佛经教念`

Điều này củng cố thêm rằng app nên có:
- reading/listening surface rõ ràng
- hỗ trợ audio cho người mắt yếu
- hỗ trợ học ban đêm, cộng tu, đọc theo bài

### Từ `guanyincitta.com`

Site tiếng Anh cho thấy cùng một trục nội dung được trình bày theo cách rất sáng:

- `For Beginners`
- `Dharma Talks`
- `Buddhism Q&A`
- `Resource Centre`
- `Inspirational Stories`

Điều này củng cố rằng PMTL_VN nên có surface rõ cho:
- giới thiệu pháp môn
- sơ học nhập môn
- thư viện bài giảng / khai thị
- hỏi đáp chính thống
- stories/testimony như lớp hỗ trợ, không phải lõi tri thức

## Kết luận thiết kế rút ra

### 1. `Ngôi Nhà Nhỏ` phải là first-class practice support
- không nên chỉ là một note trong `practiceLogs`
- cần inventory và progress rõ

### 2. `Bạch thoại Phật pháp` phải có reading surface riêng
- chữ to
- audio/video hỗ trợ
- offline-first

### 3. `Huyền học vấn đáp` phải là retrieval module riêng
- tra cứu theo vấn đề
- không để AI tự sinh lời giải mới

### 4. `Phóng sanh` và `Phát nguyện` nên thành owner module riêng
- gắn với lịch tu học và nhắc việc
- không bị chìm trong community hoặc self-log chung

### 5. `Giới thiệu pháp môn` và `sơ học` là first-class surface
- không chỉ là vài bài rải trong blog
- nên có hub riêng cho:
  - pháp môn là gì
  - bắt đầu từ đâu
  - các bước thực hành đầu tiên

### 6. `Audio / video / offline` là nhu cầu thật
- không phải nice-to-have
- đặc biệt quan trọng cho người lớn tuổi hoặc người học qua nghe

## Nguyên tắc dịch và trình bày rút ra từ nguồn

- phải giữ thuật ngữ gốc Hoa để đối chiếu
- nhưng UI chính cho user Việt lớn tuổi nên dùng tiếng Việt rõ nghĩa
- cần tránh chuyển hóa nội dung chính thống thành:
  - feed
  - blog
  - chatbot
  - gamification

## Notes for AI/codegen

- Khi thêm module mới liên quan pháp môn cốt lõi, tra lại file này và `TERMINOLOGY_RULES.md`.
- Nếu một tính năng không gắn với hỗ trợ tu tập thực tế, cần xem lại trước khi thêm vào roadmap.
