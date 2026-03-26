# PMTL agent-spec audit

---

## A. High-confidence findings

---

### F-01 · `pmtl-data-runtime-keeper` default verification is stale
- **Severity**: high
- **File**: [.claude/agents/pmtl-data-runtime-keeper.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-data-runtime-keeper.md) line 46
- **Problem**: Default verification is `just verify-cms`. The project has deprecated the CMS architecture entirely. [AGENTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/AGENTS.md) and [CLAUDE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/CLAUDE.md) both map backend/API verification to `just verify-cms` still, but the label "cms" is a legacy artifact that will confuse any new session unfamiliar with the rename history.
- **Why it matters**: A new session using this agent for a migration task will run `just verify-cms` and won't know it's a renamed command for the NestJS stack — or worse, will assume the CMS (Payload CMS) is still relevant and start referencing deprecated skill docs.
- **Fix**: Rename the verification note to `just verify-api` (or add a parenthetical `just verify-cms # alias: legacy name for NestJS/api verification`). Then update CLAUDE.md L93 and pmtl-quality-gate.md L43 to use consistent labeling. Either rename the `just` recipe or add an alias and document it everywhere the old name appears.

---

### F-02 · `pmtl-ops-debugger` and `pmtl-release-hardener` overlap on runtime/infra boundary
- **Severity**: high
- **File**: Both [.claude/agents/pmtl-ops-debugger.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-ops-debugger.md) and [.claude/agents/pmtl-release-hardener.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-release-hardener.md)
- **Problem**: Both agents claim Dockercompose, healthchecks, and monitoring as their territory. `pmtl-ops-debugger` says "monitoring, Telegram, and health checks" and `pmtl-release-hardener` says "monitoring, healthchecks" with `just monitoring` as default verification. A new session seeing "Docker is broken" or "monitoring not working" has no deterministic signal for which agent to call.
- **Why it matters**: Both will be reached by the same triggers. The user will pick one and the agent body may read infra docs but prescribe different actions (runtime recovery vs. release config tightening), leading to incompatible suggestions without a handoff protocol.
- **Fix**: Hard boundary: `pmtl-ops-debugger` owns **live runtime recovery** (services down now, stacktrace, logs, fallback). `pmtl-release-hardener` owns **pre-deploy hardening and config changes** (Compose profiles, Caddyfile, healthcheck spec, image build). Add explicit "Do not" clauses to each: "Do not change Compose/Caddyfile structure => call pmtl-release-hardener" and "Do not debug live runtime incidents => call pmtl-ops-debugger." Update README.md routing table accordingly.

---

### F-03 · `pmtl-canon-sync` second example is functionally identical to a normal implementer task
- **Severity**: high
- **File**: [.claude/agents/pmtl-canon-sync.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-canon-sync.md) lines 14–20
- **Problem**: The second example — "Sửa flow auth rồi sync lại design cho chuẩn" — describes writing code first and then syncing docs. But `pmtl-canon-sync` has `Edit, MultiEdit, Write` tools, which means a new session reading this example may use canon-sync to *implement* the auth flow, not just update docs. The example does not distinguish who writes code vs. who writes docs.
- **Why it matters**: This is the single most dangerous precedent in the current spec set. It lets AI justify using pmtl-canon-sync as a full implementer for any task that has a documentation side-effect.
- **Fix**: Rewrite example 2 to make it explicit that implementation was already done by pmtl-api-builder. Canon-sync's job in that scenario is only to update design/ to match what changed. Remove the phrase "Sửa flow auth" entirely from the canon-sync example. Add a "Do not" line: "Do not implement features. Use pmtl-canon-sync only after code changes are verified."

---

