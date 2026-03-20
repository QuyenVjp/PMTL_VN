# PMTL_VN Design

Thư mục này chốt architecture (kiến trúc), boundary (ranh giới trách nhiệm), ownership (quyền sở hữu dữ liệu), và launch guardrails (rào chắn bảo vệ khi ra mắt) cho PMTL_VN.
Nó không phải bằng chứng rằng runtime (môi trường thực thi) đã tồn tại.

## Current truth (Thực trạng hiện tại)

- Đây là `target design (thiết kế mục tiêu)` cho hướng `rebuild backend (xây dựng lại hệ thống phía sau)` với NestJS.
- Không file nào trong `design/` được coi là `implemented (đã triển khai)` nếu chưa có:
  - code reference (tham chiếu mã nguồn)
  - route/module/service (đường dẫn/mô-đun/lớp xử lý nghiệp vụ) tương ứng
  - schema/migration (lược đồ/di cư dữ liệu) tương ứng
  - runtime artifact (sản phẩm thực thi) tương ứng
- File khóa sổ chuyện này là [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/IMPLEMENTATION_MAPPING.md).

## First-launch scope (Phạm vi ra mắt lần đầu)

### In scope (Nằm trong phạm vi)

- `apps/web`
- `apps/api`
- `apps/admin`
- `Postgres`
- `Caddy`
- local storage abstraction (lớp trừu tượng lưu trữ nội bộ)
- auth/session hardening (thắt chặt bảo mật phiên đăng nhập)
- upload hardening (thắt chặt bảo mật tải tập tin)
- audit logs (nhật ký kiểm tra)
- feature flags (cờ tính năng)
- backup + restore discipline (kỷ luật sao lưu và phục hồi)

### Explicitly deferred (Tạm hoãn rõ ràng)

- `Valkey`
- `BullMQ`
- `apps/worker` (tiến trình xử lý nền)
- `outbox_events` (sự kiện chờ phát đi)
- `Meilisearch`
- `PgBouncer`
- Prometheus/Grafana/Alertmanager (bộ công cụ giám sát và cảnh báo)
- tracing (truy vết thực thi)
- `pgvector`

### Forbidden for now (Bị cấm ở hiện tại)

- bật queue (hàng đợi) trước khi có idempotency (tính lặp lại không đổi kết quả) + retry policy (chính sách thử lại)
- bật Meilisearch trước khi search SQL (tìm kiếm bằng cơ sở dữ liệu) đo được là đau (chậm)
- public upload (tải lên công khai) trước khi chốt MIME sniffing (kiểm tra loại tập tin) + delete authorization (ủy quyền xóa)
- tự host stack observability (hệ thống giám sát) nặng khi chưa từng restore DB (phục hồi cơ sở dữ liệu) thành công
- gọi là production-safe (an toàn vận hành) nếu chưa có restore drill pass (buổi diễn tập phục hồi thành công)

## Repo quickstart (Khởi động nhanh kho mã nguồn)

### Prerequisites (Điều kiện tiên quyết)

- `Node.js` LTS
- `pnpm`
- Docker / Docker Compose khi cần chạy local services (dịch vụ nội bộ)

### Commands (Các lệnh)

- install (cài đặt): `pnpm install`
- dev (phát triển): `pnpm dev`
- test (kiểm thử): `pnpm test`
- lint (kiểm tra lỗi trình bày): `pnpm lint`
- typecheck (kiểm tra kiểu): `pnpm typecheck`
- build (xây dựng bản chạy): `pnpm build`

### Runtime entrypoints (Các điểm đầu vào thực thi)

- `apps/web`: public frontend (giao diện công khai)
- `apps/api`: backend chính (hệ thống xử lý chính)
- `apps/admin`: admin UI riêng (giao diện quản trị)
- `infra`: deploy/proxy/ops scripts (kịch bản triển khai và vận hành)
- `design`: target architecture (kiến trúc mục tiêu) + contracts (hợp đồng nghiệp vụ) + launch gates (cổng kiểm soát ra mắt)

## Launch gate (Cổng kiểm soát ra mắt)

- [ ] auth/session policy finalized (chốt xong chính sách phiên đăng nhập)
- [ ] upload/media policy finalized (chốt xong chính sách truyền thông/tải lên)
- [ ] restore drill passed (diễn tập phục hồi đã vượt qua)
- [ ] `audit_logs` implemented (đã triển khai nhật ký kiểm tra)
- [ ] `feature_flags` implemented (đã triển khai cờ tính năng)
- [ ] first incident runbook written (đã viết xong tài liệu xử lý sự cố đầu tiên)
- [ ] first risky write-path reviewed end-to-end (đã rà soát xong luồng ghi dữ liệu rủi ro đầu tiên từ đầu đến cuối)

