# visuals/

Folder này chứa visual artifacts (Mermaid diagrams, C4 models) cho `design/`.

Đây là **orientation layer** — không override owner docs trong `01-repo-constitution/`, `02-platform-baseline/`, hay `03-domains/`.

## Files

| File | Nội dung |
|---|---|
| `C4_SYSTEM_CONTEXT.md` | C4 Level 1 (System Context) + Level 2 (Container View) + Level 3 (API structure) |
| `DOMAIN_INTERACTION_MAP.md` | 11 domain ownership map, cross-domain read refs, anti-patterns |

## Rule

- Nếu diagram này khác với owner docs → **owner docs thắng**.
- Cập nhật diagram khi thay đổi architecture/domain ownership thật.
- Không dùng diagram để justify implementation nếu IMPLEMENTATION_MAPPING.md chưa có row tương ứng.
