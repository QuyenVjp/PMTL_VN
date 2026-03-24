# MANAGED_PLATFORM_PATTERNS — Learnings PMTL Can Import Without Losing Authority

File này chốt các pattern có thể học từ managed platforms như Supabase mà không làm lệch kiến trúc `apps/api` authority của PMTL.

Mục tiêu:

- học `defaults`, `DX`, `observability`, `security posture`, `AI-readiness`
- không biến vendor platform thành source of truth của PMTL

> `apps/api` vẫn là backend authority duy nhất
> `Postgres` vẫn là source of truth duy nhất
> Managed service chỉ được học ở level pattern, guardrail, hoặc operator UX

Related refs:

- `design/DECISIONS.md`
- `design/baseline/security.md`
- `design/baseline/secret-management.md`
- `design/baseline/observability-architecture.md`
- `design/baseline/storage-lifecycle.md`
- `design/baseline/dependency-governance.md`

---

## 1. What PMTL should import now

### 1.1 Secure-by-default posture

Học từ Supabase:

- asymmetric signing keys / JWKS mindset
- exposed schema/API surface bị siết dần theo principle of least exposure
- public-facing defaults phải an toàn từ đầu, không trông chờ “sau này siết”

Áp dụng vào PMTL:

- giữ direction auth/session hardening mạnh
- document rõ public-safe vs secret-bearing endpoints
- schema / metadata exposure không được public by accident
- OpenAPI/health/metrics/docs endpoints phải có exposure policy rõ ngay từ scaffold

### 1.2 RLS mindset, translated to PMTL-safe rules

PMTL không dùng browser-to-DB model kiểu Supabase.

Nhưng có thể học tinh thần:

- deny-by-default
- policy-first authorization
- object-level access control không để route/controller tự đoán

Áp dụng vào PMTL:

- dùng đây như review lens cho explicit authz checks đã được owner ở `baseline/security.md` và `design/DECISIONS.md`
- explicit checks vẫn nằm ở `apps/api`; nếu về sau có DB-level policy hỗ trợ thêm thì nó là defense-in-depth
- về sau nếu có DB-level policy hỗ trợ thêm, nó là defense-in-depth chứ không thay `apps/api` authority

### 1.3 Operator-friendly security advisor mindset

Học từ Security Advisor / AI-assisted fixes:

- security posture nên được productized thành checklist/operator surface
- config drift dễ thấy hơn nếu có review surface thay vì để nằm rải trong docs

Áp dụng vào PMTL:

- về sau nên có admin/operator security status surface cho:
  - auth hardening flags
  - upload risk posture
  - search engine mode / fallback
  - secret rotation freshness
  - public surface exposure sanity

### 1.4 Docs-as-product for AI

Học từ docs export Markdown + one-click AI handoff:

- docs có lợi hơn khi owner rõ, linkable, và path-stable
- markdown clean giúp AI/dev handoff đỡ lệch hơn

Áp dụng vào PMTL:

- coi đây là validation cho hướng đã owner ở `ROOT_DOC_OWNERSHIP.md` và `baseline/writing-standards.md`
- không dùng file này để phát minh docs policy mới ngoài các owner docs đó

### 1.5 Observability as a first-class product surface

Học từ Observability Overview, log drains, charts:

- operator cần nhìn được auth/storage/search/functions như product primitives
- log sink và dashboard nên là operator workflow, không chỉ infra appendix

Áp dụng vào PMTL:

- tiếp tục giữ `observability-architecture.md` bám vào auth/session, storage, search, admin ops
- sau này khi Phase 2+ tới, nên thêm log-drain/export-friendly posture cho:
  - Loki / Sentry / Datadog / S3-like sink
- status surface nên ưu tiên health of product capabilities, không chỉ CPU/RAM

### 1.6 Storage safety and consistency thinking

Học từ storage overhaul của Supabase:

- object listing scale matters
- orphan object prevention matters
- path traversal / direct-SQL delete edge cases phải được nghĩ từ đầu

