# Content Cluster Map — PMTL_VN

> File này chốt kiến trúc content cluster (pillar + spoke) cho toàn site PMTL_VN.
> Mục tiêu: mỗi topic lớn có 1 pillar page + nhiều spoke pages, liên kết chặt chẽ.
>
> Đọc cùng: `design/seo-geo/strategy.md`, `design/seo-geo/little-house-seo.md`

---

## 1. Tổng quan — 6 Cluster chính

```
PMTL_VN Content Hub
├─ Cluster 1: Ngôi Nhà Nhỏ          [Pillar: /ngoi-nha-nho]
├─ Cluster 2: Niệm Kinh              [Pillar: /niem-kinh]
├─ Cluster 3: Phát Nguyện            [Pillar: /huong-dan/phat-nguyen]
├─ Cluster 4: Phóng Sanh             [Pillar: /huong-dan/phong-sanh]
├─ Cluster 5: Bạch Thoại Phật Pháp  [Pillar: /bai-hoa]
├─ Cluster 6: Đại Sám Hối           [Pillar: /huong-dan/dai-sam-hoi]
└─ Cross-cluster: Tra Cứu / Hỏi Đáp [/tim-kiem + Wisdom-QA]
```

---

## 2. Cluster 1: Ngôi Nhà Nhỏ

**Pillar**: `/ngoi-nha-nho`
**Keyword chính**: `ngôi nhà nhỏ`

### Spoke pages

| Trang | Route | Keyword |
|---|---|---|
| Bắt đầu — Tổng quan | `/ngoi-nha-nho/bat-dau` | `ngôi nhà nhỏ là gì` |
| Hiệu dụng | `/ngoi-nha-nho/bat-dau/hieu-dung` | `hiệu dụng ngôi nhà nhỏ` |
| Kết cấu 27/49/84/87 | `/ngoi-nha-nho/bat-dau/ket-cau` | `các loại ngôi nhà nhỏ` |
| Phật cụ cần thiết | `/ngoi-nha-nho/bat-dau/phat-cu` | `cần gì để niệm ngôi nhà nhỏ` |
| Lưu ý trước khi niệm | `/ngoi-nha-nho/tri-tung/luu-y` | `lưu ý niệm ngôi nhà nhỏ` |
| Trình tự các bước | `/ngoi-nha-nho/tri-tung/cac-buoc` | `trình tự niệm ngôi nhà nhỏ` |
| Cách điền Kính Tặng / Tặng | `/ngoi-nha-nho/tri-tung/kinh-tang` | `cách điền kính tặng` |
| Cách chấm đỏ | `/ngoi-nha-nho/tri-tung/cham-do` | `cách chấm đỏ ngôi nhà nhỏ` |
| Quy trình đốt | `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot` | `quy trình đốt ngôi nhà nhỏ` |
| Lưu ý khi đốt | `/ngoi-nha-nho/dot-va-hau-xu-ly/luu-y-dot` | `lưu ý khi đốt ngôi nhà nhỏ` |
| Bảo quản | `/ngoi-nha-nho/dot-va-hau-xu-ly/bao-quan` | `bảo quản ngôi nhà nhỏ` |
| Hủy bỏ khi sai | `/ngoi-nha-nho/dot-va-hau-xu-ly/huy-bo` | `hủy bỏ ngôi nhà nhỏ viết sai` |
| Số lượng theo tình huống | `/ngoi-nha-nho/tra-cuu/so-luong` | `số lượng ngôi nhà nhỏ` |
| Hỏi đáp | `/ngoi-nha-nho/tra-cuu/hoi-dap` | `hỏi đáp ngôi nhà nhỏ` |
| In ấn / Tải xuống | `/ngoi-nha-nho/tra-cuu/in-an` | `in ngôi nhà nhỏ` |

**Liên kết internal**:
- Mỗi spoke → Pillar (breadcrumb + "Xem tổng quan")
- Pillar → Tất cả spokes
- Spoke cuối nhóm → spoke đầu nhóm tiếp ("Bước tiếp theo")
- Tất cả → `/tu-tap/nha-nho` (CTA thực hành)

---

## 3. Cluster 2: Niệm Kinh

**Pillar**: `/niem-kinh`
**Keyword chính**: `niệm kinh pháp môn tâm linh`

### Spoke pages

