# Community Module Decisions

> Ghi chú cho sinh viên:
> Community của PMTL không phải Facebook thu nhỏ, nhưng cũng không phải góc bình luận tĩnh. Đây là `social-lite surface` để hội viên quay lại đều, chia sẻ kinh nghiệm, và cảm nhận được cộng đồng hiện diện.

## Decision 1. Community là social-lite có kiểm soát, không phải forum chết cũng không phải feed vô tận

### Context

Người dùng cần lý do quay lại thường xuyên: đọc chia sẻ, nhận phản hồi, thấy nội dung mới, và cảm nhận pháp hỷ cùng nhau.
Nhưng PMTL không được trượt thành mạng xã hội gây nghiện hoặc khoe thành tích tu tập.

### Decision

- Community được phép có các mechanics giữ nhịp quay lại:
  - bài đăng cộng đồng
  - bình luận / reply nông
  - `tim` như appreciation signal nhẹ
  - chia sẻ đường dẫn công khai
  - thông báo cho tương tác quan trọng
- Community không dùng:
  - feed vô tận tối ưu thời gian màn hình
  - reaction zoo
  - leaderboard / streak khoe thành tích
  - hiển thị progress tu tập cá nhân

### Rationale

- Giữ được retention loop có ích.
- Hợp tinh thần đạo tràng online: ấm, có tương tác, nhưng không kích thích khoe khoang.

### Trade-off

- Phải thiết kế cẩn thận để tránh social bloat.
- Moderation và abuse-control quan trọng hơn surface tĩnh thông thường.

## Decision 2. Tách discussion surfaces theo context thay vì gom chung một UGC table

### Context

Repo hiện có `postComments`, `communityPosts`, `communityComments`, `guestbookEntries`.

### Decision

- Giữ `postComments` riêng cho editorial content discussion.
- Giữ `communityPosts` và `communityComments` cho social-lite community surface.
- Giữ `guestbookEntries` là wall công khai nhẹ, nhấn vào tri ân và cảm nhận.

### Rationale

- Mỗi surface có moderation posture và public DTO khác nhau.
- Tránh generic UGC table khiến UI, policy, và query plan bị lẫn.

### Trade-off

- Có nhiều entity hơn.
- Report/moderation phải xử lý nhiều target type.

## Decision 3. Threading cho phép self-reference nhưng UI hiện tại giữ nông và dễ đọc

### Context

`communityComments` và `postComments` đều có `parent` relation.

### Decision

- Data model cho phép comment tham chiếu parent comment.
- UI chỉ hỗ trợ thread nông, predictable rendering, và pagination rõ.
- Không làm Reddit-style depth sâu trong current scope.

### Rationale

- Giữ trải nghiệm gọn, đặc biệt với người dùng lớn tuổi.
- Tránh tree rendering và moderation complexity quá sớm.

### Trade-off

- Mất một phần cảm giác thảo luận sâu.
- Nếu sau này muốn depth lớn hơn, service và paging contract phải mở rộng.

## Decision 4. Author snapshot được lưu trên entity community

### Context

User display name hoặc profile có thể đổi theo thời gian.

### Decision

- Community entities giữ relation tới user thật và snapshot tên hiển thị an toàn.
- Admin/editor cũng có thể đăng bài cộng đồng như official voice, nhưng public DTO vẫn phải hiện rõ author label/snapshot.

### Rationale

- Public DTO ổn định.
- Giảm lệ thuộc read path vào relation depth và profile drift.

### Trade-off

- Snapshot có thể không phản ánh tên mới nhất.
- Cần chấp nhận đây là denormalized display field.

## Decision 5. Moderation posture phân tầng theo surface, không pending-first cứng cho tất cả

### Context

Nếu mọi thứ đều pending-first thì community chết nhịp. Nếu mọi thứ đều public ngay thì rủi ro abuse tăng.

### Decision

- `guestbookEntries` luôn `approvalStatus = pending` trước khi public.
- `communityPosts` do member gửi mặc định `moderationStatus = pending` trước khi public.
- `communityPosts` do admin/editor tạo có thể publish ngay theo role policy.
- `postComments` và `communityComments` ưu tiên fast-path visible sau khi qua guard/anti-spam, nhưng actor rủi ro hoặc payload rủi ro có thể bị ép về pending/manual review.

### Rationale

- Giữ nhịp tương tác cho bình luận.
- Giữ chất lượng public surface của bài cộng đồng và guestbook.

### Trade-off

