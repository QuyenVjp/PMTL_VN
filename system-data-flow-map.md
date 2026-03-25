# PMTL System Data Flow Map

**Purpose**: Clarify module boundaries, ownership rules, and data flow patterns for a distributed Buddhist practice platform.

---

## 11 Core Modules & Ownership

| # | Module | Responsibility | Owns | Does NOT Own |
|---|--------|-----------------|------|--------------|
| 1 | **Identity** | Auth, authorization, user profiles | User auth state, roles, identity claims | Profile preferences (Engagement), community reputation |
| 2 | **Content** | Editorial: posts, guides, sutras, rituals, media | Posts, guides, sutras, chants, rituals, life release content | User engagement state, bookmarks, reading progress |
| 3 | **Community** | User-generated content, comments, posts | Comments, discussions, author snapshots (immutable) | Editorial content (Content-owned), raw user state (Engagement) |
| 4 | **Engagement** | User state tracking & preferences | Bookmarks, reading progress, practice sheets, user preferences | Editorial content (Content), calendar events (Calendar) |
| 5 | **Moderation** | Report management, content flagging | Reports, moderation decisions, soft-delete enforcement | Editorial content decisions (Content reviews first), user bans (Identity) |
| 6 | **Search** | Full-text public search | Search indexes, filter logic | Content creation, moderation decisions |
| 7 | **Calendar** | Ritual calendar, lunar rules, special observances | Events, lunar day rules, advisory packages | User-specific reminders (Notification-dispatched) |
| 8 | **Notification** | Push/email dispatch, admin sends | Notifications, delivery logs, subscriptions | Calendar dates (Calendar-sourced), expiry detection (Vows-Merit-sourced) |
| 9 | **Vows-Merit** | Vow tracking, merit logs, expiry management | Vows, merit records, expiry state | Calendar dates (Calendar), notification dispatch (Notification) |
| 10 | **Wisdom-QA** | Source-backed teachings, Q&A, audiobooks | Wisdom entries, authority profiles, audio companions, import jobs | Beginner guides (Content), user bookmarks (Engagement) |
| 11 | **Dashboard** | Member home aggregation | Dashboard route | Individual data (delegated to sub-modules) |

---

## Module Ownership Rules

1. **Canonical ownership**: Each entity has ONE authoritative owner module
2. **Immutable snapshots**: When Engagement creates `practiceSheet`, snapshot Content's `scenarioPreset` metadata—don't read fresh
3. **Soft-delete pattern**: Content deletion → Engagement marks with `item_removed`, doesn't hard-delete user data
4. **Moderation filtering**: Search must exclude `isHidden = true` items; Moderation syncs summary to Community on-demand
5. **Author snapshots**: Community author names captured at creation; never updated (preserves historical accuracy)
6. **Cross-module reads**: Permitted (e.g., Engagement reads fresh Content metadata for latest); writes restricted to owner
7. **Event-driven propagation** (Phase 2+): Use outbox pattern—Calendar publishes event → Notification subscribes

---

## Main User Journeys

### **Public Read Journeys**

**Search**:
```
User query → Search API → (SQL fallback)
  ↓ reads Content.posts + Wisdom-QA.entries + Community.comments
  ↓ filters by Moderation.isHidden
  ↓ returns ranked results
```

**Browse Content**:
```
User navigates → Content API → returns post/guide/sutra
  ↓ includes Calendar.relatedEvent if linked
  ↓ Engagement reads bookmark state
```

**View Wisdom**:
```
User searches teaching → Wisdom-QA API → entry + Q&A pairs
  ↓ optionally loads audio companion + authority profile
  ↓ Engagement checks bookmark state
```

**Dashboard**:
```
Member opens home → Dashboard aggregates:
  · Engagement.practiceSummary (recent activity)
  · Calendar.advisorySummary (upcoming observances)
  · Vows-Merit.activeVows (current vow status)
  · Notification.unreadCount
```

### **Admin Write Journeys**

**Create Editorial Content**:
```
Admin → Content API → create post/guide
  ↓ publishes outbox_event (Phase 2+)
  ↓ Search re-indexes (Meilisearch or SQL refresh)
  ↓ becomes discoverable via search/browse
```

**Publish Calendar Event**:
```
Admin → Calendar API → create event
  ↓ publishes outbox_event with advisory package
  ↓ Notification job picks up → queues push notifications
  ↓ Advisory also available to Dashboard/Calendar browse
```

**Moderate Content**:
```
User reports → Moderation API → review & decide
  ↓ set isHidden flag
  ↓ sync summary to Community.moderation (immutable snapshot)
  ↓ Search query filter auto-excludes (next query)
```

---

## Page → Module → Side Effects

### **Read Path Example: `/dien-dan/[slug]`**

```
[Public Page]
   ↓ GET /api/content/posts/{id}
   ↓
[Content Module] reads post (title, body, author, links)
   ↓ if relatedEvent linked, fetches Calendar.event metadata
   ↓ returns with moderation.isHidden flag
[Search Module] filters: if isHidden=true, 404 (upstream at CDN cache layer)
[Community Module] reads comments on this post
   ↓ snapshots author names (immutable, never updates)
[Engagement Module] reads user bookmark state (if authenticated)
   ↓ Side effect: Engagement records page view timestamp
```

### **Write Path Example: `/admin/noi-dung/bai-viet` (Create Post)**

