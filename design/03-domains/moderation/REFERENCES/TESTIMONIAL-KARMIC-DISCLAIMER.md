# TESTIMONIAL-KARMIC-DISCLAIMER

## Owner
- `moderation` (community post moderation)
- `community` (testimonial submission)

## Purpose
Bắt buộc **Tuyên thệ Tâm linh** (Karmic Disclaimer) khi user đăng bài chia sẻ linh nghiệm (testimonial) để bảo vệ pháp môn và Sư phụ khỏi nghiệp quả của người viết.

---

## Business Rule: Mandatory Karmic Disclaimer

### Rule 1 - Auto-Append Disclaimer to All Testimonials
**Nghiệp vụ:**
Khi user submit form chia sẻ câu chuyện (Testimonial), backend **bắt buộc** phải tự động chèn (hoặc yêu cầu user check vào ô đồng ý) một đoạn văn bản **Tuyên thệ Tâm linh** ở cuối bài viết.

**Lý do nghiệp vụ:**
- Nếu user viết sai sự thật hoặc phóng đại, người viết phải **tự gánh nghiệp**, không để ảnh hưởng đến Sư phụ và pháp môn.
- Đây là cơ chế bảo vệ tâm linh (karmic liability protection).

---

## Canonical Disclaimer Text

### Tiếng Việt (Vietnamese)
```
"Nếu có điều gì không như lý như pháp trong câu chuyện của tôi, 
xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát và các vị Hộ Pháp từ bi tha thứ. 
Tôi sẽ tự gánh vác nghiệp chướng của chính mình và không để 
Sư phụ Lư Quân Hoành phải gánh vác thay tôi."
```

### English (for international users)
```
"If there is anything inappropriate or exaggerated in my sharing, 
may Guan Yin Bodhisattva and the Dharma Protectors forgive me. 
I will bear my own karmic debts and will not let Master Lu 
bear them for me."
```

---

## UX Flow

### Flow 1: Submit Testimonial with Required Checkbox
```
User writes testimonial in CommunityPostForm
  ↓
User click [Đăng bài]
  ↓
System shows KarmicDisclaimerModal (if not yet confirmed)
  ↓ Display disclaimer text (full)
  ↓ Checkbox: [✓] Tôi đã đọc và đồng ý với tuyên thệ tâm linh này
  ↓ Button [Hủy] [Xác nhận và đăng bài] (disabled until checkbox ticked)
  ↓
User ticks checkbox
  ↓
User click [Xác nhận và đăng bài]
  ↓
Backend auto-append disclaimer text to content
  ↓
Set: karmicDisclaimerAccepted = true
  ↓
Save CommunityPost with status = PENDING
  ↓
Toast: "Bài viết của bạn đã được gửi và đang chờ kiểm duyệt."
```

---

## Service Logic

### TestimonialModerationService (NestJS)
```typescript
async createTestimonialPost(
  userId: string,
  content: string,
  disclaimerAccepted: boolean
) {
  if (!disclaimerAccepted) {
    throw new BadRequestException('Karmic disclaimer must be accepted');
  }

  const disclaimerText = await this.getActiveDisclaimer('vi');

  // Auto-append disclaimer to content
  const contentWithDisclaimer = `${content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${disclaimerText}`;

  return this.prisma.communityPost.create({
    data: {
      authorId: userId,
      content: contentWithDisclaimer,
      karmicDisclaimerAccepted: true,
      disclaimerText,
      status: 'PENDING',
    },
  });
}
```

---

## References
- `design/03-domains/community/MODULE_MAP.md`
- `design/03-domains/moderation/CONTRACTS.md`
- External source: Master Lu teachings về trách nhiệm khi chia sẻ linh nghiệm

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 11
