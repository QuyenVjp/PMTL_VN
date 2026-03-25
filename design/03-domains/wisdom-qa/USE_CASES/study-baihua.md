# Study Bai Thoai Phat Phap

## Purpose
- Hỗ trợ người dùng đọc hoặc nghe `Bạch thoại Phật pháp` theo trải nghiệm tối giản, rõ chữ, phù hợp học ban đêm và người lớn tuổi.

## Owner module
- `wisdom-qa`

## Actors
- `guest`
- `member`

## Trigger
- User mở một bài hoặc một tập `Bạch thoại Phật pháp`.
- User đổi chế độ đọc, nghe audio, hoặc lưu cho offline nếu feature bật.

## Preconditions
- Entry tồn tại trong library hoặc index.
- Entry đã publish và có quyền public read.
- Nếu user mở audio/video thì asset liên quan phải khả dụng.

## Input contract
- `entryPublicId`
- optional:
  - `preferredLanguage`
  - `readingMode`
  - `fontScale`
  - `openAudio`
  - `offlineBundleId`

## Read set
- `wisdomEntries`
- media/audio/video refs
- optional offline bundle metadata
- optional device/user preference nếu feature đọc đêm hoặc font lớn được lưu

## Write path
- Flow này chủ yếu là read-only.
- Nếu user lưu `recent study state`, write path chỉ nên:
  1. Resolve entry.
  2. Resolve reading or listening assets.
  3. Optionally update lightweight recent-study state nếu implementation có.

## Async side-effects
- optional analytics hoặc reading-progress event
- optional audio prefetch
- optional offline bundle refresh hint

## Success result
- User đọc được text lớn, rõ.
- Nếu có audio/video thì có thể nghe hoặc xem kèm.
- Nếu có bản gốc và bản dịch, user có thể đối chiếu song song.

## Errors
- `404`: entry không tồn tại hoặc chưa publish.
- `409`: offline bundle được yêu cầu nhưng version không khớp.
- `500`: lỗi mapping asset hoặc read model.

## Audit
- không bắt buộc audit nặng cho read flow thường ngày
- chỉ cần audit nếu có hành động quản trị, force publish, hoặc repair bundle

## Idempotency / anti-spam
- read flow không cần idempotency phức tạp
- nếu có recent-state write, phải là upsert nhẹ theo `user + entry`

## Performance target
- mở entry text nên hoàn tất `< 500ms`
- mở audio metadata nên hoàn tất `< 700ms`
- phần prefetch hoặc offline sync hint phải ở downstream async path

## Notes
- Đây là learning surface, không phải blog feed.
- Ưu tiên chữ to, tương phản cao, ít nhiễu, và chuyển đổi bản gốc/bản dịch rõ ràng.
