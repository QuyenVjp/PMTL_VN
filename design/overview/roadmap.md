# PMTL_VN Design Roadmap (Lộ trình thiết kế PMTL_VN)

> Ghi chú cho sinh viên:
> Đây là roadmap (lộ trình) để biến `design/` thành bộ tài liệu đủ chặt cho một lần rebuild bằng `NestJS + custom admin`, không phải tài liệu kể lại runtime cũ.

## Objectives (Mục tiêu)
- giữ `design/` khớp với target architecture (kiến trúc mục tiêu) hiện tại
- xác định thứ tự ưu tiên khi chuyển từ design sang implementation
- tránh over-scope (ôm quá rộng) bằng cách khóa rõ phase 1 và phase sau

---

## Phase 1. Foundation first (Nền tảng trước)

### Focus (Trọng tâm)
- chốt stack thật:
  - `apps/web`
  - `apps/api`
  - `apps/admin`
  - `Postgres`
  - `Caddy`
  - local storage abstraction
- chốt auth, security baseline, audit, backup/restore, launch gate
- chốt 2 write-path nguy hiểm:
  - auth/session
  - upload/media

### Exit criteria (Tiêu chí hoàn thành)
- root docs không còn mâu thuẫn nhau
- implementation mapping rõ ràng
- launch blockers (điểm chặn ra mắt) được ghi rõ

---

## Phase 2. Core module contracts (Hợp đồng mô-đun cốt lõi)

### Focus (Trọng tâm)
- `00-identity`
- `01-content`
- `02-community`
- `03-engagement`
- `04-moderation`

### Exit criteria (Tiêu chí hoàn thành)
- mỗi mô-đun có:
  - module map
  - decisions
  - contracts
  - schema
  - use-cases quan trọng
- owner module và data boundary không còn nhập nhằng

---

## Phase 3. Search, calendar, notification (Tìm kiếm, lịch, thông báo)

### Focus (Trọng tâm)
- `05-search`
- `06-calendar`
- `07-notification`

### Exit criteria (Tiêu chí hoàn thành)
- search có phase rule rõ giữa `SQL/API fallback` và engine riêng
- calendar giữ đúng vai trò owner của event/lunar data
- notification giữ đúng vai trò async control-plane

---

## Phase 4. Extended practice modules (Các mô-đun tu học mở rộng)

### Focus (Trọng tâm)
- `08-vows-merit`
- `09-wisdom-qa`

### Exit criteria (Tiêu chí hoàn thành)
- flow học tập, phát nguyện, công đức, offline bundle được mô tả rõ
- các side-effect quan trọng đều có replay/recompute path

---

## Phase 5. Implementation handoff (Bàn giao sang triển khai)

### Focus (Trọng tâm)
- link decision -> module -> route -> schema -> migration -> service
- giữ `design != runtime` cho tới khi code thật tồn tại
- dùng implementation mapping để chống ảo giác hoàn thành

### Exit criteria (Tiêu chí hoàn thành)
- AI/dev có thể code theo design mà không tự đoán các boundary nguy hiểm
- launch gate và restore drill evidence có chỗ ghi nhận rõ

---

## Anti-goals (Những thứ không làm trong roadmap này)
- không dùng roadmap này để hợp thức hóa stack cũ
- không mở thêm module mới nếu chưa có owner và use case rõ
- không bật optional infra chỉ vì “trông chuyên nghiệp”

---

## Success checklist (Danh mục kiểm tra thành công)
- [x] Root docs đã được rút gọn và chuẩn hóa lại
- [x] Phase 1 baseline đã chốt theo hướng solo-dev
- [x] NestJS rebuild đã trở thành target truth của `design/`
- [x] Các mô-đun chính đều có tài liệu tối thiểu
- [ ] Implementation artifacts thật sẽ được nối vào mapping khi code bắt đầu xuất hiện
- [ ] Restore drill evidence thật sẽ được ghi khi vận hành có chạy thử
