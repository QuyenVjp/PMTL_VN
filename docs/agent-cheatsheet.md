# Agent Skills Catalog

File này là bản quét lại toàn bộ skill hiện nhìn thấy trên máy cho PMTL. Mục tiêu của nó là: dễ đọc bằng Markmap, có bản đồ theo chủ đề thực chiến, và vẫn giữ inventory đầy đủ để không mất skill nào.

## Cách đọc file này

- `Repo-local`: skill nằm trong chính repo PMTL. Đây là lớp chuẩn và phải được ưu tiên đầu tiên khi làm việc trong repo này.
- `Global home`: skill trong `~/.agents/skills`, dùng chung giữa nhiều công cụ hoặc nhiều repo.
- `Codex core/generic`: skill trong `~/.codex/skills` nhưng mang tính phổ thông, không chỉ dành cho PMTL.
- `Codex full-stack gap fillers`: skill mới kéo về để bù khoảng trống backend, database, observability, API contracts, infra, NestJS.
- `Trail of Bits`: gói skill chuyên sâu về security, static analysis, fuzzing, crypto, blockchain, reverse engineering.

## Snapshot hiện tại

- Repo-local: 65
- Global home: 29
- Codex core/generic: 13
- Codex full-stack gap fillers: 18
- Trail of Bits: 61
- Tổng số skill đang được index: 186

## Thứ tự ưu tiên khi dùng

1. PMTL repo-local skills
2. Superpowers workflow skills
3. Codex full-stack gap fillers nếu PMTL chưa có skill canonical tương ứng
4. Global generic tool skills
5. Trail of Bits hoặc các specialist pack khi task thuộc security hoặc niche tooling

## Bản đồ chủ đề thực chiến

### 1. Workflow và delivery

- `pmtl-workflow-router`: điểm vào mặc định khi chưa biết nên gọi skill nào.
- `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`: bộ Superpowers để làm rõ spec, chia plan, rồi thực thi.
- `test-driven-development`, `systematic-debugging`, `verification-before-completion`: TDD, debug có hệ thống, và xác minh fix.
- `requesting-code-review`, `receiving-code-review`, `using-git-worktrees`, `finishing-a-development-branch`: review, worktree, kết thúc branch.
- `output-skill`: dùng khi cần output dài và không muốn bị cắt cụt.
- External CLI workers: dùng `py infra/tools/external_agent.py --provider claude|codex|copilot|gemini --prompt "..."` khi cần second opinion từ Claude Code CLI, Codex CLI, Copilot CLI, hoặc Gemini CLI.

### 2. PMTL core

- `pmtl-vn-architecture`: kiến trúc tổng thể Next.js + NestJS + Postgres + Docker/Caddy.
- `pmtl-production-baseline`, `pmtl-production-ready`: baseline production, runtime safety, hardening, docs sync.
- `pmtl-fe-implementation`, `pmtl-fe-craft`: frontend implementation của PMTL.
- `pmtl-ui-behavior`, `pmtl-ui-style-system`, `pmtl-review-web-ui`: behavior, style, UI review.
- `pmtl-verify-quality-gate`, `pmtl-verify-auth-flow`, `pmtl-verify-search-sync`: verify chất lượng, auth, search.
- `pmtl-automation-smoke-suite`, `pmtl-runbook-docker-dev-recovery`: smoke test và recovery cho local/dev stack.

### 3. Frontend, UI, design

- `frontend-design`, `ui-ux-pro-max`, `taste-skill`, `soft-skill`, `minimalist-skill`, `redesign-skill`: thiết kế và nâng cấp UI theo nhiều phong cách.
- `ckm-ui-styling`, `ckm-design-system`, `ckm-brand`, `ckm-design`, `ckm-banner-design`, `ckm-slides`: branding, token, banner, slide, design system.
- `pmtl-creative-designer`, `pmtl-vercel-precision`, `pmtl-uiux-specialist`: tinh chỉnh visual vocabulary và UX của PMTL.
- `shadcn`, `vercel-react-best-practices`, `next`, `nextjs-app-router-fundamentals`: framework support cho React/Next.js/shadcn.

### 4. Backend, database, API contracts, infra

- `kadajett-nestjs-best-practices`: NestJS generic best practices, dùng làm tài liệu tham khảo kỹ thuật cho NestJS.
- `fastagent-schema-designer`, `fastagent-database-migration-helper`, `fastagent-query-optimizer`: schema, migration, query tuning.
- `fastagent-rest-api-designer`, `fastagent-api-documentation-generator`, `levnik-ln-643-api-contract-auditor`, `levnik-ln-775-api-docs-generator`: API contracts, docs, boundary checks.
- `levnik-ln-650-persistence-performance-auditor`, `levnik-ln-651-query-efficiency-auditor`, `levnik-ln-652-transaction-correctness-auditor`: audit persistence, transaction, query, performance.
- `levnik-ln-627-observability-auditor`, `levnik-ln-771-logging-configurator`, `levnik-ln-774-healthcheck-setup`, `fastagent-infrastructure-monitor`: observability, logging, health checks, alerts, dashboards.
- `fastagent-kubernetes-best-practices`, `docker-compose-production`, `docker-configuration-validator`, `nginx-config-optimizer`, `ssh`, `sentry`: infra, container, reverse proxy, remote ops.

### 5. Security

- `security-best-practices`, `fastagent-api-security-checker`, `fastagent-image-security-scanner`: app/API/container security cơ bản và thực chiến.
- `trailofbits-differential-review`, `trailofbits-insecure-defaults`, `trailofbits-sharp-edges`: review security cho web/backend/app.
- `trailofbits-semgrep`, `trailofbits-codeql`, `trailofbits-sarif-parsing`: static analysis và xử lý kết quả scanner.
- `trailofbits-supply-chain-risk-auditor`, `trailofbits-agentic-actions-auditor`: supply chain risk và CI/CD security.
- `trailofbits-fp-check`, `trailofbits-variant-analysis`, `trailofbits-second-opinion`: verify false positive, tìm bug variant, cross-review.
- `trailofbits-constant-time-analysis`, `trailofbits-zeroize-audit`, `trailofbits-wycheproof`: crypto/security review cho code nhạy cảm.

### 6. Testing, fuzzing, audit sâu

- `trailofbits-property-based-testing`: property-based testing đa ngôn ngữ.
- `trailofbits-address-sanitizer`, `trailofbits-libfuzzer`, `trailofbits-aflpp`, `trailofbits-cargo-fuzz`, `trailofbits-atheris`, `trailofbits-ruzzy`, `trailofbits-libafl`: fuzzing theo engine và ngôn ngữ.
- `trailofbits-coverage-analysis`, `trailofbits-fuzzing-dictionary`, `trailofbits-fuzzing-obstacles`, `trailofbits-harness-writing`, `trailofbits-ossfuzz`: cải thiện hiệu quả fuzzing.
- `trailofbits-audit-context-building`, `trailofbits-audit-prep-assistant`, `trailofbits-code-maturity-assessor`: dựng context và đánh giá độ chín codebase.

### 7. SEO, content, reporting

- `keyword-research`, `competitor-analysis`, `content-gap-analysis`, `serp-analysis`, `rank-tracker`, `alert-manager`: nghiên cứu keyword, SERP, đối thủ, alert.
- `seo-content-writer`, `content-refresher`, `content-quality-auditor`, `geo-content-optimizer`: viết, làm mới, audit chất lượng, tối ưu AI citation.
- `backlink-analyzer`, `internal-linking-optimizer`, `domain-authority-auditor`, `entity-optimizer`: off-page, internal linking, authority, entity.
- `on-page-seo-auditor`, `technical-seo-checker`, `meta-tags-optimizer`, `schema-markup-generator`, `performance-reporter`: tech SEO, schema, meta, reporting.

### 8. Plugin, agent, command, skill authoring