### F-04 · `pmtl-search-builder` trigger overlaps with `pmtl-ops-debugger` for search runtime failures
- **Severity**: high  
- **File**: [.claude/agents/pmtl-search-builder.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-search-builder.md) and [.claude/agents/pmtl-ops-debugger.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-ops-debugger.md)  
- **Problem**: `pmtl-search-builder` example 2 is "Tìm giúp vì sao publish xong không ra search" (debugging why search is missing after publish). `pmtl-ops-debugger` example 2 is "Search đang fallback liên tục, xem runtime giúp anh" (debugging continuous fallback). Both are search runtime debugging. The distinction — projection debugging vs. runtime incident — is meaningful but the descriptions are not sharp enough to distinguish them in a new session.
- **Why it matters**: Two agents claim the same trigger shape. Each will grab a different part of the fix and miss what the other would have caught.
- **Fix**: Add explicit call-boundary in each description. In search-builder: "Use for projection and sync debugging (index content, mapping, publish-then-missing). Do not use for infra-level search downtime — call pmtl-ops-debugger." In ops-debugger: "Use for Meilisearch process failures, container health, or repeated fallback events. Do not diagnose index projection problems — call pmtl-search-builder."

---

### F-05 · `just verify-cms` in [pmtl-api-builder.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-api-builder.md) and [pmtl-quality-gate.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-quality-gate.md) both use CMS-era label
- **Severity**: high
- **File**: [.claude/agents/pmtl-api-builder.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-api-builder.md) line 43 and [.claude/agents/pmtl-quality-gate.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-quality-gate.md) line 43
- **Problem**: `pmtl-api-builder` says: "Use `just verify-cms`, `just auth-check`, and `just search-check` when applicable." `pmtl-quality-gate` maps "backend/runtime: `just verify-cms`". The label `verify-cms` is a legacy alias for what is now a NestJS/api verification command. The CMS (Payload) has been deprecated per AGENTS.md "Design-First Direction" and the deprecated skill docs.
- **Why it matters**: Any new session that doesn't know the CMS→NestJS migration history will be confused or will infer the Payload CMS is still canonical backend.
- **Fix**: Same as F-01. Standardize to `just verify-api` or add an inline alias comment everywhere the CMS label appears. Do it in a single coordinated patch (see Section E).

---

### F-06 · `pmtl-architect` has no explicit "Do not implement" enforcement
- **Severity**: medium
- **File**: [.claude/agents/pmtl-architect.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-architect.md) line 42
- **Problem**: The file says "Do not edit files. Your job is placement, review, and plan quality." This appears only as the last one-line line with no tooling enforcement. The tool list includes only `Read, Grep, Glob, Bash` — which is correct — but the description says "implementation planning" which can be read as planning + implementing.
- **Why it matters**: A Codex session seed with this file may see "Bash" tools and "implementation planning" in the description, and drift into running implementation commands.
- **Fix**: Add a "Boundaries" section to the body: "Do not edit source files. Do not run pnpm/npm/build commands. Use Bash only for reading (rg, git grep, cat). Hand off to the implementer role explicitly when the plan is ready." Also remove "implementation planning" from the description, replacing with "planning and handoff readiness."

---

### F-07 · `pmtl-doc-researcher` and `pmtl-canon-sync` have nearly identical rules sections
- **Severity**: medium
- **File**: [.claude/agents/pmtl-doc-researcher.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-doc-researcher.md) lines 32–36 and [.claude/agents/pmtl-canon-sync.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-canon-sync.md) lines 32–36
- **Problem**: Both files say: "Separate upstream truths, PMTL inferences, and unresolved policy decisions." Both say "do not import speculative claims." The canon-sync rules almost duplicate the doc-researcher rules word for word.
- **Why it matters**: Maintainability. When policy changes, the update will be made in one but not the other. Also, a session trying to choose between the two has no meaningful distinction.
- **Fix**: Make the handoff explicit: "pmtl-doc-researcher returns facts. pmtl-canon-sync takes those facts and writes them into design/." Add a note in each: "pmtl-doc-researcher does not write to design/. pmtl-canon-sync does not conduct fresh external research."

---

