# SEARCH_UX_CONTRACT

File này chốt search UX cho `apps/web`.
Nó không thay DTO/API canon. Nó chốt:

- người dùng tìm ở đâu
- state nào nằm ở URL
- tab/filter/result/no-result/error render ra sao

> Page canon: `design/ui/PAGE_INVENTORY.md`
> User flows: `design/ui/USER_FLOWS.md`
> Loader owner: `design/tracking/page-loader-contracts.md`
> DTO owner: `design/tracking/api-dto-shape-plan.md`

---

## Search surfaces

### Primary public search

- Route:

```text
/tim-kiem
```

- Đây là public federated search entrypoint.
- Tìm được tối thiểu:
  - Bạch thoại
  - Hỏi đáp
  - Khai thị
  - Bài viết

### Search mini entry

- xuất hiện ở:
  - homepage
  - posts listing
  - wisdom hubs
- mini search chỉ là launcher/shortcut
- canonical result surface vẫn là `/tim-kiem`

---

## Query model

### URL as source of truth

Search state canonical phải nằm ở URL:

- `q`
- `tab`
- page/pagination params
- applied filters có ý nghĩa shareable

Không để canonical search state chỉ nằm ở local component state.

### Baseline interaction

- Search page dùng `submit search` làm baseline
- filter/tab/sort có thể refetch ngay sau khi user đã ở search page
- không dùng typeahead-as-primary-results baseline cho phase đầu

Lý do:
- dễ giữ URL canon
- ít tạo cancellation/noise hơn
- hợp với content discovery hơn là command palette

---

## Result anatomy

### Required zones

Search results page phải có:

1. query summary
2. result tabs
3. filter panel
4. results list
5. pagination or load-more owner
6. no-result/help state

### Tabs

Tabs tối thiểu:
- `Tất cả`
- `Bạch thoại`
- `Hỏi đáp`
- `Khai thị`
- `Bài viết`

Rules:
- tab counts đến từ aggregate/API
- không để client tự quét list rồi đếm
- active tab phải nằm ở URL

### Filters

Phase đầu chỉ bật filter thật sự có API support.
Không render filter giả.

Filters có thể có:
- content type
- source family
- date range
- tags/topic

Rules:
- filter panel state được preserve hợp lý khi user quay lại route
- filter values canonical phải nằm ở URL nếu chúng thay đổi result set

---

## Result card contract

Mỗi result card tối thiểu phải hiện:
- content type badge
- title
- excerpt/highlight
- source/family hint nếu quan trọng
- route destination rõ

Nếu là Q&A/Wenda:
- phải làm nổi source attribution hơn content thường

Nếu là Bạch thoại/Khai thị:
- card phải giữ tông editorial, không nhìn như FAQ utilitarian card

---

## Empty / no-result / error states

### No result

Không dùng empty state trống rỗng kiểu:

```text
No results found
```

Phải có:
- message ngắn giải thích
- gợi ý đổi từ khóa
- suggested queries hoặc nearby tags nếu có

### Error state

Phải phân biệt:
- query invalid
- backend/search unavailable
- degraded fallback engine

Nếu engine fallback/degraded:
- UI có thể hiện badge nhỏ
- nhưng không đẩy technical panic ra màn hình chính

---

## Search + wisdom relationship

- `/tim-kiem` là federated entrypoint
- `/bach-thoai` và `/hoi-dap` là hub surfaces riêng
- không để `/bach-thoai` phải gánh role của global search page
- wisdom hubs có thể có local search/filter scope riêng, nhưng không thay thế `/tim-kiem`

---

## Open product decisions still needing owner input

- phase đầu có cần instant query suggestion khi gõ không
- pagination vs load-more cho `/tim-kiem`
- filter set đầu tiên chính xác gồm những gì
- có hiển thị recent searches cho signed-in user hay không