- `agent-development`, `command-development`, `hook-development`, `plugin-structure`, `plugin-settings`, `mcp-integration`, `skill-development`: làm agent/plugin/command/skill.
- `pmtl-skill-governance`, `trailofbits-designing-workflow-skills`, `trailofbits-skill-improver`, `writing-skills`: governance, workflow design, cải tiến skill.
- `using-superpowers`: skill gốc của Superpowers.

### 9. Specialist packs và niche domains

- `trailofbits-entry-point-analyzer`, `trailofbits-spec-to-code-compliance`, `trailofbits-token-integration-analyzer`: blockchain/protocol audit.
- `trailofbits-solana-vulnerability-scanner`, `trailofbits-ton-vulnerability-scanner`, `trailofbits-cosmos-vulnerability-scanner`, `trailofbits-cairo-vulnerability-scanner`, `trailofbits-substrate-vulnerability-scanner`, `trailofbits-algorand-vulnerability-scanner`: chain-specific smart contract scanning.
- `trailofbits-firebase-apk-scanner`, `trailofbits-yara-rule-authoring`, `trailofbits-dwarf-expert`, `trailofbits-burpsuite-project-parser`: mobile security, malware, reverse engineering, Burp analysis.
- `trailofbits-debug-buttercup`, `trailofbits-seatbelt-sandboxer`, `trailofbits-devcontainer-setup`, `trailofbits-gh-cli`, `trailofbits-git-cleanup`: tooling chuyên biệt.

## Đánh giá độ phủ full-stack hiện tại

### Đang mạnh

- Frontend, UI, design system, UX review.
- Workflow delivery: plan, subagent execution, review, debug, verify.
- Security review và security analysis rất mạnh nhờ Trail of Bits.
- Browser automation, search admin, Sentry, Docker recovery, auth verification.
- SEO/GEO/content/reporting sâu hơn đa số codebase khác.
- Database, API contracts, observability, persistence audit đã được bù khá nhiều bằng `fastagent-*`, `levnik-*`, và `kadajett-*`.

### Còn mỏng hoặc rời rạc

- Chưa có một skill canonical riêng cho triển khai backend NestJS theo style PMTL như frontend đã có `pmtl-fe-implementation`.
- `kadajett-nestjs-best-practices` chỉ là generic NestJS guidance, không thay thế skill PMTL design-first.
- Nếu tạo skill backend nội bộ cho PMTL thì source of truth phải là `design/` trước, rồi mới map xuống code hiện trạng.
- Chưa có skill repo-local riêng cho queue/background jobs, cron workers, event-driven pipelines.
- Chưa có observability/SRE canonical riêng của PMTL; hiện đang dùng nhiều skill ngoài để bù.
- Chưa có skill riêng cho payments, billing, file/media pipeline, API client SDK generation.

### Nếu muốn lấp tiếp bằng skill nội bộ PMTL

- `pmtl-be-implementation`: NestJS service/controller/module/use-case theo design-first.
- `pmtl-db-contracts`: migration, schema ownership, transaction rules, query review.
- `pmtl-observability-runtime`: logs, metrics, traces, alerting, rollback, incident flow.
- `pmtl-jobs-and-events`: queue workers, cron, idempotency, retry/dead-letter patterns.
- `pmtl-api-contracts`: OpenAPI, SDK generation, error envelopes, schema evolution.

## Repo-local skills (.agents/skills)

Tổng số: 65