Áp dụng vào PMTL:

- tiếp tục giữ storage abstraction + media consistency checks
- ưu tiên “DB metadata and object lifecycle stay in sync”
- explicit orphan/missing/mismatch rate trong restore drill là rất đúng hướng

### 1.7 AI-assisted database ergonomics, but advisory only

Học từ query advisor / explain diagrams / best-practice AI:

- AI có thể giúp operator/dev nhận diện missing indexes, query smell, permission smell

Áp dụng vào PMTL:

- sau này có thể thêm admin/internal query advisory surface
- nhưng advisory không thay thế migration review, query review, hay contract review

### 1.8 Snippets and repo-shared operator artifacts

Học từ SQL snippets lưu local/git-share:

- snippets/runbooks/query recipes nên versioned, shareable, repo-owned

Áp dụng vào PMTL:

- SQL snippets, health probes, incident queries, search reindex queries nên có repo-home rõ
- không để operator knowledge chỉ sống trong dashboard riêng hay chat history

---

## 2. What PMTL can plan for later

### 2.1 Read-only MCP and AI connectors

Học từ Supabase MCP:

- AI connector muốn an toàn phải scope được project, capability, read-only mode

Áp dụng vào PMTL:

- nếu sau này PMTL expose MCP/tool surfaces cho runtime data:
  - read-only first
  - scope by environment
  - internal-only by default
  - no production shortcut auth

### 2.2 Security analysis surfaces in admin

Có thể đưa vào design Phase 2+:

- security posture page
- “what is exposed” diagnostics
- secret age / rotation reminder
- auth redirect / callback / trusted-origin sanity checks

### 2.3 Export-friendly audit and observability sinks

Có thể đưa vào design Phase 2+:

- log drains
- incident export bundles
- structured audit export
- monitoring sink abstraction

### 2.4 Query/index advisory UX

Có thể đưa vào design Phase 2+:

- explain/analyze visual aid
- missing index hints cho admin/operator
- search freshness / query cost diagnostics

---

## 3. What PMTL should explicitly NOT import

### 3.1 Browser-to-database authority

Không import model:

- client gọi DB/data API như business authority
- auth/session/storage policy nằm ở platform vendor thay vì `apps/api`

### 3.2 Managed service as canonical product boundary

Không import model:

- “vì vendor có auth/storage/realtime nên PMTL bỏ module authority”
- “service role key” dùng như shortcut cho app/business flow

### 3.3 Public schema introspection by convenience

Không import model:

- OpenAPI/schema/introspection public chỉ vì DX
- metadata endpoint mở rộng hơn mức product cần

### 3.4 Feature adoption by hype

Không import chỉ vì:

- AI table filters
- vector buckets
- white-label platform
- quick starts cho framework khác
- edge-function-centric patterns khi PMTL chưa chọn path đó

---

## 4. Design changes PMTL is justified to make from these learnings

Những thay đổi dưới đây là hợp lý ở mức design:

1. Siết rõ hơn default exposure rules cho docs/OpenAPI/metrics/schema-like endpoints.
2. Tăng độ rõ của public-safe vs privileged key classes.
3. Dùng “policy-first authz” như review lens cho các authz rules đã owner ở `baseline/security.md`.
4. Chuẩn hóa read-only/scope-first rule cho MCP/connectors/tooling access.
5. Bổ sung future operator surfaces:
   - security posture
   - observability overview
   - query/index advisory
   - storage consistency status
6. Chuẩn hóa repo-shared snippets/runbook artifacts cho SQL/ops.

---

## 5. Decision summary

PMTL nên học từ Supabase ở:

- secure defaults
- exposed-surface minimization
- docs-for-AI
- operator UX
- observability productization
- storage consistency
- advisory tooling

PMTL không nên học ở:

- authority placement
- browser-to-DB trust model
- vendor-key shortcuts
- feature adoption theo hype cycle
