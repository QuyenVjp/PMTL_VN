# Moderation Module (Mô-đun Kiểm duyệt)

> Ghi chú cho sinh viên:
> Moderation không chỉ là nút "ẩn bài". Nó phải giữ source record (bản ghi nguồn) riêng để sau này biết ai báo cáo, ai xử lý, xử lý vì lý do gì.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Moderation Module (Mô-đun Kiểm duyệt)

## Objectives (Mục tiêu)
- gom toàn bộ report lifecycle (vòng đời báo cáo) vào một owner module rõ ràng
- giữ decision flow (luồng ra quyết định) của moderator/admin
- đồng bộ summary về target entity mà không làm mất canonical report history

## Module collections (Các collection thuộc mô-đun)
- `moderationReports`: source of truth cho báo cáo vi phạm và quyết định xử lý

## Supported target entities (Các thực thể đích được hỗ trợ)
- `postComments`
- `communityPosts`
- `communityComments`
- `guestbookEntries`

## Current responsibilities (Trách nhiệm hiện tại)

### Report intake (Tiếp nhận báo cáo)
- nhận reason/category
- lưu reporter identity ở dạng user hoặc IP hash
- link report vào target type và `publicId`

### Moderation decision (Ra quyết định kiểm duyệt)
- điều phối admin review workflow
- cập nhật report status như `pending`, `resolved`, `ignored`
- áp resolution effect lên target entity nếu cần
- hỗ trợ re-resolution (xử lý lại) với audit trail bắt buộc
- giữ super-admin protection (vùng bảo vệ của cấp quản trị cao)

### Summary synchronization (Đồng bộ tóm tắt)
- cập nhật `reportCount`, `lastReportReason`
- cập nhật `moderationStatus`, `approvalStatus`, `isHidden`

### Administrative notifications (Thông báo quản trị)
- báo admin/super-admin khi có report nghiêm trọng
- báo user bị ảnh hưởng khi có quyết định cuối
- signal quan trọng đi qua `outbox_events`

## Boundaries & external references (Ranh giới và tham chiếu ngoài)

### Relationships (Quan hệ)
- **Moderation owns (Moderation sở hữu)**:
  - `moderationReports`
  - report state transition logic (logic chuyển trạng thái)
  - resolution audit trail (dấu vết kiểm toán cho quyết định)
- **Moderation does NOT own (Moderation không sở hữu)**:
  - nội dung gốc của target entity
  - user authority
  - push/email delivery infra

## Current rules (Quy tắc hiện tại)
- `moderationReports` là nguồn chuẩn gốc duy nhất
- summary field trên target chỉ là read model
- re-resolve không được xóa lịch sử cũ
- canonical write phải chạy trước; alert/notification đi async phía sau
- summary trên target phải rebuild được từ source report khi cần recovery

## Summary drift prevention (Ngăn ngừa lệch tóm tắt)

Summary fields (`reportCount`, `isHidden`, `moderationStatus`) trên target entity có thể drift khỏi `moderationReports` source of truth theo thời gian.

### Recovery là recompute, không phải patch tay

Khi drift được phát hiện:
1. **Không được** sửa tay summary field trực tiếp
2. **Recovery path chuẩn**: chạy recompute function từ `moderationReports`

```sql
-- recompute summary cho 1 target entity
SELECT
  COUNT(*)                                          AS report_count,
  MAX(created_at)                                   AS last_report_at,
  (SELECT reason FROM moderation_reports
   WHERE target_public_id = :id ORDER BY created_at DESC LIMIT 1) AS last_report_reason,
  MAX(status) FILTER (WHERE status = 'hidden')      AS moderation_status,
  EXISTS(SELECT 1 FROM moderation_reports
         WHERE target_public_id = :id AND status = 'hidden') AS is_hidden
FROM moderation_reports
WHERE target_public_id = :id AND target_type = :type;
```

### Khi nào trigger recompute

| Trigger | Cách thực hiện |
|---|---|
| Admin yêu cầu thủ công | `POST /api/admin/moderation/recompute-summary` (admin+ only) |
| Sau mỗi migration có liên quan tới report tables | Chạy recompute batch trong migration script |
| Sau restore drill | Bước bắt buộc trong `ops/backup-restore.md` |
| Scheduled maintenance | Cron hàng tuần hoặc on-demand — **không phải real-time job** |

> **Quy tắc**: recompute không phải real-time background job. Nó là on-demand recovery tool.
> Real-time sync vẫn là: moderation module update summary sau mỗi report resolution.

### Admin API cho recompute

```
POST /api/admin/moderation/recompute-summary
Body: { targetPublicId: string, targetType: string }
  hoặc
Body: { all: true }  -- recompute toàn bộ (cần super-admin)

Response: { recomputed: number, driftedFixed: number }
```

Audit event bắt buộc: `moderation.summary.recomputed` với actor + scope.
