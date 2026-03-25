# Community Module Decisions

> Ghi chú cho sinh viên:
> Hãy để ý Decision 5, vì đó là chỗ nhiều người mới rất dễ thiết kế sai boundary (ranh giới trách nhiệm).

## Decision 1. Tách discussion surfaces theo context thay vì gom chung một collection

### Context

Repo hiện có `postComments`, `communityPosts`, `communityComments`, `guestbookEntries`.

### Decision

- Giữ `postComments` riêng cho editorial content discussion.
- Giữ `communityPosts` và `communityComments` cho forum-like community content.
- Giữ `guestbookEntries` là flow public nhẹ hơn.

### Rationale

- Khớp implementation hiện tại.
- Mỗi surface có moderation và public DTO khác nhau.
- Tránh generic UGC table khó validate và khó map UI.

### Trade-off

- Có nhiều collection hơn.
- Report/moderation phải xử lý nhiều target type.

## Decision 2. Threading dùng self-reference nhưng UI hiện tại nên giữ nông

### Context

`communityComments` và `postComments` đều có `parent` relation.

### Decision

- Data model cho phép comment tham chiếu parent comment.
- Current UI/contract (hợp đồng dữ liệu/nghiệp vụ) nên ưu tiên depth nông và predictable rendering.

### Rationale

- Khớp schema (lược đồ dữ liệu) hiện có.
- Tránh over-engineer tree algorithm quá sớm.

### Trade-off

- Nếu sau này muốn nested thread sâu, UI/service (lớp xử lý nghiệp vụ) phải bổ sung quy tắc paging/flatten rõ hơn.

## Decision 3. Author snapshot được lưu trên entity community

### Context

User name hoặc profile có thể thay đổi theo thời gian.
Public DTO cần ổn định kể cả khi relation load tối thiểu.

### Decision

- Community entities giữ cả relation tới user và snapshot tên hiển thị.

### Rationale

- Giúp public DTO ổn định.
- Giảm phụ thuộc read path vào relation depth.

### Trade-off

- Snapshot có thể không phản ánh tên mới nhất của user.
- Cần chấp nhận đây là denormalized display field.

## Decision 4. UGC moderation mặc định đi theo pending-first

### Context

Community content và comment đều có `moderationStatus`.
Guestbook dùng `approvalStatus`.

### Decision

- Bài cộng đồng và comment mới mặc định vào trạng thái pending.
- Guestbook entry cũng mặc định pending nhưng giữ workflow nhẹ hơn.

### Rationale

- Khớp current fields và moderation logic.
- Hỗ trợ an toàn nội dung từ đầu mà không cần workflow enterprise phức tạp.

### Trade-off

- Public appearance có thể chậm hơn submit time.
- Moderator/admin cần xử lý queue (hàng đợi xử lý) đều đặn.

## Decision 5. Report lifecycle không thuộc community module

### Context

Community có nhiều điểm bắt đầu report nhưng repo đã có moderation module riêng.

### Decision

- Community chỉ khởi tạo report request.
- `moderationReports` ở moderation module mới là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).
- Community entity chỉ giữ summary fields phục vụ read path.

### Rationale

- boundary (ranh giới trách nhiệm) rõ.
- Dễ tái dùng cùng một moderation flow cho post comments, community content, guestbook.

### Trade-off

- Cần sync summary ngược về community entity.
- Debugging phải nhìn cả community record lẫn moderation record.

## Decision 6. Async alert quan trọng đi qua outbox thay vì fire-and-forget

### Context

Community submit thường kéo theo moderation attention, admin notification hoặc downstream review signal.

### Decision

- Canonical submit phải commit vào community owner collection trước.
- Alert/notification/review signal quan trọng đi qua `outbox_events`.
- Consumer downstream phải idempotent và replay được.

### Rationale

- Tránh mất alert khi canonical record đã ghi thành công.
- Hợp với baseline reliability chung của hệ thống.

### Trade-off

- Tăng thêm lớp dispatcher/outbox cần quan sát.
