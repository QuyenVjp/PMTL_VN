# Daily Practice Experience Architecture

> File này chốt kiến trúc sản phẩm cho phần `Kinh Bài Tập Hằng Ngày` theo hướng `design-first`.
>
> Nó nối 4 lớp vốn đang bị tách rời trong repo:
>
> - hướng dẫn cho người mới
> - preset công khóa theo tình huống
> - bảng công phu cá nhân hằng ngày
> - daily advisory từ lịch âm / ngày đặc biệt
>
> File này không thay thế:
>
> - `design/02-content/practice-support-reference.md`
> - `design/02-content/chant-items-catalog.md`
> - `design/04-engagement/use-cases/manage-practice-sheet.md`
> - `design/07-calendar/use-cases/compose-daily-practice-advisory.md`
>
> Nó là lớp kiến trúc trải nghiệm và điều phối feature cho riêng `Kinh Bài Tập Hằng Ngày`.

# 1. Bài toán thật sự

`Kinh Bài Tập Hằng Ngày` không chỉ là danh sách vài bài niệm.

Nó đồng thời là:

- một `beginner ritual system` cho người mới nhập môn
- một `daily rule surface` với giờ giấc, địa điểm, cách niệm, cách bù, giới hạn
- một `scenario preset system` theo tình huống sống
- một `personal tracking workflow` cho bảng công phu hằng ngày
- một `calendar-bridged practice surface` vì ngày đặc biệt sẽ làm advisory thay đổi

Nếu chỉ làm như:

- thư viện bài niệm rời
- hoặc một PDF nhúng lên web
- hoặc chỉ có `/tu-tap/bai-tap`

thì đều thiếu:

- người mới không hiểu phải bắt đầu từ đâu
- user không biết công khóa cơ bản khác gì `Ngôi Nhà Nhỏ` và `Kinh Văn Tự Tu`
- sheet cá nhân không có context và guardrails
- daily advisory không nối tốt sang thực hành

# 2. Những gì đang có trong repo

Repo hiện đã có backbone đúng:

- `practice-support-reference.md`
  - đã map PDF “Các bước niệm kinh bài tập hằng ngày” sang business structure
- `chant-items-catalog.md`
  - đã có các bài niệm cốt lõi, purpose, preset count, time rules
- `02-content/schema.dbml`
  - đã có `chant_items`, `chant_item_recommended_presets`, `chant_item_time_rules`, `chant_plans`, `chant_plan_items`
- `04-engagement`
  - đã có `practiceSheets`, `practiceLogs`, `chantPreferences`
- `07-calendar`
  - đã có `daily practice advisory`

Nhưng vẫn còn thiếu một `feature architecture` hoàn chỉnh:

- public IA riêng cho `Kinh Bài Tập Hằng Ngày`
- admin workspace riêng
- scenario presets là first-class content surface
- cầu nối rõ giữa guide → advisory → tracker

# 3. Quan sát thực tế từ web Việt và web Trung

## 3.1. Nguồn đã đối chiếu

