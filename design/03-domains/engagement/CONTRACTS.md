# Engagement Contracts (Hợp đồng Mô-đun Tương tác)

## Data ownership (Quyền sở hữu dữ liệu)

- `sutraBookmarks`: personal bookmark state (trạng thái đánh dấu cá nhân)
- `sutraReadingProgress`: reading progress state (trạng thái tiến độ đọc)
- `chantPreferences`: personal practice preferences (cấu hình tu tập cá nhân)
- `practiceLogs`: historical practice log (nhật ký công phu)
- `practiceSheets`: daily practice sheet (bảng công phu hằng ngày)
- `ngoiNhaNhoSheets`: self-owned little-house records (bản ghi Ngôi Nhà Nhỏ cá nhân)

## API / BFF routes (Tuyến đường API)

- `GET/POST /api/engagement/bookmarks`
- `GET/POST /api/engagement/reading-progress`
- `GET /api/engagement/practice-logs`
- `GET/PUT /api/engagement/practice-logs/self`
- `GET/POST /api/engagement/practice-sheets`
- `GET /api/engagement/practice-sheets/:publicId`
- `PATCH /api/engagement/practice-sheets/:publicId`
- `POST /api/engagement/practice-sheets/:publicId/complete`
- `GET/POST /api/engagement/ngoi-nha-nho-sheets`
- `GET /api/engagement/ngoi-nha-nho-sheets/:publicId`
- `PATCH /api/engagement/ngoi-nha-nho-sheets/:publicId`
- `POST /api/engagement/ngoi-nha-nho-sheets/:publicId/entries`
- `POST /api/engagement/ngoi-nha-nho-sheets/:publicId/complete`
- `POST /api/engagement/ngoi-nha-nho-sheets/:publicId/mark-self-stored`
- `POST /api/engagement/ngoi-nha-nho-sheets/:publicId/mark-offered`

## Auth & permissions (Xác thực & quyền hạn)

- Individual ownership (quyền sở hữu cá nhân): engagement data mặc định là `self-owned`
- Contextual auth (xác thực theo ngữ cảnh): write operation lấy `userId` từ NestJS auth session
- `member`: full read/write trên dữ liệu của chính mình
- `admin`: có thể có support access theo policy, nhưng không trở thành owner của workflow cá nhân

### Admin support scope (Phạm vi hỗ trợ của admin)

- `admin` không có blanket quyền đọc/ghi mọi engagement record chỉ vì là admin.
- Admin support chỉ hợp lệ khi có một trong các lane rõ ràng:
  - assisted recovery/debug lane đã được mở trong admin workspace tương ứng
  - member chủ động yêu cầu hỗ trợ qua operational flow được audit
  - restore/recompute/reconciliation lane theo runbook
- Mọi cross-user read/write ngoài `self` phải:
  - append audit với cả `actorUserId` và `ownerUserId`
  - ghi rõ `supportReason`
  - không được mutate completion/progress state nếu không có explicit action type
- Nếu chưa có support lane canonical, mặc định API phải trả `403` thay vì để dev tự mở đường tắt.

## Canonical write rules (Quy tắc ghi chuẩn gốc)

1. Separation (tách biệt): self-state không được ghi ngược vào content canonical data.
2. References (tham chiếu): engagement chỉ đọc `sutras`, `chantItems`, `chantPlans` qua reference.
3. Context bridge (cầu nối ngữ cảnh):
   - `practiceSheets` có thể giữ `scenarioPresetRef`, `guideContextRef`, `advisoryContextRef`
   - các ref này chỉ để UI mở đúng companion guide, không biến engagement thành owner của rule text
   - context ref phải giữ thêm `sourcePublicId` + `sourceVersion` hoặc `publishedRevision` nếu owner module có versioning
   - nếu source owner chưa có version number rõ, engagement phải snapshot tối thiểu:
     - `sourceTitle`
     - `sourceSlug/publicId`
     - `sourceKind`
   - source change về sau không được silently rewrite historical practice sheet; UI có thể báo `sourceUpdated` nhưng historical row vẫn bám snapshot/version lúc user gắn ref
   - nếu source bị unpublish/delete:
     - record engagement cũ vẫn hợp lệ
     - ref được downgrade thành `stale_reference`
     - client không được tự xóa history chỉ vì source không còn public
4. Immutability (tính bất biến) với một số state:
   - `ngoiNhaNhoSheet` đã `offered` thì không được mở lại progress fields bừa bãi.
5. Idempotency (tính không đổi):
   - `practiceLogs` nên support `clientEventId` hoặc composite key kiểu `user + date + plan`.
   - canonical self-write lane cho member dashboard / practice flow = `PUT /api/engagement/practice-logs/self`
   - nếu vẫn giữ `POST /api/engagement/practice-logs`, route này phải được coi là append/manual-entry lane riêng; không được dùng song song cho cùng một UX self-save mà không chốt semantics khác biệt
6. Practice profile / encouragement boundary:
   - `chantPreferences` được phép giữ `experienceTier`, `baselineMode`, `skipBeginnerTrack`, `privateStreakEnabled`
   - `practiceLogs` hoặc owner aggregate có thể derive `privateStreak`, `consistencySummary`
   - các projection này là self-owned only; không được lộ sang community/public/admin mặc định
7. Foundation guard:
   - nếu user profile đã qua beginner phase, practice surface không được auto-suggest hạ `Đại Bi` / `Tâm Kinh` xuống dưới mức nền tảng canon chỉ vì đang chạy `Ngôi Nhà Nhỏ`
   - source-of-truth của mức nền tảng vẫn nằm ở content/wisdom rule docs; engagement chỉ lưu profile và warning state

## Expected errors (Lỗi dự kiến)

- `400`: field bắt buộc thiếu hoặc schema sai
- `401`: thiếu session hoặc token hết hạn
- `403`: cố đọc/ghi dữ liệu cá nhân của người khác
- `404`: content reference không tồn tại
- `409`: duplicate record hoặc invalid state transition
- `500`: internal service/runtime error

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- No backfilling into content (không được ghi ngược vào content)
- Offline-first sync (đồng bộ ưu tiên offline-first) phải idempotent
- Async side-effects không được chặn canonical self-state write path
- `practiceSheets` không được tự giữ bản sao script kinh/chú; chỉ giữ completion state và context refs.
- `support access` không phải shortcut cho admin edit hộ member; nếu chưa có support lane explicit thì phải từ chối.
- `private streak` được phép như động lực riêng tư; `public streak` hoặc leaderboard là cấm.
