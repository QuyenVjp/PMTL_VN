# Little House Experience Architecture

> Mục tiêu của file này là chốt cách thiết kế đầy đủ cho feature `Ngôi Nhà Nhỏ` theo hướng `design-first`, để sau này triển khai `apps/api`, `apps/admin`, `apps/web` không bị tách rời giữa:
>
> - hướng dẫn nghi thức
> - dữ liệu progress cá nhân
> - giao diện thực hành
> - quản trị nội dung
>
> File này không thay thế:
>
> - `design/02-content/little-house-spec.md`
> - `design/04-engagement/use-cases/manage-ngoi-nha-nho-sheet.md`
> - `design/04-engagement/schema.dbml`
>
> Nó là lớp kiến trúc trải nghiệm và triển khai sản phẩm cho riêng `Ngôi Nhà Nhỏ`.

# 1. Bài toán thật sự

`Ngôi Nhà Nhỏ` không phải chỉ là một bài viết dài.

Nó đồng thời là:

- một `knowledge hub` rất sâu với nhiều quy tắc nghi thức
- một `decision tree` theo tình huống thực hành
- một `visual instruction system` cần ảnh, minh họa, checklist, cảnh báo
- một `personal progress workflow` cho người dùng đang trì tụng thật
- một `high-risk content surface` vì wording sai hoặc ghép sai context có thể làm lệch nghi thức

Nếu chỉ làm theo kiểu:

- 13 bài viết rời
- hoặc 1 bài cực dài

thì đều có vấn đề:

- 13 bài rời làm người mới bị lạc
- 1 bài quá dài làm khó tra cứu nhanh khi đang thực hành
- admin khó giữ version và ảnh minh họa nhất quán
- web khó tái dùng dữ liệu cho checklist, stepper, FAQ, download, và tracker cá nhân

Vì vậy, hướng đúng là:

- giữ `content hub + deep guide` để phủ đủ nội dung
- nhưng hiển thị cho user bằng `grouped IA + context-aware surfaces`

# 2. Sự thật hiện tại trong repo

Hiện repo đã có nền móng đúng nhưng mới dừng ở mức khung:

- `design/02-content/little-house-spec.md`
  - đã có scope, flow chuẩn bị, flow tụng, flow đốt không bàn thờ, validation và UI hints
- `design/02-content/practice-ui-checklists.md`
  - đã có stepper/checklist gợi ý cho recitation và burning
- `design/04-engagement/*`
  - đã chốt owner của self-state cá nhân
  - đã có `ngoi_nha_nho_sheets`, entries, audit snapshots
- `design/ui/PAGE_INVENTORY.md`
  - đã có `/tu-tap/nha-nho`

Nhưng repo chưa có:

- một `canonical content architecture` cho toàn bộ 13 nhóm hướng dẫn
- một `admin model` để quản lý variant, rules, FAQ, assets, downloads, version
- một `public information architecture` thông minh hơn mô hình 13 link phẳng
- một `bridge` rõ giữa `đọc hiểu` và `thực hành theo dõi tiến độ`

# 3. Kết luận sản phẩm

Không nên làm `Ngôi Nhà Nhỏ` thành module domain mới.

Nó nên tiếp tục là:

- `Content` sở hữu toàn bộ `ritual truth`
- `Engagement` sở hữu toàn bộ `personal progress`
- `Search` chỉ index guide/FAQ/download
- `Notification` chỉ tham gia khi đã có reminder thật sự cần

Điểm quan trọng:

- `Ngôi Nhà Nhỏ` là một `feature surface` lớn
- nhưng không phải `domain owner` mới

# 4. Information Architecture đề xuất

## 4.1. Không hiển thị 13 mục phẳng cho user mới

User không nên nhìn thấy ngay một danh sách phẳng 13 link kiểu cổng thông tin cũ.

Thay vào đó, public FE nên dùng `5 nhóm lớn`, nhưng vẫn giữ khả năng SEO/index riêng cho từng bài con.

## 4.2. Cây nội dung đề xuất

