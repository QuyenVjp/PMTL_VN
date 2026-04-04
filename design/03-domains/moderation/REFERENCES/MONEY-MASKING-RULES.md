# MONEY-MASKING-RULES

## Owner
- `moderation` (automated content processing)
- `community` (Life Liberation post display)

## Purpose
**Tự động ẩn/che số tiền** trong bài đăng Phóng Sinh (Life Release) để tránh so sánh và dính mắc.

---

## Business Rule: No Monetary Display in Life Liberation Posts

### Rule - Strip/Mask Monetary Values
**Nghiệp vụ:**
Khi user post hình ảnh/nhật ký Phóng Sinh lên Community, AI moderation (hoặc logic code) tự động ẩn đi **số tiền** (Money spent), chỉ cho phép hiển thị **số lượng con vật** (Quantity).

**Lý do tâm linh:**
- PMTL quy định khi phóng sinh **không nên nói rõ số tiền** để tránh:
  - So sánh giữa các đồng tu ("Người ta phóng 10 triệu, mình chỉ 1 triệu").
  - Dính mắc công đức (khoe khoang, tự mãn).
  - Tạo áp lực tâm lý cho người khác.

**Được phép hiển thị:**
- ✅ Loại động vật (Cá, Cua, Tôm, v.v.).
- ✅ Số lượng con vật (50 con Cá, 100 con Tôm).
- ✅ Địa điểm phóng sinh.
- ✅ Ngày phóng sinh.
- ✅ Hình ảnh phóng sinh (không có biển hiệu giá tiền).

**Bị ẩn/che:**
- ❌ Số tiền (1.000.000 VNĐ, $50, v.v.).
- ❌ Đơn giá (50.000 VNĐ/kg).
- ❌ Tổng chi phí.

---

## Detection & Masking Logic

### Money Pattern Detection (Regex)
```typescript
const MONEY_PATTERNS = [
  /\d{1,3}([\.,]\d{3})+\s*(VNĐ|VND|đ|đồng)/gi,  // 1.000.000 VNĐ
  /\d+\s*(triệu|tr|nghìn|k)/gi,                  // 5 triệu, 500k
  /\$\s*\d+(\.\d{2})?/gi,                        // $50.00
  /USD\s*\d+/gi,                                 // USD 100
  /\d+\s*\/\s*(kg|con)/gi,                       // 50.000/kg, 20k/con
];
```

### Masking Strategy
| Original | Masked |
|----------|--------|
| "Phóng sinh 1.000.000 VNĐ" | "Phóng sinh [số tiền đã ẩn]" |
| "Tổng chi 5 triệu" | "Tổng chi [đã ẩn]" |
| "Giá 50.000 VNĐ/kg" | "Giá [đã ẩn]" |
| "$100 worth of fish" | "[amount hidden] worth of fish" |

---

## Service Logic

### MoneyMaskingService (NestJS)
```typescript
export class MoneyMaskingService {
  private readonly MONEY_PATTERNS = [
    /\d{1,3}([\.,]\d{3})+\s*(VNĐ|VND|đ|đồng)/gi,
    /\d+\s*(triệu|tr|nghìn|k)\s*(VNĐ|VND|đ|đồng)?/gi,
    /\$\s*\d+(\.\d{2})?/gi,
    /USD\s*\d+/gi,
    /\d+\s*\/\s*(kg|con)/gi,
  ];

  maskMoney(content: string, language: string = 'vi'): {
    maskedContent: string;
    originalContent: string;
    masked: boolean;
  } {
    let maskedContent = content;
    let masked = false;

    const maskText = language === 'vi' ? '[số tiền đã ẩn]' : '[amount hidden]';

    this.MONEY_PATTERNS.forEach(pattern => {
      if (pattern.test(maskedContent)) {
        maskedContent = maskedContent.replace(pattern, maskText);
        masked = true;
      }
    });

    return {
      maskedContent,
      originalContent: content,
      masked,
    };
  }
}
```

---

## References
- `design/03-domains/community/MODULE_MAP.md`
- `design/03-domains/moderation/CONTRACTS.md`
- `design/03-domains/content/REFERENCES/LIFE-RELEASE-GUIDE-LUU-Y-VA-CHUAN-BI.MD`
- External source: Master Lu teachings về phóng sinh, tránh nói số tiền

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 11
