# USE CASE: AI Firewall - Anti-Fraud Charity Whitelist
**Module:** `moderation`, `community`  
**Phase:** 34 - Tầng Kiểm Soát Vật Lý & Chống Trục Lợi Pháp Bảo  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp VỤ

Pháp Môn Tâm Linh quy định cực kỳ nghiêm ngặt:
- **Mọi Kinh sách, Đĩa CD, giấy in Tiểu Phương Tử phải tặng MIỄN PHÍ**
- Mọi khoản **trợ ấn Kinh sách** chỉ được chuyển vào **tài khoản từ thiện hợp pháp duy nhất**
- **TUYỆT ĐỐI CẤM** cá nhân lợi dụng cộng đồng để kêu gọi chuyển tiền vào tài khoản riêng

### ⚠️ TẠI SAO?
Việc kinh doanh hoặc quyên góp sai chỗ = **tạo ác nghiệp** (lừa đảo từ thiện)

---

## 🎯 Acceptance Criteria

### AC1: Regex Bank Account Detection
**GIVEN** user tạo bài viết/bình luận với từ khóa "quyên góp", "trợ ấn", "chuyển khoản"  
**WHEN** kèm theo dãy số (Account Number pattern)  
**THEN** 
- Hệ thống detect regex: `/(032|000|112|201)\s?\d{3}\s?\d{3}|432\s?\d{3}\s?\d{3}/gi`

### AC2: Whitelist Validation
**GIVEN** system phát hiện bank account  
**WHEN** validate dãy số  
**THEN** 
- Đối chiếu với **WHITELIST duy nhất**:
  ```typescript
  const APPROVED_CHARITY_ACCOUNTS = [
    {
      bank: "ST_GEORGE_BANK",
      bsb: "112 879",
      accounts: ["432 033 033", "432 919 934"],
      organisationName: "Australia Oriental Media Buddhist Charity Association"
    }
  ];
  ```

### AC3: Hard-Stop For Non-Approved
**GIVEN** dãy số KHÔNG khớp whitelist  
**WHEN** trigger validation  
**THEN** 
- API trả về `403 Forbidden`:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "code": "UNAUTHORIZED_CHARITY_SOLICITATION",
    "message": "Hành vi kêu gọi tịnh tài vào tài khoản cá nhân bị nghiêm cấm",
    "details": "Mọi khoản trợ ấn Kinh sách chỉ được thực hiện qua tài khoản từ thiện chính thức: St George Bank, BSB 112 879, Account: 432 033 033 hoặc 432 919 934"
  }
  ```

### AC4: Auto-Delete & Log
**GIVEN** validation fail  
**WHEN** enforcement trigger  
**THEN** 
1. Delete bài viết/bình luận ngay lập tức
2. Audit log:
   ```typescript
   {
     eventType: "CHARITY_FRAUD_ATTEMPT",
     userId: <uuid>,
     detectedAccount: "432 999 999",
     content: <truncated>,
     action: "DELETED_AUTO",
     timestamp: now()
   }
   ```

### AC5: User Notification Alert
**GIVEN** bài viết bị xóa  
**WHEN** system send notification  
**THEN** 
- Alert message:
  ```
  🚨 BÀI VIẾT CỦA BẠN ĐÃ BỊ XÓA
  
  Lý do: Kêu gọi quyên góp vào tài khoản cá nhân
  
  ❌ TUYỆT ĐỐI CẤUM:
  - Yêu cầu chuyển tiền vào tài khoản riêng
  - Quyên góp trợ ấn Kinh sách theo ý riêng
  
  ✅ CÁCH ĐỶN:
  - Mọi trợ ấn phải qua đây:
  - Tổ chức Từ thiện Truyền thông Đông Phương Úc
  - St George Bank, BSB 112 879
  - Account: 432 033 033 / 432 919 934
  
  📖 [Tìm hiểu thêm về Pháp luật Từ thiện]
  ```

### AC6: Repeated Offender Moderation
**GIVEN** user vi phạm 2+ lần  
**WHEN** system detect pattern  
**THEN** 
- Escalate to `moderation` team:
  ```typescript
  {
    action: "ACCOUNT_WARNING_LEVEL_2",
    reason: "Repeated unauthorized charity solicitation",
    punishment: "TEMPORARY_MUTE_7_DAYS",
    warningLevel: 2
  }
  ```

---

## 🔧 Technical Notes

### NestJS Interceptor
```typescript
// Location: apps/api/src/moderation/interceptors/charity-whitelist.interceptor.ts

@Injectable()
export class CharityWhitelistInterceptor implements NestInterceptor {
  private readonly accountRegex = /(032|000|112|201)\s?\d{3}\s?\d{3}|432\s?\d{3}\s?\d{3}/gi;
  private readonly keywords = ['quyên góp', 'trợ ấn', 'chuyển khoản', 'donate', 'sponsor'];
  
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const content = request.body?.content || request.body?.comment || '';
    
    const hasKeyword = this.keywords.some(kw => content.toLowerCase().includes(kw));
    const accounts = content.match(this.accountRegex);
    
    if (hasKeyword && accounts?.length > 0) {
      for (const account of accounts) {
        if (!this.isWhitelisted(account)) {
          throw new ForbiddenException({
            code: 'UNAUTHORIZED_CHARITY_SOLICITATION'
          });
        }
      }
    }
    
    return next.handle();
  }
  
  private isWhitelisted(account: string): boolean {
    const approved = APPROVED_CHARITY_ACCOUNTS.flatMap(c => c.accounts);
    return approved.includes(account.replace(/\s/g, ''));
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quy định từ thiện
- **Q&A Huyền học:** Pháp luật quyên góp Kinh sách
- **Hướng dẫn thực hành:** Cách ủng hộ Pháp Môn hợp pháp

---

## 🏷️ Tags
`#phase-34` `#moderation` `#charity-whitelist` `#anti-fraud` `#dharma-protection`
