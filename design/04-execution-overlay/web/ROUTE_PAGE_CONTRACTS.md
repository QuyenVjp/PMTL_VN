# ROUTE_PAGE_CONTRACTS

File này gom page contract theo route cho `apps/web`.
Mục tiêu:

- mỗi route có goal rõ
- biết primary CTA là gì
- biết empty/error/auth handling là gì
- không mở route ra rồi tự bịa state machine

> Route list: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> User journeys: `design/04-execution-overlay/web/USER_FLOWS.md`
> Loader canon: `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`

---

## Contract template

Mỗi route nên chốt:
- goal
- primary CTA
- data owner
- loading style
- empty state
- error state
- auth behavior

---

## Key routes

### `/`

- Goal: đưa user vào 1 trong 5 cổng vào chính
- Primary CTA:
  - guest: `Bắt đầu tu học`
  - member: vào `/dashboard`
- Loading: skeleton sections nhẹ
- Empty: không áp dụng như route list thường
- Error: degrade từng section, không làm sập cả homepage
- Auth behavior: logged-in user có thể được redirect `/dashboard` theo current canon

### `/tim-kiem`

- Goal: tìm và phân loại đúng content
- Primary CTA: mở detail route phù hợp
- Data owner: `SearchResultsPageDto`
- Loading: shell + skeleton results
- Empty: suggested queries/tags, không blank
- Error: query invalid vs engine degraded vs backend fail phải tách
- Auth behavior: public

### `/dang-nhap`

- Goal: vào lại đúng nơi user cần tới
- Primary CTA: submit login
- Loading: minimal
- Empty: không áp dụng
- Error: inline auth error
- Auth behavior: logged-in user -> `/dashboard`

### `/dang-ky`

- Goal: tạo tài khoản và đi vào verify flow
- Primary CTA: submit register
- Error: duplicate email / validation / rate-limit
- Auth behavior: logged-in user -> `/dashboard`

### `/dashboard`

- Goal: daily overview + launch points
- Primary CTA:
  - `Xem lịch tu hôm nay`
  - `Bắt đầu buổi tu`
- Data owner: `MemberDashboardDto`
- Loading: shell first, aggregates stream sau nếu cần
- Empty: onboarding state, không blank dashboard
- Error: retryable member aggregate fallback
- Auth behavior: guest -> login with `next`

### `/lich-ca-nhan`

- Goal: xem advisory + lịch tu cá nhân
- Primary CTA: `Bắt đầu buổi tu`
- Data owner: `PersonalPracticeCalendarPageDto`
- Empty: no scheduled items state
- Error: retry banner + safe back path
- Auth behavior: member only

### `/tu-tap/bai-tap`

- Goal: thực hành và ghi lại buổi tu
- Primary CTA: `Lưu buổi tu`
- Empty: no items today / open guide CTA
- Error: preserve draft if possible
- Auth behavior: member only

### `/bach-thoai/[slug]`

- Goal: đọc wisdom entry với attribution rõ
- Primary CTA:
  - nghe audio nếu có
  - lưu offline nếu member
- Empty: not-found nếu slug sai
- Error: retry + back to wisdom hub
- Auth behavior: public

### `/hoi-dap/[slug]`

- Goal: xem câu hỏi/đáp với provenance rõ
- Primary CTA:
  - xem nguồn
  - lưu offline nếu member
- Empty: not-found
- Error: retry + back to QA hub
- Auth behavior: public

---

## Open owner work still needed

- điền full contract cho tất cả grouped routes
- điền contract cho offline, notifications, bookmarks
- điền CTA/error wording cuối cùng bằng tiếng Việt chuẩn sản phẩm
