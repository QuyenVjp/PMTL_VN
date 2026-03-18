# Engagement Module Decisions

> Ghi chú cho sinh viên:
> Nếu bạn đang phân vân "bookmark nên để ở content hay engagement", file này chính là câu trả lời.

## Decision 1. Engagement chỉ sở hữu self-owned user state

### Context
Design cũ từng để content ôm bookmark và progress.
Repo hiện đã có collection riêng cho user-state.

### Decision
- Bookmark, reading progress, chant preference, practice log thuộc engagement module.
- Editorial content và scripture content chỉ được tham chiếu.

### Rationale
- Boundary rõ.
- Tránh content trở thành module chứa cả canonical document và personal state.

### Trade-off
- Read flow cần join/reference sang content hoặc sutra tree.

## Decision 2. Bookmark và progress tách thành hai model riêng

### Context
Bookmark và progress có ý nghĩa khác nhau:
- bookmark là điểm lưu chủ động
- progress là trạng thái đọc gần nhất

### Decision
- Giữ `sutraBookmarks` và `sutraReadingProgress` là hai collection riêng.

### Rationale
- Dễ hiểu.
- Tránh một table phải chứa hai ý nghĩa nghiệp vụ khác nhau.

### Trade-off
- Có thể cần đọc hai collection trong cùng màn hình reader.

## Decision 3. Practice preference tách khỏi practice log

### Context
Preference là cấu hình bền theo plan.
Practice log là bản ghi từng ngày hoặc từng buổi.

### Decision
- `chantPreferences` giữ cấu hình mong muốn.
- `practiceLogs` giữ lịch sử thực tế.

### Rationale
- Khớp fields hiện có.
- Hỗ trợ upsert config và append/update log tách biệt.

### Trade-off
- Cần service layer để compose preference với log khi render experience hoàn chỉnh.

## Decision 4. Upsert theo owner + context khi hợp lý

### Context
Reading progress và chant preference đều là state hiện thời hơn là immutable ledger.

### Decision
- Progress nên được cập nhật theo user + sutra.
- Preference nên được cập nhật theo user + plan.
- Practice log giữ semantics theo user + practiceDate + plan.

### Rationale
- Bám API contract hiện tại.
- Giảm duplicate records vô nghĩa.

### Trade-off
- Cần service layer giữ uniqueness discipline.

## Decision 5. Chưa đưa leaderboard, streaks, stats vào current scope

### Context
Wishlist cũ có đề cập leaderboard và gamification.
Repo hiện chưa có owner data model rõ cho phần đó.

### Decision
- Current scope chỉ giữ bookmark, progress, preference, practice log.
- Streaks/stats/leaderboard là future candidate, không đưa vào current schema.

### Rationale
- Tránh over-engineer.
- Thiết kế bám repo thật.

### Trade-off
- Nếu sau này cần gamification, phải thêm decision và schema riêng.

## Decision 6. Ngôi Nhà Nhỏ và nghi thức niệm dùng content làm reference, engagement chỉ giữ state

### Context
Bộ tài liệu PDF cho thấy phần niệm hằng ngày, phóng sinh, và đặc biệt Ngôi Nhà Nhỏ chứa nhiều:
- script
- lời khấn
- số biến
- checklist nghi thức
- guardrail thao tác

Các phần này là nội dung chuẩn để nhiều người cùng đọc, không phải dữ liệu cá nhân của một user.

### Decision
- Engagement không sở hữu script hay rule gốc của nghi thức.
- Engagement chỉ lưu:
  - preference của user
  - practice log
  - progress cá nhân
- Script/rule/checklist gốc phải được tham chiếu từ content-side practice support data.

### Rationale
- Giữ boundary đúng với repo.
- Tránh việc một thay đổi ở practice screen vô tình sửa “chân lý nội dung” của nghi thức.
- Hợp với hướng dùng `chantItems` và `chantPlans` làm reference data công khai.

### Trade-off
- Practice UI cần compose dữ liệu từ content và engagement cùng lúc.
- Cần review kỹ wording ở các flow nhạy cảm như Ngôi Nhà Nhỏ trước khi biến thành validation copy hoặc checklist UI.
