# Assisted Entry Workflow (Luồng Nhập liệu Hỗ trợ)

File này chốt **toàn bộ workflow** khi admin (Phụng sự viên) tạo hoặc sửa record vows/life-release thay cho member.

Không có doc này:
- assisted entry bị implement như "admin viết thẳng vào DB của user" — không có kiểm soát
- audit không đủ context để trace ai tạo cho ai
- member không có quyền từ chối hoặc annotation

---

## Nguyên tắc bất biến

1. **Assisted entry là support workflow có kiểm soát** — không phải blanket cross-user write permission
2. **Audit bắt buộc với đủ actor + owner** — không được bỏ qua dù bất kỳ lý do gì
3. **Member là owner cuối cùng** — có quyền void, annotate, xem history
4. **Admin không được edit sau khi tạo** — sửa là trách nhiệm của member sau đó
5. **Mọi assisted entry phải có reason** — không phải tùy chọn

---

## Khi nào dùng assisted entry

Assisted entry áp dụng cho:
- `lifeReleaseJournal`: admin ghi lại buổi phóng sanh khi member không có thiết bị hoặc không biết dùng app
- `vowProgressEntries`: admin ghi milestone thay member khi member báo cáo qua offline (điện thoại, trực tiếp)

**Không áp dụng cho:**
- tạo `vows` (phát nguyện) mới — member phải tự tạo nguyện
- xóa hoặc void record của member — member tự làm hoặc super-admin có lý do đặc biệt

---

## Pre-conditions (Điều kiện tiên quyết)

Trước khi admin tạo assisted entry, phải thỏa **ít nhất 1** trong các điều kiện sau:

| Điều kiện | Cách verify |
|---|---|
| Member có active session và đã confirm đồng ý (in-app) | Member xác nhận qua UI flow riêng |
| Admin có ghi chú đồng ý miệng/văn bản từ member | Field `assistReason` phải note rõ |
| Member đã submit form ngoài app với thông tin đủ | Field `assistReason` kèm reference (số điện thoại, ngày giờ) |

---

## Request payload (Lược đồ payload hỗ trợ nhập liệu)

Phải có Zod schema cho assisted entry — không dùng schema của member-self-create.

```typescript
// design/09-vows-merit/schemas/assisted-entry.schema.ts (reference)
const AssistedLifeReleaseSchema = z.object({
  ownerUserId:    z.string().uuid(),   // member là owner thật sự
  // --- fields giống member tự tạo ---
  date:           z.string().date(),
  creatureType:   z.string().min(1),
  quantity:       z.number().int().positive(),
  locationNote:   z.string().optional(),
  ritualNoteRef:  z.string().optional(), // publicId của wisdom entry liên quan
  // --- assisted-entry specific ---
  isAssistedEntry: z.literal(true),
  assistReason:   z.string().min(10),  // bắt buộc, không được bỏ trống
});

const AssistedVowProgressSchema = z.object({
  ownerUserId:    z.string().uuid(),
  vowId:          z.string().uuid(),
  milestoneNote:  z.string().min(1),
  progressValue:  z.number().optional(),
  // --- assisted-entry specific ---
  isAssistedEntry: z.literal(true),
  assistReason:   z.string().min(10),
});
```

---

## Stored fields (Fields phải lưu trên record)

Khi lưu assisted entry vào DB, phải có thêm các fields sau:

| Field | Type | Mô tả |
|---|---|---|
| `ownerUserId` | UUID | member là owner thật sự |
| `actorUserId` | UUID | admin đã thực hiện action |
| `isAssistedEntry` | boolean | flag phân biệt |
| `assistReason` | text | lý do hỗ trợ — bắt buộc |
| `assistedAt` | timestamptz | thời điểm tạo assisted entry |

---

## Audit requirements (Yêu cầu audit)

Mỗi assisted entry **bắt buộc** append audit log với đầy đủ:

```typescript
// audit event
{
  actor:       adminUserId,         // ai thực hiện
  action:      'vow.life_release.assisted_create', // hoặc 'vow.progress.assisted_create'
  entityType:  'life_release_journal',
  entityId:    newRecordPublicId,
  metadata: {
    ownerUserId:  memberUserId,     // ai là owner thật
    assistReason: 'text...',
    actorRole:    'admin',
  }
}
```

Audit này là **bắt buộc** — nếu audit append fail, toàn bộ write phải rollback.

---

## Immutability rules (Quy tắc bất biến sau tạo)

| Sau khi tạo... | Admin | Member |
|---|---|---|
| Sửa nội dung | **Không** | Có (tạo correction entry) |
| Void/cancel entry | Không | Có (với audit) |
| Hard delete | **Không** | Không (chỉ super-admin khi có lý do đặc biệt) |
| Xem entry | Có | Có |
| Xóa flag `isAssistedEntry` | **Không** | **Không** (bất biến) |

Lý do: admin không được retroactively xóa dấu vết hỗ trợ. Flag `isAssistedEntry` là permanent metadata.

---

## Member rights (Quyền của member với assisted entry)

Member có thể:
- xem toàn bộ assisted entries của mình (kèm `isAssistedEntry: true` indicator)
- thêm correction/annotation (tạo entry mới link tới entry gốc)
- void entry nếu sai (tạo `voidedAt` + `voidReason`, không hard delete)
- xem tên admin đã hỗ trợ (nếu privacy policy cho phép — cần confirm)

---

## UI/UX guidance

- trong UI của member, assisted entries phải có visual indicator rõ (e.g., "Được nhập bởi Phụng sự viên")
- member không thấy tên admin cụ thể mặc định — chỉ hiện "Phụng sự viên" trừ khi policy cho phép rõ
- admin UI phải có confirmation step rõ trước khi submit assisted entry — không phải one-click
- field `assistReason` phải visible với admin và ghi nhớ rõ là "lý do này sẽ được lưu lại"

---

## Error contract

| Code | Trường hợp |
|---|---|
| `400` | `assistReason` thiếu hoặc quá ngắn; `ownerUserId` không tồn tại |
| `401` | Admin chưa đăng nhập |
| `403` | Role không phải admin; cố gắng tạo cho chính mình qua flow này |
| `404` | `ownerUserId` không tồn tại |
| `409` | Duplicate entry theo business rule |
| `500` | Audit append fail; persistence fail |

---

## Notes for AI/codegen

- assisted entry phải dùng **schema riêng** — không dùng member self-create schema
- `isAssistedEntry` flag phải là `z.literal(true)` — không để optional hoặc default false
- audit append là **bắt buộc trong cùng transaction** — không phải async fire-and-forget
- admin không được gọi endpoint này để sửa record cũ — chỉ tạo mới
- member correction phải tạo entry mới link về gốc, không overwrite `isAssistedEntry` flag