### F-08 · [README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/README.md) "How to use" section lacks a concrete task-to-agent decision tree
- **Severity**: medium
- **File**: [.claude/agents/README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/README.md) lines 43–75
- **Problem**: The How-to-use section lists task types one by one but doesn't handle multi-agent workflows, ambiguous cases, or tasks that could fit two roles. The only exception is "planning/placement first → architect." There's no guidance on the canon-sync vs doc-researcher split, the ops-debugger vs release-hardener split, or the api-builder vs data-runtime-keeper split for data-touching backend tasks.
- **Why it matters**: Codex/Gemini starting a new chat and reading README.md first will pick the agent that appears earliest in the list for ambiguous tasks.
- **Fix**: Add a 2-column decision table after the routing list: "If X, use Y, not Z" for every known ambiguous pair. Minimum entries: api-builder vs data-runtime-keeper, search-builder vs ops-debugger, ops-debugger vs release-hardener, canon-sync vs doc-researcher.

---

### F-09 · `pmtl-admin-builder` verification uses `just verify-web` but admin may be a separate app
- **Severity**: medium
- **File**: [.claude/agents/pmtl-admin-builder.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-admin-builder.md) line 46
- **Problem**: Default verification is `just verify-web`. If `apps/admin` is a separate Vite/React app (as suggested by prior conversation context about Vite configs and Cloudflare tunnel for admin), running `just verify-web` may target `apps/web` (Next.js), not `apps/admin`.
- **Why it matters**: The agent would report no failures for the wrong app surface.
- **Fix**: Clarify which Just recipe verifies `apps/admin` specifically. If it's the same as `apps/web`, add a note explaining why. If not, add `just verify-admin` or equivalent. Audit the `justfile` to confirm which recipe covers what path.

---

### F-10 · `pmtl-release-hardener` verification is vague ("targeted compose/health checks")
- **Severity**: medium
- **File**: [.claude/agents/pmtl-release-hardener.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-release-hardener.md) line 47
- **Problem**: Default verification says "targeted compose/health checks for deploy/runtime changes" without naming any concrete commands. In contrast, other agents name specific `just` recipes.
- **Why it matters**: A session ending with release-hardener work has no deterministic next command. It will improvise, which defeats the purpose of having a verification step.
- **Fix**: Name at minimum two concrete commands: `just dev-rebuild && just dev-logs` for compose changes, `curl -sf http://localhost:PORT/health` or equivalent for healthcheck validation, and `just monitoring` for monitoring lane. Pick the right ones per the justfile and lock them.

---

### F-11 · `pmtl-quality-gate` description trigger is too broad — "before finishing a task" catches everything
- **Severity**: medium
- **File**: [.claude/agents/pmtl-quality-gate.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/pmtl-quality-gate.md) line 3
- **Problem**: "Use for review, verification planning, targeted checks, regression spotting, and readiness decisions before finishing a task." This matches almost every task ending. The examples are also generic ("Check giúp anh trước khi chốt", "Task này xong chưa").
- **Why it matters**: An AI session in a new chat will interpret this as the natural endpoint of every task, not a specialized role. It will call quality-gate when what's actually needed is just running a targeted check the implementer already knows.
- **Fix**: Tighten description to: "Use when the changed surface spans multiple modules, when the right verification command is ambiguous, or when you need a second-pass review before marking a task done. Do not use as a substitute for the standard verification step already called by the implementer role." Add a third example that shows a case where calling quality-gate is wrong (implementer just fixed one file → run verify directly, no need for quality-gate).

---