```text
/ngoi-nha-nho
├─ /bat-dau
│  ├─ Ngôi Nhà Nhỏ là gì
│  ├─ Hiệu dụng
│  ├─ Kết cấu 27/49/84/87
│  ├─ Các loại Ngôi Nhà Nhỏ
│  └─ Những Phật cụ cần thiết
├─ /tri-tung
│  ├─ Một số lưu ý trước khi niệm
│  ├─ Trình tự các bước
│  ├─ Hướng dẫn theo từng loại
│  ├─ Cách điền Kính Tặng / Tặng
│  └─ Cách chấm đỏ
├─ /dot-va-hau-xu-ly
│  ├─ Quy trình đốt
│  ├─ Những lưu ý khi đốt
│  ├─ Bảo quản
│  ├─ Hủy bỏ khi viết sai / chấm sai
│  └─ Xử lý tro
├─ /tra-cuu
│  ├─ Số lượng theo tình huống
│  ├─ Hỏi đáp
│  ├─ In ấn / mẫu tải xuống
│  └─ Tài liệu liên quan
└─ /thuc-hanh
   ├─ Chọn trường hợp của tôi
   ├─ Checklist chuẩn bị
   ├─ Bắt đầu trì tụng
   └─ Sang tracker cá nhân
```

## 4.3. Vì sao cách này tốt hơn

- vẫn giữ đủ 13 nhóm tri thức để không mất quy tắc
- nhưng gộp theo `mental model` của user:
  - tìm hiểu
  - bắt đầu
  - trì tụng
  - đốt
  - tra cứu tình huống
- dễ làm mobile hơn
- dễ gắn CTA sang tracker cá nhân
- dễ làm `sticky nav`, `stepper`, `print/download`, `image compare`

## 4.4. Quy tắc hiển thị

- `public hub` dùng cho đọc hiểu và điều hướng
- `deep guide pages` vẫn tồn tại riêng cho SEO, search, share link
- `member tracker` là surface khác, không trộn toàn bộ bài giảng vào màn hình thao tác

# 5. Mapping từ 13 mục cũ sang IA mới

| Nhóm cũ | Nhóm mới |
|---|---|
| 1. Ngôi Nhà Nhỏ và hiệu dụng | `bat-dau` |
| 2. Phật cụ cần thiết | `bat-dau` |
| 3. Một số lưu ý khi niệm | `tri-tung` |
| 4. Trình tự các bước | `tri-tung` |
| 5. Hướng dẫn chi tiết các loại | `tri-tung` + `thuc-hanh` |
| 6. Quy trình đốt | `dot-va-hau-xu-ly` |
| 7. Những điều lưu ý khi đốt | `dot-va-hau-xu-ly` |
| 8. Cách bảo quản | `dot-va-hau-xu-ly` |
| 9. Cách hủy bỏ khi viết sai/chấm sai | `dot-va-hau-xu-ly` |
| 10. Cách chấm chấm đỏ | `tri-tung` |
| 11. Số lượng cho các trường hợp | `tra-cuu` |
| 12. Hỏi đáp | `tra-cuu` |
| 13. In ấn Ngôi Nhà Nhỏ | `tra-cuu` |

Kết luận:

- logic cũ vẫn giữ được đầy đủ
- nhưng không ép user học theo cách website cũ đang cắt menu

# 6. Module ownership chuẩn

## 6.1. Content owns

`Content` phải sở hữu:

- hub `Ngôi Nhà Nhỏ`
- các guide pages
- ritual scripts và explanatory copy
- warning blocks, do/don't blocks
- step sequences
- case variants
- FAQ
- download assets
- print template metadata
- image sets minh họa đúng/sai
- source provenance và version notes

`Content` không được sở hữu:

- tiến độ user đã tụng bao nhiêu
- tờ nào user đang làm dở
- user đã self-store hay offered một tờ nào

## 6.2. Engagement owns

`Engagement` phải sở hữu:

- sheet cá nhân
- counters
- progress
- trạng thái `draft`, `in_progress`, `completed`, `self_stored`, `offered`
- audit snapshots của action lớn
- anti-double-submit cho việc chấm

