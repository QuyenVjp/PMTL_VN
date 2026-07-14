# Public ID Generator Inventory — Plans 5.1

Ngày: 2026-07-14
Task: Plans.md 5.1 `[tdd:skip:analysis-only]` — unblocks 5.2
Owner rule: `design/01-repo-constitution/DECISIONS.md` (public ID = external random id, không phải internal cuid)

## Canon rule (chốt)

- **New records MUST use `nanoid(21)`** (nanoid default length) cho public identity.
- Bare `nanoid()` (no arg) = 21 chars = hợp lệ, nhưng codebase dùng explicit `nanoid(21)` cho rõ ràng — giữ nguyên convention đó.
- Non-21 explicit lengths cho public identity là **drift** phải sửa (task 5.2).
- Non-identity uses (slug suffix, refresh token) không thuộc rule này.

## Lookup compatibility (vì sao đổi length an toàn)

Mọi resolve public record đi qua exact string match: `where: { publicId }` (Prisma `findUnique`/`findFirst`).
Không có nơi nào assert `publicId.length === 12` hoặc slice theo length cố định.
→ Đổi generator sang `nanoid(21)` cho record MỚI **không phá** URL 12-char đang tồn tại; chúng vẫn resolve bằng exact match.
→ Không cần backfill; không cần migration cho existing rows. Chỉ new writes đổi length.

## Drift sites — `nanoid(12)` cho public identity (18 call sites / 6 files) → task 5.2

| File | Count | Domain |
|---|---|---|
| `src/modules/content/daily-practice.controller.ts` | 3 | Daily Practice |
| `src/modules/content/daily-recitation.service.ts` | 3 | Daily Practice |
| `src/modules/content/life-release/life-release.service.ts` | 3 | Life Release |
| `src/modules/content/little-house/little-house.service.ts` | 3 | Little House (content) |
| `src/modules/content/self-cultivation/self-cultivation.service.ts` | 2 | Self Cultivation |
| `src/modules/wisdom-qa/wisdom-qa.service.ts` | 4 | Wisdom-QA |

Audit gọi tên 3 domain (Daily Practice, Self Cultivation, Wisdom-QA); inventory mở rộng thêm Life Release + Little House content dùng cùng pattern → 5.2 phải xử lý cả 6 file để không để sót drift.

## Valid `nanoid(21)` sites (không đụng)

Tất cả call site còn lại đã dùng `nanoid(21)` đúng canon: identity, audit, dharma-compliance, engagement, events, moderation, sacred-forms, vows-merit, altar, little-house (member module), life-liberation, storage, content posts. Không cần thay đổi.

## Non-identity generators (out of scope — KHÔNG đổi)

| Site | Use | Lý do giữ |
|---|---|---|
| `wisdom-qa.service.ts:239` `nanoid(8)` | slug suffix `wisdom-xxxxxxxx` | slug uniqueness, không phải public id |
| `admin-media.controller.ts:654` `nanoid(6)` | folder slug fallback `thu-muc-xxxxxx` | slug uniqueness, không phải public id |
| `sessions.service.ts:15` `nanoid(64)` | refresh token | security token, dài hơn cố ý |
| `request-id.middleware.ts:23` `nanoid(21)` | `req_` correlation id | transport, đã đúng 21 |

## Collision / uniqueness

- `nanoid(21)` = 21 chars, alphabet 64 → ~121 bits, collision risk negligible ở scale PMTL.
- `nanoid(12)` = ~71 bits — vẫn an toàn cho hiện tại nhưng dưới canon; đổi lên 21 tăng margin, không giảm.
- Mọi `publicId` column có UNIQUE index → DB constraint là backstop nếu có collision, insert fail thay vì silent dup.

## 5.2 execution plan

1. Đổi `nanoid(12)` → `nanoid(21)` tại 18 call site trong 6 file (chỉ new-write path).
2. KHÔNG đổi lookup logic (đã exact-match, tương thích ngược sẵn).
3. Test: unit assert new record `publicId.length === 21`; regression assert một 12-char id giả lập vẫn resolve qua repository lookup.
4. KHÔNG backfill existing rows.