- Việt:
  - [Hướng Dẫn Niệm Kinh Bài Tập - phapmontamlinh.vn](https://phapmontamlinh.vn/huong-dan-niem-kinh/)
  - [Dành cho người mới - phapmontamlinh.com](https://phapmontamlinh.com/danh-cho-nguoi-moi/)
  - [Kinh bài tập là gì? các vấn đề thường gặp... - phapmontamlinh.vn](https://phapmontamlinh.vn/kinh-bai-tap-la-gi-cac-van-de-thuong-gap-va-nhung-luu-y-khi-niem-kinh-bai-tap/)
- Trung:
  - [每日功课步骤 - 卢台长新加坡心灵法门](https://orientalradio.com.sg/%E6%AF%8F%E6%97%A5%E5%8A%9F%E8%AF%BE%E6%AD%A5%E9%AA%A4/)
  - [每日功课步骤（初学者）PDF - guanyincitta.info](https://www.guanyincitta.info/downloads/xlfm_chinese_guide.pdf)

## 3.2. Pattern ngoài đời

### Pattern A. PDF-first / manual-first

Web Trung và một phần web Việt đang ưu tiên:

- 1 PDF một trang hoặc vài trang
- liệt kê bước 1-7
- người dùng tự tải về và làm theo

Điểm mạnh:

- đúng tài liệu gốc
- ít nguy cơ wording drift

Điểm yếu:

- khó tra cứu nhanh trên mobile
- không có state
- không có branch theo tình huống

### Pattern B. Beginner hub + resource links

Trang “Dành cho người mới” trên web Việt đang gom:

- sách kinh
- bước niệm kinh bài tập
- trình tự thắp tâm hương
- Ngôi Nhà Nhỏ
- phóng sinh

Điểm mạnh:

- người mới biết phải mở gì trước

Điểm yếu:

- vẫn là danh sách link/PDF
- chưa có guided flow

### Pattern C. FAQ / scenario article

Trang FAQ trên web Việt đang có phần rất giá trị:

- định nghĩa `Kinh Bài Tập`
- phân biệt với `Ngôi Nhà Nhỏ` và `Kinh Văn Tự Tu`
- lưu ý về giờ giấc / địa điểm
- cách niệm đúng
- preset theo tình huống:
  - người mới
  - công việc / học hành
  - hóa giải oán kết
  - người cao tuổi
  - bệnh nặng

Điểm mạnh:

- rất hữu ích cho thực hành thật

Điểm yếu:

- bị chôn trong long-form article
- FE khó tái sử dụng

## 3.3. Kết luận benchmark

Những gì nên giữ từ web ngoài:

- beginner hub
- step-by-step manual
- PDF companion
- FAQ
- scenario presets

Những gì nên làm tốt hơn:

- grouped IA thay vì chỉ blog/PDF rời
- typed content blocks
- bridge sang `/tu-tap/bai-tap`
- bridge với `daily advisory`
- admin workspace để quản lý wording/presets/rules/downloads

# 4. Kết luận sản phẩm

`Kinh Bài Tập Hằng Ngày` không nên bị chìm trong:

- generic `beginnerGuides`
- generic `chant library`
- hoặc generic `practice sheet`

Nó nên là một `feature surface lớn`, giống cách đã làm với `Ngôi Nhà Nhỏ`.

Không tạo module mới.

Ownership chuẩn:

- `Content` giữ `ritual truth`
- `Engagement` giữ `practice sheet`, `log`, `preferences`
- `Calendar` giữ `daily advisory composition`
- `Notification` chỉ là downstream reminder delivery

# 5. Information Architecture đề xuất

## 5.1. Public IA

Route canonical:

```text
/kinh-bai-tap
├─ /bat-dau
│  ├─ Kinh bài tập là gì
│  ├─ Khác gì với Ngôi Nhà Nhỏ và Kinh Văn Tự Tu
│  ├─ Bộ công khóa cơ bản cho người mới
│  └─ Tài liệu tải xuống
├─ /cac-buoc
│  ├─ Các bước 1-7
│  ├─ Các chú nhỏ và phần khép lại
│  └─ Tên đầy đủ các kinh/chú cần đọc
├─ /luu-y
│  ├─ Thời gian và địa điểm
│  ├─ Cách niệm đúng
│  ├─ Khi bị gián đoạn hoặc chưa hoàn thành
│  └─ Những điều không nên làm
├─ /theo-tinh-huong
│  ├─ Người mới
│  ├─ Công việc / học hành
│  ├─ Hóa giải oán kết
│  ├─ Người cao tuổi
│  └─ Bệnh nặng
└─ /thuc-hanh
   ├─ Chọn preset phù hợp
   ├─ Xem checklist hôm nay
   └─ Sang tracker cá nhân
```

## 5.2. Vì sao IA này tốt hơn

- giữ toàn bộ cấu trúc người ngoài đang dùng
- nhưng tổ chức theo mental model hiện đại hơn
- dễ SEO hơn chỉ nhúng PDF
- dễ gắn CTA “Bắt đầu thực hành”
- dễ bridge sang member state

# 6. Mapping từ nguồn thực tế sang IA mới

| Pattern nguồn | IA mới |
|---|---|
| PDF bước niệm cho người mới | `/kinh-bai-tap/cac-buoc` + `downloads` |
| Trang “Dành cho người mới” | `/kinh-bai-tap/bat-dau` |
| Bài FAQ / lưu ý | `/kinh-bai-tap/luu-y` + `/theo-tinh-huong` |
| Preset người mới / cao tuổi / bệnh nặng | `/kinh-bai-tap/theo-tinh-huong` |

# 7. Module ownership chuẩn

## 7.1. Content owns

- beginner hub của `Kinh Bài Tập`
- guide pages
- scenario presets
- FAQ
- time/place guardrails
- download panels
- step sequences
- canonical wording của lời khấn mở đầu
- full-name rules cho tên kinh/chú

## 7.2. Engagement owns

- `practiceSheets`
- `practiceLogs`
- `chantPreferences`
- completion state
- optional target customization per user
- sheet context user đang dùng hôm nay

## 7.3. Calendar owns

- daily advisory composition
- chọn ngày hôm nay nên nhấn gì
- sourceRefs và practice sequence cho ngày đặc biệt

## 7.4. Notification owns

- reminder delivery
- không sở hữu nội dung công khóa

# 8. Data model đề xuất

## 8.1. Content phase 1

Tiếp tục dùng:

- `hubPages`
- `beginnerGuides`
- `downloads`
- `chantItems`
- `chantPlans`

Thêm typed blocks cho `Kinh Bài Tập`:

- `hero_intro`
- `quick_summary`
- `step_sequence`
- `core_plan_matrix`
- `scenario_preset_cards`
- `warning_list`
- `do_dont_grid`
- `time_place_rules`
- `faq_block`
- `download_panel`
- `source_reference`

## 8.2. Phase 1.5 nếu reuse nhiều

Tách registry riêng khi cần:

- `daily_practice_scenario_presets`
- `daily_practice_rule_cards`
- `daily_practice_step_sequences`
- `daily_practice_faq_entries`

## 8.3. Engagement phase 1 improvements

`practiceSheets` nên chuẩn bị mở rộng bằng:

- `guideContextRef`
- `scenarioPresetRef`
- `advisoryContextRef`
- `planMode`
- `sheetSource`
- `lastGuidanceAcknowledgedAt`

Lý do:

- biết user đi vào từ beginner preset hay từ advisory
- biết sheet hôm nay đang theo plan nào
- dễ deep-link đúng companion guide

# 9. API surface đề xuất

## 9.1. Public content API

- `GET /content/hub-pages/kinh-bai-tap`
- `GET /content/daily-practice/guide-map`
- `GET /content/daily-practice/guides`
- `GET /content/daily-practice/guides/:slug`
- `GET /content/daily-practice/scenario-presets`
- `GET /content/daily-practice/faq`
- `GET /content/daily-practice/downloads`

## 9.2. Engagement API

- `GET /engagement/practice-sheets`
- `POST /engagement/practice-sheets`
- `GET /engagement/practice-sheets/:publicId`
- `PATCH /engagement/practice-sheets/:publicId`
- `POST /engagement/practice-sheets/:publicId/complete`

Quy tắc:

- `practice sheet` là self-state
- không patch ngược `chantPlans`
- completion là action riêng

## 9.3. Admin API

- `GET /admin/content/daily-practice/overview`
- `POST /admin/content/daily-practice/guides`
- `PATCH /admin/content/daily-practice/guides/:id`
- `POST /admin/content/daily-practice/scenario-presets`
- `PATCH /admin/content/daily-practice/scenario-presets/:id`
- `POST /admin/content/daily-practice/faq`
- `PATCH /admin/content/daily-practice/faq/:id`
- `POST /admin/content/daily-practice/publish`

# 10. Admin FE đề xuất

Route:

```text
/admin/noi-dung/kinh-bai-tap
```

Tabs:

- `Tổng quan`
- `Các bước`
- `Lưu ý`
- `Scenario presets`
- `FAQ`
- `Downloads`
- `Version / nguồn`

Admin này không được chỉ là form bài viết thường.

Nó phải quản lý:

- step sequences
- preset counts
- caution/warning
- source refs
- PDF companion

# 11. User FE đề xuất

## 11.1. Public learning hub

`/kinh-bai-tap`

Màn hình này nên có:

- Kinh Bài Tập là gì
- phân biệt với `Ngôi Nhà Nhỏ` / `Kinh Văn Tự Tu`
- 5 cửa vào lớn
- CTA tải bản PDF chuẩn
- CTA “Bắt đầu thực hành”

## 11.2. Guide detail pages

Ví dụ:

- `/kinh-bai-tap/cac-buoc/cho-nguoi-moi`
- `/kinh-bai-tap/luu-y/thoi-gian-va-dia-diem`
- `/kinh-bai-tap/theo-tinh-huong/benh-nang`

Mỗi trang cần:

- đọc nhanh
- sticky TOC
- time/place warning
- download panel
- CTA sang `/tu-tap/bai-tap`

## 11.3. Member practice sheet

`/tu-tap/bai-tap` không nên chỉ là checklist thuần.

Nó nên có:

- preset selector
- companion guide side sheet
- advisory context card
- checklist item states
- quick note
- completion action

## 11.4. Bridge giữa guide và sheet

Khi user bấm `Bắt đầu thực hành` từ public guide:

- mang theo `scenarioPresetRef`
- mang theo `guideContextRef`
- nếu vào từ advisory thì thêm `advisoryContextRef`

# 12. Advisory integration

`Calendar` advisory không nên copy toàn bộ hướng dẫn.

Nó chỉ nên trả:

- `practiceSequence`
- `recitationRules`
- `sourceRefs`
- `recommendedScenarioPresetRef`

Khi user muốn làm thật:

- mở `/tu-tap/bai-tap`
- hoặc guide detail tương ứng

# 13. Demo pages nên làm trước

1. `/kinh-bai-tap`
2. `/kinh-bai-tap/cac-buoc/cho-nguoi-moi`
3. `/kinh-bai-tap/theo-tinh-huong/benh-nang`
4. `/tu-tap/bai-tap`
5. `/admin/noi-dung/kinh-bai-tap`

# 14. Quyết định chốt

1. `Kinh Bài Tập Hằng Ngày` là `feature surface lớn`, không phải chỉ là chant library.
2. Giữ những gì web ngoài đang làm tốt: PDF chuẩn, step-by-step, FAQ, scenario presets.
3. Vượt web ngoài ở 4 điểm:
   - grouped IA
   - guide-to-tracker bridge
   - advisory integration
   - admin content model typed hơn
4. `Content` giữ `ritual truth`, `Engagement` giữ self-state, `Calendar` giữ advisory.