### F-12 · CLAUDE.md "PMTL Subagents" section lists `claude-worker` and `codex-worker` without clarifying they are external compare lanes, not PMTL role specs
- **Severity**: medium
- **File**: [CLAUDE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/CLAUDE.md) lines 74–77
- **Problem**: `claude-worker`, `codex-worker`, `copilot-worker`, `gemini-worker` are listed under "PMTL Subagents" alongside the actual role specs. A new session reading this will treat them as peers to `pmtl-architect`, which is wrong — they are advisory external workers dispatched via the multi-cli orchestrator.
- **Why it matters**: A session may route an implementation task to `claude-worker` thinking it is a PMTL-aware builder, but it's a raw external CLI with no PMTL design/ context loaded.
- **Fix**: Move the four `*-worker` lines to a separate subsection "External compare workers" with a note: "These are not PMTL role specs. They are advisory lanes dispatched via pmtl-multi-cli-orchestrator and should not receive implementation tasks directly."

---

### F-13 · AGENTS.md "Skill Routing" and "Skill Routing Order" sections are partially redundant with README.md routing table
- **Severity**: low
- **File**: [AGENTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/AGENTS.md) lines 62–87
- **Problem**: AGENTS.md has two skill routing sections (Skill Routing + Skill Routing Order) that both list routing priorities but never cross-reference [.claude/agents/README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/.claude/agents/README.md). README.md has its own routing table. A new session reading AGENTS.md will build a complete routing picture from AGENTS.md alone, and will never consult the agent README, which contains the per-agent role briefs.
- **Why it matters**: The link between AGENTS.md skill routing and the `.claude/agents/` role specs is implicit. A non-Claude tool (Codex, Gemini) loading only AGENTS.md won't know the agent specs exist.
- **Fix**: Add one explicit line in AGENTS.md "Agent Operating Model" section: "Role brief files for per-task specialization live in `.claude/agents/README.md`; read that index before picking an implementer or verifier."

---

### F-14 · All 11 agent specs use `effort: high` — this is meaningless as a signal
- **Severity**: low
- **File**: All agent spec files, YAML frontmatter
- **Problem**: Every agent file sets `effort: high`. This metadata field exists to communicate to Claude Code's task scheduler how much compute to allocate. When everything is high, the field carries zero selection signal.
- **Why it matters**: Tools that use the effort field for task routing or display will show no differentiation. Also, a researcher or doc agent doing a read-only fact-check doesn't need the same effort level as an implementer building a new module.
- **Fix**: Set `pmtl-doc-researcher` and `pmtl-architect` to `effort: medium` (read-heavy, plan output, no large code output). Set implementers to `effort: high`. Ops-debugger can stay high for incidents. Quality-gate can be `effort: medium` unless it's a large cross-surface review.

---

### F-15 · `pmtl-api-builder` example 2 (search sync fix) should route to `pmtl-search-builder`, not api-builder
- **Severity**: medium
- **File**: `.claude/agents/pmtl-api-builder.md` lines 14–21
- **Problem**: Example 2 — "Sửa publish API để sync Meilisearch đúng hơn" — is described as api-builder work. But the sync path between canonical write and Meilisearch projection is exactly what `pmtl-search-builder` is designed for. Using api-builder for this task risks treating search as more than a projection.
- **Why it matters**: It's the canonical PMTL anti-pattern: api-builder doesn't know the search projection rules as explicitly as search-builder does. The wrong agent will write a direct-write to Meilisearch inside the controller instead of going through the projection event path.
- **Fix**: Replace example 2 in api-builder with a task that is purely backend: e.g., rate limiting, permission matrix, or a new DTO with audit emission. Add a note: "For tasks touching search sync or projection behavior, prefer pmtl-search-builder." Move the publish-sync example to pmtl-search-builder as example 3.

---

## B. Overlap matrix