`Engagement` không được sở hữu:

- text bài khấn canonical
- ritual rules canonical
- content giải thích giáo lý

## 6.3. Search owns

`Search` chỉ sở hữu:

- search document cho guide, FAQ, download, chant item
- không tự viết rules, không tự dựng nội dung

## 6.4. Admin ownership

`apps/admin` chỉ là UI quản trị của `Content` và `Engagement`.

Admin không được:

- ghi đè business rule trong browser
- giữ source of truth riêng ngoài API

# 7. Data model đề xuất

## 7.1. Phase 1: không nổ quá nhiều bảng riêng

Phase 1 nên ưu tiên `typed content blocks` thay vì tạo ngay 10 bảng đặc thù mới.

Giữ canonical publishing units ở `Content`:

- `hubPages`
- `beginnerGuides`
- `downloads`
- `chantItems`

Thêm `typed block schema` cho `beginnerGuides` và `hubPages`.

### Block types bắt buộc cho Little House

- `hero_intro`
- `quick_summary`
- `ritual_structure`
- `case_matrix`
- `required_items`
- `warning_list`
- `do_dont_grid`
- `step_sequence`
- `script_block`
- `image_compare`
- `faq_block`
- `download_panel`
- `version_notice`
- `source_reference`

### Vì sao chọn block schema trước

- admin linh hoạt hơn khi biên tập
- FE render được nhiều dạng layout
- chưa khóa mình vào một physical model quá cứng
- vẫn đủ typed để validate và render có kiểm soát

## 7.2. Phase 1.5: bảng riêng cho dữ liệu tái dùng nhiều

Khi nội dung ổn định, tách các registry reusable:

- `little_house_case_variants`
- `little_house_rule_cards`
- `little_house_step_sequences`
- `little_house_faq_entries`
- `little_house_print_templates`

Chỉ tách khi có ít nhất một trong các dấu hiệu:

- admin phải copy/paste cùng một rule nhiều nơi
- một thay đổi wording phải sửa ở nhiều guide
- FE cần fetch riêng theo case/rule/faq

## 7.3. Engagement schema nên mở rộng gì

Từ `design/04-engagement/schema.dbml`, nên chuẩn bị mở rộng `ngoi_nha_nho_sheets` bằng các field sau:

- `recipient_type`
- `recipient_label`
- `giver_name`
- `case_variant_ref`
- `burning_mode`
- `storage_mode`
- `target_sheet_count`
- `template_version_ref`
- `preparation_state`
- `last_guidance_acknowledged_at`

Lý do:

- tracker cá nhân cần biết user đang làm loại nào
- FE có thể deep-link sang đúng guide hoặc đúng warning
- khi content thay đổi wording, tracker vẫn giữ `template_version_ref` để audit

## 7.4. Không nên lưu gì ở DB

Không lưu trong `Engagement`:

- toàn văn bài khấn canonical
- toàn văn guideline đốt
- ảnh hướng dẫn canonical

Những thứ đó phải reference từ `Content`.

# 8. API surface đề xuất

## 8.1. Public read API

Trong `apps/api/src/modules/content`, nên thêm surface Little House rõ ràng thay vì bắt FE phải tự chắp guide rời:

- `GET /content/hub-pages/ngoi-nha-nho`
- `GET /content/little-house/guide-map`
- `GET /content/little-house/guides`
- `GET /content/little-house/guides/:slug`
- `GET /content/little-house/case-variants`
- `GET /content/little-house/faq`
- `GET /content/little-house/downloads`

`guide-map` nên trả:

- nhóm IA
- thứ tự
- title
- short description
- icon/image
- estimated reading time
- recommended for beginner/intermediate/urgent lookup

## 8.2. Engagement API

Inventory hiện có mới là:

- `GET /engagement/ngoi-nha-nho-sheets`
- `POST /engagement/ngoi-nha-nho-sheets`

Để dùng thực tế, nên bổ sung:

