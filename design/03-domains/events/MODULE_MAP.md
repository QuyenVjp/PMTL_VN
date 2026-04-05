# Events Module (Mô-đun Sự Kiện)

> Ghi chú cho sinh viên:
> Events module quản lý sự kiện Pháp hội với zero-monetization firewall bắt buộc.
> Module này không chỉ là CRUD event — nó enforces quy tắc phi lợi nhuận tuyệt đối của Pháp Môn.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Events Module (Mô-đun Sự Kiện)

## Objectives (Mục tiêu)
- mô tả ownership của event data, monetization enforcement, và violation tracking
- giữ zero-monetization firewall như invariant tuyệt đối
- chốt rõ access logs là compliance monitoring, không phải analytics
- phối hợp với dharma-compliance cho fundraising content detection trong content chung

## Module collections (Các collection thuộc mô-đun)
- `events`
- `event_monetization_rules`
- `event_fundraising_blocks`
- `event_access_logs`
- `event_violations`

## Current responsibilities (Trách nhiệm hiện tại)

### Events Core (Sự kiện chính)
- đăng sự kiện public: teaching, ceremony, retreat, talkback, livestream, study group
- giữ thời gian, địa điểm, delivery mode (offline, online, hybrid)
- giữ thông tin organizer, speaker, cover image
- quản lý trạng thái published/unpublished
- hỗ trợ phóng sinh tập thể (mass life liberation) với state machine riêng

### Zero Monetization Enforcement (Firewall phi lợi nhuận)
- enforce price = 0 cho mọi event tại cả application và DB level
- enforce pricePerUnit = 0 cho mọi dharma good (sách Kinh, đĩa CD, giấy Ngôi Nhà Nhỏ)
- auto-sanitize price > 0 về 0 và ghi audit log
- chặn mọi hình thức thu phí: vé vào cửa, merchandise, quyền truy cập độc quyền, VIP seating

### Fundraising Blocks (Chặn quyên góp)
- chặn direct donation request trong event context
- chặn sponsorship proposal, merchandise presale, paid recording access
- chặn payment link cá nhân (PayPal, Stripe, MoMo cá nhân)
- block UI elements liên quan (nút donate, form thanh toán)

### Access Monitoring (Giám sát truy cập)
- ghi log hành vi truy cập event
- phát hiện hành vi vi phạm: cố mua vé, cố quyên góp, click fundraiser link
- đánh dấu `policy_violation_detected` khi phát hiện bất thường

### Violation Tracking (Theo dõi vi phạm)
- ghi nhận vi phạm theo event và organizer
- hỗ trợ severity: warning, suspension, removal, account_ban
- theo dõi resolution status: pending, in_progress, resolved
- giữ evidence URLs và detection source

## Những gì events service không được làm
- không thu tiền dưới bất kỳ hình thức nào — price luôn = 0
- không sở hữu bank account whitelist — thuộc dharma-compliance
- không tự ban account — phải escalate sang moderation
- không sử dụng access logs cho marketing/engagement analytics
- không sở hữu calendar scheduling hoặc lunar recurrence — thuộc calendar module

## External references (Tham chiếu ngoài mô-đun)

### Calendar
- events có thể được tham chiếu từ calendar module qua `relatedEvent`
- calendar sở hữu event scheduling nếu liên quan đến lịch âm/sự kiện định kỳ

### Dharma Compliance
- fundraising content detection trong forum/chat chung thuộc dharma-compliance
- events chỉ xử lý fundraising trong event creation/update context
- cả hai module đồng bộ buzzword list

### Life Liberation
- mass life liberation events sử dụng state machine: PLANNING → EN_ROUTE → AT_LOCATION → RELEASING → COMPLETE
- events sở hữu event record, life-liberation sở hữu release details

### Moderation
- events escalate violation sang moderation khi cần hành động tài khoản
- moderation thực hiện mute, ban, role downgrade

## Current rules (Quy tắc hiện tại)
- price = 0 là bất biến tuyệt đối, enforced tại cả application và DB level
- mọi tài liệu Pháp (sách, đĩa CD, giấy Ngôi Nhà Nhỏ) phải phát tặng miễn phí
- volunteer không được đứng ra thu tiền hoặc kêu gọi quyên góp cá nhân
- vi phạm 3+ lần → escalate hạ quyền VOLUNTEER → MEMBER
- access logs chỉ phục vụ compliance monitoring
- violation severity escalation: warning → suspension → removal → account_ban
