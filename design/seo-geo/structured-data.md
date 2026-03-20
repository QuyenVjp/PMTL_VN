# Structured Data — Schema.org Strategy

> File này chốt loại Schema.org markup cần triển khai cho từng loại trang trong PMTL_VN.
> Structured data giúp SERP hiển thị rich results (FAQ, HowTo, Breadcrumb, Article)
> và giúp AI engines hiểu context của nội dung.
>
> Đọc cùng: `design/seo-geo/strategy.md`, `design/seo-geo/geo-citation-strategy.md`

---

## 1. Tổng quan mapping trang → schema

| Loại trang | Schema types |
|---|---|
| Homepage | `WebSite`, `Organization`, `SiteLinksSearchBox` |
| Hub page (Ngôi Nhà Nhỏ, Niệm kinh...) | `WebPage`, `BreadcrumbList`, `ItemList` |
| Guide detail page | `Article`, `HowTo`, `BreadcrumbList`, `FAQPage` (nếu có FAQ) |
| FAQ page / tra cứu | `FAQPage`, `BreadcrumbList` |
| Blog / Bài viết | `Article`, `BreadcrumbList` |
| Wisdom entry | `Article`, `Quotation`, `BreadcrumbList` |
| Sutra / Kinh sách | `Book`, `BreadcrumbList` |
| Chant item | `MusicRecording` (nếu có audio) + `Text`, `BreadcrumbList` |
| Contact page | `ContactPage`, `Organization` |
| Calendar / Events | `Event`, `BreadcrumbList` |
| Download page | `DigitalDocument`, `BreadcrumbList` |

---

## 2. Homepage

### WebSite + SiteLinksSearchBox

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Pháp Môn Tâm Linh",
  "url": "https://pmtl.vn",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://pmtl.vn/tim-kiem?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Pháp Môn Tâm Linh Việt Nam",
  "alternateName": "PMTL_VN",
  "url": "https://pmtl.vn",
  "logo": "https://pmtl.vn/images/logo.png",
  "description": "Cổng thông tin tu học Pháp Môn Tâm Linh (心灵法门) bằng tiếng Việt. Gồm hướng dẫn Năm Đại Pháp Bảo: Niệm kinh, Phát nguyện, Phóng sanh, Bạch Thoại Phật Pháp, Đại Sám Hối.",
  "sameAs": [
    "https://www.facebook.com/[page]",
    "https://www.youtube.com/@[channel]"
  ]
}
```

---

## 3. BreadcrumbList — Áp dụng trên mọi trang (trừ homepage)

### Template động (Next.js)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Trang chủ",
      "item": "https://pmtl.vn"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Hub name]",
      "item": "https://pmtl.vn/[hub-slug]"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Page title]",
      "item": "https://pmtl.vn/[hub-slug]/[page-slug]"
    }
  ]
}
```

### Ví dụ: Trang Quy Trình Đốt

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Trang chủ", "item": "https://pmtl.vn" },
    { "@type": "ListItem", "position": 2, "name": "Ngôi Nhà Nhỏ", "item": "https://pmtl.vn/ngoi-nha-nho" },
    { "@type": "ListItem", "position": 3, "name": "Đốt & Hậu xử lý", "item": "https://pmtl.vn/ngoi-nha-nho/dot-va-hau-xu-ly" },
    { "@type": "ListItem", "position": 4, "name": "Quy trình đốt", "item": "https://pmtl.vn/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot" }
  ]
}
```

---

## 4. HowTo — Áp dụng cho guide có trình tự bước

**Áp dụng cho**: Quy trình đốt, Trình tự trì tụng, Cách chấm đỏ, Quy trình chuẩn bị.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Quy Trình Đốt Ngôi Nhà Nhỏ Đúng Cách",
  "description": "Hướng dẫn đầy đủ các bước đốt Ngôi Nhà Nhỏ theo Pháp Môn Tâm Linh, bao gồm chuẩn bị dụng cụ, cách khấn, và xử lý tro sau đốt.",
  "image": "https://pmtl.vn/images/dot-ngoi-nha-nho-huong-dan.jpg",
  "totalTime": "PT30M",
  "supply": [
    { "@type": "HowToSupply", "name": "Tờ Ngôi Nhà Nhỏ đã trì xong" },
    { "@type": "HowToSupply", "name": "Đĩa sứ trắng không hoa văn" },
    { "@type": "HowToSupply", "name": "Ghế đốt mới" },
    { "@type": "HowToSupply", "name": "Tâm hương" },
    { "@type": "HowToSupply", "name": "Bật lửa hoặc diêm" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Chuẩn bị dụng cụ",
      "text": "Chuẩn bị đĩa sứ trắng không hoa văn, ghế đốt mới chưa dùng, tâm hương, bật lửa."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Thắp tâm hương và cảm tạ",
      "text": "Thắp tâm hương, cảm tạ Bồ Tát Quán Thế Âm 3 lần."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Niệm Chú Đại Bi và Tâm Kinh",
      "text": "Niệm Chú Đại Bi 1 biến và Bát Nhã Tâm Kinh 1 biến."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Nâng tờ và quán tưởng",
      "text": "Nâng tờ Ngôi Nhà Nhỏ lên ngang trán, quán tưởng người nhận."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Đọc câu thỉnh cầu chuyển tặng",
      "text": "Đọc lời thỉnh cầu chuyển tặng theo mẫu, nêu rõ tên người đốt, số lượng, người nhận."
    },
    {
      "@type": "HowToStep",
      "position": 6,
      "name": "Đốt tờ kinh",
      "text": "Đốt từ góc phải phía trên. Không niệm kinh, không nói chuyện trong lúc đốt. Đốt hoàn toàn đến tro."
    },
    {
      "@type": "HowToStep",
      "position": 7,
      "name": "Khấn kết thúc",
      "text": "Đọc lời khấn cảm tạ kết thúc sau khi đốt xong."
    },
    {
      "@type": "HowToStep",
      "position": 8,
      "name": "Xử lý tro",
      "text": "Cho tro vào khăn giấy sạch, gói kỹ, bỏ vào túi ni lông mới, xử lý như rác sinh hoạt."
    }
  ]
}
```