- `GET /engagement/ngoi-nha-nho-sheets/:publicId`
- `PATCH /engagement/ngoi-nha-nho-sheets/:publicId`
- `POST /engagement/ngoi-nha-nho-sheets/:publicId/entries`
- `POST /engagement/ngoi-nha-nho-sheets/:publicId/complete`
- `POST /engagement/ngoi-nha-nho-sheets/:publicId/mark-self-stored`
- `POST /engagement/ngoi-nha-nho-sheets/:publicId/mark-offered`

Quy tắc:

- `entries` chỉ ghi delta và `clientEventId`
- action đổi lifecycle phải qua service riêng, không cho FE patch bừa status

## 8.3. Admin API

Admin không cần route owner mới, nhưng nên có surface editorial rõ:

- `GET /admin/content/little-house/overview`
- `POST /admin/content/little-house/guides`
- `PATCH /admin/content/little-house/guides/:id`
- `POST /admin/content/little-house/case-variants`
- `PATCH /admin/content/little-house/case-variants/:id`
- `POST /admin/content/little-house/faq`
- `PATCH /admin/content/little-house/faq/:id`
- `POST /admin/content/little-house/assets`
- `POST /admin/content/little-house/publish`

Nếu muốn giữ generic hơn:

- vẫn có thể dùng generic `content` endpoints
- nhưng admin FE nên có workspace riêng cho `Ngôi Nhà Nhỏ`

# 9. Admin FE đề xuất

## 9.1. Không chỉ là một form bài viết

Nếu admin chỉ dùng form blog chung, feature này sẽ nhanh chóng vỡ vì:

- ảnh minh họa nhiều
- rule nhiều
- variant nhiều
- FAQ nhiều
- cần preview theo đúng mobile UX

## 9.2. Workspace quản trị đề xuất

Route:

```text
/admin/noi-dung/ngoi-nha-nho
```

Tabs:

- `Tổng quan`
- `Nhóm hướng dẫn`
- `Bài chi tiết`
- `Case variants`
- `FAQ`
- `Downloads & in ấn`
- `Ảnh minh họa`
- `Version / nguồn`

## 9.3. Mỗi tab làm gì

`Tổng quan`

- chỉnh hero, intro, caution banner
- sắp xếp 5 nhóm IA
- chọn bài nổi bật cho người mới

`Nhóm hướng dẫn`

- quản lý card group `bat-dau`, `tri-tung`, `dot-va-hau-xu-ly`, `tra-cuu`, `thuc-hanh`

`Bài chi tiết`

- block editor có preview
- chọn case liên quan
- gắn assets, download, FAQ liên quan

`Case variants`

- người cần kinh của mình
- người quá cố
- thai nhi
- người cần kinh trong nhà
- hóa giải oán kết
- tự tích lũy
- niệm giúp
- `3-6-9`
- phạm Thái Tuế

`FAQ`

- quản lý câu hỏi/đáp ngắn
- gắn tag theo topic và case

`Downloads & in ấn`

- mẫu in
- PDF
- ảnh lớn
- note version và print warning

`Ảnh minh họa`

- ảnh đúng/sai
- flow đốt
- flow chấm đỏ
- phân loại `before`, `during`, `after`, `do_not`

`Version / nguồn`

- link nguồn gốc
- ghi chú đối chiếu
- audit biên tập
- ngày cập nhật

## 9.4. Admin UX bắt buộc

- preview mobile và desktop
- preview `guide page` và `tracker companion card`
- validation khi thiếu warning block ở bài nhạy cảm
- validation khi guide có `script_block` nhưng không có `source_reference`
- publish workflow phải log audit

# 10. User FE đề xuất

## 10.1. Tách 3 surface khác nhau

Không nên gom tất cả vào một màn hình.

Phải tách:

- `Public learning hub`
- `Contextual guide pages`
- `Member tracker`

## 10.2. Public learning hub

Route đề xuất:

```text
/ngoi-nha-nho
```

Màn hình này nên có:

- intro ngắn
- 5 cửa vào lớn
- `Tôi mới bắt đầu`
- `Tôi đang chuẩn bị niệm`
- `Tôi cần xem quy trình đốt`
- `Tôi viết/chấm sai thì sao`
- `Tôi cần biết số lượng theo trường hợp`

