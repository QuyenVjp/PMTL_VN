# Định Tuyến Đổi Tên Cho Trẻ Nhận Nuôi & Người Không Biết Tên Gốc — True Name Identity Router
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Conditional routing logic
> **Cập nhật:** 2026-04-06

## Purpose
Việc Thăng Văn đổi tên cần khai báo tên gốc. Nhưng nếu một người không biết hoặc không chắc chắn tên gốc của mình (vd: trẻ em được nhận nuôi, thất lạc cha mẹ), thì **KHÔNG ĐƯỢC** dùng mẫu Thăng Văn đổi tên thông thường, mà **BẮT BUỘC** phải dùng một mẫu riêng biệt gọi là **"Thăng Văn Chánh Danh" (Application for True Name)**.

## Owner module
`identity` — name change form routing

## Actors
- User (person requesting name change)
- System (form router)
- PDF generator (true name vs regular form)

## Trigger
User bấm `[Yêu Cầu Đổi Tên]` hoặc `[Change of Name Application]`

## Business Rules

| Rule | Detail |
|------|--------|
| Standard Path | Người biết tên gốc → dùng `Change of Name Application` (Thăng Văn Đổi Tên) |
| True Name Path | Người không biết tên gốc → dùng `True Name Application` (Thăng Văn Chánh Danh) |
| Adoption Flag | Checkbox: "Tôi là con nuôi / Không xác định tên gốc" |
| Form Switch | Dựa trên flag, auto-switch PDF template |

## Input Contract

```typescript
interface NameChangeInitiationDto {
  userId: string;
  newDesiredName: string;
  isAdoptedChild?: boolean;
  knownBirthName?: string | null;
}

interface NameChangeRoutingDto {
  applicationType: "STANDARD_CHANGE_OF_NAME" | "TRUE_NAME_APPLICATION";
  isAdoptedOrUnknown: boolean;
  requiredFields: string[];  // list of mandatory fields per form type
}

interface FormGenerationDto {
  applicationType: "STANDARD_CHANGE_OF_NAME" | "TRUE_NAME_APPLICATION";
  formPdfUrl: string;
}
```

## Write Path

```
GET /identity/name-change/initiate
  → Render form with checkbox

POST /identity/name-change/validate-eligibility
  Input: NameChangeInitiationDto

  1. Check: isAdoptedChild OR knownBirthName == null
     → If true: routing = "TRUE_NAME_APPLICATION"
     → If false: routing = "STANDARD_CHANGE_OF_NAME"

  2. Return: NameChangeRoutingDto with form type

  3. Conditionally show form fields based on routing

GET /identity/name-change/generate-pdf
  Input: { applicationType: "..." }
  → Call PDF generator with appropriate template
  → Return PDF
```

## FE Behavior

```
[Yêu Cầu Đổi Tên]
  ↓
[Điền Thông Tin]

Tên mới bạn muốn đặt: ________

[ ] Tôi là con nuôi / Tôi không xác định được tên gốc lúc mới sinh

(User tick checkbox)
  ↓
[Form thay đổi: Thăng Văn Chánh Danh]

Trường bắt buộc cho "True Name Application":
- Tên mới: _____
- Lý do (không có tên gốc): _____
- Ngày sinh hoặc ước tính: _____
- Bằng chứng nhân nuôi (nếu có): [Upload]

[Tạo PDF - Thăng Văn Chánh Danh]

---

(Nếu không tick checkbox)
  ↓
[Form bình thường: Thăng Văn Đổi Tên]

Trường bắt buộc:
- Tên gốc: _____
- Tên mới: _____
- Lý do đổi tên: _____

[Tạo PDF - Thăng Văn Đổi Tên]
```

## Schema Notes

```prisma
model NameChangeApplication {
  id                    String   @id @default(cuid())
  userId                String
  newName               String
  applicationType       String  // "STANDARD_CHANGE_OF_NAME", "TRUE_NAME_APPLICATION"
  isAdoptedChild        Boolean @default(false)
  originalBirthName     String?
  reasonForChange       String?
  supportingDocUrl      String?
  pdfGeneratedAt        DateTime?
  submittedAt           DateTime?
  statusCode            String  // "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model TrueNameApplicationRecord {
  id                String   @id @default(cuid())
  applicationId     String   @unique
  estimatedBirthDate DateTime?
  adoptionProof     String?  // URL to supporting doc
  approvalStatus    String
}
```

## Audit
Mỗi lần application submit → log form type, timestamp, status

## Error Codes

| Code | Message |
|------|---------|
| MISSING_BIRTH_NAME | Vui lòng khai báo tên gốc hoặc xác nhận là con nuôi. |
| INVALID_FORM_TYPE | Loại đơn không hợp lệ. |
| ADOPTION_PROOF_REQUIRED | Với đơn Chánh Danh, bằng chứng nhân nuôi hoặc tờ khai sinh là bắt buộc. |

## Notes
- True Name Application có extra validation (adoption docs)
- Standard Change of Name yêu cầu original birth name

## Related
- `identity/occupational-karma-hazard-engine.md` — identity profile
- `vows-merit/statue-cleaning-protocol.md` — identity-based altar setup
