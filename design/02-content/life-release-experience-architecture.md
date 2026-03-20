# Life Release Experience Architecture

> File này chốt kiến trúc sản phẩm cho phần `Phóng Sanh`.
>
> Nó nối 4 lớp hiện đang rời nhau:
>
> - hướng dẫn nghi thức phóng sanh
> - lời khấn và biến thể theo ngữ cảnh
> - journal cá nhân của member
> - reminder/advisory theo ngày đặc biệt
>
> File này không thay thế:
>
> - `design/02-content/practice-support-reference.md`
> - `design/02-content/practice-ui-checklists.md`
> - `design/02-content/chant-items-catalog.md`
> - `design/09-vows-merit/use-cases/log-life-release.md`

# 1. Bài toán thật sự

`Phóng Sanh` không chỉ là một form journal.

Nó đồng thời là:

- một `ritual guide surface`
- một `situational branching surface`
- một `member journal workflow`
- một `calendar-bridged practice surface`

Nếu chỉ có:

- bài viết dài
- hoặc PDF rời
- hoặc `/phong-sanh/ghi-lai`

thì đều thiếu:

- người mới không biết phải chuẩn bị gì
- user không biết nên dùng mẫu khấn nào cho bản thân hay cho người khác
- journal không có companion guide
- advisory không deep-link đúng vào nghi thức

# 2. Những gì đang có trong repo

Repo hiện đã có backbone đúng:

- `practice-support-reference.md`
  - đã map tài liệu `Nghi thức phóng sinh`
- `practice-ui-checklists.md`
  - đã có stepper, checklist, branch `for_self` / `for_other_person`
- `chant-items-catalog.md`
  - đã có các bài niệm và mẫu khấn liên quan
- `09-vows-merit`
  - đã có `lifeReleaseJournal` owner module và assisted-entry workflow
- `07-calendar`
  - đã có advisory hooks cho ngày phóng sanh / ngày đặc biệt

Nhưng vẫn thiếu:

- public IA rõ cho phần nghi thức phóng sanh
- admin workspace riêng để biên tập nội dung nhạy cảm
- ritual variants là first-class content surface
- cầu nối rõ giữa guide -> member journal

# 3. Quyết định IA

## 3.1. Route strategy

Giữ tách rõ:

- public guide:
  - `/huong-dan/phong-sanh`
  - `/huong-dan/phong-sanh/[slug]`
- member self-state:
  - `/phong-sanh`
  - `/phong-sanh/ghi-lai`

Lý do:

- không trộn public content với journal cá nhân
- khớp `seo-geo/content-cluster-map.md`
- tránh xung đột route và ownership

## 3.2. Owner boundary

- `02-content` giữ:
  - guide hub
  - ritual steps
  - prayer scripts
  - ritual variants
  - warnings
  - downloads
  - FAQ
- `09-vows-merit` giữ:
  - `lifeReleaseJournal`
  - assisted-entry support flow
  - linked vow/progress effects
- `07-calendar` chỉ giữ:
  - advisory và day context
- `08-notification` chỉ là downstream reminder

# 4. Source-derived ritual structure

Từ tài liệu đã map trong repo, flow canonical nên đi theo cụm:

1. chuẩn bị và đến nơi
2. cảm ân / cung thỉnh
3. khấn chính
4. tụng kinh/chú trước khi thả
5. thả chúng sinh nhẹ nhàng
6. xử lý trường hợp tử vong ngoài ý muốn
7. cảm ân kết thúc

## 4.1. Những gì phải thành typed content

- `step_sequence`
- `script_block`
- `ritual_variant`
- `chant_count_matrix`
- `warning_list`
- `required_items`
- `faq_block`
- `download_panel`

## 4.2. Ritual variants bắt buộc

- `for_self`
- `for_other_person`
- `on_the_way`
- `accidental_death_handling`

Các variant này không được chôn trong một bài dài duy nhất.

# 5. Gợi ý public IA

