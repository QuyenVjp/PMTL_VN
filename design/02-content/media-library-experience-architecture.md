# Thư Viện Ảnh / Video Pháp Môn — Experience Architecture

> File này chốt kiến trúc cho một surface public chuyên biệt về ảnh, video, playlist, album, và clip giới thiệu pháp môn.
> Nó không thay thế `Wisdom-QA` và không gom bừa mọi audio/video vào một chỗ.

---

## 1. Vì sao phải có surface này

Hiện tại repo đã có:

- `media_assets` và admin media management
- audio/video refs rải trong `chantItems`, `events`, `wisdom entries`
- `Wisdom-QA` cho `Bạch thoại`, `khai thị`, `Q&A`, offline bundle

Nhưng vẫn thiếu:

- một trang public chuyên biệt để người dùng xem nhanh `ảnh/video pháp môn`
- một nơi hợp nhất `album ảnh`, `video giới thiệu`, `clip pháp hội`, `playlist đồ đằng`, `poster/video recap`
- một workspace admin riêng để curate thành collection có chủ đích, thay vì chỉ có `media asset grid`

---

## 2. Benchmark thực tế đã đối chiếu

### Web Việt

- `phapmontamlinh.vn` có menu `Video Đồ Đằng`, tức là video đang được xem như một surface public riêng, không chỉ là attachment.
- site đó cũng có `Blog`, `Download`, và social links tách rời, nghĩa là media đang bị phân mảnh theo menu chứ chưa thành thư viện hợp nhất.

### Web Trung

- `orientalradio.com.sg` có các surface video/bài giảng riêng và cả page hình ảnh như `设佛台开示合集｜十、佛台美图`.
- pattern bên Trung cho thấy: `ảnh đẹp`, `video khai thị`, `bài giảng`, `ảnh pháp hội` thường bị chia thành nhiều ngăn nội dung độc lập.

### Kết luận benchmark

- đối thủ hiện có media surfaces thật, nhưng phần lớn còn rời rạc
- PMTL_VN nên làm tốt hơn bằng một `hub thư viện pháp môn` có filter rõ, collection rõ, nhưng vẫn giữ boundary:
  - `Content` sở hữu curation và public library
  - `Wisdom-QA` sở hữu learning entries doctrinal
  - `Calendar` sở hữu gallery theo từng event

---

## 3. Owner split

### `02-content` owns

- thư viện public tổng hợp ảnh/video pháp môn
- curated collections như:
  - ảnh pháp hội
  - video giới thiệu pháp môn
  - playlist đồ đằng
  - album hoạt động phụng sự
  - poster / banner / clip recap chính thức
- hero, tabs, featured collections, SEO metadata

### `10-wisdom-qa` still owns

- `Bạch thoại`, `khai thị`, `Q&A`, `video talk entries`
- transcript, source provenance, learning retrieval

### `07-calendar` still owns

- gallery, poster, file đính kèm của từng sự kiện cụ thể

### `02-content` may reference

- `wisdomEntryRef`
- `eventRef`
- `downloadRef`
- `mediaAssetRef`

---

## 4. Route strategy

### Public

- `/thu-vien/phap-mon`
- `/thu-vien/phap-mon/[slug]`

### Admin

- `/admin/noi-dung/thu-vien-phap-mon`

---

## 5. IA public

```text
/thu-vien/phap-mon
├─ Tabs
│  ├─ tất cả
│  ├─ video
│  ├─ hình ảnh
│  ├─ pháp hội
│  ├─ giới thiệu pháp môn
│  └─ đồ đằng / playlist
├─ featured collection
├─ collection grid
└─ related deep links
   ├─ /su-kien/[slug]
   ├─ /bai-hoa/[slug]
   └─ /tai-lieu
```

---

## 6. Collection model

Thay vì render media rời, public FE nên đọc theo `media collections`.

### Collection types

- `photo_album`
- `video_playlist`
- `mixed_gallery`
- `featured_story_gallery`

### Canonical item types

- `image`
- `video_embed`
- `uploaded_video`
- `poster`
- `external_playlist_link`

---

## 7. API surface

### Public

- `GET /content/hub-pages/thu-vien-phap-mon`
- `GET /content/media-library/collections`
- `GET /content/media-library/collections/:slug`
- `GET /content/media-library/featured`
- `GET /content/media-library/tags`

### Admin

- `GET /admin/content/media-library/overview`
- `POST /admin/content/media-library/collections`
- `PATCH /admin/content/media-library/collections/:publicId`
- `POST /admin/content/media-library/collections/:publicId/items`
- `PATCH /admin/content/media-library/collections/:publicId/items/:itemPublicId`
- `POST /admin/content/media-library/featured`
- `POST /admin/content/media-library/publish`

---

## 8. Data design

### Nên có first-class tables

- `media_collections`
- `media_collection_items`

### Không nên chỉ dùng

- một đống `posts` với `gallery`
- hoặc chỉ `media_assets` rồi FE tự đoán ra album

---

## 9. Smart integration rules

- event recap albums nên xuất hiện ở library, nhưng owner vẫn là `Calendar`
- video bài giảng doctrinal có thể teaser ở library, nhưng detail canonical vẫn là `Wisdom-QA`
- `Content` library là cửa vào, không phải owner của mọi transcript/provenance sâu