---

## 5. FAQPage — Áp dụng cho trang hỏi đáp và guide có FAQ block

**Áp dụng cho**: `/ngoi-nha-nho/tra-cuu`, các guide page có `faq_block`.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Có thể đốt bao nhiêu tờ Ngôi Nhà Nhỏ mỗi ngày?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ngày thường tối đa 7 tờ (phải là số lẻ: 1, 3, 5 hoặc 7). Ngày mùng 1 và 15 âm lịch có thể đốt 7-21 tờ. Luôn dùng số lẻ, không dùng số chẵn."
      }
    },
    {
      "@type": "Question",
      "name": "Đốt Ngôi Nhà Nhỏ khi không có bàn thờ Phật thì làm thế nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Khi không có bàn thờ, thắp tâm hương, niệm Chú Đại Bi 1 biến và Tâm Kinh 1 biến trước, sau đó thực hiện đúng quy trình đốt. Không cần bàn thờ để thực hiện được."
      }
    },
    {
      "@type": "Question",
      "name": "Tro sau khi đốt Ngôi Nhà Nhỏ phải xử lý như thế nào?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cho tro vào khăn giấy sạch, gói cẩn thận (tro còn nóng), đặt vào túi ni lông mới, có thể bỏ với rác sinh hoạt không bị bẩn. Không trộn với rác bẩn."
      }
    },
    {
      "@type": "Question",
      "name": "Nếu viết sai Kính Tặng hoặc chấm sai thì phải làm gì?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tờ viết sai hoặc chấm sai phải hủy bỏ theo đúng quy trình, không được tiếp tục sử dụng. Xem hướng dẫn hủy bỏ cụ thể tại trang đốt và hậu xử lý."
      }
    }
  ]
}
```

---

## 6. Article — Áp dụng cho blog post và guide detail

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Tiêu đề bài]",
  "description": "[Meta description]",
  "image": "https://pmtl.vn/images/[og-image].jpg",
  "datePublished": "[ISO 8601 date]",
  "dateModified": "[ISO 8601 date]",
  "author": {
    "@type": "Organization",
    "name": "Pháp Môn Tâm Linh",
    "url": "https://pmtl.vn"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Pháp Môn Tâm Linh",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pmtl.vn/images/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://pmtl.vn/[slug]"
  }
}
```

---

## 7. ItemList — Áp dụng cho hub pages (danh sách hướng dẫn)

**Áp dụng cho**: `/ngoi-nha-nho`, `/huong-dan`.

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Hướng dẫn Ngôi Nhà Nhỏ",
  "description": "Toàn bộ hướng dẫn về Ngôi Nhà Nhỏ trong Pháp Môn Tâm Linh",
  "numberOfItems": 5,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Bắt đầu — Ngôi Nhà Nhỏ là gì",
      "url": "https://pmtl.vn/ngoi-nha-nho/bat-dau"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Trì tụng — Hướng dẫn niệm kinh",
      "url": "https://pmtl.vn/ngoi-nha-nho/tri-tung"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Đốt và hậu xử lý",
      "url": "https://pmtl.vn/ngoi-nha-nho/dot-va-hau-xu-ly"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Tra cứu — Hỏi đáp và số lượng",
      "url": "https://pmtl.vn/ngoi-nha-nho/tra-cuu"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Thực hành — Bắt đầu trì tụng",
      "url": "https://pmtl.vn/ngoi-nha-nho/thuc-hanh"
    }
  ]
}
```

---

## 8. Book — Áp dụng cho Kinh sách

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "[Tên kinh]",
  "author": {
    "@type": "Person",
    "name": "Lư Quân Hoành",
    "alternateName": "卢军宏"
  },
  "inLanguage": "vi",
  "description": "[Mô tả kinh]",
  "url": "https://pmtl.vn/kinh-sach/[slug]"
}
```

---

## 9. SpeakableSpecification — Cho AI assistant đọc nội dung

Áp dụng cho các đoạn nội dung quan trọng muốn AI voice assistant đọc được:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".speakable-summary", ".speakable-steps", "h1", "h2"]
  }
}
```

Thêm class `.speakable-summary` vào:
- Quick summary box đầu mỗi guide
- Câu trả lời FAQ
- Cảnh báo quan trọng

---

## 10. Implementation trong Next.js

### Cách triển khai

Dùng Next.js `metadata` API + JSON-LD script tag:

```tsx
// Trong page component
export function generateStructuredData(page: PageData): string {
  const schemas = [
    buildBreadcrumbSchema(page.breadcrumbs),
    buildArticleSchema(page),
    page.howToSteps ? buildHowToSchema(page) : null,
    page.faqs?.length ? buildFaqSchema(page.faqs) : null,
  ].filter(Boolean);

  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
}
```

### Vị trí render

- JSON-LD phải render trong `<head>` (dùng Next.js Script component với `strategy="beforeInteractive"` hoặc inline trong layout)
- Không render JSON-LD trong body content

### Validation

- Validate mỗi schema bằng Google Rich Results Test trước khi deploy
- Ghi vào checklist deploy nếu có thay đổi schema markup
