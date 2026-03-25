# IMAGE_MEDIA_RATIO_MAP

File này chốt ratio và usage baseline cho image/media surfaces.

> Image rules: `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`

---

## Ratio map

| Surface | Suggested ratio | Notes |
|---|---|---|
| homepage hero visual | `16:9` hoặc `5:4` | tùy art direction, không đổi lung tung |
| featured post card | `16:9` | editorial-friendly |
| standard content card | `4:3` hoặc `16:9` | chọn 1 family chủ đạo |
| wisdom/qa cover | `16:9` | nếu có cover |
| author/source thumbnail | `1:1` | avatar-like |
| audio/book cover | `3:4` | sách nói / companion cover |
| gallery compare block | `4:3` | side-by-side ổn định |
| download/resource thumbnail | `3:4` | tài liệu/PDF feel |

---

## Rules

- Mỗi card family chỉ nên có 1 ratio owner, không mix loạn trong cùng list.
- Nếu route không có media chắc chắn, layout phải vẫn đẹp khi text-only.
- Audio/book-like surfaces được phép dùng `3:4`.
- Hero ratio phải ổn định giữa desktop/mobile family, không để CLS/awkward crop.

---

## Open owner decisions still needed

- homepage hero dùng `16:9` hay `5:4`
- content cards chuẩn dùng `16:9` hay `4:3`
- wisdom detail có cover image baseline hay text-first hoàn toàn
