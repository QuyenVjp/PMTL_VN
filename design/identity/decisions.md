# Identity Module Decisions

> Ghi chú cho sinh viên:
> Nếu bạn chỉ muốn hiểu nhanh auth của repo, hãy đọc Decision 1 và Decision 3 trước.

## Decision 1. Payload auth là auth authority duy nhất

### Context
Repo hiện tại đã dùng Payload auth trong `users` collection.
Design cần dừng việc ám chỉ có auth layer thứ hai.

### Decision
- Đăng ký, đăng nhập, đăng xuất, reset password, session đều đi qua Payload auth.
- Web không sở hữu auth database hay session authority riêng.
- Google login được phép tồn tại như provider flow, nhưng phải đi vào cùng `users` collection và cùng session authority.

### Rationale
- Khớp implementation.
- Giữ auth boundary đơn giản và reviewable.
- Tránh việc AI tách Google login thành một hệ auth riêng.

### Trade-off
- Auth phụ thuộc vào availability của CMS runtime.
- Provider login cần callback mapping rõ để tránh duplicate account.

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
Repo cần role đủ rõ để quản trị nhưng không nên phình ra quá nhiều tầng gây rối cho solo/community project.

### Decision
- Role set chuẩn trong design là:
  - `super-admin`
  - `admin`
    - business/UI label: `Phụng sự viên`
  - `member`
- `role` là explicit field trên user document.
- `isBlocked` là explicit field để khóa account.

### Rationale
- Phù hợp mục tiêu hiện tại của dự án.
- Giữ access control đơn giản hơn và dễ đồng bộ design hơn.

### Trade-off
- Một role `admin` phải ôm cả biên tập, kiểm duyệt, vận hành trong current scope.
- Nếu sau này team thật sự lớn hơn, có thể cần permission matrix chi tiết hơn, nhưng chưa cần tách thành role mới lúc này.

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

## Decision 5. Provider login được phép, nhưng không tạo auth authority thứ hai

### Context
Codebase hiện có Google callback route và field compatibility cho provider mapping.

### Decision
- Current design mô tả rõ Google login như một provider flow hợp lệ.
- Current design không thêm auth framework thứ hai cho session hoặc đăng nhập.
- Provider identity chỉ là input để resolve hoặc create `users` record trong authority hiện tại.

### Rationale
- Khớp repo truth.
- Tránh tài liệu nói sai rằng repo "không OAuth" trong khi implementation đã có.

### Trade-off
- Cần ghi rõ policy merge account theo email/provider id để tránh hiểu nhầm.