- `agent-development` (Việt: agent phát triển): Skill này được sử dụng khi người dùng yêu cầu 'tạo agent' (create an agent), 'thêm agent' (add an agent), 'viết subagent', hoặc cần hướng dẫn về cấu trúc hệ thống agent, system prompts, hay các best practices để phát triển plugin Claude Code.
- `alert-manager` (Việt: cảnh báo quản lý): Thiết lập và quản lý các cảnh báo (alerts) cho các chỉ số quan trọng của SEO và GEO như báo rớt hạng (ranking drops), thay đổi lưu lượng truy cập (traffic changes), và các vấn đề kỹ thuật.
- `backlink-analyzer` (Việt: backlink phân tích): Phân tích hồ sơ backlink (backlink profiles) để hiểu về độ uy tín của link, xác định các link độc hại (toxic links), khám phá cơ hội xây dựng link, và theo dõi đối thủ.
- `ckm-banner-design` (Việt: ckm banner thiết kế): Thiết kế banner (banner design) cho mạng xã hội, quảng cáo, hero image trên website và in ấn. Hỗ trợ nhiều phong cách nghệ thuật đa dạng với hình ảnh được AI tạo ra.
- `ckm-brand` (Việt: ckm thương hiệu): Giọng nói thương hiệu (Brand voice), nhận diện hình ảnh, khung quy tắc thông điệp. Sử dụng cho các nội dung số, văn phong, và thiết kế chuẩn thương hiệu (brand compliance).
- `ckm-design` (Việt: ckm thiết kế): Skill thiết kế toàn diện: nhận diện thương hiệu, thiết kế UI, hệ thống token thiết kế, tạo logo bằng AI, slide HTML, ảnh mạng xã hội, và các mockup hệ thống doanh nghiệp.
- `ckm-design-system` (Việt: ckm thiết kế hệ thống): Kiến trúc các token thiết kế (Design tokens), thông số kỹ thuật component và tạo báo cáo trình bày. Hỗ trợ CSS variables và hệ thống căn chỉnh typography.
- `ckm-slides` (Việt: ckm slide): Tạo các bài trình bày HTML (HTML presentations) mang tính chiến lược với Chart.js, hệ thống token và bố cục đáp ứng (responsive layouts).
- `ckm-ui-styling` (Việt: ckm UI style): Tạo giao diện người dùng (UI) đẹp mắt, có khả năng tiếp cận (accessible) với các công cụ shadcn/ui và Tailwind CSS. Dùng khi muốn tuỳ chỉnh chủ đề, màu sắc, chế độ tối (dark mode).
- `claude-opus-4-5-migration` (Việt: claude opus 4 5 migration): Di chuyển (Migrate) các câu lệnh prompts và code từ Claude Sonnet 4.0/4.5 hoặc Opus 4.1 lên Opus 4.5. Xử lý các thay đổi về chuỗi mô hình và tính tương thích.
- `command-development` (Việt: lệnh phát triển): Sử dụng khi người dùng yêu cầu 'tạo lệnh gạch chéo' (slash command), 'thêm lệnh', 'viết lệnh tuỳ chỉnh'. Hướng dẫn về tham số động, thực thi bash, và frontmatter.',
- `competitor-analysis` (Việt: đối thủ phân tích): Phân tích đối thủ cạnh tranh (competitor SEO) để tìm hiểu từ khóa xếp hạng của họ, chiến lược nội dung, hồ sơ backlink và khả năng trích dẫn AI.
- `content-gap-analysis` (Việt: nội dung gap phân tích): Phân tích khoảng trống nội dung (content gaps) để tìm các chủ đề (topics) và từ khóa mà đối thủ đã đề cập nhưng hệ thống của bạn thì chưa. Giúp tìm ra các cơ hội nội dung.
- `content-quality-auditor` (Việt: nội dung chất lượng kiểm toán): Kiểm tra chất lượng nội dung (content quality audit) thông qua khung đánh giá CORE-EEAT. Tính toán điểm chuẩn SEO / GEO và lập kế hoạch sửa đổi.
- `content-refresher` (Việt: nội dung làm mới): Cập nhật và làm mới nội dung cũ (refresh content) để cải thiện và khôi phục sự sụt giảm thứ hạng, tối ưu lại cho các hệ thống SEO/GEO hiện tại.
- `domain-authority-auditor` (Việt: tên miền thẩm quyền kiểm toán): Kiểm tra độ uy tín của tên miền (domain authority) bằng công cụ CITE 40 mục, đánh giá 4 chiều của độ đáng tin cậy. Dùng để xem xét điểm uy tín nội dung hiện tại.
- `entity-optimizer` (Việt: thực thể tối ưu): Tối ưu hóa sự hiện diện của thực thể (entity presence), đồ thị tri thức (knowledge graph). Dùng để giúp Google/AI nhận diện thương hiệu tốt hơn.
- `frontend-design` (Việt: frontend thiết kế): Tạo các giao diện frontend cấp production với thiết kế tinh xảo, đẹp mắt. Tạo ra code chất lượng cao, tránh các hình thái giao diện phổ thông (generic) của AI.
- `geo-content-optimizer` (Việt: geo nội dung tối ưu): Tối ưu hóa để nội dung dễ dàng được các Engine AI (ChatGPT, Claude, Perplexity) trích dẫn. Bổ sung các cấu trúc Q&A, số liệu rõ ràng và FAQ schema.
- `hook-development` (Việt: hook phát triển): Tạo các hook mở rộng (PreToolUse, PostToolUse, Stop...) cho Claude Code. Dùng để cấu hình tự động hóa, kiểm tra và ngăn chặn các lệnh nguy hiểm.
- `internal-linking-optimizer` (Việt: nội bộ liên kết tối ưu): Kiểm tra và tối ưu hóa hệ thống liên kết nội bộ (internal links) nhằm cải thiện thứ hạng, trải nghiệm trang và chuyển điều phối lượng ủy quyền hợp lý.
- `keyword-research` (Việt: từ khóa nghiên cứu): Nghiên cứu từ khóa (keyword research) để tìm ý tưởng bài viết, kiểm tra độ khó (keyword difficulty), lượng tìm kiếm (search volume) và tiềm năng trích dẫn AI.
- `mcp-integration` (Việt: mcp tích hợp): Hướng dẫn cấu hình tích hợp các Model Context Protocol (MCP) server vào plugin Claude Code để gọi các công cụ và dịch vụ bên ngoài (external services).
- `memory-management` (Việt: ghi nhớ management): Quản lý hệ thống bộ nhớ 2 lớp (hot cache + cold storage) nhằm giữ lại bối cảnh làm việc dự án, theo dõi đối thủ, từ khóa và các chiến dịch tối ưu SEO.
- `meta-tags-optimizer` (Việt: meta tags tối ưu): Tạo và kiểm tra nội dung thẻ tiêu đề (title tag), mô tả (meta description), thẻ Open Graph để tối đa hóa tỷ lệ click chuột (CTR) và chia sẻ xã hội.
- `minimalist-skill` (Việt: tối giản skill): Giao diện website phong cách sạch và tối giản. Bảng màu đơn sắc ấm, phong cách bento grid phẳng. Không dùng gradients, bỏ qua những shadow quá dày.
- `on-page-seo-auditor` (Việt: on trang SEO kiểm toán): Kiểm tra toàn diện SEO trên trang (on-page SEO), từ tiêu đề, mô tả thư mục, heading, độ chất lượng đến các cơ hội cấu trúc internal linking, và tối ưu hình ảnh.
- `output-skill` (Việt: đầu ra skill): Kỹ năng ghi đè, bắt LLM không được cắt xén text (truncation), ép buộc code/nội dung phải được gen đầy đủ hoàn toàn so với mẫu mà không có placeholder.
- `performance-reporter` (Việt: hiệu năng reporter): Lập báo cáo tổng quan (performance report) về các chỉ số hiệu suất SEO / GEO bao gồm thứ hạng, lượt truy cập (traffic) dùng cho bảng tin lãnh đạo (dashboard).
- `plugin-settings` (Việt: plugin cấu hình): Quản lý và giải thích các thiết lập của plugin (plugin configuration) thông qua hệ thống tệp .local.md, cách đọc frontmatter, v.v...
- `plugin-structure` (Việt: plugin cấu trúc): Hỗ trợ cấu trúc cài đặt, tổ chức thư mục thành phần, hướng dẫn viết manifest trong việc cấu hình dự án plugin của Claude Code.
- `pmtl-automation-smoke-suite` (Việt: PMTL tự động hóa smoke suite): Bộ tự động làm bài test kiểm tra khói (smoke tests) và giám sát (monitoring drills) lặp đi lặp lại chuẩn hệ thống của PMTL_VN mà không phải gõ tay tại shell.
- `pmtl-creative-designer` (Việt: PMTL sáng tạo thiết kế): Kỹ năng hình ảnh thương hiệu sáng tạo. Tạo hình kiến trúc mặt ngoài cho UI, đảm bảo cảm giác Phật giáo thân thiện, ấm áp và đậm chất sản phẩm (premium) trên toàn web PMTL_VN.
- `pmtl-fe-craft` (Việt: PMTL frontend chất lượng cao): Kỹ năng làm Frontend điêu luyện (Frontend craftsmanship) đối với PMTL_VN. Phục hồi, cải tiến code UI theo chuẩn chuyên gia: sạch, logic hướng server-first, tránh dư thừa do AI gây ra.
- `pmtl-fe-implementation` (Việt: PMTL frontend triển khai): Quy tắc triển khai Frontend cơ bản của PMTL_VN đối với React và Next.js. Thực thi xây tính năng nhằm đảm bảo quy ước repo, chất lượng code tối ưu đúng môi trường.
- `pmtl-production-baseline` (Việt: PMTL production baseline): Viết codebase nền tảng cho PMTL_VN, áp dụng cho các chức năng có chuẩn baseline (logging, validation, xử lý lỗi an toàn, giám sát, tài liệu kỹ thuật).
- `pmtl-production-ready` (Việt: PMTL production sẵn sàng): Kỹ năng biến bộ code nháp thành hàng thật chuẩn vận hành trên production, làm chặt ứng dụng (hardening). Phải có log, kiểm thử an toàn đối với mọi tính năng thay đổi làm sập nhánh.
- `pmtl-review-web-ui` (Việt: PMTL review web UI): Đánh giá, duyệt code Giao diện người dùng Web PMTL_VN. Phân tích chức năng truy cập, tương tác trực quan hoặc thiết kế lại dựa trên quy tắc chung của hệ thống PMTL.
- `pmtl-runbook-cms-runtime-errors` (Việt: PMTL runbook cms runtime errors): [ĐÃ LỖI THỜI - DEPRECATED] Kỹ năng tham chiếu tới cấu trúc Payload CMS cũ (nay backend là NestJS). KHÔNG sử dụng skill này cho các quy trình sửa lỗi mới.
- `pmtl-runbook-docker-dev-recovery` (Việt: PMTL runbook Docker dev recovery): Sổ thực thi hỗ trợ phục hồi khi Docker Compose, container local của môi truờng DEV bị lỗi, dừng boot không mong muốn dựa vào hướng dẫn giải quyết thay vì mò mẫm.
- `pmtl-scaffold-payload-collection` (Việt: PMTL scaffold payload collection): [ĐÃ LỖI THỜI - DEPRECATED] Dùng cho code Payload CMS cũ không còn hoạt động. Cấu trúc hiện tại của dự án dùng NestJS thay cho backend. KHÔNG sử dụng.
- `pmtl-skill-governance` (Việt: PMTL skill quản trị): Thiết kế, đánh giá cấp độ quy tắc cấu trúc cho các bài 'Skill' chạy tại dự án PMTL_VN để tránh rác (tái chế các chức năng cục bộ cho agent sử dụng).
- `pmtl-ui-behavior` (Việt: PMTL UI hành vi): Kỹ luật thiết kế hành vi và khả năng sử dụng (accessibility). Hỗ trợ lập trình biểu mẫu (forms), điều hướng, logic hộp hiển thị, trạng thái đang load, xử lý lỗi.
- `pmtl-ui-style-system` (Việt: PMTL UI style hệ thống): Xây hệ thống giao diện hình ảnh cơ bản PMTL_VN: typography, định hướng cách xếp trang, tuỳ chọn phong cách (tối giản, mượt mà...).
- `pmtl-uiux-specialist` (Việt: PMTL UI/UX chuyên gia): Chuyên gia về ứng xử người dùng. Đánh giá tính kết nối thân thiện trong khi xây dựng layout trang, hộp trạng thái, hành vi người tương tác với dữ liệu (UX).
- `pmtl-vercel-precision` (Việt: PMTL Vercel độ chính xác): Tối ưu giao diện mượt mà và chính xác nhằm nâng cao 'cảm giác đắt tiền' (premium) bằng các khe hở (spacing) nhỏ, định hình lại cấu trúc trang và hoạt ảnh.
- `pmtl-verify-auth-flow` (Việt: PMTL xác minh xác thực luồng): Kỹ năng kiểm tra lại bộ chuẩn xác thực auth PMTL_VN: kiểm tra chức năng đăng nhập, đăng xuất, cấp quyền (OAuth), phiên (session cookies), đặt lại mật khẩu...
- `pmtl-verify-quality-gate` (Việt: PMTL xác minh chất lượng gate): Chạy bộ quét lệnh kiểm tra chất lượng (lint, typecheck, build validation) một cách gắt gao sau khi lập trình xong sửa lỗi hệ thống trên môi trường.
- `pmtl-verify-search-sync` (Việt: PMTL xác minh tìm kiếm đồng bộ): Kiểm tra tính đồng bộ (search sync) hệ thống tìm kiếm khi đổi index schemas, tích hợp với Meilisearch và đối chiếu kết quả đầu ra có lỗi hay không.
- `pmtl-vn-architecture` (Việt: PMTL VN kiến trúc): Hướng dẫn kiến trúc cấu trúc hệ thống PMTL_VN sử dụng Ngôn ngữ backend NestJS, database Postgres, frontend Next.js 16, Caddy bảo mật, và auth session.
- `pmtl-workflow-router` (Việt: PMTL quy trình điều hướng): Quy trình điều phối agent mặc định PMTL_VN, dùng khi một tác vụ cần nhóm hợp lý nhiều luồng Skill với nhau mà người dùng không biết lệnh khai báo tên chính xác.
- `rank-tracker` (Việt: xếp hạng theo dõi): Theo dõi trạng thái xếp hạng từ khóa tìm kiếm (rank tracker). So sánh biến động xếp hạng để xuất ra các report / alert trên kết quả tìm kiếm hệ thống thống kê tự nhiên.
- `redesign-skill` (Việt: thiết kế lại skill): Nâng cấp giao diện một website/App cũ lên bản cập nhật thị giác xuất sắc nhất. Gỡ bỏ sự nhạt chữ từ gen code mặc định AI và đưa cho sản phẩm vẻ ngoài tốt nhất có thể.
- `schema-markup-generator` (Việt: schema markup tạo sinh): Sinh chuỗi dữ liệu đánh dấu định đạng JSON-LD (Schema Markup) chuẩn SEO với các thực thể FAQ, bài báo, xếp hạng đánh giá, và kiểm tra validate lại từ Google/Bing.
- `seo-content-writer` (Việt: SEO nội dung viết): Viết và xây dựng lộ trình sáng tạo nội dung từ khóa được tối ưu hóa cho SEO bằng phương thức checklist chuẩn chỉnh H1-H2-H3, từ đó đẩy thứ hạng.
- `serp-analysis` (Việt: SERP phân tích): Phân tích trạng thái thông tin Trang Kết Quả Tìm Kiếm của hệ thống SE (SERPs). Áp dụng tìm hiểu mô-tuýp câu trả lời, sự hiểu biết từ hệ AI từ khóa xếp hạng trang đầu.
- `shadcn` (Việt: shadcn): Quản lý xây thành phần tái sử dụng UI từ kho hệ thống shadcn/ui. Sửa chữa, định hướng hình ảnh giao diện có kèm ví dụ tuỳ chọn với preset cho app.
- `skill-development` (Việt: skill phát triển): Khóa tạo Skill dùng khi user muốn 'tạo khóa' (create a skill), viết kĩ năng, tối ưu hoặc cập nhật lại tính năng hiện có cho agent tại hệ Claude Code plugins.
- `soft-skill` (Việt: mềm skill): Dạy AI làm như thiết kế của công ty chuyên nghiệp. Áp những quy chuẩn gắt gao nhằm tránh xa những mẫu UI AI gen sẵn nham nhở, để nó trong mức độ hạng xịn.
- `taste-skill` (Việt: gu skill): Hướng dẫn AI trở thành UX/UI Senior: Đặt quy tắc hệ thống gắt, thành phần kiến trúc linh động, quản trị CSS và giúp code Frontend hoạt động cân bằng cấu trúc.
- `technical-seo-checker` (Việt: technical SEO checker): Thực hiện tìm kiếm những bất ổn bên dưới kỹ thuật SEO (technical SEO). Quét LCP/CLS/INP, chuẩn sitemap, index, bảo mật web hoặc cấu trúc canonical...
- `ui-ux-pro-max` (Việt: UI UX pro max): Kho kiến thức UI/UX khủng gồm 50 phong cách, bảng màu, biểu đồ phục vụ nền tảng React/Vue/Tailwind/HTML. Chữa, duyệt, định hình thiết kế tương tác (glassmorphism, bento...).
- `vercel-react-best-practices` (Việt: Vercel react tốt nhất thực hành tốt): Danh sách kỹ thuật tăng tối đa sức mạnh tốc độ của React/Next.js theo bản quy chuẩn Vercel Engineering. Dùng để xem qua (review) sửa lại code logic.
- `web-design-guidelines` (Việt: web thiết kế guidelines): Đánh giá, lập chuẩn review bề mặt Web khi user cần thiết kế, tạo hình hoặc check lại trang web (PMTL surface) đã đáp ứng chuẩn chung về website interface chưa.
- `writing-hookify-rules` (Việt: writing hookify rules): Tạo luật (rules) cho Hookify. Cấu hình kịch bản các pattern cho hệ setup syntax hookify.