```text
/huong-dan/phong-sanh
├─ /nghi-thuc-co-ban
├─ /cho-ban-than
├─ /cho-nguoi-khac
├─ /luu-y-va-chuan-bi
├─ /xu-ly-khi-co-loai-vat-tu-vong
└─ /hoi-dap
```

## 5.1. Hub page

`/huong-dan/phong-sanh`

Nên có:

- định nghĩa ngắn
- khi nào nên mở guide này
- quick chooser:
  - `Tôi phóng sanh cho chính mình`
  - `Tôi phóng sanh thay người khác`
  - `Tôi cần xem nghi thức từng bước`
  - `Tôi cần biết lưu ý`
- CTA sang journal member

## 5.2. Detail pages

Mỗi page detail nên có:

- summary box đầu trang
- step sequence hoặc script block
- warnings
- ritual variant card liên quan
- CTA `Mở sổ tay phóng sanh`

# 6. Member surface

## 6.1. `/phong-sanh`

Không chỉ là list journal.

Nó nên có:

- recent entries
- summary theo tháng
- shortcut sang guide hiện đang phù hợp
- advisory/preset card nếu vào từ ngày đặc biệt

## 6.2. `/phong-sanh/ghi-lai`

Form journal nên có:

- thông tin factual của buổi phóng sanh
- `guideContextRef`
- `ritualVariantRef`
- companion panel mở đúng script / checklist đã dùng

Journal không phải nơi sở hữu full ritual truth.

# 7. Admin workspace

Route:

`/admin/noi-dung/phong-sanh`

Tabs nên có:

- Tổng quan
- Nghi thức cơ bản
- Variants
- Lưu ý & chuẩn bị
- FAQ
- Downloads & nguồn
- Version & review notes

Validation bắt buộc:

- script wording nhạy cảm phải có `sourceReference`
- biến thể `cho người khác` phải chỉ rõ placeholder tên người được hồi hướng
- species-specific counts phải có review note

# 8. API surface

## 8.1. Public content

- `GET /content/hub-pages/phong-sanh`
- `GET /content/life-release/guide-map`
- `GET /content/life-release/guides`
- `GET /content/life-release/guides/:slug`
- `GET /content/life-release/ritual-variants`
- `GET /content/life-release/faq`
- `GET /content/life-release/downloads`

## 8.2. Admin editorial

- `GET /admin/content/life-release/overview`
- `POST /admin/content/life-release/guides`
- `PATCH /admin/content/life-release/guides/:id`
- `POST /admin/content/life-release/ritual-variants`
- `PATCH /admin/content/life-release/ritual-variants/:id`
- `POST /admin/content/life-release/faq`
- `PATCH /admin/content/life-release/faq/:id`
- `POST /admin/content/life-release/publish`

## 8.3. Member journal bridge

`vows-merit` vẫn là owner:

- `GET /life-release-journal`
- `POST /life-release-journal`
- `GET /life-release-journal/:publicId`
- `PATCH /life-release-journal/:publicId`

Nhưng payload nên cho phép context refs:

- `guideContextRef`
- `ritualVariantRef`
- `advisoryContextRef`

# 9. Những gì PMTL nên làm thông minh hơn web ngoài

Web ngoài thường chỉ có:

- PDF
- bài dài
- lời khấn text thuần

PMTL nên hơn ở 4 điểm:

1. guide và journal nối với nhau
2. variant `cho mình / cho người khác / xử lý tử vong` là first-class
3. warning hiển thị đúng lúc, không chôn cuối bài
4. member có thể xem lại nguồn chuẩn ngay trong flow ghi journal

# 10. Demo pages nên ưu tiên

1. `/huong-dan/phong-sanh`
2. `/huong-dan/phong-sanh/nghi-thuc-co-ban`
3. `/huong-dan/phong-sanh/cho-nguoi-khac`
4. `/phong-sanh`
5. `/phong-sanh/ghi-lai`
6. `/admin/noi-dung/phong-sanh`
