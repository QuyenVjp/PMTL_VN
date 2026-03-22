# Wisdom-QA Family Audit

> File này chốt audit pass theo từng family cho `10-wisdom-qa`.
> Mục tiêu: không để `apps/web`, `apps/admin`, `apps/api`, và search/index scaffold phải tự đoán taxonomy.

---

## 1. Family inventory

| Family | Canonical owner | Canonical data class | Public surface |
|---|---|---|---|
| `Bạch thoại Phật pháp` | `10-wisdom-qa` | `wisdomEntries` | `/bach-thoai` + detail `/bach-thoai/[slug]` |
| `Wenda / Hỏi đáp` | `10-wisdom-qa` | `qaEntries` | `/bach-thoai` tab/filter `Hỏi đáp` + detail `/bach-thoai/[slug]` |
| `Khai thị` | `10-wisdom-qa` | `wisdomEntries` | `/bach-thoai` tab/filter `Khai thị` + detail `/bach-thoai/[slug]` |
| `Phật ngôn / aphorism` | `10-wisdom-qa` | `wisdomEntries` | `/bach-thoai` detail |
| `Pháp hội / event discourse` | `10-wisdom-qa` | `wisdomEntries` | `/bach-thoai` detail; có thể deep-link từ event surface |
| `Authority profile` | `10-wisdom-qa` | `authorityProfiles` | chưa mở public route canon riêng |
| `Bạch thoại audiobook` | `10-wisdom-qa` | `baihuaBooks` + `wisdomEntries` + `baihuaAudioTracks` | `/bach-thoai/sach-noi/*` |
| `Offline bundles` | `10-wisdom-qa` | `offlineBundles` + projection items | member offline + admin rebuild workspace |
| `Search / retrieval` | `06-search` runtime owner, `10-wisdom-qa` source owner | unified search documents | `/tim-kiem` + scoped search trong `/bach-thoai` |

---

## 2. Fixed in this pass

- route canon đã bỏ `/bai-hoa`, dùng `/bach-thoai`
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

### 3.5 Offline control model

- Hiện đã rõ projection/bundle direction, nhưng còn cần chốt rõ hơn:
  - curated bundle
  - member-derived bundle
  - auto-sync policy
  - stale manifest policy

---

## 4. Anti-drift rules

- Không route-invent riêng `/bach-thoai/hoi-dap` nếu canon chưa đổi
- Không route-invent `/bach-thoai/quyen-*`; audiobook đi qua `/bach-thoai/sach-noi/[bookSlug]`
- `posts` không được làm owner canonical cho doctrine/Q&A
- Search results phải trả đủ `docType` + `entryType` + `sourceFamily`
- Admin workspace phải hiện taxonomy bằng field thật, không đoán bằng title

---

## 5. Suggested next audit order

1. `authorityProfiles` public route decision
2. `event_discourse` response shape between `07-calendar` and `10-wisdom-qa`
3. `aphorism / Phật ngôn`
4. offline bundle control model
5. search API/query param parity across `06-search` + UI docs + route inventory
