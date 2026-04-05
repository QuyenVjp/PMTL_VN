# SHIMS (Legacy Governance Files)

⚠️ **AUDIT TRAIL ONLY** — Files cũ để maintain backward link compatibility.
Không edit files này. Redirect tới **canonical owners** bên dưới.

---

## Shim → Canonical Owner Mapping

| Legacy File | Status | Canonical Owner | Notes |
|---|---|---|---|
| `SOURCE_PRIORITY.md` | ❌ Deprecated | [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md) + [DECISIONS.md](../01-repo-constitution/DECISIONS.md) | Source priority rules merged |
| `GOVERNANCE_SYSTEM.md` | ⚠️ Partial | [DECISIONS.md](../01-repo-constitution/DECISIONS.md) (decision part) + [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md) (precedence part) | Taxonomy still in GOVERNANCE_SYSTEM, can read but DECISIONS thắng conflicts |
| `STATUS_AND_PHASE.md` | ❌ Deprecated | [design/04-execution-overlay](../04-execution-overlay) + [design/05-references/brd-research](../05-references/brd-research) | Status/phase semantics moved to domain implementation tracking |
| `CONFLICT_RESOLUTION.md` | ❌ Deprecated | [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md) (Precedence rule section) | Conflict resolution rules → ownership registry |
| `CANONICAL_LAYOUT.md` | ❌ Deprecated | [FOLDER_CANON.md](./FOLDER_CANON.md) | Layout structure → dedicated folder canon file |
| `IMPORT_AND_FORMAT.md` | ❌ Deprecated | [WRITING_STANDARDS.md](./WRITING_STANDARDS.md) | Format standards still in WRITING_STANDARDS |
| `DOC_TAXONOMY.md` | ⚠️ Partial | [GOVERNANCE_SYSTEM.md](./GOVERNANCE_SYSTEM.md) (taxonomy section) | Taxonomy moved inline, reference as needed |
| `IMPLEMENTATION_STATUS_SCHEMA.md` | ❌ Deprecated | [design/04-execution-overlay](../04-execution-overlay) + project tracking tools | Status schema → execution overlay readiness reports |

---

## Reading Guide

**For new developers:**
- ✅ Do NOT read shims
- ✅ Start with [design/00-governance/README.md](./README.md)
- ✅ Then read [design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md)
- ✅ If conflict → read [design/01-repo-constitution/DECISIONS.md](../01-repo-constitution/DECISIONS.md)

**If you land on a shim via search:**
- ✅ Follow the "Canonical Owner" link above
- ✅ Or navigate to [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md)

---

## Policy: No New Shims

- Once a governance file is deprecated, it stays as shim-only (read-only link targets)
- Do not create new shim files
- Update the table above if a shim is deleted or consolidated

---

## Timeline

- 2026-03-27: Governance consolidation audit
- 2026-04-05: Shims table created, ownership clarified
