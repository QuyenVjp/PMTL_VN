# USE CASE: Charity Whitelist Firewall
**Module:** `dharma-compliance`, `community`  
**Phase:** 33 - Kiểm Soát Nhân Quả Chuyên Sâu & Ràng Buộc Pháp Bảo Vật Lý  
**Source:** Buddhism in Plain Terms, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Theo quy định tối thượng của Pháp Môn, **việc in ấn và phân phát Kinh sách, Ngôi Nhà Nhỏ phải hoàn toàn miễn phí**, tuyệt đối cấm trục lợi.

### ⚠️ TUYỆT ĐỐI CẤM:
- ❌ Cá nhân lợi dụng cộng đồng để kêu gọi quyên góp vào tài khoản cá nhân
- ❌ Bất kỳ hình thức "kinh doanh" hoặc "lấy lợi" từ Kinh sách/Pháp bảo

### ✅ CHỈ HỢP LỆ:
- ✅ Quyên góp vào tài khoản từ thiện **chính thức** của "Australia Oriental Media Buddhist Charity Association"
- ✅ Tài khoản: **432 033 033** hoặc **432 919 934** (Ngân hàng St George Bank, BSB 112 879)
- ✅ Trả phí in ấn **qua kênh chính thức** chứ không phải kêu gọi trong bài viết/bình luận

---

## 🎯 Acceptance Criteria

### AC1: Bank Account Regex Pattern Detection
**GIVEN** user đăng bài viết, bình luận, hoặc chat  
**WHEN** content chứa chuỗi số tài khoản  
**THEN** 
- NestJS `ContentInterceptor` phát hiện regex pattern:
  ```typescript
  const BANK_ACCOUNT_PATTERNS = [
    /\d{6}\s*\d{6}/g,           // Format "123456 789012"
    /\d{6}-\d{6}/g,             // Format "123456-789012"
    /BSB\s*\d{3}\s*\d{3}/gi,    // Format "BSB 123 456"
    /Account\s*[\d\s-]+/gi,     // Format "Account 123 456 789"
  ];
  ```

### AC2: Whitelist Validation
**GIVEN** bank account detected  
**WHEN** match against whitelist  
**THEN** 
- Meilisearch query:
  ```typescript
  const APPROVED_ACCOUNTS = [
    { bsb: "112 879", account: "432 033 033", org: "Australia Oriental Buddhist Charity" },
    { bsb: "112 879", account: "432 919 934", org: "Australia Oriental Buddhist Charity" }
  ];
  
  if (isWhitelisted(detectedAccount)) {
    // ALLOW
  } else {
    // BLOCK
  }
  ```

### AC3: Auto-Delete & Alert Non-Whitelisted Accounts
**GIVEN** account detected but NOT in whitelist  
**WHEN** content posted  
**THEN** 
- Auto-delete post/comment
- Trả về `403 Forbidden`:
  ```json
  {
    "statusCode": 403,
    "error": "Forbidden",
    "message": "Hành vi kêu gọi tịnh tài vào tài khoản cá nhân bị nghiêm cấm. Trợ ấn Kinh sách chỉ được thực hiện qua tài khoản từ thiện chính thức của đài Đông Phương (BSB 112 879 - Account 432 033 033 hoặc 432 919 934).",
    "code": "UNAUTHORIZED_CHARITY_ACCOUNT",
    "allowedAccounts": [
      { bsb: "112 879", account: "432 033 033" },
      { bsb: "112 879", account: "432 919 934" }
    ]
  }
  ```

### AC4: User Warning & Education
**GIVEN** post auto-deleted  
**WHEN** notification sent  
**THEN** 
- In-App alert:
  ```
  🚨 HÀNH VI BỊ CẤM
  
  Bài viết của bạn vừa được hệ thống xóa 
  vì chứa số tài khoản ngân hàng cá nhân.
  
  ⚠️  LUẬT PHÁP MÔN:
  
  Quyên góp trợ ấn Kinh sách PHẢI được gửi 
  vào tài khoản từ thiện chính thức của 
  "Australia Oriental Media Buddhist Charity":
  
  🏦 Ngân hàng: St George Bank
  📍 BSB: 112 879
  💳 Tài khoản: 432 033 033 hoặc 432 919 934
  
  Nếu bạn tái phạm, tài khoản sẽ bị khóa.
  ```

### AC5: Moderation Flag For Review
**GIVEN** account mismatch detected  
**WHEN** logged to moderation queue  
**THEN** 
- Create `ModerationCase`:
  ```typescript
  {
    userId: <user_id>,
    caseType: "UNAUTHORIZED_CHARITY_SOLICITATION",
    severity: "HIGH",
    detectedAccount: <account>,
    content: <post_content>,
    actionTaken: "AUTO_DELETE",
    timestamp: <timestamp>,
    status: "PENDING_REVIEW"
  }
  ```

### AC6: Account Suspension For Repeat Offenders
**GIVEN** user violates rule > 3 times  
**WHEN** moderation review  
**THEN** 
- Escalate to admin:
  ```
  ⚠️  TÁI PHẠM - ĐỀ NGHỊ KHÓA TÀI KHOẢN
  
  Người dùng: [Username]
  Lần thứ: 4
  
  [Khóa Tài Khoản]  [Cảnh Báo Cuối]
  ```

---

## 🔧 Technical Notes

### NestJS Interceptor
```typescript
// Location: apps/api/src/dharma-compliance/interceptors/charity-firewall.interceptor.ts

@Injectable()
export class CharityFirewallInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const content = request.body?.content || request.body?.text || '';
    
    const BANK_ACCOUNT_PATTERNS = [
      /\d{6}\s*\d{6}/g,
      /\d{6}-\d{6}/g,
      /BSB\s*\d{3}\s*\d{3}/gi,
      /Account\s*[\d\s-]+/gi
    ];
    
    const detectedAccounts = [];
    BANK_ACCOUNT_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) detectedAccounts.push(...matches);
    });
    
    if (detectedAccounts.length > 0) {
      // Check whitelist
      const approved = this.prisma.approvedCharityAccount.findMany();
      
      const isApproved = detectedAccounts.every(acc => 
        this.isWhitelisted(acc, approved)
      );
      
      if (!isApproved) {
        throw new ForbiddenException({
          message: "Unauthorized charity account detected",
          code: "UNAUTHORIZED_CHARITY_ACCOUNT"
        });
      }
    }
    
    return next.handle();
  }
  
  private isWhitelisted(account: string, approved: any[]): boolean {
    return approved.some(a => account.includes(a.account));
  }
}
```

---

## 📚 References

- **Giáo lý gốc:** Buddhism in Plain Terms - Quy tắc thanh tịnh của Pháp Môn
- **Tổ Chức:** Australia Oriental Media Buddhist Charity Association
- **Hướng dẫn thực hành:** Quyên góp chính thức

---

## 🏷️ Tags
`#phase-33` `#dharma-compliance` `#charity-whitelist` `#anti-fraud` `#community`
