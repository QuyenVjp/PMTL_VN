# ZOD_4_RUNTIME_POLICY — Boundary validation canon for PMTL

File này chốt cách PMTL dùng `Zod 4` ở `apps/api`, `apps/web`, `apps/admin`, và `packages/shared`.
Nó tồn tại để chặn 3 kiểu drift:

- `class-validator` hoặc TS-only types trở thành source of truth thứ hai
- FE/BE/shared mỗi nơi giữ một schema semantics khác nhau
- dùng bừa các feature mới của Zod 4 mà không có owner rule

> **Decision owner**: `design/01-repo-constitution/DECISIONS.md`
> **Nest request pipeline**: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
> **Frontend forms**: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`
> **Version pin**: `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`
> **Dependency governance**: `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md`
> **Reviewed source snapshot**: `docs/zod_docs.md`

## Core rule

- `Zod 4` là validation canon của PMTL.
- Mọi boundary runtime phải map được về `Zod schema`:
  - request `params/query/body`
  - env contract
  - webhook/internal callback payload
  - queue payload
  - shared form contract
- TypeScript types nên `infer` từ Zod; không viết type/interface thứ hai chỉ để lặp schema semantics.

## Source-of-truth chain

PMTL khóa chuỗi này:

`domain meaning -> Zod schema -> inferred TS types -> transport/docs adapters`

Không đảo ngược thành:

`decorator DTO -> TS interface -> rồi mới vá Zod`

## Placement rule

| Kind | Canonical location | Không được làm |
|---|---|---|
| shared request/response schema | `packages/shared/src/schemas/*` | copy cùng schema sang web/api/admin bằng tay |
| API-only transport helper schema | `apps/api/src/common/validation/*` hoặc module-local `schemas/` | nhét vào controller file |
| form-only UI composition schema | `apps/web` hoặc `apps/admin` feature-local schema nếu thật sự không shared | biến UI-only schema thành authority cho backend |
| env schema | `apps/api/src/common/config/config.schemas.ts` | parse env rải rác trong service |
| queue/webhook payload schema | `packages/shared/src/schemas/*` hoặc platform-local schema owner | inline schema trong worker/service |

## Zod 4 feature stance

### Package stance

- PMTL baseline package là `zod`.
- `zod/mini` không là baseline mặc định của PMTL.
- `zod/v4/core` không là app/runtime import baseline của PMTL; đó là lane cho library authors.

Rule:
- app code dùng `zod`
- chỉ cân nhắc `zod/mini` nếu có measured bundle-pressure thật và owner exception rõ
- không import `zod/v4/core` trong app/business/runtime code

### Metadata and registries

- `Metadata/registries` được phép dùng.
- Vai trò đúng:
  - annotate schema ownership
  - attach operation id / module / contract tags
  - hỗ trợ internal tooling hoặc docs bridge
- `z.globalRegistry` được phép dùng như registry chung cho metadata có tính JSON-Schema/OpenAPI/tooling.
- Không được dùng metadata như chỗ giấu business rule mà schema chính không thể hiện.
- Không được biến registry thành nơi tự định nghĩa field semantics khác với schema.
- Nếu metadata và schema mâu thuẫn, schema thắng.

### JSON Schema

- `JSON Schema` generation được phép dùng như derivative artifact.
- Dùng tốt cho:
  - internal tooling
  - contract export
  - docs bridge
- `z.toJSONSchema()` là path chuẩn nếu cần export từ Zod sang JSON Schema.
- `z.fromJSONSchema()` chỉ được dùng như import/helper lane khi thật sự có external schema cần intake.
- Không được coi JSON Schema là source of truth mới; authority vẫn là Zod schema.
- Không lấy external JSON Schema rồi coi nó là authority mới cho PMTL nếu chưa convert và review lại trong owner layer.
- Nếu schema có phần không representable sạch trong JSON Schema, ưu tiên giữ Zod semantics thay vì sửa business schema cho vừa exporter.

### Codecs

- `Codecs` được phép dùng có chọn lọc cho decode/encode boundary rõ ràng:
  - date string <-> `Date`
  - canonical ID wrappers
  - structured query value normalization khi owner doc cho phép
- `z.decode()` / `z.encode()` chỉ nên xuất hiện ở transport/boundary layer rõ ràng.
- Không dùng codecs để che giấu implicit coercion rộng khắp.
- Nếu transform làm thay đổi business semantics đáng kể, nó phải có owner doc hoặc module contract rõ.
- Không bọc canonical business policy vào codec chỉ vì muốn schema nhìn gọn.

### Refinement and transform stance

- `.check()` được phép và nên ưu tiên hơn `.superRefine()` cho validation logic mới cùng loại.
- `.superRefine()` không bị cấm tuyệt đối trong compatibility lane, nhưng không còn là mặc định cho code mới.
- `.transform()` vẫn hợp lệ, nhưng phải nhớ:
  - output runtime semantics kém introspectable hơn
  - JSON Schema/tooling bridge có thể không biểu diễn sạch
- Nếu một schema cần export mạnh sang JSON Schema/OpenAPI/tooling, ưu tiên shape ít black-box transform hơn.

## Error policy

- API error authority vẫn là PMTL error envelope.
- Zod parse error phải được map qua `validation-error.mapper.ts`, không trả raw `ZodError` thẳng ra client.
- UI form layer chỉ hiển thị field errors đã được normalize; không render raw issue dump cho end user.
- Nếu cần machine-readable details, giữ shape ổn định ở mapper layer thay vì leak internals của Zod issue format.
- `ZodError.format()` và `ZodError.flatten()` không là PMTL baseline mới.
- Nếu cần tree-shaped error output ở API/UI mapper, ưu tiên `z.treeifyError()`.

## Parse discipline

- Boundary parse mặc định dùng:
  - `schema.parse()` khi fail phải chặn request ngay
  - `schema.safeParse()` khi lane cần branch logic rõ ràng
- Không parse đi parse lại cùng payload ở nhiều lớp nếu một layer đã là authority.
- Không dựa vào TypeScript narrowing mà bỏ runtime parse.

## Coercion discipline

- Coercion chỉ được mở khi owner contract nói rõ:
  - ví dụ query string -> number/bool/date
- Không dùng coercion rộng để “cho user tiện” rồi làm semantics mờ.
- Với security-sensitive lanes như auth, webhook, moderation ops:
  - ưu tiên explicit shape
  - tránh coercion ngầm

## Frontend form rule

- Form stack chuẩn là `react-hook-form + zod + @hookform/resolvers/zod`.
- Client form schema nên reuse shared schema khi semantics trùng backend.
- Nếu UI cần schema nhẹ hơn cho draft UX:
  - phải coi đó là UI convenience schema
  - submit boundary vẫn phải pass canonical schema

## API/OpenAPI bridge rule

- OpenAPI/JSON Schema/docs chỉ là artifact đi sau Zod schema.
- Nếu route cần doc metadata thêm, annotate ở bridge/helper layer thay vì tạo DTO authority mới.
- Khi schema và doc không khớp, Zod thắng; doc phải sửa lại.
- Nếu export JSON Schema/OpenAPI fail vì feature không representable sạch, giữ Zod schema làm authority và sửa bridge/tooling; không bẻ schema business chỉ để export dễ.

## Anti-patterns

- dùng `class-validator` làm validation authority
- để controller/service tự validate bằng `if/else`
- copy cùng object shape thành Zod schema ở 3 nơi
- viết TS type trước rồi “ước lượng” schema sau
- dùng `.transform()` hoặc codec để giấu logic business đáng lẽ nằm ở service
- trả raw `ZodError` cho client
- để web nâng Zod version trước `packages/shared`
- dùng `ZodError.format()` / `.flatten()` như baseline mới
- import `zod/mini` hay `zod/v4/core` vào app code mà không có owner exception
- coi `fromJSONSchema()` input là authority thay cho Zod owner schema
- nhét metadata vào registry rồi quên cập nhật schema thật

## Canonical pattern examples

### 1. Shared boundary schema (packages/shared)

```typescript
// packages/shared/src/schemas/identity.schemas.ts
import { z } from 'zod';

export const RegisterMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().min(1).max(80).trim(),
});

// Type inferred from schema — do NOT write a separate interface
export type RegisterMemberDto = z.infer<typeof RegisterMemberSchema>;
```

### 2. NestJS pipe usage at boundary

```typescript
// apps/api/src/common/validation/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { z } from 'zod';

export class ZodPipe<T> implements PipeTransform {
  constructor(private schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      // NEVER return raw ZodError — always map through envelope
      throw new BadRequestException(mapZodError(result.error));
    }
    return result.data;
  }
}

function mapZodError(err: z.ZodError) {
  // z.treeifyError() is the Zod 4 baseline — NOT .format() or .flatten()
  return { code: 'VALIDATION_ERROR', detail: z.treeifyError(err) };
}
```

### 3. Zod 4 refinement — prefer .check() over .superRefine()

```typescript
// Zod 4: .check() is preferred for same-type validation
export const VowSchema = z.object({
  targetCount: z.number().int().positive(),
  deadline: z.string().date().optional(),
}).check((ctx) => {
  if (ctx.value.deadline && new Date(ctx.value.deadline) < new Date()) {
    ctx.addIssue({ code: 'custom', message: 'deadline phải trong tương lai', path: ['deadline'] });
  }
});

// .superRefine() still valid in compatibility lane, but not the new default
```

### 4. Env schema (apps/api config)

```typescript
// apps/api/src/common/config/config.schemas.ts
import { z } from 'zod';

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  STORAGE_ADAPTER: z.enum(['local', 'r2']).default('local'),
  SEARCH_ENGINE: z.enum(['meilisearch', 'sql']).default('meilisearch'),
});

export type Env = z.infer<typeof EnvSchema>;
```

## Decision for future AI/codegen

AI chỉ được thêm validation mới nếu:

1. schema sống ở đúng owner location
2. type được infer từ schema
3. error đi qua mapper chuẩn
4. FE/BE/shared không sinh source of truth thứ hai
