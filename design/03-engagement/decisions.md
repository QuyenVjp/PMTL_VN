# Engagement Module Decisions (Quyết định Mô-đun Tương tác & Tu tập)

> Note for students (Ghi chú cho sinh viên):
> Nếu anh đang phân vân bookmark/progress có nên nằm ở Content không, file này chốt câu trả lời.

## Decision 1. Engagement owns self-owned state only (Tương tác chỉ sở hữu trạng thái cá nhân)

### Context (Bối cảnh)

Legacy designs (thiết kế cũ) từng trộn bookmark và progress vào Content.

### Decision (Quyết định)

- bookmarks, reading progress, practice preferences, practice logs đều thuộc Engagement
- editorial/scripture content chỉ được reference, không được đồng sở hữu

### Rationale (Lý do)

- boundary rõ hơn
- content không phải gánh hàng nghìn private telemetry records

## Decision 2. Bookmarks and progress are separate models (Bookmark và progress là hai model tách biệt)

### Context (Bối cảnh)

Bookmark là user-saved point (điểm người dùng chủ động lưu), còn progress là automatic telemetry (tiến độ tự động).

### Decision (Quyết định)

- giữ `sutraBookmarks` và `sutraReadingProgress` thành hai collection riêng

### Rationale (Lý do)

- tránh nhét hai business meaning khác nhau vào một bảng

## Decision 3. Preferences and logs are different things (Preferences và logs là hai loại dữ liệu khác nhau)

### Context (Bối cảnh)

Preference là cấu hình bền vững; log là dấu vết của từng buổi thực hành.

### Decision (Quyết định)

- `chantPreferences` giữ configured goals/toggles (cấu hình mục tiêu/bật tắt)
- `practiceLogs` giữ execution history (lịch sử thực hiện)

### Rationale (Lý do)

- phù hợp với physical data model (mô hình dữ liệu vật lý) dự kiến
- dễ update độc lập hơn

## Decision 4. Upsert based on identity + context (Upsert dựa trên định danh + ngữ cảnh)

### Context (Bối cảnh)

Progress và preference đại diện cho current state (trạng thái hiện tại), không phải immutable ledger (sổ cái bất biến).

### Decision (Quyết định)

- sutra progress upsert theo `user + sutraId`
- practice preference upsert theo `user + planSlug`
- practice log định danh theo `user + practiceDate + planSlug`

### Rationale (Lý do)

- giảm duplicate record
- hợp với API contract hiện tại

## Decision 5. No gamification in current phase (Chưa đưa gamification vào giai đoạn hiện tại)

### Context (Bối cảnh)

Leaderboard, streaks, và global stats chưa có owner model đủ rõ.

### Decision (Quyết định)

- leaderboards, streaks, global statistics là out of scope (ngoài phạm vi) ở current phase
- chỉ tập trung vào core state management (quản lý trạng thái cốt lõi)

### Rationale (Lý do)

- tránh over-engineering

## Decision 6. Ritual truth lives in content; personal progress lives in engagement (Sự thật nghi thức ở Content; tiến độ cá nhân ở Engagement)

### Context (Bối cảnh)

Ritual guides, scripts, prayer templates, count rules là instructional truth (sự thật hướng dẫn), không phải self-state.

### Decision (Quyết định)

- Engagement không sở hữu scripts hay ritual rules canonical
- Engagement chỉ lưu user preference và user progress đối với các rule đó
- Canonical scripts, `chantItems`, checklist phải được reference từ Content

### Rationale (Lý do)

- tránh việc UI change vô tình sửa lệch ritual truth
- giữ ranh giới giữa liturgical truth và personal state
