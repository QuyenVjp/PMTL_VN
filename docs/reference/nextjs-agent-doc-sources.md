# NEXTJS_AGENT_DOC_SOURCES

File này chốt cách để agent tìm đúng docs Next.js mới nhất mà không cần người dùng paste tay mỗi lần.

---

## Mục tiêu

Ép agent đi theo thứ tự:

1. đúng version docs của project
2. official docs nếu local docs chưa có
3. source code và `design/` của repo

Không được đi theo:
- trí nhớ model
- blog cũ
- tutorial bên thứ ba

---

## Source-of-truth order cho PMTL

### 1. Bundled docs theo version của project

Ưu tiên cao nhất khi `apps/web` đã tồn tại và có `next` cài đặt:

```txt
apps/web/node_modules/next/dist/docs/
```

Đây là lane official được Next.js khuyến nghị cho AI agents vì docs ở đây khớp với đúng version `next` đang chạy trong project.

Khi tìm docs:
- tìm topic tương ứng dưới `01-app`, `02-pages`, `03-architecture`
- đọc đúng file liên quan trước khi sửa routing, caching, metadata, Server Actions, special files, hay config

### 2. `.next-docs/` nếu có

Với một số dự án Next.js 16.1 cũ hơn, Next có codemod tạo:

```txt
.next-docs/
```

Nếu thư mục này tồn tại, coi nó là local official docs cache thứ hai.

### 3. Official Next.js docs

Nếu local bundled docs chưa có, dùng official sources theo thứ tự:

1. [Next.js llms.txt](https://nextjs.org/docs/llms.txt)
2. [Next.js llms-full.txt](https://nextjs.org/docs/llms-full.txt)
3. trang docs official cụ thể đang cần

`llms.txt` tốt để map nhanh cấu trúc docs.

`llms-full.txt` tốt khi cần ingest nhiều ngữ cảnh hơn.

Trang docs cụ thể là lane cuối khi cần semantics đầy đủ hoặc examples chi tiết.

### 4. Repo canon

Sau khi đọc official docs, map ngược lại vào:
- `AGENTS.md`
- `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
- `design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md`
- `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md`
- owner docs ở `design/02-platform-baseline/web-runtime/*` và `design/04-execution-overlay/web/*`

Nếu repo canon cũ hơn official docs, cập nhật repo canon trước rồi mới triển khai.

---

## Trạng thái hiện tại của PMTL

Hiện tại repo này chưa có `apps/web` mới, nên:

- `apps/web/node_modules/next/dist/docs/` chưa tồn tại
- bundled docs lane chưa dùng được ngay

Vì vậy trong giai đoạn design/scaffold hiện tại, agent phải dùng:

1. official Next.js docs
2. official llms docs
3. repo design canon

Khi scaffold lại `apps/web` xong và cài `next`, bundled docs lane sẽ trở thành ưu tiên số 1.

---

## MCP lane

Repo đã có `.mcp.json` và có thể thêm/giữ `next-devtools-mcp` để agent truy cập lane Next.js MCP khi môi trường hỗ trợ.

MCP phù hợp cho:
- debug app state
- inspect routing/render/runtime behavior
- migration/upgrade support

MCP không thay thế docs version-matched.

Nó là lane bổ sung cho:
- app internals
- runtime state
- debug flow

---

## Rules for agents

- Trước khi sửa code Next.js, đọc docs source-of-truth trước.
- Khi behavior không hiển nhiên, ghi rõ local path hoặc official page đã dựa vào.
- Không viện dẫn blog, StackOverflow, hay tutorial cũ làm authority chính.
- Nếu local bundled docs không tồn tại, phải nói rõ đang fallback sang official docs chứ không giả vờ như đã verify local.