Không hiển thị một danh sách 13 link bé và dày ngay đầu trang.

## 10.3. Contextual guide pages

Ví dụ:

- `/ngoi-nha-nho/bat-dau`
- `/ngoi-nha-nho/tri-tung/cac-buoc`
- `/ngoi-nha-nho/tri-tung/cham-do`
- `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot`
- `/ngoi-nha-nho/tra-cuu/so-luong`

Mỗi trang cần:

- sticky section nav
- `đọc nhanh`
- `xem checklist`
- `xem hình minh họa`
- `tải mẫu`
- CTA sang `thực hành`

## 10.4. Member tracker

Route đã có trong design:

- `/tu-tap/nha-nho`

Nhưng tracker nên đổi từ một màn hình counter đơn lẻ thành `task-oriented workflow`:

### Bước trên UI

1. Chọn loại trường hợp
2. Điền `Kính Tặng` / `Tặng`
3. Xem cảnh báo cần nhớ
4. Bắt đầu tụng và chấm
5. Hoàn tất tờ
6. Chọn `self-store` hoặc `offered`
7. Xem hướng dẫn đốt tương ứng

### UI blocks nên có

- `paper-like cover card`
- `large tally counters`
- `progress ring + exact counts`
- `guardrail banner`
- `open guide side sheet`
- `history drawer`

### Nguyên tắc UX

- gần giấy thật
- chữ to
- thao tác ít
- không animation phức tạp
- không game hóa

## 10.5. Cầu nối giữa content và tracker

Khi user đọc guide và bấm `Bắt đầu thực hành`, FE phải mang theo context:

- case type
- burning mode nếu có
- guide slug/ref

để tracker mở đúng state ban đầu.

# 11. Thiết kế công nghệ và infra

## 11.1. Stack

Giữ đúng hướng repo:

- `apps/web`: Next.js 16 public/member FE
- `apps/api`: NestJS backend authority
- `apps/admin`: custom admin UI
- `PostgreSQL`: canonical data
- `platform/storage`: ảnh, PDF, print template

## 11.2. Storage strategy

Không lặp lại phụ thuộc kiểu `Google Drive` làm nguồn chính.

Nên dùng:

- canonical asset metadata trong Postgres
- file lưu qua `storage` platform
- public CDN URL cho ảnh/PDF đã publish

Tài sản cần quản lý:

- infographic
- image compare đúng/sai
- print template
- PDF hướng dẫn
- preview image

## 11.3. Caching và delivery

Public guides nên:

- render dạng content-first
- cache read aggressively
- invalidate theo publish action

Member tracker thì:

- no-store hoặc short-lived owner fetch
- optimistic update cho `entries`
- idempotency bằng `clientEventId`

## 11.4. Search

Phase 1:

- SQL search cho guide/FAQ/download

Phase 2:

- unified search documents nếu cần

Không cần bật Meilisearch chỉ vì riêng `Ngôi Nhà Nhỏ`.

## 11.5. Audit và versioning

Phần này nhạy cảm, nên bắt buộc:

- publish audit cho content
- version notes khi thay wording quan trọng
- source reference trên các article/block nhạy cảm

# 12. Demo pages nên làm trước

Nếu anh muốn demo sớm mà vẫn đúng kiến trúc, nên ưu tiên 5 màn hình:

1. `Public hub /ngoi-nha-nho`
2. `Guide detail /ngoi-nha-nho/bat-dau`
3. `Guide detail /ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot`
4. `Member tracker /tu-tap/nha-nho`
5. `Admin workspace /admin/noi-dung/ngoi-nha-nho`

Lý do:

- 1 trang chứng minh IA
- 2 trang chứng minh content blocks + ảnh + warning + CTA
- 1 trang chứng minh tracker
- 1 trang chứng minh backend/admin model không bị treo trong lý thuyết

# 13. Roadmap triển khai

## Phase A. Content foundation

- dựng `Little House hub`
- dựng block schema
- import 13 nhóm nội dung
- gắn assets, downloads, FAQ

## Phase B. Admin management

