# Version Matrix

File này là entrypoint ngắn gọn cho version/runtime baseline hiện hành.

Authority chi tiết vẫn thuộc:

- [design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md)
- [design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md)
- [design/01-repo-constitution/DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md)

## Runtime Baseline

| Surface | Baseline |
|---|---|
| Node.js | `20.18.0` |
| pnpm | `10.30.3` |
| TypeScript | `5.9.x` |

## Web

| Concern | Baseline |
|---|---|
| Next.js | `16.1.6` |
| React | `19.2.0` |
| React DOM | `19.2.0` |
| Zod | `4.1.11` |
| TanStack Query | `5.90.x` |
| React Hook Form | `7.62.x` |
| Tailwind CSS | `4` |

## Admin

| Concern | Baseline |
|---|---|
| Vite | `8.x stable` at activation |
| React | same line as web |
| TanStack Router | latest stable compatible line at activation |
| TanStack Table | latest stable compatible line at activation |

## API

| Concern | Baseline |
|---|---|
| NestJS core/common/platform-express | `11.1.17` |
| `@nestjs/swagger` | stable `11.x` compatible line at scaffold time |
| Prisma | stable `7.x` at scaffold time |
| Zod | exact sync with `packages/shared` |
| Pino / `nestjs-pino` | stable compatible line at scaffold time |

## Optional Scale

| Component | Baseline |
|---|---|
| Valkey | latest stable line at activation |
| BullMQ | latest stable line at activation |
| Meilisearch | latest stable line at activation |
| PgBouncer | latest stable line at activation |
| Prometheus/Grafana/Alertmanager | latest stable lines at activation |
| OpenTelemetry | latest stable collector line at activation |
| pgvector | excluded until reconsideration trigger |

## Rules

- Không dùng `latest` như một lý do đủ để nâng version.
- Không dùng prerelease trên production runtime path nếu không có doc ngoại lệ rõ.
- Boundary-critical packages phải giữ sync theo `dependency-governance.md`.
- Nếu docs/framework thay đổi behavior quan trọng, cập nhật owner docs trước rồi mới scaffold/code.
