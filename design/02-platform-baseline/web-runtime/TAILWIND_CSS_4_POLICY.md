# TAILWIND_CSS_4_POLICY

File này chốt cách PMTL dùng `Tailwind CSS 4`.
Nó tồn tại để AI scaffold không trôi về mindset Tailwind v3 hoặc JS-config-first.

Authority liên quan:

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)
- [VERSION_MATRIX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- [DESIGN_PRINCIPLES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md)
- [TOKEN_IMPLEMENTATION_SHEET.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/TOKEN_IMPLEMENTATION_SHEET.md)
- [SHADCN_UI_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/SHADCN_UI_INVENTORY.md)

## Baseline

- PMTL khóa `Tailwind CSS 4.2.2` theo `VERSION_MATRIX.md`
- baseline là `CSS-first config`, không quay lại `tailwind.config.js` nặng làm authority chính
- design token authority vẫn là PMTL docs; Tailwind chỉ là execution layer của token

## Configuration stance

- ưu tiên `@theme` và CSS variable mapping thay vì JS theme object phình to
- config/bootstrap phải giữ tối giản theo exact app/workspace needs
- không tạo custom plugin hoặc preset trừ khi có owner doc riêng
- không nhét business semantics vào class names

## Token mapping rules

- semantic token ownership đọc ở `DESIGN_PRINCIPLES.md`; `TOKEN_IMPLEMENTATION_SHEET.md` giữ execution mapping sheet
- Tailwind chỉ map CSS variables/tokens, không tự trở thành semantic token owner
- utility classes như `bg-background`, `text-foreground`, `border-border`, `bg-primary` phải map qua CSS variables chuẩn
- arbitrary values chỉ dùng khi token chưa tồn tại và route/component owner xác nhận là case exception

## Monorepo + shadcn rules

- shadcn/Tailwind wiring phải phục vụ monorepo boundary, không đảo ngược boundary
- base primitive reuse thực sự mới đưa vào `packages/ui`
- app-specific composition và route styling vẫn ở `apps/web` hoặc `apps/admin`
- không để Tailwind config trở thành design system song song với PMTL docs

## Forbidden drift

- copy Tailwind v3 guides rồi mang vào PMTL như baseline
- mở rộng theme tùy hứng mà không update token owner docs
- dùng utility-only theming làm source of truth thay CSS variables/tokens
- để một app có token alias khác app còn lại cho cùng semantic meaning
