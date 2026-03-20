# Bạch Thoại Audiobook — Ingestion Inventory

> Inventory này chốt các loại record cần ingest từ nguồn audiobook.

---

## 1. Book seeds từ source đã thấy

| Group | Examples |
|---|---|
| `baihua_book` | `白话佛法一` ... `白话佛法十二` |
| `baihua_video_discourse` | `白话佛法视频开示一` ... `四` |
| `radio_lecture` | `广播讲座一`, `广播讲座二`, `白话佛法广播讲座` |

---

## 2. Record layers

### Layer A. Book metadata

- source label
- source url
- book key
- title original
- title vietnamese
- cover image
- full book mp3 url nếu có

### Layer B. Chapter source text

- chapter number
- chapter title original
- body original
- source url riêng

### Layer C. Translation

- title vietnamese
- body vietnamese
- summary vietnamese
- translation credit
- review status

### Layer D. Audio attachment

- source audio url
- audio type:
  - `full_book_mp3`
  - `chapter_mp3`
  - `future_vi_voice`

---

## 3. Ingestion rule

- import theo `book`
- trong mỗi book import theo `chapter`
- chapter text là canonical payload để dịch
- audio chỉ là attachment layer

