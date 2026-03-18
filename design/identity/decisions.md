# Identity Module Decisions

## Decision 1. Payload auth là auth authority duy nhất

### Context
Repo hiện tại đã dùng Payload auth trong `users` collection.
Design cần dừng việc ám chỉ có auth layer thứ hai.

### Decision
- Đăng ký, đăng nhập, đăng xuất, reset password, session đều đi qua Payload auth.
- Web không sở hữu auth database hay session authority riêng.

### Rationale
- Khớp implementation.
- Giữ auth boundary đơn giản và reviewable.

### Trade-off
- Auth phụ thuộc vào availability của CMS runtime.
- Muốn thêm social login trong tương lai phải có decision riêng.

## Decision 2. Một users collection giữ cả account và profile cơ bản

### Context
Repo hiện chỉ có `users` làm owner cho account + profile nhẹ.

### Decision
- Giữ account data và profile cơ bản trong `users`.
- Không tạo thêm `profiles` table/module riêng ở current scope.

### Rationale
- Đủ cho nhu cầu hiện tại.
- Giảm join và drift contract giữa auth data với profile data.

### Trade-off
- Nếu public profile sau này phức tạp hơn, có thể cần sub-model hoặc module riêng.

## Decision 3. Role model cố định, explicit, và nằm trên user

### Context
Role hiện được dùng xuyên suốt web, cms, moderation, và notification targeting.

### Decision
- Role set hiện tại là:
  - `super-admin`
  - `admin`
  - `editor`
  - `moderator`
  - `member`
- `role` là explicit field trên user document.
- `isBlocked` là explicit field để khóa account.

### Rationale
- Rõ ràng cho access control.
- Dễ map vào JWT/session claims.

### Trade-off
- Khi số vai trò tăng, field-based role model có thể cần thêm permission matrix riêng.
- Current scope chưa cần permission matrix phức tạp.

## Decision 4. publicId chỉ dùng cho public-facing identity references

### Context
Repo hiện dùng `publicId` ở nhiều public contract để tránh expose raw internal ids.

### Decision
- `users.publicId` tồn tại để phục vụ public-facing references khi cần.
- Internal system relations vẫn có thể dùng internal document id ở service layer.

### Rationale
- Đồng bộ với public contract style toàn repo.
- Tách internal persistence id khỏi public API identity.

### Trade-off
- Cần giữ mapper rõ giữa internal id và public id.

## Decision 5. Không đưa social login hoặc auth layer thứ hai vào current design

### Context
Task hiện yêu cầu current design phải bám repo truth và không thêm auth abstraction mới.

### Decision
- Current design không mô tả OAuth providers.
- Current design không thêm auth framework thứ hai cho session hoặc đăng nhập.
- Nếu code còn field compatibility liên quan social auth, coi đó là system residue, không phải current contract.

### Rationale
- Tránh AI generate flow ngoài current scope.
- Giảm mâu thuẫn giữa design và implementation thực tế đang vận hành.

### Trade-off
- Tài liệu này không chuẩn bị sẵn cho social login expansion.
- Khi có nhu cầu thật, phải bổ sung decision và flows riêng.
