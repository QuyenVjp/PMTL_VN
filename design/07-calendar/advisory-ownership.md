# Advisory Ownership (Phân định Quyền sở hữu Thông báo Tu tập)

File này chốt **ranh giới rõ ràng** giữa Calendar module và Wisdom-QA module trong quá trình compose daily practice advisory.

Không có doc này, ambiguity dẫn đến:
- Calendar tự copy teaching text vào event record — vi phạm source ownership
- Wisdom-QA tự xây advisory logic — duplicate với Calendar
- Code gen implement advisory incorrectly

---

## Vấn đề cần giải quyết

Advisory hằng ngày (`GET /api/practice-calendar`) cần trả về:
1. Lịch ngày hôm nay (âm lịch, ngày đặc biệt)
2. Chuỗi thực hành gợi ý (niệm kinh gì, bao nhiêu biến, làm lễ gì)
3. Trích dẫn hoặc link tới khai thị / Bạch thoại phù hợp
4. Gợi ý mở đúng `daily practice preset` hoặc companion guide khi cần

→ Câu hỏi: **Calendar hay Wisdom-QA sở hữu output này?**

---

## Phân định rõ ràng

### Calendar module OWNS (Sở hữu)

- logic "ngày nào là ngày đặc biệt" (mùng 1, 15, kỵ nhật, ngày phóng sanh)
- logic "ngày này nên thực hành gì" (practice sequence, recitation rules)
- composition của `advisoryCard` — assembly logic
- scheduling của reminder notifications liên quan
- `personalPracticeCalendarReadModel` — derived read model per user
- chọn `recommendedScenarioPresetRef` nếu ngày đó phù hợp preset cụ thể

Calendar **tự xác định** practice context dựa trên:
- `lunarEvents` table
- `lunarEventOverrides` table
- user preferences (từ Engagement module)
- vow context (từ Vows-Merit module nếu có)

---

### Wisdom-QA module OWNS (Sở hữu)

- canonical text của tất cả khai thị, Bạch thoại, Phật ngôn
- provenance và review status của từng teaching
- tag taxonomy cho teaching retrieval
- xác nhận tính thẩm quyền của nguồn (official/mirror/volunteer)

Wisdom-QA **KHÔNG** biết "hôm nay cần dùng khai thị nào" — đó là Calendar's job.

---

## Composition flow (Luồng ghép nội dung)

```
Calendar                          Wisdom-QA
    |                                  |
    |-- [1] Xác định context ngày --->|
    |    (lunar date, event type)      |
    |                                  |
    |-- [2] Query sourceRefs -------->|
    |    by tag: 'phong-sanh',         |
    |    'mung-1', 'niem-kinh', ...    |
    |                                  |
    |<-- [3] SourceRef[] -------------|
    |    { publicId, type, title,      |
    |      excerpt, sourceUrl }        |
    |                                  |
    |-- [4] Assemble advisoryCard -----> (local, không gọi thêm)
    |    practiceSequence (Calendar-owned)
    |    + sourceRefs (pointer tới Wisdom-QA)
    |                                  |
    [5] Return response to client
```

**Quan trọng**: Calendar nhận `SourceRef` objects — chỉ có `publicId`, `title`, `excerpt`, `sourceUrl`.
Calendar **không** nhận và không copy `originalText` hoặc `translatedText` đầy đủ vào advisory.
Client tự fetch full content nếu cần (via `GET /api/wisdom/:publicId`).

---

## SourceRef contract (Hợp đồng tham chiếu nguồn)

Đây là shape Calendar nhận từ Wisdom-QA khi compose advisory:

```typescript
const SourceRefSchema = z.object({
  publicId:    z.string(),
  entryType:   z.enum(['wisdom_entry', 'qa_entry']),
  title:       z.string(),
  excerpt:     z.string(),           // tối đa 300 chars
  sourceUrl:   z.string().url().optional(),
  sourceName:  z.string().optional(), // tên nguồn thẩm quyền
  tags:        z.array(z.string()),
});
```

Wisdom-QA module expose một internal service method:

```typescript
// internal, không phải public HTTP endpoint
WisdomQueryService.findSourceRefsByTags(tags: string[], limit: number): Promise<SourceRef[]>
```

---

## Advisory response shape (Lược đồ response advisory)

```typescript
const PracticeCalendarResponseSchema = z.object({
  date:       z.string().date(),       // ISO date
  lunarDate:  z.string(),              // e.g. "Mùng 1 tháng 2 Bính Ngọ"
  eventName:  z.string().optional(),   // tên sự kiện nếu có
  eventType:  z.string().optional(),   // 'phong_sanh', 'le_vu_lan', etc.
  advisoryCards: z.array(z.object({
    cardTitle:        z.string(),       // e.g. "Thực hành chính ngày hôm nay"
    practiceSequence: z.array(z.string()), // Calendar-owned, e.g. ["Niệm kinh buổi sáng", "Phóng sanh trưa"]
    recitationRules:  z.array(z.string()).optional(), // e.g. ["Thánh Vô Lượng Thọ 37 biến sau phóng sanh"]
    sourceRefs:       z.array(SourceRefSchema),       // pointers tới Wisdom-QA
  })),
  reminderScheduled: z.boolean(),      // có reminder nào đã schedule chưa
});
```

---

## What Calendar does NOT do (Những gì Calendar không được làm)

| Hành động | Tại sao không |
|---|---|
| Copy `originalText` hoặc `translatedText` đầy đủ vào event record | Vi phạm ownership của Wisdom-QA |
| Tự tạo hoặc sinh ra khai thị mới | Không có thẩm quyền — teaching phải từ Wisdom-QA |
| Hardcode teaching text trong migration/seed | Breaking ownership rule + text drift |
| Modify provenance hoặc review status của Wisdom-QA | Không phải Calendar's responsibility |
| Cache toàn bộ teaching text lâu dài | Short TTL cache excerpt OK, nhưng không store full text |

---

## Recovery path (Đường phục hồi)

Khi `personalPracticeCalendarReadModel` drift:
- **Recovery**: replay `calendar.event.updated` signal hoặc recompute window
- **Không** được: patch tay advisory content, copy text từ Wisdom-QA mà không qua query

Khi Wisdom-QA entries thay đổi (update source text):
- Calendar advisory sẽ tự reflect qua `excerpt` refresh khi next compose
- Calendar không cần subscribe vào Wisdom-QA update events — pull on demand

---

## Notes for AI/codegen

- Calendar không own text của khai thị — chỉ own pointers (SourceRef)
- `practiceSequence` là Calendar-authored strings — không phải quotes từ Wisdom-QA
- `recitationRules` là operational rules (e.g., "37 biến") từ calendar/practice domain — không phải literal khai thị text
- advisory có thể mang `recommendedScenarioPresetRef`, nhưng preset canonical vẫn do `Content` sở hữu.
- `WisdomQueryService.findSourceRefsByTags` là internal call — không phải HTTP request giữa apps
- nếu Wisdom-QA không có entry phù hợp với tags, advisoryCard vẫn valid với `sourceRefs: []`
- không hardcode `publicId` của wisdom entries trong Calendar code