```
[Admin Form]
   ↓ POST /api/content/posts
   ↓
[Content Module] creates post entity
   ↓ Side effect 1: emits outbox_event(postCreated)
   ↓ Side effect 2: linked Calendar events (if any) recorded in relatedEvent
[Search Module] (async) consumes event → recomputes Meilisearch index
   ↓ OR (Phase 1 fallback): API cache invalidated
[Dashboard] (async) search results refresh on next user query
```

### **Write Path Example: User Completes Vow**

```
[Member Page]
   ↓ POST /api/vows/complete/{id}
   ↓
[Vows-Merit Module] records completion
   ↓ updates merit log
   ↓ checks if vow expires within 7 days
   ↓ Side effect: emits outbox_event(vow_expiry_reminder)
[Notification Module] (async) consumes event
   ↓ creates reminder notification
   ↓ dispatches via push/email based on subscription
[Engagement Module] updates vow progress in user profile
```

---

## End-to-End Example: Daily Practice Flow

**Scenario**: User opens `/kinh-bai-tap/phat-luyen-hang-ngay`, completes a practice, bookmarks it, and receives a reminder 2 days later.

### **Step 1: Load Page (Read)**
```
GET /api/content/guides/phat-luyen-hang-ngay
  ↓ [Content] returns guide with nested chantItems, practice metadata
  ↓ [Calendar] (linked) returns today's lunar day + advisory
  ↓ [Engagement] (if auth) returns user's lastReadPosition
  ↓ [Search] (phase-1 fallback) ensures guide isn't marked isHidden
  ↓ Response includes: guide body, calendar context, user's reading position
```

### **Step 2: User Completes Practice (Write)**
```
POST /api/engagement/practice-sheets
  Body: { contentId: "phat-luyen-hang-ngay", scenarioPreset: "daily_morning", completedAt }
  ↓ [Engagement] creates practiceSheet
    ├─ snapshots Content.scenarioPreset metadata (immutable)
    ├─ records completion timestamp
    └─ Side effect: emits outbox_event(practiceCompleted)
  ↓ [Dashboard] (async) updates user's practiceSummary (date-grouped stats)
```

### **Step 3: User Bookmarks (Write)**
```
POST /api/engagement/bookmarks
  Body: { contentId: "phat-luyen-hang-ngay" }
  ↓ [Engagement] records bookmark
    ├─ reads fresh Content metadata (latest version)
    ├─ snapshots at bookmark creation time
    └─ immutable: even if Content updates later, bookmark refs old version
  ↓ [Search] (if user searches later) includes bookmark signal in ranking
```

### **Step 4: Calendar Advisory Triggers Reminder (Write - Async)**
```
[Calendar Job] detects: it's lunar day 15 (important observance)
  ↓ publishes outbox_event(calendarAdvisory)
    └─ advisory: "Today is lunar full-moon; suggest meditating on Infinite Compassion"
  ↓ [Notification] consumes event
    ├─ creates push notification with advisory text
    ├─ targets users subscribed to daily/lunar reminders
    └─ Side effect: dispatches via push/email within 5 minutes
  ↓ [Member Dashboard] next refresh shows: "Upcoming: 2 lunar observances this week"
```

### **Step 5: Content Update — Practice Guide Improved (Async)**
```
[Admin] POST /api/content/guides/phat-luyen-hang-ngay
  Updated: { body, chantItems, relatedEvent }
  ↓ [Content] updates post (new version)
    └─ Side effect: emits outbox_event(contentUpdated)
  ↓ [Search] (Meilisearch) recomputes index for guide
  ↓ [User's Bookmark] remains unchanged
    └─ Points to original version snapshot; doesn't see admin update
  ↓ [User's practiceSheet] references original scenarioPreset
    └─ Versioning: if scenario changes (e.g., add chant), user's completed logs persist unchanged
```

---

## Data Ownership & Dependencies Summary

```
┌─────────────────────────────────────────┐
│ Editorial (Content, Wisdom-QA)          │
│ Authority: admin-only creation          │
└────────────────┬────────────────────────┘
                 │ (provides reference data)
                 ↓
┌─────────────────────────────────────────┐
│ User State (Engagement)                  │
│ Authority: user + admin-assisted entry  │
│ · snapshots editorial metadata          │
│ · immutable at creation time            │
└────────────────┬────────────────────────┘
                 │ (feeds aggregation)
                 ↓
┌─────────────────────────────────────────┐
│ Public Interface (Search, Dashboard)     │
│ Reads: Content + Engagement + Community │
│ Filters: by Moderation.isHidden         │
└─────────────────────────────────────────┘

Parallel:
┌─────────────────────────────────────────┐
│ Community (Comments, Discussions)        │
│ Authority: user-generated, moderated    │
│ Reads: Content (for context)            │
└─────────────────────────────────────────┘

Async Events (Phase 2+):
  Calendar → Notification (advisory dispatch)
  Vows-Merit → Notification (expiry reminders)
  Content → Search (re-index)
```

---

## Key Constraints

- **Soft-delete only**: Never hard-delete user engagement data; mark `item_removed`
- **Immutable snapshots**: Engagement references are timestamped; don't refresh after creation
- **Moderation filtering**: Search always filters `isHidden = true`; no exceptions
- **Author snapshots**: Community stores display name at post creation; never syncs updates
- **Event-driven reliability** (Phase 2+): Use outbox pattern to guarantee Calendar → Notification → user sees advisory within SLO
