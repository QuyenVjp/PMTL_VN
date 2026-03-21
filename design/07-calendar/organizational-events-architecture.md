# Organizational Events Architecture

> File này chốt kiến trúc cho `sự kiện tổ chức` trong PMTL_VN.
> Nó áp dụng cho các chương trình có lịch trình chi tiết, nhiều tiết mục, nhiều diễn giả/người thực hiện, poster, gallery, file chương trình, CTA tham gia, và reminder downstream.
>
> Nó không tạo module mới.
> Owner module vẫn là `calendar`.

# 1. Vì sao cần file này

`events` hiện tại trong `07-calendar` đã đủ cho:

- sự kiện công khai đơn giản
- tiêu đề, ngày giờ, địa điểm, mô tả
- media và external link cơ bản

Nhưng chưa đủ sâu cho loại chương trình như:

- pháp hội
- một ngày an lạc
- gieo duyên buffet chay
- khóa tu, pháp đàm, ngày hội cộng tu
- sự kiện có agenda theo khung giờ

Loại event này cần nhiều hơn một bài giới thiệu.

Nó cần:

- `agenda` có cấu trúc
- `speaker/facilitator roster`
- `CTA` rõ
- `files/poster/gallery`
- `attendance guidance`
- `event status` tách rõ trạng thái biên tập và trạng thái công khai

# 2. Quyết định ownership

`Calendar` vẫn sở hữu:

- canonical event record
- agenda
- speakers/facilitators
- files/poster/gallery mapping
- public delivery status

`Notification` chỉ sở hữu:

- reminder delivery
- subscription targeting
- async push job / email job

`Content` chỉ tham chiếu:

- bài recap
- bài giới thiệu liên quan
- bài học/pháp thoại liên kết đến event

# 3. Event taxonomy đề xuất

## 3.1. Hai lớp event

### Simple calendar events

Phù hợp cho:

- ngày vía
- buổi sinh hoạt ngắn
- livestream đơn giản
- thông báo lịch ngắn

### Organizational events

Phù hợp cho:

- chương trình có timeline
- nhiều tiết mục/khối nội dung
- nhiều người phụ trách
- cần poster, map, file chương trình, CTA

## 3.2. Event categories nên có

- `phap-hoi`
- `mot-ngay-an-lac`
- `gieo-duyen`
- `khoa-tu`
- `phong-sanh`
- `phap-dam`
- `livestream`
- `community-meetup`
- `volunteer-activity`

# 4. Data model đề xuất

## 4.1. Event record cốt lõi

Event cốt lõi giữ:

- title
- slug/publicId
- summary
- rich content
- start/end datetime
- location
- status
- delivery status
- cover/poster refs

## 4.2. Agenda items

Agenda phải là first-class structured data:

- `startTime`
- `endTime`
- `title`
- `description`
- `hostLabel`
- `segmentType`
- `sortOrder`

Ví dụ `segmentType`:

- `checkin`
- `ritual`
- `performance`
- `opening`
- `teaching`
- `sharing`
- `meal`
- `closing`
- `other`

## 4.3. Speakers / facilitators

Không ép nhét vào một string `speaker`.

Nên có:

- `name`
- `roleLabel`
- `bioShort`
- `avatarRef`
- `sortOrder`

## 4.4. CTA links

Tách CTA thành cấu trúc riêng:

- `register`
- `map`
- `livestream`
- `download-program`
- `contact-zalo`
- `facebook-post`

## 4.5. Media bundles

Nên support:

- cover image
- poster image
- gallery
- downloadable files
- optional embedded video

# 5. Public FE architecture

## 5.1. Listing page

Route:

```text
/su-kien
```

Page này nên có:

- featured upcoming event
- event filters theo loại
- upcoming / past segmentation
- compact cards cho mobile

## 5.2. Detail page

Route:

```text
/su-kien/[slug]
```

Cấu trúc:

1. Hero
2. Thông tin nhanh
3. CTA row
4. Agenda timeline
5. Speakers/facilitators
6. Rich content
7. Gallery
8. Files/downloads
9. Related links hoặc bài liên quan

## 5.3. Mobile rules

- timeline phải đọc được theo chiều dọc
- card agenda không quá dày text
- CTA chính luôn ở trên fold
- map / đăng ký / gọi liên hệ phải bấm dễ

# 6. Admin FE architecture

Route gốc:

```text
/admin/he-thong/lich
```

Nên có thêm detail workspace:

```text
/admin/he-thong/lich/[eventId]
```

Tabs đề xuất:

- `Thông tin chung`
- `Lịch trình`
- `Diễn giả`
- `CTA & liên kết`
- `Poster / ảnh / file`
- `Xuất bản`

## 6.1. Validation bắt buộc

- Event có `type = organizational` thì phải có ít nhất 1 agenda item
- `startTime < endTime`
- agenda không được overlap ngoài chủ ý
- CTA URL phải hợp lệ
- location bắt buộc với event offline

## 6.2. Publish rules

- publish event trước
- append audit
- append outbox signal nếu reminder hoặc refresh read-model cần chạy

# 7. API surface đề xuất

## Public read

- `GET /calendar/events`
- `GET /calendar/events/:publicId`
- `GET /calendar/events/:publicId/agenda`

## Admin write

- `POST /admin/calendar/events`
- `PATCH /admin/calendar/events/:publicId`
- `POST /admin/calendar/events/:publicId/agenda-items`
- `PATCH /admin/calendar/events/:publicId/agenda-items/:agendaItemPublicId`
- `POST /admin/calendar/events/:publicId/speakers`
- `PATCH /admin/calendar/events/:publicId/speakers/:speakerPublicId`
- `POST /admin/calendar/events/:publicId/ctas`
- `PATCH /admin/calendar/events/:publicId/ctas/:ctaPublicId`
- `POST /admin/calendar/events/:publicId/publish`

# 8. Reminder / notification interplay

Calendar không tự gửi notification.

Nhưng `organizational event` nên có signal downstream khi:

- event được publish
- event đổi thời gian
- event bị hủy
- event sắp diễn ra

`Notification` có thể dùng:

- subscriber preferences
- category preferences
- event type
- timing window

để tạo reminder job.

# 9. Launch recommendation

Nếu chỉ demo phase đầu, tối thiểu nên có:

1. event listing page
2. event detail page với timeline
3. admin event editor có agenda table
4. schema và contract đủ cho poster, files, CTA

# 10. Kết luận

1. `Sự kiện tổ chức` không cần module mới.
2. Nó là `specialized event surface` bên trong `calendar`.
3. Phase 1 phải thêm `agenda`, `speakers`, `ctas`, `poster/files/gallery`.
4. Public FE và admin FE đều cần page riêng đủ chiều sâu, không thể chỉ dùng event card cơ bản.
