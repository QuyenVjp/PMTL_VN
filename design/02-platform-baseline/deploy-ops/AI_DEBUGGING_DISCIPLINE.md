# AI_DEBUGGING_DISCIPLINE — How PMTL Uses LLMs for Debugging Without Trusting Them Blindly

File này chốt cách PMTL dùng LLM, subagent, và external CLI worker khi debug.

Mục tiêu:

- tận dụng AI để tăng tốc hypothesis generation
- không giả vờ LLM “đọc hiểu” code như người maintain repo
- buộc mọi chẩn đoán đi kèm context runtime và verification

> Trong PMTL, LLM là `assistant for debugging`, không phải `authority for debugging`.

Related refs:

- `docs/agent-operating-model.md`
- `docs/agent-cheatsheet.md`
- `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md`
- `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`
- `design/02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md`
- `design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md`
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

---

## 0. Tooling stance: Chrome DevTools MCP

Chrome DevTools MCP la mot lane huu ich cho PMTL khi debug web runtime vi no cho AI thay:

- DOM/state/render tree thuc te
- network requests
- console/runtime errors
- performance traces
- third-party script/widget behavior trong browser that

Rule:

- coi Chrome DevTools MCP la `runtime evidence source`, khong phai `auto-fix authority`
- uu tien no khi bug can browser truth ma code reading khong du:
  - hydration mismatch
  - cache/navigation oddities
  - third-party script side effects
  - auth/session behavior trong browser
  - performance regressions va rendering glitches
- khong bo qua:
  - reproduction steps
  - owner docs trong `design/`
  - local verification sau khi AI/DevTools dua hypothesis
- moi de xuat sinh ra tu DevTools AI hoac MCP lane van phai duoc xem la hypothesis cho toi khi:
  - repro duoc
  - fix duoc verify
  - regression gan do duoc check

PMTL vi vay cho phep dung DevTools MCP de tang toc debug, nhung van giu nguyen principle `evidence-first, verify-always`.

---

## 1. Why this rule exists

Research gần đây cho thấy fault localization của LLM rất dễ vỡ khi code bị thay đổi theo cách không đổi semantics, ví dụ:

- rename biến
- thêm comment
- thêm dead code
- đổi thứ tự function
- đẩy relevant code xuống sâu hơn trong context

Điều này nghĩa là:

- model thường bám lexical/pattern cues hơn là semantics thật
- output debug của model không được coi là evidence
- prompt tốt hơn không thay thế được runtime evidence

PMTL vì vậy không cho phép “AI nói bug ở đây” trở thành lý do đủ để sửa code.

---

## 2. Core rule

Khi debug với AI trong PMTL:

- diagnosis phải bám vào `runtime evidence` trước
- code slice phải được `minimize` trước
- dead code / stale comments / irrelevant branches phải được nhận diện rõ
- hypothesis của model phải được verify bằng test, repro, log, trace, hoặc instrumented output

Nếu thiếu runtime evidence, output của model chỉ được coi là `speculation`.

---

## 3. Required inputs before asking AI to debug

Ít nhất nên có 1 hoặc nhiều hơn các input sau:

- stack trace
- failing test output
- reproduction steps
- expected vs actual behavior
- structured logs với correlation id nếu có
- relevant request/response payload
- environment facts: branch, flag, seed data, role, auth state

Không nên chỉ đưa:

- một file code lớn
- screenshot lỗi không có text
- “sao nó không chạy?”

---

## 4. Scope reduction rules

### 4.1 Slice before you ask

Không quăng cả file dài nếu bug nằm ở 1 flow nhỏ.

Ưu tiên:

- isolate function/handler/module liên quan
- đưa thêm caller path hoặc stack trace thay vì cả file 800 dòng
- nếu bug ở cuối file, tách riêng đoạn cuối đó để model không bị bias bởi top-of-file context

### 4.2 Mark unreachable or irrelevant code

Nếu có đoạn:

- dead code
- legacy path
- feature flag đang off
- fallback branch không active

thì phải nói rõ trong prompt hoặc loại nó khỏi context.

### 4.3 Prefer execution path over file order

Prompt debug phải theo execution path:

- input nào vào
- route/service nào chạy
- guard/filter/interceptor nào tham gia
- query/job/webhook nào bị ảnh hưởng

không chỉ theo thứ tự file xuất hiện.

---

## 5. Prompt discipline for AI debugging

Prompt debug trong PMTL nên yêu cầu model trả lời theo dạng:

1. most likely cause
2. evidence from runtime/context supporting it
3. what evidence is still missing
4. smallest verification step
5. alternative hypothesis if verification fails

Không dùng prompt kiểu:

- “find the bug”
- “why broken”
- “fix this” khi chưa có repro

---

## 6. Multi-agent and external worker implications

Các subagent hoặc external CLI worker có ích cho:

- tạo hypothesis nhanh
- đọc chéo nhiều file
- chỉ ra area đáng instrument thêm
- gợi ý missing invariant hoặc missing test

Nhưng không được xem là authority để:

- kết luận root cause chỉ từ code reading
- bỏ qua reproduction
- bỏ qua failing test
- sửa code khi chưa xác định được expected behavior

Nếu 2 worker disagree, không vote theo số lượng model. Quay lại:

- runtime evidence
- design owner docs
- local repro

---

## 7. Verification requirement after an AI-suggested fix

Sau khi AI đề xuất fix:

- chạy failing test cũ hoặc tạo test tái hiện bug
- chạy check mạnh nhất liên quan area bị chạm
- xác nhận symptom biến mất và không tạo regression gần đó
- nếu chỉ có “code looks right” mà chưa có evidence, không được claim fixed

---

## 8. PMTL-specific debugging checklist

Trước khi nhờ AI debug:

- [ ] đã có reproduction steps hoặc failing test chưa
- [ ] đã có stack trace / log / output thực tế chưa
- [ ] đã cắt scope xuống file/module/flow nhỏ nhất chưa
- [ ] đã đánh dấu dead code, stale path, flag-off branch chưa
- [ ] đã đối chiếu owner doc trong `design/` chưa

Sau khi AI trả lời:

- [ ] output này là evidence hay chỉ là hypothesis
- [ ] có bước verify nhỏ nhất nào để xác nhận ngay không
- [ ] fix proposed có chạm sai boundary PMTL không
- [ ] có test/log/check nào chứng minh fix thật không

---

## 9. Design impact on PMTL codebase

Từ rule này, PMTL nên tiếp tục ưu tiên:

- module boundaries rõ
- structured logging tốt
- health and metrics rõ
- tests nhỏ, dễ tái hiện
- route inventory / DTO registry / error registry rõ

Vì các thứ này không chỉ giúp người đọc code, mà còn giúp AI debug ít đoán mò hơn.

---

## 10. Decision summary

Chốt:

- LLM không được tin như semantic debugger đáng tin cậy
- AI debugging trong PMTL là evidence-first
- runtime context quan trọng hơn “đưa nhiều code”
- dead code và context noise phải bị loại hoặc đánh dấu
- mọi AI-suggested fix phải qua verification thật
