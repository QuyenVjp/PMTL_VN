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

## Decision 5. Không public-gamify, nhưng được phép có private motivation loop

### Context (Bối cảnh)

Leaderboard, streaks công khai, và global stats chưa có owner model đủ rõ.

### Decision (Quyết định)

- leaderboards và global statistics vẫn là out of scope ở current phase
- `private streak`, consistency summary, và gentle encouragement được phép nếu:
  - chỉ owner nhìn thấy
  - không so sánh với người khác
  - không trở thành penalty loop

### Rationale (Lý do)

- giữ động lực cá nhân mà không biến practice thành social competition

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

## Decision 7. Onboarding practice profile phải tách người mới nhập môn với người tu lâu nhưng mới dùng app

### Context (Bối cảnh)

Trong đời thực có hai nhóm rất khác:
- người mới bắt đầu thật sự
- người đã có công khóa ổn định từ lâu nhưng chỉ mới tham gia PMTL_VN

Nếu app ép cả hai đi cùng một beginner path thì sẽ sai và gây khó chịu.

### Decision (Quyết định)

- `chantPreferences` hoặc owner self-state tương đương phải giữ `practice profile` tối thiểu:
  - `newcomer`
  - `established`
  - `experienced_new_to_app`
- onboarding phải cho user chọn hoặc skip beginner track rõ ràng
- user `experienced_new_to_app` được phép bỏ qua preset 7 biến dành cho người mới để vào thẳng profile nền tảng phù hợp

### Rationale (Lý do)

- đúng thực tế đồng tu ngoài đời
- tránh biến app thành nơi “dạy lại từ đầu” cho người đã có nền

## Decision 8. Little House load không được tự động kéo chuẩn nền tảng xuống dưới mức an toàn đã chốt

### Context (Bối cảnh)

Người dùng đôi khi phải dành nhiều thời gian cho `Ngôi Nhà Nhỏ`.
Nếu app vì thế tự động gợi ý hạ chuẩn công khóa nền tảng xuống quá thấp thì sẽ trái rule support content.

### Decision (Quyết định)

- Với user profile đã qua beginner phase, app không được auto-suggest giảm `Đại Bi` hoặc `Tâm Kinh` xuống dưới mức nền tảng đã chốt trong owner content/wisdom rule.
- Current canon cho rule support này:
  - `7` biến là lane sơ học / mới bắt đầu
  - `21` biến là nền tảng cơ bản cho đồng tu đã vào guồng, đặc biệt khi vẫn đang赶念 `Ngôi Nhà Nhỏ`
- Nếu user chủ động custom thấp hơn, UI phải hiện warning rõ thay vì coi đó là normal preset.

### Rationale (Lý do)

- hỗ trợ đúng tinh thần hành trì
- app không vô tình hướng user sang practice downgrade