## Global home skills (~/.agents/skills)

Tổng số: 29

- `agent-development` (Việt: agent phát triển): Skill này được sử dụng khi người dùng yêu cầu 'tạo agent' (create an agent), 'thêm agent' (add an agent), 'viết subagent', hoặc cần hướng dẫn về cấu trúc hệ thống agent, system prompts, hay các best practices để phát triển plugin Claude Code.
- `auth-js` (Việt: xác thực js): Công cụ cấu hình nhận diện danh tính (Authentication) Auth.js v5 sẵn sàng lên production, áp dụng Next.js và Cloudflare Workers.
- `auth-module-builder` (Việt: xác thực module builder): Triển khai lớp thiết kế logic luồng nhận dạng danh nhập với tính năng đăng ký, JWT map vòng chạy mã hóa mật khẩu, session và cookie chống lỗ hổng bảo mật.
- `claude-opus-4-5-migration` (Việt: claude opus 4 5 migration): Di chuyển (Migrate) các câu lệnh prompts và code từ Claude Sonnet 4.0/4.5 hoặc Opus 4.1 lên Opus 4.5. Xử lý các thay đổi về chuỗi mô hình và tính tương thích.
- `command-development` (Việt: lệnh phát triển): Sử dụng khi người dùng yêu cầu 'tạo lệnh gạch chéo' (slash command), 'thêm lệnh', 'viết lệnh tuỳ chỉnh'. Hướng dẫn về tham số động, thực thi bash, và frontmatter.',
- `design-md` (Việt: thiết kế md): Phân tích ứng dụng dự án, dịch thuật quy chuẩn thành hệ thống Design System chuẩn rồi thả vào một bản DESIGN.md cụ thể hợp nhất lại cho sản phẩm.
- `docker-compose-production` (Việt: Docker compose production): Kiến thức phục vụ quy trình tung ứng dụng Docker Compose lên cấu hình Server Production: tăng cường an toàn, quản lý tài nguyên, theo dõi tính khả dụng cao và check log.
- `docker-configuration-validator` (Việt: Docker configuration validator): Đánh giá lại sự toàn diện tập tin Dockerfile và Compose xem ứng dụng đã áp dụng chuẩn Best Practices bảo mật, tối ưu ảnh quét chống việc config bị lỗi rủi ro cao chưa.
- `enhance-prompt` (Việt: enhance prompt): Cải tiến (enhance) prompt AI khi tuỳ biến thông tin sơ sài cho web thành cụm từ khóa (keywords) rõ chi tiết UX/UI, giúp kết quả Stitch-optimized cao nhất.
- `eraser-diagrams` (Việt: eraser diagrams): Tạo các bảng vẽ sơ đồ cấu hình biểu diễn hạ tầng từ logic code của văn bản để miêu tả biểu diễn hệ kiến trúc phần mềm hệ thống dự án.
- `find-skills` (Việt: find skills): Giúp người sử dụng tìm, cài đặt những công cụ agent skills bên ngoài khi gõ lệnh 'làm thế này bằng cách nào' hay 'tìm hỗ trợ kỹ năng skill XY ở đâu'.
- `frontend-design` (Việt: frontend thiết kế): Tạo các giao diện frontend cấp production với thiết kế tinh xảo, đẹp mắt. Tạo ra code chất lượng cao, tránh các hình thái giao diện phổ thông (generic) của AI.
- `hook-development` (Việt: hook phát triển): Tạo các hook mở rộng (PreToolUse, PostToolUse, Stop...) cho Claude Code. Dùng để cấu hình tự động hóa, kiểm tra và ngăn chặn các lệnh nguy hiểm.
- `mcp-integration` (Việt: mcp tích hợp): Hướng dẫn cấu hình tích hợp các Model Context Protocol (MCP) server vào plugin Claude Code để gọi các công cụ và dịch vụ bên ngoài (external services).
- `meilisearch-admin` (Việt: meilisearch admin): Check tình hình server hệ tìm kiếm Meilisearch, log nhiệm vụ báo sức khỏe, lỗi, và thao tác xem trạng thái cấu hình công cụ. Chỉ xử lý các quy trình read-only (đọc dữ liệu).
- `next` (Việt: next): Lệnh hỗ trợ với app dùng Next.js framework, định tuyến điều hướng (Router), lấy dữ liệu bộ nhớ Cache, linh kiện Server Render, v.v...
- `nextjs-app-router-fundamentals` (Việt: nextjs app điều hướng fundamentals): Căn bản cách làm với App Router trên bản update từ Next.js 13+. Dùng ở yêu cầu migrate cũ sang router Next 13+, tạo layout thư mục giao diện...
- `nginx-config-optimizer` (Việt: nginx config tối ưu): Tinh chỉnh setup máy chủ ảo (virtual host) tải của Nginx cho proxy truyền cân bằng tải. Hoàn thiện tối ưu độ bảo mật và hiệu suất kết nối request HTTP...
- `plugin-settings` (Việt: plugin cấu hình): Quản lý và giải thích các thiết lập của plugin (plugin configuration) thông qua hệ thống tệp .local.md, cách đọc frontmatter, v.v...
- `plugin-structure` (Việt: plugin cấu trúc): Hỗ trợ cấu trúc cài đặt, tổ chức thư mục thành phần, hướng dẫn viết manifest trong việc cấu hình dự án plugin của Claude Code.
- `react-components` (Việt: react components): Điều hướng thay đổi file mô phỏng từ thiết kế mô-đun hóa trở về cấu trúc mạng component React AST có độ thẩm định cao cho ứng dụng Vite / Next.
- `redis-best-practices` (Việt: redis tốt nhất thực hành tốt): Thao tác sử dụng máy chủ Database Redis hiệu quả. Cache giá trị Key-Value, giảm độ muộn truy vấn cho luồng chức năng...
- `remotion` (Việt: remotion): Render tạo video mẫu trực diễn walkthrough từ việc kết hợp Stitch với mượt mà biểu diễn chữ và công nghệ Remotion (video react logic component).
- `skill-development` (Việt: skill phát triển): Khóa tạo Skill dùng khi user muốn 'tạo khóa' (create a skill), viết kĩ năng, tối ưu hoặc cập nhật lại tính năng hiện có cho agent tại hệ Claude Code plugins.
- `ssh` (Việt: ssh): Quản lý giao thức đăng nhập an toàn hệ thống (SSH). Xây dụng môi trường với điều khiển remote kết nối và chuyển tệp (SCP) thông suốt.
- `stitch-loop` (Việt: stitch loop): Dạy Agent quy trình tự thân tạo quy trình vòng trích lập liên hoàn chuyển tay tự động để dần hình thành chức năng giao diện hệ thống web với Stitch.
- `superpowers` (Việt: superpowers): Các quy tắc mở rộng quy trình làm việc (Superpowers) bổ trợ cho xử lý thao tác gỡ rối hoặc thiết kế kịch bản agent cao cấp.
- `ui-ux-pro-max` (Việt: UI UX pro max): Kho kiến thức UI/UX khủng gồm 50 phong cách, bảng màu, biểu đồ phục vụ nền tảng React/Vue/Tailwind/HTML. Chữa, duyệt, định hình thiết kế tương tác (glassmorphism, bento...).
- `writing-hookify-rules` (Việt: writing hookify rules): Tạo luật (rules) cho Hookify. Cấu hình kịch bản các pattern cho hệ setup syntax hookify.

