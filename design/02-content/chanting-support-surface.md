# CHANTING_SUPPORT_SURFACE

File này chốt `public route + display model` cho các surface hỗ trợ niệm kinh.
Mục tiêu là chặn việc FE chỉ có data rồi render thành 1 cục text dài vô chủ.

> Canon refs:
> - `design/ui/PAGE_INVENTORY.md`
> - `design/tracking/page-loader-contracts.md`
> - `design/tracking/api-dto-shape-plan.md`
> - `design/02-content/chant-items-catalog.md`
> - `design/02-content/daily-practice-experience-architecture.md`

---

## 1. Route model

Public chanting support phải tách thành 4 loại surface:

1. `hub`
   - route: `/niem-kinh`
   - dùng để điều hướng người mới và người đã có nhu cầu rõ
2. `chant item detail`
   - route: `/niem-kinh/[slug]`
   - dùng cho từng bài niệm đơn lẻ
3. `ritual detail`
   - route: `/niem-kinh/nghi-thuc/[slug]`
   - dùng cho flow nhiều bước như `thắp tâm hương`
4. `plan detail`
   - route: `/niem-kinh/ke-hoach/[slug]`
   - dùng cho plan công khóa hoặc ritual support plan
5. `environment rules`
   - route: `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
   - dùng cho luật `time/place/environment/body-state`

Không được gộp `chant item`, `ritual`, `plan`, `guide`, `environment rules` vào cùng 1 kiểu page detail.

---

## 2. Hub `/niem-kinh`

Trang này không phải chỉ là `library`.
Nó là `support hub` cho toàn bộ luồng niệm kinh.

Hub phải có các section:

- `Bắt đầu từ đây`
  - card sang guide công khai `/kinh-bai-tap/*`
  - card sang ritual mở đầu như `thắp tâm hương`
- `Nghi thức thường dùng`
  - ritual template cards
- `Bài niệm`
  - chant item cards
- `Kế hoạch gợi ý`
  - chant plan cards
- `Lưu ý quan trọng`
  - FAQ / time-place rules / warning snippets
- `Môi trường & thời gian`
  - card sang `/niem-kinh/luu-y-moi-truong-va-thoi-gian`

Primary CTA phải giúp user đi theo 1 trong 3 hướng:

- đọc `guide`
- mở `nghi thức`
- bắt đầu `thực hành`

---

## 3. Ritual detail `/niem-kinh/nghi-thuc/[slug]`

Đây là surface đúng cho `thắp tâm hương`.

Trang ritual detail phải render như `guided flow`, không phải long-form article.

Anatomy bắt buộc:

- header
  - `title`
  - `summary`
  - `context badge`
- preparation card
  - nơi chốn / điều kiện / vật tham chiếu
- stepper
  - tổng số bước
  - trạng thái hiện tại
- step cards
  - nhãn loại bước:
    - `Chuẩn bị`
    - `Quán tưởng`
    - `Niệm thầm`
    - `Lạy`
    - `Kết thúc`
  - số lần / số biến phải nổi bật
  - condition note nếu có
- condensed mode
  - `Xem nhanh 9 bước`
- expanded mode
  - `Xem chi tiết từng bước`
- closing note
  - điều cần nhớ sau khi hoàn tất

`Thắp tâm hương` phải luôn giữ distinction hiển thị:

- step nào là `quán tưởng`
- step nào là `niệm thầm`
- step nào có `7/13` biến theo điều kiện

Không được để user phải tự đọc một đoạn dài rồi tự tách bước trong đầu.

---

## 4. Chant item detail `/niem-kinh/[slug]`

Trang này dành cho từng bài niệm đơn lẻ.
Không nhét ritual flow nhiều bước vào đây.

Anatomy:

- title
- audio
- bilingual text
- recommended counts
- time rules
- related rituals
- related plans
- optional practice log CTA

Nếu item được dùng trong ritual như `thắp tâm hương`, trang này chỉ hiện `used in ritual` refs.
Không embed toàn bộ ritual sequence ở item detail.

---

## 5. Plan detail `/niem-kinh/ke-hoach/[slug]`

Trang này dành cho plan có thứ tự.

Anatomy:

- title + purpose
- estimated duration
- entry requirements
- ordered sections
  - mỗi section ghi rõ:
    - ritual mở đầu
    - chant items chính
    - closing items
- related ritual template card
- CTA sang tracker hoặc guide nếu applicable

Plan detail phải giúp user biết:

- bắt đầu từ đâu
- thứ tự ra sao
- có ritual mở đầu nào phải làm trước

---

## 6. Bridge rules sang các surface khác

### Guide -> Ritual

Từ `guide` công khai như `/kinh-bai-tap/*`:

- card hoặc inline block có thể deep-link sang `/niem-kinh/nghi-thuc/thap-tam-huong`
- không copy nguyên ritual flow vào guide nếu ritual đã có owner detail page

### Ritual -> Tracker

Từ ritual detail:

- CTA `Xong phần chuẩn bị, bắt đầu thực hành`
- chuyển sang `/tu-tap/bai-tap` với context phù hợp nếu member flow tồn tại

### Hub -> Guide

Người mới nên được đưa về guide trước nếu chưa biết ngữ cảnh.
Hub không ép user nhảy thẳng vào chant item detail nếu họ cần guided context.

### Environment rules -> Feature surfaces

Từ `/niem-kinh/luu-y-moi-truong-va-thoi-gian`:

- `Kinh Bài Tập` có thể nhúng `time warning card`, `environment checklist`
- `Ngôi Nhà Nhỏ` chỉ lấy subset phù hợp như `quality focus`, `bệnh viện`, `non-interpretive caution`
- `Kinh Văn Tự Tu` lấy subset về giờ giấc và môi trường cơ bản

Feature surfaces không giữ bản sao wording riêng nếu chỉ là cùng một rule môi trường.

---

## 7. Rule cho các ritual/support surface khác

Cùng nguyên tắc này phải áp dụng cho:

- `thắp tâm hương`
- `phát nguyện`
- `phóng sinh`
- `Ngôi Nhà Nhỏ` opening/burning support flows

Tức là:

- `chant item` không đủ để biểu diễn ritual nhiều bước
- phải có ritual owner hoặc guide owner rõ
- FE không được giải quyết bằng cách hardcode text trong component

---

## 8. Non-negotiables

- Public chanting support không được chỉ có `library list + detail text`.
- Ritual nhiều bước phải có route detail riêng.
- Rule `time/place/environment` phải có route canon riêng.
- Step labels và step counts phải visible ngay trên fold.
- Mobile phải đọc được từng bước mà không cần zoom hay cuộn một khối text quá dài.
- Mọi CTA từ hub/guide/ritual sang tracker phải mang context, không chỉ là link trần.
