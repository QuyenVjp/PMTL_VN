# Thư Viện Ảnh / Video Pháp Môn — Content Inventory

> Inventory canonical cho feature `Thư viện pháp môn`.

---

## 1. Route inventory

| Surface | Route | Priority |
|---|---|---|
| Hub thư viện pháp môn | `/thu-vien/phap-mon` | P0 |
| Chi tiết collection | `/thu-vien/phap-mon/[slug]` | P0 |
| Admin workspace | `/admin/noi-dung/thu-vien-phap-mon` | P0 |

---

## 2. Collection seeds

| Collection seed | Type | Priority |
|---|---|---|
| Video giới thiệu Pháp Môn Tâm Linh | `video_playlist` | P0 |
| Video đồ đằng / clip nổi bật | `video_playlist` | P0 |
| Ảnh pháp hội và chương trình | `photo_album` | P0 |
| Ảnh hoạt động phụng sự | `photo_album` | P1 |
| Poster / clip recap chính thức | `mixed_gallery` | P1 |

---

## 3. Hub page blocks

- `hero_intro`
- `featured_collection`
- `filter_tabs`
- `collection_grid`
- `cross_link_panel`

---

## 4. Collection detail blocks

- `collection_hero`
- `metadata_bar`
- `media_grid`
- `playlist_panel`
- `related_links_panel`

---

## 5. Editorial rules

- collection phải là object first-class, không phải query tạm từ `media_assets`
- item nào đến từ `Calendar` hoặc `Wisdom-QA` phải giữ `ownerRef`
- video external chỉ nhận domain allowlist
- ảnh/video nhạy cảm về nguồn phải có `sourceNote`