| Trang | Route | Keyword |
|---|---|---|
| Kinh bài tập hằng ngày | `/niem-kinh/bai-tap` | `kinh bài tập hằng ngày` |
| Chú Đại Bi | `/niem-kinh/chu-dai-bi` | `niệm chú đại bi` |
| Bát Nhã Tâm Kinh | `/niem-kinh/bat-nha-tam-kinh` | `bát nhã tâm kinh` |
| Lưu ý khi niệm kinh | `/niem-kinh/luu-y` | `lưu ý khi niệm kinh` |
| Thời gian niệm kinh | `/niem-kinh/thoi-gian` | `thời gian tốt nhất để niệm kinh` |
| Dâng hương | `/niem-kinh/dang-huong` | `quy trình dâng hương` |

**Liên kết ngang** (cross-cluster):
- Niệm kinh → Ngôi Nhà Nhỏ (vì Chú Đại Bi dùng trong quy trình đốt)
- Niệm kinh → Phát Nguyện (niệm kinh hỗ trợ nguyện)

---

## 4. Cluster 3: Phát Nguyện

**Pillar**: `/huong-dan/phat-nguyen`
**Keyword chính**: `phát nguyện pháp môn tâm linh`

### Spoke pages

| Trang | Route | Keyword |
|---|---|---|
| Phát nguyện là gì | `/huong-dan/phat-nguyen/la-gi` | `phát nguyện là gì` |
| Cách phát nguyện | `/huong-dan/phat-nguyen/cach-thuc-hien` | `cách phát nguyện` |
| Mẫu phát nguyện | `/huong-dan/phat-nguyen/mau` | `mẫu lời phát nguyện` |
| Theo dõi nguyện | `/phat-nguyen` (member) | — |

**Liên kết ngang**:
- Phát Nguyện → Niệm Kinh (nguyện liên quan đến kinh)
- Phát Nguyện → Phóng Sanh (nguyện phóng sanh phổ biến)

---

## 5. Cluster 4: Phóng Sanh

**Pillar**: `/huong-dan/phong-sanh`
**Keyword chính**: `phóng sanh pháp môn tâm linh`

### Spoke pages

| Trang | Route | Keyword |
|---|---|---|
| Nghi thức phóng sanh cơ bản | `/huong-dan/phong-sanh/nghi-thuc-co-ban` | `nghi thức phóng sanh` |
| Mẫu khấn cho bản thân | `/huong-dan/phong-sanh/cho-ban-than` | `mẫu khấn phóng sanh cho bản thân` |
| Mẫu khấn cho người khác | `/huong-dan/phong-sanh/cho-nguoi-khac` | `mẫu khấn phóng sanh cho người khác` |
| Lưu ý và chuẩn bị | `/huong-dan/phong-sanh/luu-y-va-chuan-bi` | `lưu ý khi phóng sanh` |
| Xử lý khi có loài vật tử vong | `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong` | `phóng sanh có con vật chết phải làm sao` |
| Hỏi đáp | `/huong-dan/phong-sanh/hoi-dap` | `hỏi đáp phóng sanh` |
| Ghi nhật ký phóng sanh | `/phong-sanh` (member) | — |

**Liên kết internal**:
- Pillar → tất cả guides P0
- `nghi-thuc-co-ban` → `cho-ban-than` và `cho-nguoi-khac`
- `luu-y-va-chuan-bi` → `nghi-thuc-co-ban`
- tất cả guides → `/phong-sanh/ghi-lai` (CTA thực hành)

---

## 6. Cluster 5: Bạch Thoại Phật Pháp

**Pillar**: `/bai-hoa`
**Keyword chính**: `bạch thoại phật pháp`

### Spoke pages (theo Quyển)

| Trang | Route | Keyword |
|---|---|---|
| Tổng quan BHFF | `/bai-hoa` | `bạch thoại phật pháp là gì` |
| Quyển 1 | `/bai-hoa/quyen-1` | `bạch thoại phật pháp quyển 1` |
| Quyển 2 | `/bai-hoa/quyen-2` | `bạch thoại phật pháp quyển 2` |
| ... | ... | ... |
| Hỏi đáp (Wenda) | `/bai-hoa/hoi-dap` | `hỏi đáp pháp môn tâm linh` |

