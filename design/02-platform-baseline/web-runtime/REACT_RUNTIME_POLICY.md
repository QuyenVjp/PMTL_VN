# REACT_RUNTIME_POLICY

## Purpose

Chot React runtime rules cho `apps/web` va `apps/admin` de codegen khong di lech sang anti-patterns thong dung.

## Scope

- React Compiler
- component purity
- state structure
- effects discipline
- refs / DOM escape hatches
- custom hooks
- Suspense / `use()` / transition semantics
- memoization stance

## Authority

- `required`

## Phase

- `all`

## Version basis

- React design pin: `19.2.4`
- source snapshot: `docs/react_docs.md`
- official doc family:
  - `learn/react-compiler/*`
  - `learn/keeping-components-pure`
  - `learn/render-and-commit`
  - `learn/state-as-a-snapshot`
  - `learn/queueing-a-series-of-state-updates`
  - `learn/choosing-the-state-structure`
  - `learn/sharing-state-between-components`
  - `learn/preserving-and-resetting-state`
  - `learn/extracting-state-logic-into-a-reducer`
  - `learn/passing-data-deeply-with-context`
  - `learn/scaling-up-with-reducer-and-context`
  - `learn/referencing-values-with-refs`
  - `learn/manipulating-the-dom-with-refs`
  - `learn/synchronizing-with-effects`
  - `learn/you-might-not-need-an-effect`
  - `learn/lifecycle-of-reactive-effects`
  - `learn/separating-events-from-effects`
  - `learn/removing-effect-dependencies`
  - `learn/reusing-logic-with-custom-hooks`

## React Compiler

### Must

- scaffold mindset la `compiler-first`, khong `manual memo-first`
- giu code tuan thu Rules of React de compiler co the phan tich an toan
- incremental adoption duoc phep theo app/dir/lane, khong bat buoc rollout dong loat
- debugging compiler phai di kem repro ro rang; khong tat compiler theo cam tinh vi mot bug chua khoanh vung

### Must not

- khong coi `useMemo`, `useCallback`, `memo` la baseline style cho code moi
- khong xoa manual memo cu chi vi docs noi compiler co the thay the; chi xoa khi da test lane do
- khong dua business rule vao compiler directives hay build quirks

## Component purity

### Must

- components va hooks phai duoc viet nhu ham thuan theo `props`, `state`, `context`
- side effects chi duoc dat trong event handlers hoac effects co owner ly do ro rang
- derive UI tu state hien tai; khong mutate input trong render

### Must not

- khong mutate props, state, arrays, objects trong render
- khong doc/ghi DOM, timer, storage, network trong render
- khong dua random/time-based side effect vao render de “cho tien”

## State model

### Must

- uu tien state structure nho, ro, khong duplicate derived state
- state chung dua len owner gan nhat; khong dua len global store neu chi 1 subtree can
- `reducer + context` chi mo khi state cross-component da co event vocabulary ro
- phan biet ro persisted server state, local UI state, va derived view state

### Must not

- khong luu duplicate booleans co the derive tu 1 source of truth
- khong dung context nhu global bag cho moi thu
- khong day server state vao Zustand chi de doc/ghi de hon

## Effects discipline

### Must

- bat dau tu cau hoi: `co that su can Effect khong?`
- effect chi dung de dong bo voi system ben ngoai React:
  - network subscription
  - DOM imperative bridge
  - timer
  - browser API
  - analytics / logging side effect
- tach event logic khoi effect logic
- dependencies phai phan anh dung reactive values duoc doc

### Must not

- khong dung effect de tinh toan data co the derive ngay trong render
- khong dung effect de chain state update khi event handler lam truc tiep duoc
- khong suppress dependency lint ma khong co owner explanation ro
- khong nhom nhieu ly do side effect khac nhau vao 1 effect lon

## Refs and DOM escape hatches

### Must

- refs chi dung cho imperative bridge, focus, measurement, scroll, selection, third-party widget
- neu can thao tac DOM, giu surface nho va dat sau React ownership boundary

### Must not

- khong dung refs nhu state thay the
- khong read/write ref de tranh lifecycle cua React neu state moi la owner dung

## Custom hooks

### Must

- custom hook phai gom 1 logic tai su dung co boundary ro
- hook ten theo y nghia runtime, khong ten theo screen cu the neu logic co the dung lai
- hook expose API nho, on dinh, tranh lo internals cua query/effect/state machine

### Must not

- khong tao custom hook chi de giau 1 effect xau
- khong gom unrelated concerns vao 1 hook “tien loi”

## Suspense / transitions / async UI

### Must

- `Suspense` chi dat khi owner route/section da thiet ke loading semantics ro
- `use()` chi dung trong lane ma `FRONTEND_ARCHITECTURE.md` va App Router contracts da cho phep
- `startTransition` dung cho updates co the defer ma khong lam hong input responsiveness
- `useDeferredValue` dung cho read-heavy derived UI nhu filter/search preview khi UX can lam muot

### Must not

- khong dung transition/deferred APIs de che bug state ownership
- khong phu thuoc `Suspense` cho lane can cancellation-sensitive behavior neu contract da cam
- khong boc qua nhieu UI vao 1 boundary lam mat granular streaming

## Memoization stance

- mac dinh: tin compiler truoc
- `useMemo` / `useCallback` / `memo` van duoc phep nhu escape hatch khi:
  - effect dependency can identity on dinh
  - third-party API can referential stability
  - profiling xac nhan lane do thuc su can
- neu dung manual memo, phai co ly do ro o muc component/hook, khong spam theo mau

## Preferred patterns

- derive view model trong render tu source state gon
- event handler chua user intent; effect chua synchronization
- route/server boundary xu ly data ownership; client chi giu UI-interactive state can thiet
- custom hooks uu tien compose tu hooks nho thay vi hidden framework

## Forbidden patterns

- effect-to-effect chains de sync state noi bo
- manual memo everywhere style
- context giant object cho ca app
- ref-driven state machine khi React state/reducer du
- “fix hydration” bang random client-only branches khong co contract

## Dependencies

- [FRONTEND_ARCHITECTURE.md](../../02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md)
- [WEB_APP_ROUTER_FILE_CONTRACT.md](../../04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md)
- [WEB_QUERY_INVALIDATION_PLAN.md](../../04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md)
- [DESIGN_PRINCIPLES.md](../../02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md)
- [VERSION_MATRIX.md](../../02-platform-baseline/dependency-version/VERSION_MATRIX.md)
- [docs/react_docs.md](../../../docs/react_docs.md)
