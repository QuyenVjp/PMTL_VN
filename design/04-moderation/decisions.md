# Moderation Module Decisions

> Ghi chú cho sinh viên:
> Hãy nhớ câu này: `moderationReports` là nguồn gốc, còn field trên comment/post chỉ là phần tóm tắt để đọc nhanh.

## Decision 1. moderationReports là source of truth duy nhất

### Context
Nhiều entity có thể bị report nhưng repo đã có collection `moderationReports`.

### Decision
- Mọi report lifecycle phải đi qua `moderationReports`.
- Không tạo report sub-table riêng trong từng module.

### Rationale
- Boundary rõ.
- Dễ thống nhất route và admin workflow.

### Trade-off
- Muốn xem full moderation state của một entity phải nhìn cả report record và summary field.

## Decision 2. Target entity chỉ giữ moderation summary

### Context
Entity bị report đang có các field như `reportCount`, `lastReportReason`, `moderationStatus`, `approvalStatus`, `isHidden`.

### Decision
- Các field này chỉ là summary/read model.
- Chúng không thay thế moderation report source record.

### Rationale
- Public/community read path nhanh hơn.
- Admin có thể lọc nhanh entity cần chú ý.

### Trade-off
- Cần sync summary sau khi tạo report hoặc ra quyết định.

## Decision 3. Decision flow áp dụng trực tiếp lên target entity

### Context
Moderator cần action rõ trên entity đích sau khi ra quyết định.

### Decision
- Với comment/community entity:
  - cập nhật `moderationStatus`
  - cập nhật `isHidden` khi cần
- Với guestbook:
  - cập nhật `approvalStatus`

### Rationale
- Khớp implementation hiện tại.
- Giữ public filtering đơn giản.

### Trade-off
- Target module phải chấp nhận một số summary field do moderation điều khiển.

## Decision 4. Reporter identity có thể là user hoặc hashed IP

### Context
Không phải report nào cũng đến từ user đã đăng nhập.

### Decision
- Report có thể lưu:
  - `reporterUser`
  - `reporterIpHash`
- Không lưu IP thô làm canonical moderation field.

### Rationale
- An toàn hơn cho dữ liệu nhạy cảm.
- Vẫn đủ phục vụ abuse investigation cơ bản.

### Trade-off
- Một số forensic case cần log/hệ thống khác nếu muốn điều tra sâu hơn.

## Decision 5. Chưa tạo moderation queue table riêng

### Context
Design cũ từng gợi ý queue/escalation table riêng.
Repo hiện tại chưa cần đến mức đó.

### Decision
- Chưa thêm `moderationQueue` hoặc `escalationQueue` riêng vào current scope.
- Queue hiển thị cho admin hiện suy ra từ report status + target summary.

### Rationale
- Giữ thiết kế triển khai được cho current repo.
- Tránh enterprise workflow thừa.

### Trade-off
- Nếu moderation volume lớn hơn, sau này có thể cần queue/escalation model rõ hơn.
