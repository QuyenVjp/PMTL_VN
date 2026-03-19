# Moderation Module Decisions

> Ghi chú cho sinh viên:
> Hãy nhớ câu này: `moderationReports` là nguồn gốc, còn field trên comment/post chỉ là phần tóm tắt để đọc nhanh.

## Decision 1. moderationReports là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất

### Context
Nhiều entity có thể bị report nhưng repo đã có collection `moderationReports`.

### Decision
- Mọi report lifecycle phải đi qua `moderationReports`.
- Không tạo report sub-table riêng trong từng module.

### Rationale
- boundary (ranh giới trách nhiệm) rõ.
- Dễ thống nhất route và admin workflow.

### Trade-off
- Muốn xem full moderation state của một entity phải nhìn cả report record và summary field.

## Decision 2. Target entity chỉ giữ moderation summary

### Context
Entity bị report đang có các field như `reportCount`, `lastReportReason`, `moderationStatus`, `approvalStatus`, `isHidden`.

### Decision
- Các field này chỉ là summary/read model (mô hình dữ liệu đọc).
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

## Decision 5. Chưa tạo moderation queue (hàng đợi xử lý) table riêng

### Context
Design cũ từng gợi ý queue (hàng đợi xử lý)/escalation table riêng.
Repo hiện tại chưa cần đến mức đó.

### Decision
- Chưa thêm `moderationQueue` hoặc `escalationQueue` riêng vào current scope.
- queue (hàng đợi xử lý) hiển thị cho admin hiện suy ra từ report status + target summary.

### Rationale
- Giữ thiết kế triển khai được cho current repo.
- Tránh enterprise workflow thừa.

### Trade-off
- Nếu moderation volume lớn hơn, sau này có thể cần queue (hàng đợi xử lý)/escalation model rõ hơn.

## Decision 6. Moderation signal quan trọng đi qua outbox và summary phải recompute được

### Context
Report mới, decision resolve, notify affected user, và admin attention đều là downstream side effect quan trọng.

### Decision
- Canonical report write hoặc decision update phải commit vào `moderationReports` trước.
- Alert/notify signal quan trọng đi qua `outbox_events`.
- Summary trên target entity phải recompute được từ `moderationReports` nếu bị lệch.

### Rationale
- Giữ moderation cùng ngôn ngữ reliability với search, community, notification.
- Dễ recovery khi summary hoặc notify downstream bị mất.

### Trade-off
- Tăng thêm outbox lag và summary recompute path cần quan sát.