- Policy matrix phức tạp hơn một chút.
- Cần risk-based rules rõ để không gây khó hiểu.

## Decision 6. `Tim` được phép như appreciation signal nhẹ; không mở nhiều reaction và không gamify

### Context

Người dùng muốn bày tỏ pháp hỷ và ủng hộ nhau nhanh, nhưng không cần social mechanics nặng.

### Decision

- Cho phép `tim` trên bài cộng đồng và comment đủ điều kiện hiển thị.
- UI hiển thị heart icon, không dùng nhãn `like`.
- Không mở reaction khác như haha, angry, sad.
- Không hiện các rank/kho điểm/phần thưởng từ tim.

### Rationale

- Tạo loop phản hồi nhanh và nhẹ.
- Giữ ngôn ngữ giao diện mềm, không quá mạng xã hội.

### Trade-off

- Cần anti-spam / dedupe cho heart toggle.
- Nếu metric này bị lạm dụng, phải thêm rate-limit và abuse heuristics.

## Decision 7. Share là capability public bắt buộc, nhưng share analytics không phải canonical source

### Context

Community post, guestbook entry đã duyệt, và editorial discussion surface cần share để lan tỏa nội dung.

### Decision

- Public community surfaces phải có URL ổn định, metadata chia sẻ rõ, và copy-link / Web Share friendly.
- Nếu có ghi nhận share event, đó chỉ là auxiliary telemetry hoặc audit signal, không phải canonical business record.

### Rationale

- Share là growth loop tự nhiên và rẻ.
- Không cần đẻ thêm owner model nặng chỉ để có nút chia sẻ.

### Trade-off

- Không phải mọi share đều đo được chính xác.
- Analytics share chỉ nên dùng như supporting signal.

## Decision 8. Report lifecycle không thuộc community module; repeated reports có thể auto-hide tạm thời

### Context

Community có nhiều điểm khởi tạo report nhưng repo đã có moderation module riêng.
Đồng thời, các nội dung bị report dồn dập cần được chặn nhanh trước khi moderator xử lý tay.

### Decision

- Community chỉ khởi tạo report request.
- `moderationReports` ở moderation module mới là source of truth.
- Community entity chỉ giữ summary fields phục vụ read path như `reportCount`, `isHidden`, `moderationStatus`.
- Khi vượt risk threshold, target có thể bị `auto-hide` tạm thời trước khi moderator resolve chính thức.

### Rationale

- boundary rõ.
- Có safety valve khi cộng đồng report dồn.

### Trade-off

- Auto-hide có thể che nhầm một số nội dung hợp lệ.
- Summary phải recompute được từ `moderationReports` nếu drift.

## Decision 9. Notification được dùng cho retention loop, nhưng delivery posture vẫn phải tương thích phase gate

### Context

Community muốn kéo người dùng quay lại bằng reply alert, approval alert, và tương tác quan trọng.

### Decision

- Các event sau được coi là notification-worthy:
  - có người trả lời bình luận của mình
  - bài cộng đồng được duyệt / bị từ chối
  - guestbook entry được duyệt
  - bài cộng đồng của admin hoặc content authority mới publish vào feed phù hợp
- `Phase 1`: có thể dùng control-plane records, preference state, và best-effort dispatch nếu async delivery lane chưa active.
- `Phase 2+`: delivery request quan trọng đi qua `outbox_events` rồi mới dispatch async.

### Rationale

- Giữ retention loop ngay từ launch.
- Không ép phải bật full worker stack từ ngày đầu.

### Trade-off

- Phase 1 delivery ít chắc chắn hơn phase 2+.
- Phải viết fallback/readiness rule rõ để AI không suy diễn sai.

## Decision 10. Community tuyệt đối không được lộ progress tu tập cá nhân

### Context

Người dùng có thể chia sẻ cảm nhận tu học, nhưng progress số biến, số buổi, tiến độ nguyện là dữ liệu riêng tư.

### Decision

- Không hiển thị công khai:
  - số biến
  - số buổi
  - streak
  - milestone tu tập
  - tiến độ nguyện cá nhân
- Nếu user tự viết cảm nhận trong bài/post/guestbook thì đó là self-authored narrative text, không phải system-generated progress projection.

### Rationale

- Giữ privacy boundary đúng tinh thần dự án.
- Ngăn drift sang social-comparison product.

### Trade-off

- Mất vài mechanics giữ chân kiểu gamification.
- Cần copy/UX tốt hơn để bù retention bằng giá trị nội dung và cộng đồng.
