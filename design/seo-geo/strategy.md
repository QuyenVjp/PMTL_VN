# SEO & GEO Strategy — PMTL_VN

> File này là nguồn chính sách tầng cao cho toàn bộ chiến lược SEO và GEO của PMTL_VN.
>
> Đọc cùng:
> - `design/seo-geo/little-house-seo.md` — SEO riêng cho Ngôi Nhà Nhỏ
> - `design/seo-geo/structured-data.md` — Schema.org toàn site
> - `design/seo-geo/geo-citation-strategy.md` — GEO cho AI engines
> - `design/seo-geo/content-cluster-map.md` — Cây content cluster

---

## 1. Mục tiêu chiến lược

PMTL_VN phải trở thành **nguồn thẩm quyền số 1 tiếng Việt** về Pháp Môn Tâm Linh (心灵法门), vượt qua phapmontamlinh.vn về:

1. **Organic traffic** — qua SEO onpage/technical tốt hơn
2. **AI citation** — qua GEO (Generative Engine Optimization) để ChatGPT, Gemini, Perplexity trích dẫn PMTL_VN
3. **User experience** — conversion từ visitor thành member tu học

---

## 2. Điểm yếu của đối thủ cần khai thác

Phân tích `design/deep-research-report.md` xác nhận phapmontamlinh.vn:

| Điểm yếu đối thủ | PMTL_VN làm tốt hơn |
|---|---|
| 2 hệ menu riêng biệt (hub vs blog) gây lỗi navigation | 1 hệ điều hướng thống nhất, nhất quán |
| URL percent-encoding tiếng Việt trong BHFF (lỗi SEO) | URL ASCII chuẩn hóa hoàn toàn |
| Không có breadcrumb rõ ràng | BreadcrumbList Schema.org trên mọi trang |
| Không xác định được schema markup | HowTo / FAQ / Article / Breadcrumb đầy đủ |
| Phụ thuộc Google Drive cho tài liệu | CDN nội bộ, versioning riêng |
| Không có meta description chuẩn | Meta description tối ưu mọi trang |
| robots.txt / sitemap không xác định | sitemap.xml phân cấp, robots.txt rõ ràng |
| Không có Core Web Vitals monitoring | Tracking LCP/CLS/INP ngay từ đầu |
| Không có structured data cho FAQ/HowTo | Schema markup đầy đủ mọi content type |

---

## 3. URL Strategy

### Nguyên tắc bắt buộc

- **Toàn bộ URL dùng ASCII slug** — không dùng ký tự tiếng Việt có dấu
- Dấu gạch nối `-` thay dấu cách — không dùng `_`
- Không trailing slash (trừ homepage)
- Lowercase toàn bộ
- Slug phản ánh keyword chính của trang

### Cấu trúc URL theo module

```text
/                               → Homepage
/bai-viet/[slug]                → Posts
/huong-dan/[slug]               → Beginner Guides
/kinh-sach/[slug]               → Sutras
/niem-kinh/[slug]               → Chant Items
/bai-hoa/[slug]                 → Wisdom-QA
/tim-kiem                       → Search
/lich                           → Calendar
/so-luu-niem                    → Guestbook
/lien-he                        → Contact

/ngoi-nha-nho                   → Little House Hub
/ngoi-nha-nho/bat-dau           → Nhóm: Bắt đầu
/ngoi-nha-nho/tri-tung          → Nhóm: Trì tụng
/ngoi-nha-nho/dot-va-hau-xu-ly  → Nhóm: Đốt & Hậu xử lý
/ngoi-nha-nho/tra-cuu           → Nhóm: Tra cứu
/ngoi-nha-nho/[group]/[slug]    → Guide chi tiết

/dang-nhap                      → Login
/dang-ky                        → Register
/tu-tap/bai-tap                 → Daily Practice
/tu-tap/nha-nho                 → NNN Tracker
/phat-nguyen                    → Vows
/phong-sanh                     → Life Release
/lich-ca-nhan                   → Personal Calendar
```

### Quy tắc redirect

- Không bao giờ dùng percent-encoded URL trong nội bộ
- Mọi URL cũ nếu có sẽ 301 redirect về URL mới chuẩn
- Canonical tag phải khớp với URL canonical chính thức

---

## 4. On-page SEO chuẩn

### Title Tag

Công thức: `[Keyword Chính] — Pháp Môn Tâm Linh`

- Max 60 ký tự cho tiêu đề trong SERP
- Keyword chính đặt đầu title
- Tên thương hiệu đặt cuối
- Mỗi trang phải có title unique

Ví dụ:
```
Quy Trình Đốt Ngôi Nhà Nhỏ — Pháp Môn Tâm Linh
Hướng Dẫn Niệm Ngôi Nhà Nhỏ Từ A Đến Z — Pháp Môn Tâm Linh
```

### Meta Description

- Max 155 ký tự
- Phải chứa keyword chính
- Phải có CTA ngầm (gợi click)
- Phải unique mỗi trang

Ví dụ:
```
Hướng dẫn đầy đủ quy trình đốt Ngôi Nhà Nhỏ: dụng cụ, thời gian, cách khấn,
xử lý tro đúng chuẩn Pháp Môn Tâm Linh. Có checklist và hình minh họa.
```

### Heading Structure

- `H1`: Chỉ 1 trên mỗi trang. Chứa keyword chính.
- `H2`: Các nhóm nội dung chính. Keyword variation.
- `H3+`: Sub-sections. Semantic, không nhồi keyword.

### Breadcrumb