| Agent Pair | Overlap Type | Risk Level | Recommended Boundary |
|---|---|---|---|
| `pmtl-ops-debugger` ↔ `pmtl-release-hardener` | Docker, compose, monitoring, healthchecks | **Risky** | ops-debugger = live recovery; release-hardener = pre-deploy config. Hard cutover at "is the service running right now?" |
| `pmtl-search-builder` ↔ `pmtl-ops-debugger` | Search runtime/fallback debugging | **Risky** | search-builder = projection/sync/index; ops-debugger = Meilisearch container/process down |
| `pmtl-canon-sync` ↔ `pmtl-doc-researcher` | Doc verification and writing | **Risky** | doc-researcher = evidence in; canon-sync = write to design/. Neither crosses into the other. |
| `pmtl-api-builder` ↔ `pmtl-data-runtime-keeper` | Backend implementation with schema/data access | **Acceptable** | api-builder writes service/controller/DTO; data-runtime-keeper owns Prisma schema, migrations, transaction contracts. Overlap is real but manageable if each file makes the handoff point explicit. |
| `pmtl-web-builder` ↔ `pmtl-admin-builder` | Frontend code, packages/ui | **Acceptable** | web-builder = apps/web + packages/ui (public-facing). admin-builder = apps/admin only. Both may touch packages/ui but for different package consumers. Make this explicit in descriptions. |
| `pmtl-architect` ↔ `pmtl-quality-gate` | Pre-implementation plan vs. post-implementation review | **Acceptable** | Acceptable as long as architect explicitly triggers handoff to implementer, and quality-gate doesn't re-plan from scratch. |
| `pmtl-release-hardener` ↔ `pmtl-data-runtime-keeper` | Migration rollback, backup posture | **Should be reduced** | data-runtime-keeper claims "backup/restore posture" but release-hardener owns infra-level recovery runbooks. Add explicit scope: data-runtime-keeper covers Prisma migration safety, not Docker volume backups or compose-level restore. |

---

## C. Quick wins

1. **Standardize all verification labels from `verify-cms` to `verify-api`** (or add inline alias comments) across `pmtl-api-builder.md`, `pmtl-data-runtime-keeper.md`, `pmtl-quality-gate.md`, and `CLAUDE.md`. One patch, high signal gain.

2. **Add "Do not" section to `pmtl-doc-researcher.md`**: "Do not write to design/ or any source file. Return bullets with sources only. Hand off to pmtl-canon-sync for writing."

3. **Add "Do not" section to `pmtl-architect.md`**: "Do not edit source files. Do not run build/install commands. Use Bash only for search tools (rg, git grep). Produce a written plan and name the next agent explicitly."

4. **Add routing decision table to `README.md`** (after line 75): a compact table covering all ambiguous pairs so any tool reading README.md alone can disambiguate without guessing.

5. **Fix the misleading canon-sync example 2** — rewrite it to make clear that implementation was already done; canon-sync's job starts post-implementation (see F-03).

6. **Set `effort` metadata to differentiate read-only vs. write roles** — doc-researcher and architect should not be `effort: high`.

7. **Move `*-worker` lines in CLAUDE.md** to a separate "External compare lanes" subsection with a warning that they are not PMTL-aware role specs (see F-12).

8. **Add one cross-reference line in AGENTS.md** under "Agent Operating Model" pointing to `.claude/agents/README.md` as the role brief index (see F-13).

9. **Clarify `apps/admin` verification** in `pmtl-admin-builder.md` — confirm whether `just verify-web` legitimately covers admin or if a separate recipe is needed (see F-09).

10. **Replace api-builder example 2** (publish→search sync) with a pure backend task; move that example to search-builder (see F-15).

11. **Add third example to `pmtl-quality-gate.md`** showing when *not* to use quality-gate (single-file fix = just run the verify command yourself, no pmtl-quality-gate needed).

12. **Add a `tools: WebFetch` or equivalent** to `pmtl-doc-researcher.md` if the tool supports web access. The agent claims to research official docs but has no fetch tool listed — it can only `Bash` + `Read`. A session using this as a prompt seed for Codex or Gemini will have no web access signal.

---

## D. Missing pieces

1. **`docs/codex-agent-quickstart.md`** — A one-page cheatsheet for starting a fresh Codex/Gemini session: which agent file to load, which docs to read first, what the first 3 commands should be. Currently this knowledge is scattered across README.md, AGENTS.md, and CLAUDE.md with no synthesis.