## Read in order (Thứ tự đọc)

1. [ARCHITECTURE_GOVERNANCE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ARCHITECTURE_GOVERNANCE.md)
2. [CORE_DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/CORE_DECISIONS.md)
3. [00-overview/domain-map.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-overview/domain-map.md)
4. [00-overview/execution-map.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-overview/execution-map.md)
5. [infra/INFRA.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/infra/INFRA.md)
6. [NEST_APPLICATION_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/NEST_APPLICATION_BASELINE.md)
7. [SECURITY_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SECURITY_BASELINE.md)
8. [BACKUP_RESTORE_RUNBOOK.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/BACKUP_RESTORE_RUNBOOK.md)
9. [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/IMPLEMENTATION_MAPPING.md)
10. [RESTORE_DRILL_LOG.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/RESTORE_DRILL_LOG.md)

## Where each rule lives (Quy tắc nằm ở đâu)

- Cross-cutting baseline (Nền tảng cắt ngang): [ARCHITECTURE_GOVERNANCE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ARCHITECTURE_GOVERNANCE.md)
- Infra phase rules (Quy tắc phân pha hạ tầng): [infra/INFRA.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/infra/INFRA.md)
- NestJS app contract (Hợp đồng ứng dụng NestJS): [NEST_APPLICATION_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/NEST_APPLICATION_BASELINE.md)
- Security contract (Hợp đồng bảo mật): [SECURITY_BASELINE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SECURITY_BASELINE.md)
- Failure behavior (Hành vi khi lỗi): [FAILURE_MODE_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/FAILURE_MODE_MATRIX.md)
- SLO targets and how to measure them (Mục tiêu chất lượng dịch vụ và cách đo): [SLA_SLO.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SLA_SLO.md)
- Recovery procedure (Quy trình phục hồi): [BACKUP_RESTORE_RUNBOOK.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/BACKUP_RESTORE_RUNBOOK.md)
- Runtime mapping status (Trạng thái ánh xạ thực thi): [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/IMPLEMENTATION_MAPPING.md)

## Module reading rule (Quy tắc đọc theo mô-đun)

- Chọn đúng owner module (mô-đun sở hữu) trước.
- Đọc `module-map.md` (bản đồ mô-đun).
- Đọc `contracts.md` (hợp đồng nghiệp vụ).
- Đọc use-case (kịch bản sử dụng) tương ứng.
- Với flow (luồng) nguy hiểm, đọc thêm:
  - [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-identity/use-cases/manage-auth-session.md)
  - [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-content/use-cases/upload-media-asset.md)

## First implementation wave (Làn sóng triển khai đầu tiên)

Nếu đang rebuild (xây dựng lại) từ đầu một mình, mặc định chỉ ưu tiên 4 cụm trước:

1. `00-identity`
2. `01-content`
3. upload/media boundary (ranh giới tải lên/truyền thông)
4. `02-community`

Các module còn lại tồn tại như target design (thiết kế mục tiêu), không phải lý do để code song song hết ngay.

## Status semantics (Ý nghĩa trạng thái)

- `implemented`: đã có code/runtime artifact (sản phẩm thực thi) thật
- `required before launch`: launch blocker (vật cản ngăn chặn ra mắt)
- `planned`: hướng đã chốt, chưa bật
- `forbidden for now`: bị cấm ở hiện tại

## Anti-junior traps (Chặn các "cái bẫy" của người mới)

- Không thêm service (lớp nghiệp vụ) chỉ vì sơ đồ trông enterprise (doanh nghiệp) hơn.
- Không để docs dài tạo ảo giác runtime (môi trường thực thi) đã tồn tại.
- Không dùng `design/` để suy ra implementation (triển khai) nếu chưa qua [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/IMPLEMENTATION_MAPPING.md).
- Không coi validation (kiểm tra đầu vào) là thay thế security architecture (kiến trúc bảo mật).
- Không coi backup (sao lưu) có cron (tự động theo giờ) là đủ nếu chưa restore pass (phục hồi thành công).

## Learning guide (Hướng dẫn học tập)

Roadmap (lộ trình) học VPS/production cho người mới đã được tách khỏi `design/` và đặt ở:

- [docs/learning/STUDENT_VPS_PRODUCTION_ROADMAP.md](C:/Users/ADMIN/DEV2/PMTL_VN/docs/learning/STUDENT_VPS_PRODUCTION_ROADMAP.md)

