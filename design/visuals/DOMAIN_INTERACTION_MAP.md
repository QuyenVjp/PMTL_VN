# Domain Interaction Map — PMTL_VN

> **Authority**: orientation/visual only. Owner docs trong `design/03-domains/<domain>/` thắng nếu có xung đột.
> **Rule**: mỗi domain chỉ có một chủ sở hữu dữ liệu thật. Cross-domain chỉ được đọc ref hoặc nhận derived package.
> **Last updated**: 2026-03-27

---

## 11 Domains + ownership boundary

```mermaid
graph TD
  subgraph Platform["Platform (apps/api/src/platform/)"]
    P_Auth["sessions + identity flow"]
    P_Audit["audit_logs"]
    P_FF["feature_flags"]
    P_RL["rate_limit_records"]
    P_Storage["storage adapter"]
    P_Health["health + metrics"]
  end

  subgraph Domains["Business Domains (apps/api/src/modules/)"]
    D1["01 · Identity<br/>users · sessions · roles"]
    D2["02 · Content<br/>posts · hubPages · guides<br/>chantItems · sutras · mediaCollections"]
    D3["03 · Community<br/>communityPosts · comments<br/>guestbookEntries"]
    D4["04 · Engagement<br/>sutraBookmarks · readingProgress<br/>practiceLogs · practiceSheets<br/>ngoiNhaNhoSheets"]
    D5["05 · Moderation<br/>moderationReports<br/>decision history"]
    D6["06 · Search<br/>search index/query<br/>(Meilisearch projection)"]
    D7["07 · Calendar<br/>events · agendaItems<br/>lunarEvents · practiceCalendar"]
    D8["08 · Notification<br/>pushSubscriptions · pushJobs"]
    D9["09 · Vows & Merit<br/>vows · vowProgress<br/>lifeReleaseJournal"]
    D10["10 · Wisdom-QA<br/>wisdomEntries · qaEntries<br/>authorityProfiles · offlineBundles"]
    D11["11 · Contact<br/>contactInfo · volunteers"]
  end

  %% Platform consumed by all domains
  D1 --> P_Auth
  D2 --> P_Storage
  D2 --> P_Audit
  D3 --> P_Audit
  D5 --> P_Audit
  D9 --> P_Audit

  %% Cross-domain read relationships (NOT ownership transfer)
  D3 -->|"author ref"| D1
  D4 -->|"content ref (sutras, chantItems)"| D2
  D4 -->|"advisory context"| D7
  D5 -->|"target ref"| D3
  D5 -->|"actor ref"| D1
  D6 -->|"source fields"| D2
  D6 -->|"source fields"| D10
  D7 -->|"content refs"| D2
  D7 -->|"teaching refs"| D10
  D7 -->|"vow/release hooks"| D9
  D8 -->|"user target"| D1
  D8 -->|"event/advisory"| D7
  D9 -->|"guide ref"| D2
  D9 -->|"time suitability"| D7
  D10 -->|"hub/gateway link"| D2
```

---

## Data ownership: what each domain OWNS vs MUST NOT hold

| Domain | Owns (source of truth) | Must NOT self-hold |
|---|---|---|
| **Identity** | `users`, `sessions`, role/block state, provider linkage | community profile, notification cache source |
| **Content** | `posts`, `hubPages`, `beginnerGuides`, `downloads`, `chantItems`, `chantPlans`, `sutras`, `sutraVolumes`, `sutraChapters`, `sutraGlossary`, `categories`, `tags`, `mediaCollections` | bookmark, reading progress, practice sheets |
| **Community** | `communityPosts`, `communityComments`, `postComments`, `guestbookEntries` | report lifecycle canonical |
| **Engagement** | `sutraBookmarks`, `sutraReadingProgress`, `chantPreferences`, `practiceLogs`, `practiceSheets`, `ngoiNhaNhoSheets` | kinh văn gốc, guide gốc, FAQ gốc |
| **Moderation** | `moderationReports`, decision history | bài/comment gốc |
| **Search** | search query contract, index/status | publish status canonical, moderation status canonical |
| **Calendar** | `events`, `eventAgendaItems`, `eventSpeakers`, `eventCtas`, `lunarEvents`, `lunarEventOverrides`, `practiceCalendarReadModel` | full discourse text, ritual truth gốc |
| **Notification** | `pushSubscriptions`, `pushJobs`, reminder preferences | inbox canonical, source data của event/bài viết |
| **Vows & Merit** | `vows`, `vowProgressEntries`, `lifeReleaseJournal` | guide canonical, ritual script canonical |
| **Wisdom-QA** | `wisdomEntries`, `qaEntries`, `authorityProfiles`, audiobook metadata, offline bundle metadata, source provenance | beginner guide, hub page canonical |
| **Contact** | `contactInfo`, `volunteers` | form submissions, community profile, auth user store |

---

## Side effect taxonomy (when a write triggers downstream)

```mermaid
flowchart LR
  Write["Canonical Write\n(owner module)"]
  Write -->|"sync revalidate"| Cache["Next.js cache\nrevalidateTag"]
  Write -->|"sync or fire-and-forget"| SearchSync["Search index\n(Meilisearch)"]
  Write -->|"outbox_event → Phase 2"| Outbox["outbox_events table\n→ dispatcher → worker"]
  Write -->|"audit append"| AuditLog["audit_logs\n(required on risky writes)"]

  classDef phase2 fill:#ffd,stroke:#aa0
  class Outbox phase2
```

**Phase 1 rule**: side effects dùng sync hoặc fire-and-forget có `log intent + log outcome + recovery path`.
Outbox-driven pattern chỉ activate khi trigger đủ mạnh (xem `DECISIONS.md` section 3).

---

## Module interaction anti-patterns (common mistakes)

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Content giữ `sutraReadingProgress` | Progress là self-owned của user, không phải canonical content | Engagement giữ, đọc content ref |
| Community tự giữ full report lifecycle | Report canonical thuộc Moderation | Community chỉ giữ `target ref`, Moderation ghi decision |
| Search làm source of truth | Search chỉ là projection | Source thật ở Content hoặc Wisdom-QA |
| Calendar chép nguyên kinh văn vào advisory | Calendar chỉ compose, không own text | Calendar compose ref → text gốc ở Wisdom-QA |
| Admin tự sửa Engagement/Vows-Merit của member | Self-owned, cross-user write bị chặn | Phải có assisted-entry canon (xem `ASSISTED_ENTRY_WORKFLOW.md`) |
| `pushJobs` coi là inbox canonical | pushJobs là "phiếu công việc gửi" | Inbox canonical không tồn tại trong phase 1 |

> Owner doc cho từng domain: `design/03-domains/<domain>/CONTRACTS.md`
