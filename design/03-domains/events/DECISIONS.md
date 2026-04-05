# Events Module Decisions

> Ghi chú cho sinh viên:
> Module này quản lý sự kiện Pháp hội với firewall zero-monetization.
> Điểm khó là phân biệt `event_monetization_rules` (quy tắc cấm kiếm tiền) với `event_fundraising_blocks` (chặn quyên góp cụ thể).
> Một cái là policy layer, một cái là enforcement layer.

## Decision 1. Events module sở hữu zero-monetization enforcement, không phải dharma-compliance

### Context

Pháp Môn hoạt động hoàn toàn miễn phí. Mọi sự kiện, tài liệu, thực phẩm tại Pháp hội phải phát tặng miễn phí. Cần module rõ ràng sở hữu enforcement logic này.

### Decision

- `events` sở hữu `event_monetization_rules` và `event_fundraising_blocks`.
- events module chặn mọi event có price > 0 tại write path.
- dharma-compliance chỉ xử lý charity whitelist và bank account detection trong content.

### Rationale

- Event pricing enforcement gắn chặt với event lifecycle.
- Tách riêng "cấm thu tiền event" (events) khỏi "cấm quyên góp cá nhân" (dharma-compliance).

### Trade-off

- Một số vi phạm chồng chéo (volunteer post fundraising link trong event description) cần phối hợp cả hai module.

## Decision 2. Monetization rules là DB-level constraint, không chỉ application validation

### Context

Price = 0 là bất biến tuyệt đối của hệ thống. Application-level validation có thể bị bypass.

### Decision

- `events.price` có DB-level CHECK constraint: `price = 0`.
- `dharmaGoods.pricePerUnit` cũng có CHECK constraint tương tự.
- Nếu input có price > 0, application auto-sanitize về 0 và ghi audit log.

### Rationale

- DB constraint là lớp bảo vệ cuối cùng.
- Auto-sanitize thay vì reject giúp admin không bị block khi nhập nhầm.

### Trade-off

- Cần migration rõ ràng để thêm CHECK constraint.
- Auto-sanitize có thể gây nhầm lẫn nếu admin thật sự muốn giá > 0 (nhưng điều này không bao giờ hợp lệ).

## Decision 3. Violation tracking là event-scoped, không phải global moderation

### Context

Vi phạm monetization (cố gắng kiếm tiền, quyên góp không phép, mô tả sai lệch) cần được ghi nhận và xử lý.

### Decision

- `event_violations` ghi nhận vi phạm theo event và organizer.
- Severity: warning → suspension → removal → account_ban.
- events module sở hữu toàn bộ violation lifecycle cho event-specific issues.

### Rationale

- Vi phạm event gắn chặt với event context.
- Escalation path rõ ràng từ warning đến ban.

### Trade-off

- Repeated offender tracking cần aggregation qua nhiều event violations.

## Decision 4. Access logs phục vụ compliance monitoring, không phải analytics

### Context

`event_access_logs` ghi lại hành vi truy cập event, đặc biệt là hành vi vi phạm (cố mua vé, click fundraiser link).

### Decision

- Access logs thuộc sở hữu events module.
- Mục đích chính: phát hiện policy_violation.
- Không sử dụng cho marketing analytics hoặc engagement tracking.

### Rationale

- Tách biệt compliance monitoring khỏi analytics.
- Access logs có thể chứa thông tin nhạy cảm (IP, user agent) cần bảo mật.

### Trade-off

- Nếu cần analytics sau này, phải tạo projection riêng, không dùng compliance logs.

## Decision 5. Volunteer fundraising content scan thuộc events cho event context, dharma-compliance cho general content

### Context

Volunteer có thể post fundraising content trong event description hoặc trong forum/chat chung.

### Decision

- Nếu fundraising content trong event creation/update → events module chặn.
- Nếu fundraising content trong bài viết/bình luận/chat chung → dharma-compliance chặn.
- Cả hai module đều ghi audit log và escalate tái phạm.

### Rationale

- Boundary rõ ràng dựa trên context phát sinh vi phạm.
- Tránh duplicate enforcement.

### Trade-off

- Cần đồng bộ buzzword list giữa hai module.