## Global Codex skills (~/.codex/skills) - Core and generic

Tổng số: 13

- `.system` (Việt: .system): Hệ thống quy chuẩn ngầm mặc định của dự án.
- `agent-browser` (Việt: agent trình duyệt): Điều khiển tự động trình duyệt thông qua Agent. Giải quyết thao tác nhấp website, điền thông tin, lấy mẫu data hoặc làm automation kịch bản chạy ứng dụng web UI API.
- `docker-compose-production` (Việt: Docker compose production): Kiến thức phục vụ quy trình tung ứng dụng Docker Compose lên cấu hình Server Production: tăng cường an toàn, quản lý tài nguyên, theo dõi tính khả dụng cao và check log.
- `meilisearch-admin` (Việt: meilisearch admin): Check tình hình server hệ tìm kiếm Meilisearch, log nhiệm vụ báo sức khỏe, lỗi, và thao tác xem trạng thái cấu hình công cụ. Chỉ xử lý các quy trình read-only (đọc dữ liệu).
- `minimalist-skill` (Việt: tối giản skill): Giao diện website phong cách sạch và tối giản. Bảng màu đơn sắc ấm, phong cách bento grid phẳng. Không dùng gradients, bỏ qua những shadow quá dày.
- `output-skill` (Việt: đầu ra skill): Kỹ năng ghi đè, bắt LLM không được cắt xén text (truncation), ép buộc code/nội dung phải được gen đầy đủ hoàn toàn so với mẫu mà không có placeholder.
- `playwright` (Việt: Playwright): Công cụ Test mô phỏng giao thức Web. Dùng ở quy trình thao tác trình duyệt thật thông qua Playwright, click, tạo snapshot, lấy dữ liệu lỗi ở frontend...
- `redesign-skill` (Việt: thiết kế lại skill): Nâng cấp giao diện một website/App cũ lên bản cập nhật thị giác xuất sắc nhất. Gỡ bỏ sự nhạt chữ từ gen code mặc định AI và đưa cho sản phẩm vẻ ngoài tốt nhất có thể.
- `security-best-practices` (Việt: bảo mật tốt nhất thực hành tốt): Dò quét nhanh ngôn ngữ / Framework bảo mật, thực hành khuyên dùng sửa lại với hệ mã (Python/Node/Go). Không khởi chạy các chức năng non-security.
- `sentry` (Việt: Sentry): Dùng kết nối để thanh tra tình hình Sentry API logs (chú ý lỗi sập Production qua API cần Auth Token của Sentry). Tóm tắt phân loại lỗi xuất hiện do log lỗi sinh ra.
- `soft-skill` (Việt: mềm skill): Dạy AI làm như thiết kế của công ty chuyên nghiệp. Áp những quy chuẩn gắt gao nhằm tránh xa những mẫu UI AI gen sẵn nham nhở, để nó trong mức độ hạng xịn.
- `taste-skill` (Việt: gu skill): Hướng dẫn AI trở thành UX/UI Senior: Đặt quy tắc hệ thống gắt, thành phần kiến trúc linh động, quản trị CSS và giúp code Frontend hoạt động cân bằng cấu trúc.
- `ui-ux-pro-max` (Việt: UI UX pro max): Kho kiến thức UI/UX khủng gồm 50 phong cách, bảng màu, biểu đồ phục vụ nền tảng React/Vue/Tailwind/HTML. Chữa, duyệt, định hình thiết kế tương tác (glassmorphism, bento...).