> **URL chuẩn hóa quan trọng**: Competitor dùng `/bach-thoai-phat-phap/` với URL percent-encoding cho quyển/tập.
> PMTL_VN phải dùng `/bai-hoa/quyen-1/tap-01` — ASCII hoàn toàn.

**Liên kết ngang**:
- BHFF → Wisdom-QA search (tìm theo chủ đề)
- BHFF → Offline bundles (tải về đọc offline)

---

## 7. Cluster 6: Đại Sám Hối

**Pillar**: `/huong-dan/dai-sam-hoi`
**Keyword chính**: `đại sám hối pháp môn tâm linh`

### Spoke pages

| Trang | Route | Keyword |
|---|---|---|
| Đại Sám Hối là gì | `/huong-dan/dai-sam-hoi/la-gi` | `đại sám hối là gì` |
| Số biến và giới hạn | `/huong-dan/dai-sam-hoi/so-bien` | `số biến đại sám hối` |
| Lưu ý | `/huong-dan/dai-sam-hoi/luu-y` | `lưu ý khi niệm đại sám hối` |

---

## 8. Cross-cluster: Tra Cứu / Hỏi Đáp

Competitor có **30 chủ đề tra cứu** cấp 1. PMTL_VN nên có taxonomy tương tự nhưng tích hợp với Wisdom-QA module:

### 30 chủ đề tra cứu (kế thừa từ đối thủ + bổ sung)

| Nhóm | Chủ đề |
|---|---|
| Thực hành | Ăn chay, Niệm kinh, Phóng sanh, Phát nguyện, Sám hối |
| Gia đình | Tình cảm gia đình, Hôn nhân, Con cái, Cha mẹ |
| Sức khỏe | Bệnh tật, Phong thủy nhà ở, Bàn thờ Phật nhỏ |
| Tâm linh | Giấc mơ, Oán kết, Sảy thai & Phá thai, Thai nhi |
| Học tập & Sự nghiệp | Học tập, Công việc, Tài lộc |
| Xã hội | Câu cá, Ăn thịt, Giết mổ |
| Kiến thức Phật pháp | Phật học vấn đáp, Hỏi đáp huyền nghệ |
| Kinh điển | Kinh văn, Thần chú, Mật tông |

Mỗi chủ đề nên là 1 trang `/tra-cuu/[topic-slug]` với:
- FAQPage schema
- Filter theo loại nội dung (Q&A / Bạch thoại / Blog)
- Liên kết sang cluster liên quan

---

## 9. Blog — Hỗ trợ mọi cluster

Blog không phải cluster độc lập mà là **spoke bổ sung** cho mọi cluster:

| Loại bài blog | Cluster hỗ trợ |
|---|---|
| Chia sẻ kinh nghiệm tu học | Tất cả |
| Giải đáp thắc mắc phổ biến | Ngôi Nhà Nhỏ, Niệm kinh |
| Câu chuyện cảm ứng | Tất cả |
| Hướng dẫn ngày đặc biệt (rằm, mùng 1) | Calendar + Niệm kinh |

Mỗi bài blog phải có:
- 1-2 internal link sang pillar/spoke page liên quan
- CTA cuối bài gợi ý hành động (đọc guide, bắt đầu thực hành)

---

## 10. Homepage — Junction Point

Homepage không phải cluster mà là **junction** kết nối các clusters:

```
/  (Junction)
├─ → /ngoi-nha-nho         [Cluster 1 entry]
├─ → /niem-kinh            [Cluster 2 entry]
├─ → /huong-dan/phat-nguyen [Cluster 3 entry]
├─ → /huong-dan/phong-sanh  [Cluster 4 entry]
├─ → /bai-hoa              [Cluster 5 entry]
├─ → /huong-dan/dai-sam-hoi [Cluster 6 entry]
├─ → /tim-kiem             [Cross-cluster search]
└─ → /bai-viet             [Blog entry]
```

Homepage phải có `ItemList` schema listing 6 practices.

---

## 11. Đo lường cluster performance

Mỗi cluster nên có dashboard riêng trong Google Search Console:
- Filter URL contains `/ngoi-nha-nho` → Ngôi Nhà Nhỏ cluster
- Filter URL contains `/niem-kinh` → Niệm kinh cluster

Metrics theo cluster:
- Total impressions
- Total clicks
- Average position
- CTR (click-through rate)
- Top performing spoke pages
