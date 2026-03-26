# VALKEY_CACHE_CANDIDATE_INVENTORY — Cache candidate inventory

File này chốt `cái gì đáng cache bằng Valkey`, `cái gì không`, và `ai owner invalidation`.
Nó bổ sung cho `CACHE_TOPOLOGY.md`; không thay topology 4 lớp hay invalidation chain owner.

> **Topology owner**: `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`
> **Valkey baseline**: `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md`
> **Runtime sources reviewed**: `docs/redis_docs.md` — `node-redis`, `error handling`, `production usage`

## Rules before adding a cache key

- Chỉ cache `derived read` hoặc `coordination read`, không cache canonical write truth.
- Mỗi cache family phải có:
  - key namespace
  - TTL class
  - invalidation owner
  - fallback read path
- Nếu không xác định được invalidation owner, default là `không cache`.

## TTL classes

| Class | TTL | Dùng cho |
|---|---|---|
| `short` | `30-120s` | member aggregates, search status, volatile summary |
| `medium` | `5-15 phút` | public detail/list projections, feature flags |
| `long` | `1-24 giờ` | advisory/date-window snapshots, top-query stats, hiếm đổi |

## Candidate inventory

| Family | Key pattern | Candidate payload | TTL class | Invalidation owner | Activate when | Không phù hợp nếu |
|---|---|---|---|---|---|---|
| Content public detail | `cache:content:post:{publicId}` | public post detail DTO/projection | `medium` | `content.post.*` + `platform/cache` | same DTO/query bị đọc lặp nhiều | page đang chủ yếu dựa vào Next.js cache là đủ |
| Content list/featured | `cache:content:list:{slug}` | featured slots, landing aggregates, guide list projection | `medium` | `content.*.published/unpublished` | list aggregate fan-out đắt | list thay đổi liên tục hoặc thiếu tag/path mapping |
| Wisdom detail | `cache:wisdom:entry:{publicId}` | wisdom/qa detail projection | `medium` | `wisdom.entry.*` | public read-heavy rõ | source provenance thay đổi thường xuyên mà chưa có invalidation chuẩn |
| Wisdom list/glossary | `cache:wisdom:list:{filterHash}` | list/glossary/source navigation aggregates | `medium` | `wisdom.entry.*`, glossary update path | repeated filter shapes nóng | filter combinatorics quá rộng, hit rate thấp |
| Calendar advisory | `cache:calendar:advisory:{date}` | advisory/day bundle cho date cụ thể | `long` | `calendar.advisory.refreshed`, `calendar.event.*`, lunar override | advisory compose tốn công, user đọc lặp | advisory correctness cần cập nhật tức thì nhưng invalidation chưa sạch |
| Calendar date window | `cache:calendar:window:{from}:{to}:{scope}` | member/public date-range projection | `short` hoặc `medium` | `calendar.event.*`, advisory refresh | tháng/tuần được đọc lặp | query shape quá cá nhân hóa |
| Feature flags | `cache:feature-flags` / `ff:{flagKey}` | evaluated flag snapshot | `medium` | `feature.flag.updated` | flag reads dày trong request path | flag ảnh hưởng public gate mà chưa có revalidation mapping |
| Search ops summary | `cache:search:status` | admin reindex/status summary | `short` | `search.reindex.*` | admin polling nóng | search lane chưa có worker/index runtime |
| Search top queries | `cache:search:top-queries` | rolling popular queries | `long` | time-based/manual flush | ops/reporting cần read nhanh | chưa có consumer thật |
| Dashboard aggregate | `cache:member:dashboard:{userId}` | member dashboard summary | `short` | engagement/vows/notification/calendar mutation owners | dashboard aggregate p95 cao và repeated reads | write frequency cao làm invalidation cost lớn hơn lợi ích |
| Notification summary | `cache:notification:summary:{userId}` | unread count / reminder summary | `short` | notification mutation/delivery owners | unread polling nóng | app yêu cầu strict immediate accuracy ở mọi refresh |
| Contact singleton | `cache:contact:info` | contact info public DTO | `medium` | contact admin update path | public contact page đọc nhiều | CRUD quá hiếm, DB read quá rẻ nên cache không cần |
| Volunteer directory | `cache:contact:volunteers:{locale}` | public volunteer list projection | `medium` | contact volunteer admin update | list read nhiều | filtering hiếm và list nhỏ |

## Explicit do-not-cache list

| Surface | Lý do |
|---|---|
| auth/session authority | phải đọc canonical truth; stale hoặc drift là bug bảo mật |
| CSRF / reset token / refresh token state | correctness và security quan trọng hơn tốc độ |
| upload authorization / delete authorization | không chấp nhận stale permission read |
| moderation report resolution truth | operator cần canonical state, không phải cache snapshot |
| canonical vow / progress / practice entry writes | member vừa ghi xong phải đọc lại đúng từ source of truth |
| admin mutation result authority | admin UI được cache query nhẹ, nhưng mutation success không được dựa trên Redis snapshot |
| search document truth | index/search engine hoặc SQL search là authority, không phải Valkey |

## Key design guardrails

- Dùng namespace ngắn, rõ: `cache:{family}:{id-or-hash}`
- Không nhét object graph quá to vào một key nếu invalidate thường xuyên.
- Filter/list cache phải hash normalized params; không dùng raw query string lộn xộn.
- TTL nên có jitter khi volume lớn để tránh herd effect.

## Decision rule for future AI/codegen

AI chỉ được thêm cache candidate mới khi:

1. nó thuộc một family trong file này, hoặc
2. file này được cập nhật cùng task để thêm family mới

Nếu không, default là đọc trực tiếp từ canonical data path.