## Global Codex skills (~/.codex/skills) - Full-stack gap fillers

Tổng số: 18

- `fastagent-api-documentation-generator` (Việt: fastagent API tài liệu tạo sinh): Sinh document và bản đặc tả API (OpenAPI/Swagger) từ quy định mẫu cấu trúc code hoặc thư viện. Chuẩn bị tài liệu REST APIs dễ sử dụng.
- `fastagent-api-security-checker` (Việt: fastagent API bảo mật checker): Kiểm tra hệ thống API dựa vào 10 chuẩn đầu bảo vệ OWASP, nhận dạng lỗi định danh hoặc rớt vòng Authorization truy cập. Giúp ứng phó lỗi bảo mật lập trình.
- `fastagent-database-migration-helper` (Việt: fastagent cơ sở dữ liệu migration helper): Trợ lý hỗ trợ xử lý Database Migration, làm file backup, update chuẩn schema từ ứng dụng mã code và rollback thao tác nếu sai lầm với hạ tầng.
- `fastagent-image-security-scanner` (Việt: fastagent image bảo mật scanner): Quét (scan) các Docker Image của dự án phát hiện package quá hạn khai vị cấu hình lỏng lẻo dễ tấn công xâm nhập. Quản lý việc nâng lớp bảo mật hình ảnh môi trường container.
- `fastagent-infrastructure-monitor` (Việt: fastagent infrastructure monitor): Theo dõi và phân bổ luồng (log/alert/monitor) giám sát dữ liệu API, cơ sở hạ tầng. Thiết kế dashboard phục vụ các dịch vụ có thể theo dõi nhanh chóng.
- `fastagent-kubernetes-best-practices` (Việt: fastagent Kubernetes tốt nhất thực hành tốt): Gợi ý định nghĩa kịch bản thực tiễn khi deploy trên cụm nhóm kubernetes, cài đặt resource cao ổn định chạy k8s / yaml pods an toàn cao nhất.
- `fastagent-query-optimizer` (Việt: fastagent truy vấn tối ưu): Tìm quy tắc tối tân hóa SQL Index cấu trúc. Sửa nội dung query sao cho hiệu năng tra cứu không rớt (chậm database). Đánh giá truy xuất hiệu năng database engine.
- `fastagent-rest-api-designer` (Việt: fastagent REST API thiết kế): Kỹ thuật kiến trúc lên bản vẽ RESTful endpoint ứng với quy mô API hợp cấu trúc URL/ HTTP, xây mô hình giao tiếp ứng dụng backend hiệu năng tốt.
- `fastagent-schema-designer` (Việt: fastagent schema thiết kế): Thiết kế mảng lược đồ schema (quan hệ/Index/khoá chính-ngoại). Phân mẩu cấu trúc tổ chức table CSDL một cách bài bản hiệu năng tốt cho bảng chứa data.
- `kadajett-nestjs-best-practices` (Việt: kadajett NestJS tốt nhất thực hành tốt): Kiểm kê chuẩn cấu trúc ứng dụng với kiến trúc model NestJS cho ứng dụng Production. Quản lý hệ modules logic Inject, hiệu năng và xử lý lỗi ứng dụng framework hiệu quả nhất.
- `levnik-ln-627-observability-auditor` (Việt: levnik ln 627 observability kiểm toán): Kiểm định định dạng cấu trúc hệ thống thu logger của backend, đo lường các mức thu thập (levels/tracing/health check), audit dữ liệu theo dõi dự án.
- `levnik-ln-643-api-contract-auditor` (Việt: levnik ln 643 API contract kiểm toán): Kiểm toán giao thức API, định tuyến rác dữ liệu Entity làm lộ database, thiếu sót chuẩn mã DTO hay lỗi logic truyền qua hợp đồng rác của lỗi API giao tiếp.
- `levnik-ln-650-persistence-performance-auditor` (Việt: levnik ln 650 persistence hiệu năng kiểm toán): Đi sâu tìm lỗi gây tắc hiệu năng Database Query. Chỉ ra trạng thái sống / giới hạn của hạ tầng và kiểm tra rủi ro chạy chập chờn gây chết app.
- `levnik-ln-651-query-efficiency-auditor` (Việt: levnik ln 651 truy vấn efficiency kiểm toán): Kiểm tra vòng lặp N+1 sai lầm khi fetch dữ liệu lố tay, dư thừa hoặc bỏ sót Bulk cấu hình để Database giảm bớt tải.
- `levnik-ln-652-transaction-correctness-auditor` (Việt: levnik ln 652 giao dịch đúng đắn kiểm toán): Kiểm tra lại độ tin cậy thao tác dòng chuyển lưu thay đổi dữ liệu (Transaction rollback). Kiểm tra sai lệch do các Trigger/Notify sinh ra quá lâu khoá row chết cứng.
- `levnik-ln-771-logging-configurator` (Việt: levnik ln 771 logging configurator): Thiết lập cài đặt cấu hình thông tin log dạng JSON cấu hình với structlog / Serilog. Sinh định dạng file ghi log để hỗ trợ debug khi cần thiết ở dự án Backend.
- `levnik-ln-774-healthcheck-setup` (Việt: levnik ln 774 healthcheck setup): Cấu trúc giao thức thiết lập kết nối health check Endpoint liveness/readiness/startup đo mức mạng khi kết hợp làm service backend k8s / Kubernetes probe.
- `levnik-ln-775-api-docs-generator` (Việt: levnik ln 775 API docs tạo sinh): Thêm cổng thư viện API Documentation (Swagger Docs/Open API) giúp front-end thao tác test hệ thống dễ nhìn và tự động cập nhật.

## Global Codex skills (~/.codex/skills) - Trail of Bits

Tổng số: 61