- workspace riêng trong admin
- preview + publish + audit
- version/source management

## Phase C. Tracker cá nhân

- mở rộng engagement schema
- screen `/tu-tap/nha-nho`
- counters + lifecycle actions

## Phase D. Smart bridging

- deep-link từ guide sang tracker
- contextual warning cards
- “chọn trường hợp của tôi”

## Phase E. Search và refinement

- search guide/faq
- related guides
- print/download polish

# 14. Quyết định chốt

1. `Ngôi Nhà Nhỏ` là một `feature surface lớn`, không phải module domain mới.
2. `Content` giữ `ritual truth`; `Engagement` giữ `self-owned state`.
3. User FE phải đi theo `grouped IA + contextual guidance`, không theo menu phẳng 13 mục.
4. Admin phải có workspace riêng cho `Ngôi Nhà Nhỏ`, không dùng form blog chung thuần túy.
5. Phase 1 nên dùng `typed blocks` trước, chỉ tách thêm bảng khi reuse thật sự xuất hiện.
6. Demo nên làm theo thứ tự `hub -> guide detail -> burning guide -> tracker -> admin`.

# 15. SEO & GEO

Feature này có cơ hội SEO rất lớn. Chiến lược đã được chốt riêng:

- `design/seo-geo/strategy.md` — chiến lược SEO/GEO toàn site
- `design/seo-geo/little-house-seo.md` — keyword research, target pages, Featured Snippet strategy
- `design/seo-geo/structured-data.md` — HowTo / FAQPage / BreadcrumbList / ItemList schemas
- `design/seo-geo/geo-citation-strategy.md` — để ChatGPT, Gemini, Perplexity trích dẫn PMTL_VN
- `design/seo-geo/content-cluster-map.md` — pillar/spoke cho 6 clusters

**Tóm tắt ngắn cho developer**:
- `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot` → phải có `HowTo` schema (Featured Snippet)
- `/ngoi-nha-nho/tra-cuu/hoi-dap` → phải có `FAQPage` schema
- Mọi guide page → phải có `BreadcrumbList` schema 4 cấp
- Hub page `/ngoi-nha-nho` → phải có `ItemList` schema (5 nhóm)
- Mọi trang có FAQ block → thêm `FAQPage` schema

# 16. Tech Features đặc thù

Feature Ngôi Nhà Nhỏ có 8 tính năng công nghệ vượt trội đối thủ. Spec đầy đủ:

- `design/02-content/little-house-tech-features.md`

**Tóm tắt phase**:
- **Phase A**: `image_compare` component (cần ngay khi có content)
- **Phase B**: Dynamic PDF Generator (điền sẵn Kính Tặng/Tặng)
- **Phase C**: Smart Quantity Calculator + Lunar, Step Timer, Offline PWA, Anti-mistake Validation
- **Phase D**: Contextual Warning Engine, Practice Companion deep-link

# 17. Việc nên làm tiếp trong repo

Sau file này, các bước tiếp theo hợp lý là:

1. ✅ `design/02-content/little-house-content-inventory.md` — đã tạo, canonical content 13→5
2. ✅ `design/02-content/little-house-tech-features.md` — đã tạo, 8 tech features spec
3. ✅ `design/seo-geo/` — đã tạo đầy đủ 5 files SEO/GEO
4. ✅ `design/ui/PAGE_INVENTORY.md` — đã cập nhật routes Little House (1.4, 1.4a, 1.4b)
5. ✅ `design/06-search/unified-index-mapping.md` — đã thêm `little_house_guide` + `little_house_faq`
6. ✅ `design/04-engagement/schema.dbml` — đã thêm 9 fields + 3 enums mới

**Còn lại (chưa làm)**:
- Scaffold API contracts cho `GET /content/little-house/guide-map` và các endpoints trong §8
- Tạo `design/02-content/use-cases/publish-little-house-guide.md`
- Cập nhật `design/tracking/api-route-inventory.md` khi API được scaffold
- Cập nhật `design/tracking/prisma-schema-plan.md` để gộp 3 enums mới vào Prisma