2. **Agent-to-task matrix** — A table mapping common task shapes ("add a new API endpoint", "debug Docker startup", "migrate a Prisma schema", "update official-doc canon") to the exact agent sequence (planner → implementer → verifier). README.md "How to use" gestures at this but doesn't commit to rows.

3. **Canonical naming rules for future agent files** — Currently the convention is `pmtl-<noun>-<verb/role>.md` but it's not written down. A future author adding a new agent (e.g., `pmtl-redis-keeper` or `pmtl-email-builder`) has no naming contract to follow.

4. **"How to use these files outside Claude Code" explicit note** — README.md line 4 says "Chúng đang nằm trong .claude/agents/ để tương thích với tooling hiện có, nhưng không bị khóa vào Claude." But there's no concrete instruction for using them as Codex prompt seeds: which frontmatter to strip, which sections to pass as system prompt, etc.

5. **Inverse routing guide: "agent to avoid" per task type** — The routing table tells you what to use. There's no table telling you what *not* to use for a task. The most common misroutes (canon-sync for implementation, ops-debugger for projection debugging, admin-builder for api work) should have an explicit anti-pattern list somewhere.

6. **`just verify-admin` recipe or explicit note** that `verify-web` covers admin if they share the same runner. The ambiguity between apps/web and apps/admin verification is currently unresolved in any file.

---

## E. Proposed patch plan

### Phase 1 — Critical correctness (do first, breaks nothing if done alone)

Files:
- `.claude/agents/pmtl-api-builder.md`
- `.claude/agents/pmtl-data-runtime-keeper.md`
- `.claude/agents/pmtl-quality-gate.md`
- `CLAUDE.md`

Changes:
1. Replace all `verify-cms` with `verify-api` (or add alias comments) in all four files.
2. Fix pmtl-api-builder example 2: replace with pure backend task; add "For search sync, prefer pmtl-search-builder."
3. In CLAUDE.md, move external `*-worker` lines under a separate subsection.
4. Add one line in CLAUDE.md L93 clarifying `just verify-cms` legacy label if the rename hasn't landed in the justfile yet.

### Phase 2 — Boundary hardening (do second, eliminates the dangerous overlaps)

Files:
- `.claude/agents/pmtl-ops-debugger.md`
- `.claude/agents/pmtl-release-hardener.md`
- `.claude/agents/pmtl-search-builder.md`
- `.claude/agents/pmtl-canon-sync.md`
- `.claude/agents/pmtl-doc-researcher.md`
- `.claude/agents/pmtl-architect.md`
- `.claude/agents/README.md`

Changes:
1. Add explicit "Do not" clause + call-boundary in ops-debugger and release-hardener (F-02).
2. Add call-boundary note between search-builder and ops-debugger in both files (F-04).
3. Rewrite canon-sync example 2 to post-implementation-only (F-03).
4. Add "Do not write to design/" in doc-researcher; "Do not conduct fresh research" in canon-sync (F-07).
5. Add "Do not edit files" enforcement section in pmtl-architect (F-06).
6. Add routing decision table to README.md (F-08, C-4).
7. Add cross-reference to `.claude/agents/README.md` in AGENTS.md "Agent Operating Model" (F-13).

### Phase 3 — Polish and missing artifacts (do last, pure additions)

Files to create:
- `docs/codex-agent-quickstart.md`
- (optional) update justfile to add `verify-api` alias or rename

Changes:
1. Write codex-agent-quickstart with agent selection flowchart and first-command table.
2. Add naming rules section to README.md for future agent file authors.
3. Adjust `effort` metadata across all specs (doc-researcher, architect → medium).
4. Add a `tools: WebFetch` note or equivalent to doc-researcher frontmatter if applicable.
5. Confirm or fix pmtl-admin-builder default verification path (F-09).