- `trailofbits-address-sanitizer` (Việt: Trail of Bits địa chỉ sanitizer): Sử dụng công cụ cảnh báo AddressSanitizer trong C/C++ Fuzzing để chặn Buffer Overflow hoặc sai vòng dữ liệu cấp vùng nhớ memory leak.
- `trailofbits-aflpp` (Việt: Trail of Bits aflpp): Hỗ trợ AFL++: công cụ tối đa lõi giả lập fuzzing đa tiến trình nhằm tối ưu quy tắc code cho thư viện chuẩn C/C++.
- `trailofbits-agentic-actions-auditor` (Việt: Trail of Bits agentic actions kiểm toán): Kiểm điểm quy trình CI/CD tích hợp thao tác máy tính AI độc lập (Code Actions, Sandbox...). Rà lỗi injection khiến người nhập lộ thông tin quy trình hành động môi trường GitHub.
- `trailofbits-algorand-vulnerability-scanner` (Việt: Trail of Bits algorand vulnerability scanner): Quét rủi ro kẽ hở thông minh (SM), lỗ hỏng giao dịch chữ ký phí của cấu trúc dự án thuật toán Algorand TEAL.
- `trailofbits-ask-questions-if-underspecified` (Việt: Trail of Bits ask questions if underspecified): Dừng và làm rõ định dạng tài liệu nếu như đặc tả còn chưa hợp lý hoặc gây nhầm lẫn khi thực hiện tạo lệnh viết.
- `trailofbits-atheris` (Việt: Trail of Bits atheris): Thực hiện tìm lỗi dựa trên độ phủ code fuzzing cho thư viện Python nguyên thuỷ và C extension nhằm khoanh vùng các hàm chạy Python bẩn.
- `trailofbits-audit-context-building` (Việt: Trail of Bits audit context building): Hiểu logic sâu chuẩn code base với kỹ thuật đọc phân tích kiến trúc chi tiết (line-by-line). Nắm cấu trúc kỹ thuật hạ tầng tổng quát để rà soát mục tiêu chuyên gia báo mật.
- `trailofbits-audit-prep-assistant` (Việt: Trail of Bits audit prep assistant): Phụ tá làm quen, chuẩn bị checklist dọn hệ thống file dự án bằng cách sinh doc / diagram cấu trúc dòng code với biểu đồ giúp chuyên gia dễ Audit / Scan static web.
- `trailofbits-burpsuite-project-parser` (Việt: Trail of Bits burpsuite project parser): Công cụ trích lập tìm lỗi dự án tại Burp Suite (.burp), check dump network HTTP site map history nhanh hỗ trợ pentest bảo mật.
- `trailofbits-cairo-vulnerability-scanner` (Việt: Trail of Bits cairo vulnerability scanner): Kiểm soát các hàm lỗi số học, sai xót bảo chứng Cairo/StarkNet smart contract ở lỗi chữ ký (signature replay).
- `trailofbits-cargo-fuzz` (Việt: Trail of Bits cargo fuzz): Cargo-fuzz kiểm toán độ an toàn chuẩn lỗi libFuzzer đối với ứng phó Rust app.
- `trailofbits-claude-in-chrome-troubleshooting` (Việt: Trail of Bits claude in chrome troubleshooting): Hỗ trợ chẩn đoán cấu hình đường mạng, MCP Chrome Extension giữa công cụ chạy AI Claude kết nối trình duyệt bị đứt khi xử lý lỗi tương tác web.
- `trailofbits-code-maturity-assessor` (Việt: Trail of Bits code maturity assessor): Làm bài rà soát tổng phân hạng độ trưởng thành mã nguồn hệ ứng dụng đánh giá 9 cấp độ (kiểm duyệt, truy cập, an toàn Toán...). Phê chuẩn thông qua hồ sơ chuyên nghiệp.
- `trailofbits-codeql` (Việt: Trail of Bits CodeQL): Điều lệnh cấu trúc quét hệ thống với kỹ nghệ CodeQL (Tracking Data flow Taint). Tìm cảnh báo độc tố an toàn với khả năng tuỳ biến ruleset (SARIF / Alert analysis).
- `trailofbits-constant-time-analysis` (Việt: Trail of Bits constant time phân tích): Kỹ thuật chuyên biệt xác định đường rò rỉ bộ đếm thời gian từ thao tác mật mã bảo vệ ở đa ngôn ngữ mã C / C++ / Go / Rust / PHP / Java...
- `trailofbits-constant-time-testing` (Việt: Trail of Bits constant time kiểm thử): Kiểm thử vòng lặp thời gian biến thiên của module thông số bảo mật mật mã hóa giúp chặn lỗ hổng lộ thông tin chu kỳ thời gian.
- `trailofbits-cosmos-vulnerability-scanner` (Việt: Trail of Bits cosmos vulnerability scanner): Kiểm tra kỹ thuật lỗi blockchain mạng Cosmos (làm tròn kết quả, kí mạo danh) trước chuỗi sự kiện mạng hợp đồng thông minh hợp lệ.
- `trailofbits-coverage-analysis` (Việt: Trail of Bits coverage phân tích): Xem xét kết quả rào độ phủ code sinh ra lúc quét fuzz. Đề bài này có dùng để check chỗ block mã gây bí.
- `trailofbits-debug-buttercup` (Việt: Trail of Bits debug buttercup): Kiểm tra trạng thái máy chủ lỗi hệ dịch vụ Buttercup k8s, tìm hiểu Pods có crash báo lỗi do cấu hình khởi tạo Redis, DinD hay Scheduler... gây kẹt rớt tải.
- `trailofbits-designing-workflow-skills` (Việt: Trail of Bits designing quy trình skills): Giúp phác đồ quy tắc, lệnh giao tác multi-step/pipeline nhiều điều kiện an toàn, đệ quy agent tự quản và tạo chu trình an toàn đối với lập trình chuỗi kỹ năng luồng Workflow mới.
- `trailofbits-devcontainer-setup` (Việt: Trail of Bits devcontainer setup): Chuẩn hóa Container tạo môi trường chứa công cụ Claude chạy chung môi trường biệt lập an toàn theo setup devcontainer cho ngôn ngữ Python/JS/Rust...
- `trailofbits-differential-review` (Việt: Trail of Bits differential review): So mã lệnh PR git history để tránh các rủi ro bug ẩn sinh ra. Nhận diện an ninh cấu trúc rớt do commit và cảnh báo nếu có.
- `trailofbits-dwarf-expert` (Việt: Trail of Bits dwarf expert): Phân tích file gỡ rối (DWARF format info). Kiểm soát dịch dữ liệu file khi ứng dụng sinh file debug từ ngôn ngữ native C/C++.
- `trailofbits-entry-point-analyzer` (Việt: Trail of Bits entry point phân tích): Phân vùng điểm móc chạy (entry point) của Code ứng dụng. Check cấp phép tuỳ chọn public/admin hàm truy vấn Smart contract của (Solana, EVM..).
- `trailofbits-firebase-apk-scanner` (Việt: Trail of Bits firebase apk scanner): Quay chẩn lỗi bộ Android App, truy thông tin APK nhận cấu hình hệ rủi ro từ Google Firebase Database hở cấu hình.
- `trailofbits-fp-check` (Việt: Trail of Bits fp check): Vận hành hệ thống chuyên dò xem báo nguy hiểm có phải do máy làm sai không (False Positives check). Lập bằng chứng cụ thể trước kết luận cuối.
- `trailofbits-fuzzing-dictionary` (Việt: Trail of Bits fuzzing dictionary): Quyển biên dịch tự khóa phân rã fuzzing (Fuzzing dictionaries). Hỗ trợ bốc tự vựng với kiểu giao thức protocol parser app.
- `trailofbits-fuzzing-obstacles` (Việt: Trail of Bits fuzzing obstacles): Hỗ trợ gỡ giải việc fuzz bị tịt, bí cục do mắc kẹt bởi tham số như validate mã Checksum, phân giải logic chặn đứt...
- `trailofbits-gh-cli` (Việt: Trail of Bits gh cli): Dùng trình xử lý thao tác Github CLI có bản chứng thực auth thay cho trình lấy Curl cùi nhằm tăng bảo vệ quyền quản lý kho kéo code.
- `trailofbits-git-cleanup` (Việt: Trail of Bits git cleanup): Thanh lý những file, môi trường Worktree hoặc các nhánh rác tồn đọng Git Branch sau khi Pull rẽ vào dẹp kho project local cho nhẹ gọn.
- `trailofbits-guidelines-advisor` (Việt: Trail of Bits guidelines advisor): Rà tính năng an toàn mã ứng dụng từ danh sách khuyến cáo. Generate tài liệu an toàn hợp lý cập nhật lỗi cấu trúc khi check theo guideline tốt nhất.
- `trailofbits-harness-writing` (Việt: Trail of Bits harness writing): Viết tạo các phần đoạn hàm harness mục tiêu hiệu quả đối đãi ứng dụng hệ kỹ thuật đa ngôn ngữ rà lỗi API fuzz test an toàn.
- `trailofbits-insecure-defaults` (Việt: Trail of Bits insecure defaults): Báo sai lầm về cấu hình lộ mật mã cứng hoặc tài khoản quyền hạn tuỳ tiện (Insecure Defaults) hớ hênh nơi khởi động trên môi trường Web / API.
- `trailofbits-interpreting-culture-index` (Việt: Trail of Bits interpreting culture index): Hệ tham khảo thống kê tâm lý phỏng vấn nhận dạng thành phần nhóm tổ chức Culture Index để quản trị con người / PDF OpenCV Json trích lập đánh giá Teamwork.
- `trailofbits-let-fate-decide` (Việt: Trail of Bits let fate decide): Trình cắm bói 4 lá bài Tarot os.urandom. Làm rõ tình thế lưỡng nan từ câu chọc 'không biết tiếp theo phải làm gì / lấy cung bói' (Let fate decide / Yu-Gi-Oh) hay lúc yêu cầu mông lung quăng phỏng đoán hướng giải.
- `trailofbits-libafl` (Việt: Trail of Bits libafl): Chạy mô hình kiến trúc lập trình kỹ nghệ Fuzz Module custom linh hoạt ngoài mục tiêu cơ bản (AFL library backend fuzzing).
- `trailofbits-libfuzzer` (Việt: Trail of Bits libfuzzer): Khởi động lõi fuzz có sẵn từ LLVM ứng xử tìm Bug an toàn theo thuật toán coverage C/C++ do trình clang kéo.
- `trailofbits-modern-python` (Việt: Trail of Bits modern python): Hỗ trợ tái tạo cấu hình bộ mã nguồn Python mới tinh gọn tốt (Ruff, Uv). Đổi công cụ từ trình Pip / Black nặng nề về môi trường Python tốt.
- `trailofbits-ossfuzz` (Việt: Trail of Bits ossfuzz): Cấu hình tự động OSS-Fuzz vào làm test bug vòng liên tục tích hợp an toàn miễn phí dự án OSS công khai.
- `trailofbits-property-based-testing` (Việt: Trail of Bits thuộc tính based kiểm thử): Áp dụng định hướng test kỹ dựa vào thuộc tính sinh dữ liệu property (Serialization/Parsing..) nhằm cho sự an toàn cao hơn bài thử test tự tạo bằng tay (Example-Testing).
- `trailofbits-ruzzy` (Việt: Trail of Bits ruzzy): Triển khai tìm lỗi phần mềm tự động từ Fuzz ứng dụng hệ sinh thái mã Ruby an toàn cao do Trail of bits nâng cấp (Ruzzy).
- `trailofbits-sarif-parsing` (Việt: Trail of Bits SARIF parsing): Phân loại chuỗi định dạng SARIF format sau phân lớp mã tĩnh CodeQL / Semgrep quét lỗi trả ra, giúp loại bỏ cảnh báo trùng lắp lên CI/CD (Lưu ý: Không Scan Code).
- `trailofbits-seatbelt-sandboxer` (Việt: Trail of Bits seatbelt sandboxer): Rào chắn Seatbelt giúp biên tập tối thiểu vùng quy tắc chuẩn môi trường ứng dụng App MAC OS Profile (Sandbox profile isolation allowlist).
- `trailofbits-second-opinion` (Việt: Trail of Bits second opinion): Xin trợ giúp rà xét logic thứ 2 khi tham khảo luồng mã un-commit hay git branch dùng tác vu Google Gemini CLI review độc lập ngoài Claude AI.
- `trailofbits-secure-workflow-guide` (Việt: Trail of Bits secure quy trình guide): Quy trình thiết yếu 5 bước thực hành mã Code an toàn chuẩn Audit với SLITHER, phát biểu rủi ro thủ công và biểu đồ lỗi nâng cấp Smart Contract token.
- `trailofbits-semgrep` (Việt: Trail of Bits Semgrep): Phóng nhánh tác vụ Agent chạy công nghệ dò bug bảo mật Semgrep chéo tập tin thư viện song song trên kho Repo tĩnh mã (High-confidence bug scan).
- `trailofbits-semgrep-rule-creator` (Việt: Trail of Bits Semgrep rule creator): Tập viết các Rule tự thiết kế cho Semgrep bắt bug mã lệnh do lỗ hỏng bảo mật mã quy chuẩn lập trình dự án công ty cấu hình.
- `trailofbits-semgrep-rule-variant-creator` (Việt: Trail of Bits Semgrep rule biến thể creator): Thiên biến vạn hóa các rule Semgrep chạy áp cho nhiều môi trường ngôn ngữ khác nhau chung từ gốc (Variant creator).
- `trailofbits-sharp-edges` (Việt: Trail of Bits sharp edges): Hiểu những điểm API gây ngã hay cấu hình giao thức mỏng dễ sập dẫn tới sai sót lập trình viên ngớ ngẩn 'Sharp edges / Footgun design mistakes'.
- `trailofbits-skill-improver` (Việt: Trail of Bits skill improver): Tập lệnh cải tạo luồng chất lượng câu Skill khi fix bug lệnh Claude agent, qua đó hệ nâng review vòng rà soát Skill Improve (Không làm Single Time).
- `trailofbits-solana-vulnerability-scanner` (Việt: Trail of Bits solana vulnerability scanner): Quét bắt dính các ngã lỗi API CPI, sai PDA hoặc truy biến sysvar giả bọc lỗi Smart Contract Solana Rust framework ứng ứng.
- `trailofbits-spec-to-code-compliance` (Việt: Trail of Bits spec to code compliance): Vạch lá đi tìm sự logic thống nhất của tài liệu Spec whitepaper ứng bản thiết kế cấu trúc Smart Contract với phần mã thi công, ngăn cản trốn mã lệch.
- `trailofbits-substrate-vulnerability-scanner` (Việt: Trail of Bits substrate vulnerability scanner): Giúp tìm sự hoán đổi lỗi do phép toán sai, Origin không rõ liên đới Substrate Pallet ứng Blockchain runtime FRAME layer do người làm tạo mắc.
- `trailofbits-supply-chain-risk-auditor` (Việt: Trail of Bits chuỗi cung ứng chuỗi rủi ro kiểm toán): Thanh trừng phân tích gói cài đặt có nghi lây nhiễm lỗ hỏng tiếp quản Supply Chain (Dependency Risk). Khảo sát bề mặt rủi ro dồn hệ thống.
- `trailofbits-testing-handbook-generator` (Việt: Trail of Bits kiểm thử handbook tạo sinh): Thực thi phân rã lấy kinh nghiệm kiến thức An ninh appsec.guide, Trail Of Bits biến sổ tay này sang bộ hệ Skill chạy tool phân tích.
- `trailofbits-token-integration-analyzer` (Việt: Trail of Bits token tích hợp phân tích): Phân tích trạng thái hợp lệnh Token từ tài liệu thực thực. Quản lý trạng thái logic tương quan 20 quy chuẩn Owner, Scarcity ERC Token Compose.
- `trailofbits-ton-vulnerability-scanner` (Việt: Trail of Bits ton vulnerability scanner): Tính toán chỉ điểm 3 điểm thắt nguy cấp của lỗi lập trình giả mạo TON Smart Contract (Int-as-bool / FWRD-Gas) ngôn ngữ FunC viết TON network.
- `trailofbits-variant-analysis` (Việt: Trail of Bits biến thể phân tích): Tập trung dò cấu trúc biến thể phân tử Pattern của lỗ hỏng tìm Bug tương tự ở repo khác giúp xây chuỗi CodeQL Semgrep scan đồng bộ sau khi vỡ lở vấn đề.
- `trailofbits-wycheproof` (Việt: Trail of Bits wycheproof): Cấp Vectors cho mã kiểm định Wycheproof đánh dấu test crypto bắt điểm góc chết nguy lỗi (Edge Case).
- `trailofbits-yara-rule-authoring` (Việt: Trail of Bits yara rule authoring): Quy trình chuẩn kỹ nghệ YARA-X rules ngăn Malware tấn công và giả lập báo động hiệu năng tốt tránh mắc phải False Positives, IOC Detection tối thượng.
- `trailofbits-zeroize-audit` (Việt: Trail of Bits xóa sạch audit): Giải mã và truy vết xoá dữ liệu vùng bí mật (C/Rust password compiler opt). Xác minh quy trình Assembly của dữ liệu chống truy xuất sau phân mảnh.
