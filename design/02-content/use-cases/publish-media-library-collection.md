# Use case: Publish media library collection

## Mục tiêu

Cho phép editor tạo hoặc cập nhật một collection trong `Thư viện ảnh/video pháp môn`, rồi publish ra public surface an toàn.

## Input tối thiểu

- `title`
- `slug`
- `collectionType`
- `description`
- `items[]`

## Validation

- `slug` unique
- `collectionType` phải thuộc:
  - `photo_album`
  - `video_playlist`
  - `mixed_gallery`
  - `featured_story_gallery`
- mỗi item phải có:
  - `itemType`
  - `sortOrder`
- external video URL phải qua domain allowlist
- nếu item chỉ là reference sang `event` hoặc `wisdom entry`, phải có owner ref rõ

## Write path

1. Editor mở workspace `thu-vien-phap-mon`
2. Tạo mới hoặc sửa collection
3. Hệ thống validate metadata và items
4. Nếu hợp lệ, persist vào `media_collections` và `media_collection_items`
5. Publish collection
6. Trigger downstream revalidation + search sync nếu cần
