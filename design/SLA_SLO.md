# SLA_SLO (Thỏa thuận và Mục tiêu mức độ dịch vụ)

File này định nghĩa `design targets (các mục tiêu thiết kế)`, không phải bằng chứng đã đạt SLO (Mục tiêu mức độ dịch vụ).
Nếu chưa có metric (chỉ số đo lường), probe (bộ dò sức khỏe), load check (kiểm tra tải), hoặc incident evidence (bằng chứng sự cố) thì trạng thái đúng là:

- `targeted (đang đặt mục tiêu)`
- chưa được `certified (chứng nhận)`

## Cách đọc file này (Reading guide)

- phase 1 (giai đoạn 1) chỉ giữ các target (mục tiêu) thật sự cần cho first launch (ra mắt lần đầu)
- mọi con số phải đi kèm:
  - áp dụng cho flow (luồng) nào
  - đo bằng gì
  - hiện đã đo hay chưa

## Certification rule (Quy tắc chứng nhận)

- Không target (mục tiêu) nào trong file này được coi là `đã đạt` nếu chưa có ít nhất một trong các evidence (bằng chứng) sau:
  - app metric (chỉ số ứng dụng)
  - health/readiness probe (bộ dò sức khỏe/sẵn sàng) tương ứng
  - structured timing log (nhật ký thời gian có cấu trúc)
  - load test (kiểm tra tải) hoặc smoke timing record (nhật ký thời gian kiểm thử khói)

## Phase 1 targets (Các mục tiêu giai đoạn 1)

| Flow (Luồng xử lý) | Target (Mục tiêu) | Measure from (Đo lường từ) | Status today (Trạng thái) | Notes (Ghi chú) |
|---|---|---|---|---|
| public content read (đọc nội dung công khai) | p95 `< 500ms` | app timing log hoặc `/metrics` latency bucket | targeted | ưu tiên hơn dashboard (bảng điều khiển) nội bộ |
| auth login/register/profile update (đăng nhập/đăng ký/cập nhật hồ sơ) | p95 `< 800ms` | auth route timing log + `/metrics` | targeted | không tính external email delivery (gửi email ra bên ngoài) |
| upload metadata accept path (luồng chấp nhận siêu dữ liệu tải lên) | p95 `< 1000ms` | upload route timing log | targeted | chỉ cho canonical accept path (luồng chấp nhận chuẩn), không bao gồm scan (quét) dài |
| community submit (gửi bài cộng đồng) | p95 `< 800ms` | submit route timing log | targeted | canonical write (ghi dữ liệu chuẩn) phải xong nhanh |
| calendar public query (truy vấn lịch công khai) | p95 `< 500ms` | route timing log | targeted | không phụ thuộc async downstream (luồng bất đồng bộ phía dưới) |
| restore DB to clean machine (phục hồi cơ sở dữ liệu sang máy sạch) | `<= 30 phút` | restore drill log (nhật ký diễn tập phục hồi) | targeted | đây là ops SLO (mục tiêu vận hành) quan trọng hơn nhiều con số đẹp khác |

## Deferred targets (Các mục tiêu tạm hoãn)

Các target (mục tiêu) dưới đây chỉ có nghĩa khi component (thành phần) tương ứng thật sự được bật.

| Flow (Luồng xử lý) | Target (Mục tiêu) | Applies only when (Chỉ áp dụng khi) | Measure from (Đo lường từ) |
|---|---|---|---|
| search API (API tìm kiếm) | p95 `< 1200ms` | phase 1 SQL/API fallback (đường dự phòng SQL giai đoạn 1) | route timing log |
| search API (API tìm kiếm) | p95 `< 250ms` | Meilisearch đã bật | route timing log + search health |
| search freshness (độ tươi mới của tìm kiếm) | `< 10 giây` | Meilisearch + sync path (đường đồng bộ) đã bật | index sync lag metric (chỉ số trễ đồng bộ chỉ mục) |
| notification dispatch start (bắt đầu phân phát thông báo) | `< 30 giây` | queue/worker (hàng đợi/xử lý nền) đã bật | queue lag metric (chỉ số trễ hàng đợi) |
| async side-effect enqueue/handoff (đưa vào hàng đợi/bàn giao tác động phụ bất đồng bộ) | `< 2 giây` | outbox/queue đã bật | outbox lag / dispatch metric (chỉ số trễ/phân phát) |

## Error-budget stance (Quan điểm về ngân sách lỗi)

- eventual consistency (tính nhất quán sau cùng) chấp nhận được với:
  - search projection (phản chiếu tìm kiếm)
  - notification dispatch (phân phát thông báo)
  - revalidation (xác thực lại)
- eventual consistency (tính nhất quán sau cùng) không chấp nhận được với:
  - auth authority (quyền lực xác thực)
  - canonical publish state (trạng thái xuất bản chuẩn)
  - moderation source record (bản ghi nguồn kiểm duyệt)
  - self-owned practice log (nhật ký tu tập cá nhân) sau khi request đã trả thành công

## Review rule (Quy tắc rà soát)

Mỗi khi thêm target (mục tiêu) mới, phải thêm cùng lúc:

- measurement source (nguồn đo lường)
- phase (giai đoạn) áp dụng
- điều kiện để coi là certified (đã chứng nhận)

Nếu không thêm 3 ý đó, target mới chỉ là wish list (danh sách mong muốn).
