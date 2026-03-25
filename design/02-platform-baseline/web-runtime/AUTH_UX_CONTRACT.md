# AUTH_UX_CONTRACT

File này chốt auth UX của `apps/web`.
Nó trả lời:

- guest vào member route thì đi đâu
- user đã login vào auth pages thì đi đâu
- success/failure states của auth flows là gì
- session hết hạn thì UX phải ra sao

> Route canon: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> Flows: `design/04-execution-overlay/web/USER_FLOWS.md`
> Navigation: `design/02-platform-baseline/web-runtime/NAVIGATION_ARCHITECTURE.md`
> API authority: `docs/api/contracts.md`

---

## Baseline

- `apps/api` là auth authority duy nhất.
- `apps/web` chỉ render auth UX, transport, proxy, và guard behavior.
- Auth pages:
  - `/dang-nhap`
  - `/dang-ky`
  - `/xac-nhan-email`
  - `/quen-mat-khau`
  - `/dat-lai-mat-khau`
- Member pages:
  - `/dashboard`
  - `/tu-tap/*`
  - `/phat-nguyen*`
  - `/lich-ca-nhan`
  - `/thong-bao`
  - `/tai-khoan`
  - `/luu-trang`

---

## Redirect canon

### Guest vào member route

- Redirect tới:

```text
/dang-nhap?next=<requestedPath>
```

Ví dụ:

```text
/dashboard -> /dang-nhap?next=/dashboard
/tu-tap/bai-tap -> /dang-nhap?next=/tu-tap/bai-tap
```

Rules:
- giữ `next` chỉ cho internal same-origin path
- không nhận external redirect target
- không redirect vòng lặp

### User đã đăng nhập vào auth pages

- `/dang-nhap` -> `/dashboard`
- `/dang-ky` -> `/dashboard`
- `/quen-mat-khau` -> `/dashboard`
- `/dat-lai-mat-khau` -> `/dashboard` nếu đã có session hợp lệ

### Register success

- Không redirect về `/dang-nhap`
- Flow chuẩn:
  - submit register thành công
  - vào screen/step xác nhận email
  - verify xong -> `/dashboard`

### Email verify success

- Redirect về `/dashboard`
- Dashboard first-login state phải hiện onboarding nhẹ

### Logout success

- Redirect về `/`
- Nếu cần xóa sạch client-side state, ưu tiên full reload semantics
- Sau logout, browser `back` khong duoc lam lo state nhay cam tu member surfaces; restore lane phai re-check session authority truoc khi render lai data nhay cam.

---

## Flow contracts

### `/dang-nhap`

Primary goal:
- vào lại app nhanh, không làm user lạc

Success:
- nếu có `next` hợp lệ -> redirect về `next`
- nếu không -> `/dashboard`

Failure:
- sai email/password -> inline error rõ ràng, không lộ enumeration semantics
- rate-limited -> inline warning + retry guidance
- unverified email -> CTA gửi lại email xác nhận

### `/dang-ky`

Primary goal:
- tạo tài khoản với friction thấp

Success:
- show verify-email state
- không auto thả user về homepage

Failure:
- email đã tồn tại -> inline error + CTA sang `/dang-nhap`
- validation fail -> inline errors

### `/xac-nhan-email`

States:
- verifying
- success -> redirect `/dashboard`
- token expired -> CTA `Gửi lại email xác nhận`
- token invalid -> state rõ + CTA quay về auth flow

### `/quen-mat-khau`

Success:
- luôn dùng anti-enumeration copy
- hiện message kiểu "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn"

Failure:
- rate-limited
- validation fail

### `/dat-lai-mat-khau`

Success:
- đổi mật khẩu xong -> `/dang-nhap` hoặc auto-login là decision product chưa khóa
- baseline hiện tại: ưu tiên `/dang-nhap` + success state

Failure:
- token expired
- token invalid
- password policy fail

---

## Session-expired UX

### Member route fetch 401/expired

- Nếu ở route-level auth guard:
  - redirect về `/dang-nhap?next=<currentPath>`
- Nếu đang ở member shell với unsaved work:
  - ưu tiên banner/modal `Phiên đăng nhập đã hết hạn`
  - cho phép user đăng nhập lại nếu flow kỹ thuật cho phép
  - nếu không, redirect với warning rõ

### Sensitive forms

- `/tai-khoan`
- `/tu-tap/*`
- `/phat-nguyen/*`

Nếu session hết hạn giữa chừng:
- không âm thầm mất dữ liệu nếu còn draft cục bộ
- phải có message rõ trước khi điều hướng đi

### Browser back-forward restore after auth changes

- Auth/session UX phai coi `pageshow` voi `event.persisted === true` la mot lane rieng.
- Sau `logout`, `session revoke`, hoac `session expiry`, member routes khi duoc restore tu browser history phai:
  - re-check session authority
  - clear hoac re-fetch auth-sensitive data
  - tranh flash lai profile/member state cu trong 1 frame lau thay ro
- Neu session khong con hop le:
  - redirect ve `/dang-nhap?next=<currentPath>` hoac `/`
  - hoac render expired-state gate truoc khi member content mount day du
- Auth analytics neu co phan tich pageview/member recovery phai tinh ca restore lane, khong chi full load.

---

## Guard ownership

- `proxy.ts` làm optimistic routing guard và redirect sớm.
- `apps/api` vẫn là authority cho:
  - session validity
  - refresh rotation
  - authz
  - profile ownership
- Không rely vào page-level UI guard để bảo vệ mutation/auth surface.

---

## Open product decisions still needing owner input

- reset password success:
  - về `/dang-nhap`
  - hay auto-login rồi vào `/dashboard`
- session-expired recovery:
  - hard redirect ngay
  - hay banner + re-auth modal trước
- social login/OAuth:
  - có ở phase đầu hay không
