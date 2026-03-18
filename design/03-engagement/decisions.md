# Engagement Module Decisions

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
