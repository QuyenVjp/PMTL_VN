# Wisdom-QA Family Audit

> File này chốt audit pass theo từng family cho domain `wisdom-qa`.
> Mục tiêu: không để `apps/web`, `apps/admin`, `apps/api`, và search/index scaffold phải tự đoán taxonomy.

---

## 1. Family inventory

| Family | Canonical owner | Canonical data class | Public surface |
|---|---|---|---|
| `Bạch thoại Phật pháp` | `wisdom-qa` | `wisdomEntries` | `/bach-thoai` + detail `/bach-thoai/[slug]` |
| `Wenda / Hỏi đáp` | `wisdom-qa` | `qaEntries` | `/hoi-dap` + detail `/hoi-dap/[slug]` |
| `Khai thị` | `wisdom-qa` | `wisdomEntries` | search filter / related cards / detail labels; chưa mở public top-level route canon |
| `Phật ngôn / aphorism` | `wisdom-qa` | `wisdomEntries` | `/bach-thoai` detail |
| `Pháp hội / event discourse` | `wisdom-qa` | `wisdomEntries` | `/bach-thoai` detail; có thể deep-link từ event surface |
| `Authority profile` | `wisdom-qa` | `authorityProfiles` | chưa mở public route canon riêng |
| `Bạch thoại audiobook` | `wisdom-qa` | `baihuaBooks` + `wisdomEntries` + `baihuaAudioTracks` | `/bach-thoai/sach-noi/*` |
| `Offline bundles` | `wisdom-qa` | `offlineBundles` + projection items | member offline + admin rebuild workspace |
| `Search / retrieval` | `search` runtime owner, `wisdom-qa` source owner | unified search documents | `/tim-kiem` + scoped search trong `/bach-thoai` |

---

## 2. Fixed in this pass

- route canon đã bỏ `/bai-hoa`, dùng `/bach-thoai`
- official alignment pass từ `xlch.org` đã chốt `Hỏi đáp` là family riêng, không còn treo như tab của `/bach-thoai`
- `BHFF` đã bỏ khỏi docs tiếng Việt, dùng `BTPP`
- `qaEntries` vs `wisdomEntries` đã được anti-duplication hóa: không publish lại như `posts`
- `sourceFamily` đã được chốt trong schema/search/contracts:
  - wisdom: `btpp_video`, `btpp_radio`, `zongshu`, `guide_manual`
  - qa: `wenda`, `mail_qa`
- search docs giờ có `entryType` + `sourceFamily`
- admin workspace `bach-thoai` đã được mô tả thành first-class module
- `authorityProfiles` đã được chốt là admin-first surface; public route vẫn intentionally chưa mở
- `event_discourse` vs `Calendar` đã được chốt rõ hơn: event shell ở `calendar`, discourse/transcript ở `wisdom-qa`, event page chỉ giữ refs

---

## 3. Open gaps after this pass

### 3.1 Authority profiles

- Public route canon vẫn intentionally chưa mở
- Nếu sau này mở public route, cần chốt:
  - route pattern
  - search doc inclusion
  - FE card/layout rules cho fact vs translated profile vs doctrinal claims

### 3.2 Phật ngôn / aphorism

- Có mặt trong module map và publish rules, nhưng chưa có ingest example cụ thể
- Chưa có public labeling rules rõ bằng `BTPP`, `Hỏi đáp`, `Khai thị`

### 3.3 Pháp hội / event discourse

- Đã rõ hơn: event discourse vẫn là `wisdomEntries`, còn `Calendar` chỉ giữ relation refs
- Nhưng vẫn chưa có response-shape doc riêng cho `relatedWisdomPublicIds` / lightweight source refs trên event detail

### 3.4 Search filter parity

- Search docs đã có `entryType` + `sourceFamily`, nhưng API route inventory chưa mô tả query params này đủ rõ
- Cần chắc `apps/web` scoped search và global search dùng cùng filter vocabulary

### 3.5 Official XLCH alignment outside Wisdom-QA

- Source official đang nhấn rất mạnh `初学入门` với 6 trụ cột
- PMTL hiện còn gap chưa owner đủ sâu ở:
  - `佛台供设`
  - `各类升文`
- Cần quyết định hai family này nằm ở module public nào trước khi scaffold tiếp

### 3.6 Offline control model

- Hiện đã rõ projection/bundle direction, nhưng còn cần chốt rõ hơn:
  - curated bundle
  - member-derived bundle
  - auto-sync policy
  - stale manifest policy

### 3.7 Curated highlights vs canonical entries

- `精选开示` trên source official là một kiểu curated surface, không phải tín hiệu đủ mạnh để tạo owner data class mới
- Nếu PMTL mở curated highlights, nó nên là projection/read-model từ `wisdomEntries` đã duyệt
- Không được ingest `精选开示` như family doctrine mới nếu canonical source vẫn là `Khai thị` hoặc `Pháp hội`

### 3.8 Sensitive family: `现场图腾`

- Đây là family nhạy cảm hơn `Wenda` hoặc `BTPP`
- Chưa đủ policy trong design hiện tại để mở public surface an toàn
- Nếu muốn đưa vào hệ thống, cần chốt trước:
  - source provenance rules
  - moderation / disclaimer policy
  - search exposure policy
  - admin review gate riêng

### 3.9 Testimony / `同修分享`

- Official source có `同修分享`, nhưng loại này không nên trở thành canonical doctrine owner
- Nếu PMTL nhận family này, owner hợp lý thiên về `community` hoặc curated support surface
- Không được gộp `同修分享` vào `wisdomEntries` chỉ vì nó nằm gần `法会开示`

---

## 4. Anti-drift rules

- Không route `qaEntries` qua `/bach-thoai/[slug]`
- Không route-invent riêng `/bach-thoai/hoi-dap`; family này có route canon riêng là `/hoi-dap`
- Không route-invent `/bach-thoai/quyen-*`; audiobook đi qua `/bach-thoai/sach-noi/[bookSlug]`
- `posts` không được làm owner canonical cho doctrine/Q&A
- Search results phải trả đủ `docType` + `entryType` + `sourceFamily`
- Admin workspace phải hiện taxonomy bằng field thật, không đoán bằng title

---

## 5. Suggested next audit order

1. `authorityProfiles` public route decision
2. `event_discourse` response shape between `calendar` and `wisdom-qa`
3. `aphorism / Phật ngôn`
4. offline bundle control model
5. search API/query param parity across `search` + UI docs + route inventory
6. taxonomy/policy cho `现场图腾`
7. owner decision cho `同修分享`