Mọi trang (trừ homepage) phải có breadcrumb hiển thị và BreadcrumbList schema:
```
Trang chủ > Ngôi Nhà Nhỏ > Đốt & Hậu xử lý > Quy trình đốt
```

---

## 5. Technical SEO

### robots.txt

```text
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /tu-tap/
Disallow: /phat-nguyen/
Disallow: /phong-sanh/
Disallow: /lich-ca-nhan/
Disallow: /ngoai-tuyen/
Disallow: /tai-khoan/
Disallow: /thong-bao/
Disallow: /api/

Sitemap: https://phatmontamlinh.vn/sitemap.xml
```

### sitemap.xml

Sitemap phân cấp (sitemap index):
- `sitemap-posts.xml` — bài viết
- `sitemap-guides.xml` — hướng dẫn và Ngôi Nhà Nhỏ guides
- `sitemap-sutras.xml` — kinh sách
- `sitemap-wisdom.xml` — Bạch thoại / Hỏi đáp
- `sitemap-static.xml` — trang tĩnh (liên hệ, sổ lưu niệm, v.v.)

Mỗi entry phải có:
- `<loc>` — URL canonical
- `<lastmod>` — ngày cập nhật (từ `updatedAt` hoặc `publishedAt`)
- `<changefreq>` — phù hợp với loại trang (monthly cho guide, weekly cho blog)
- `<priority>` — 1.0 cho hub, 0.8 cho guide chi tiết, 0.6 cho blog

Sitemap **không bao gồm** trang yêu cầu đăng nhập (`/tu-tap/*`, `/phat-nguyen/*`, v.v.).

### Core Web Vitals Targets

| Metric | Target (Good) | Measurement |
|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | PageSpeed Insights |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | PageSpeed Insights |
| INP (Interaction to Next Paint) | ≤ 200ms | Chrome UX Report |
| TTFB (Time to First Byte) | ≤ 800ms | Server-side |

Đây là targets **phase 1**. Đo lại mỗi quý.

### Canonical Tags

- Mọi trang phải có `<link rel="canonical">` trỏ về URL chính thức
- Trang pagination phải có canonical riêng (không rel=canonical về trang 1)
- Không có duplicate content giữa www và non-www (chọn 1 và 301 redirect)

### hreflang

Phase 1: Chỉ tiếng Việt (`vi`).
Phase 2+: Thêm `zh-Hant` nếu có bản song ngữ Việt-Hoa.

```html
<link rel="alternate" hreflang="vi" href="https://pmtl.vn/..." />
<link rel="alternate" hreflang="x-default" href="https://pmtl.vn/..." />
```

---

## 6. Open Graph & Social Cards

Mọi public page phải có:
```html
<meta property="og:title" content="[Page Title]" />
<meta property="og:description" content="[Meta Description]" />
<meta property="og:image" content="[Absolute URL to OG image 1200x630]" />
<meta property="og:url" content="[Canonical URL]" />
<meta property="og:type" content="website|article" />
<meta property="og:site_name" content="Pháp Môn Tâm Linh" />
<meta name="twitter:card" content="summary_large_image" />
```

OG images:
- Kích thước: 1200×630px
- Template theo loại trang (hub, guide, blog)
- Có chứa title + thương hiệu
- Không dùng ảnh chứa nhiều chữ nhỏ

---

## 7. Internal Linking Strategy

### Quy tắc internal linking

- Mỗi guide page phải link tới ít nhất 2 trang liên quan
- Hub pages phải link đến mọi trang con
- Blog posts phải link tới ít nhất 1 guide/hub liên quan
- Không orphan page (trang không có internal link vào)

### Anchor text

- Dùng anchor text mô tả, không dùng "click here", "xem thêm" thuần túy
- Chứa keyword khi tự nhiên
- Đa dạng anchor text cho cùng một trang đích

### Pillar — Cluster model

Xem `design/seo-geo/content-cluster-map.md` cho chi tiết.

---

## 8. Image SEO

- `alt` text mô tả nội dung ảnh, chứa keyword khi tự nhiên
- File name phải là slug mô tả (không `IMG_001.jpg`)
- Dùng WebP format ưu tiên, fallback PNG/JPG
- `loading="lazy"` cho ảnh below-the-fold
- `srcset` cho responsive images
- Không dùng ảnh host ngoài (Google Drive, v.v.) làm nội dung chính

---

## 9. Monitoring & Reporting

### Tools

- Google Search Console: theo dõi impressions, clicks, position
- Google Analytics 4: behavior, conversions
- PageSpeed Insights API: Core Web Vitals auto-check sau mỗi deploy
- Meilisearch admin: theo dõi query không có kết quả

### KPIs quan trọng

| KPI | Target Phase 1 | Target Phase 2 |
|---|---|---|
| Organic sessions/tháng | Baseline | +50% |
| Ngôi Nhà Nhỏ page impressions | Baseline | Top 3 cho "đốt ngôi nhà nhỏ" |
| Featured Snippet appearances | 0 | ≥3 cho FAQ queries |
| AI citation mentions | 0 | ≥1 khi hỏi về PMTL |
| Core Web Vitals Pass Rate | 100% | 100% |

---

## 10. SEO Ownership trong codebase

| Concern | Owned by |
|---|---|
| URL slug generation | Content module (slug field) |
| Title & meta description | Content module (metaTitle, metaDescription fields) |
| OG image generation | Content module (Next.js OG image route) |
| sitemap.xml generation | Next.js route handler `/sitemap.xml` |
| robots.txt | Next.js route handler `/robots.txt` |
| Canonical tag | Next.js layout (head) |
| Schema.org JSON-LD | Next.js page components |
| Internal linking logic | Content module (relatedContent field) |
