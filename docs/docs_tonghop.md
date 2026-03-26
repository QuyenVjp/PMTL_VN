# 1. Prometheus + Grafana + Alertmanager

**A. Official sources**  
- https://prometheus.io/docs/prometheus/latest/configuration/configuration/  
- https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/  
- https://prometheus.io/docs/alerting/latest/configuration/  
- https://prometheus.io/docs/alerting/latest/alertmanager/  
- https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/  
- https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/  

**B. Verified upstream truths**  
- Prometheus evaluates alerting rules itself using `rule_files` and `evaluation_interval` (default 1m); Alertmanager handles grouping, routing, inhibition and notifications.  
- Configuration reload via SIGHUP or POST /-/reload (requires `--web.enable-lifecycle`); invalid config prevents reload.  
- `scrape_interval` global default 1m; `scrape_timeout` must be ≤ scrape_interval.  
- Alertmanager root route must define a receiver; `group_by` uses labels or `...` to disable grouping.  
- Grafana configuration via `grafana.ini` or `GF_` env vars; provisioning directory for dashboards/alert rules applied at startup.  
- Grafana data_source_proxy_whitelist restricts proxied data source URLs.  
- Anonymous access in Grafana grants Viewer role to all; new dashboards visible unless hidden.  
- Alertmanager config reloadable via SIGHUP or /-/reload; uses `--config.file`.  
- Prometheus metric name validation via `metric_name_validation_scheme` (utf8 default or legacy).  
- Alertmanager resolve_timeout default 5m for resolved alerts without EndsAt.  
- Grafana security section controls admin_password, secret_key, cookie_secure, HSTS, CSP, CSRF.  

**C. PMTL-fit inferences**  
- Inference for PMTL: Prometheus rule files remain the single source of truth for alert conditions; Grafana only for dashboard provisioning and alert UI.  
- Inference for PMTL: scrape_configs and rule_files belong in infra/monitoring/ alongside dormant compose files.  
- Inference for PMTL: internal-only exposure of Grafana/Prometheus/Alertmanager via Caddy trusted_proxies only.  
- Inference for PMTL: dormant lane means no baseline exemplars or native histograms until OTEL lane activated.  
- Inference for PMTL: metamonitoring (alerting on Prometheus/Alertmanager itself) must be first rule set.  
- Inference for PMTL: Grafana anonymous disabled by default; RBAC via organizations for internal team access.  
- Inference for PMTL: resource limits and healthchecks required in Docker Compose for all three containers.  
- Inference for PMTL: X-Forwarded-* headers trusted only from Caddy/Cloudflare upstream.  

**D. Env / config surface**  
- Upstream: PROMETHEUS_CONFIG_FILE (--config.file), ALERTMANAGER_CONFIG_FILE (--config.file)  
- Upstream: GF_SECURITY_ADMIN_PASSWORD, GF_SECURITY_ADMIN_USER, GF_SERVER_ROOT_URL  
- Upstream: GF_SECURITY_DISABLE_INITIAL_ADMIN_CREATION (optional lock after bootstrap)  
- PMTL candidate: no custom env names invented; use GF_ prefix for Grafana and standard flags for Prometheus/Alertmanager.  

**E. Implementation canon candidates for PMTL**  
- File placement candidates: infra/monitoring/prometheus.yml, infra/monitoring/alertmanager.yml, infra/monitoring/grafana/provisioning/  
- Bootstrap seams: entrypoint validate config + amtool check-config before container start.  
- Must-exist artifacts: prometheus.rules.yml (symptom-based), Grafana provisioning JSONs, Alertmanager route tree.  
- Must-not-do list: manual UI edits to rules/dashboards in production; expose Grafana public; scrape Prometheus from itself.  

**F. Uncertain / PMTL-must-decide**  
- Exact resource limits / CPU-memory values for PMTL stack size (Prisma + Meilisearch load).  
- Alert severity mapping and runbook annotation URL template.  
- Grafana v12.x exact provisioning + OTEL receiver coexistence behavior (docs do not pin version-specific numbers).  

# 2. Sentry

**A. Official sources**  
- https://docs.sentry.io/platforms/javascript/guides/node/  
- https://docs.sentry.io/platforms/javascript/guides/node/configuration/  
- https://docs.sentry.io/platforms/javascript/  

**B. Verified upstream truths**  
- DSN is the project boundary identifier; separate DSN per platform/project.  
- Sentry.init() must be called as early as possible before any other code.  
- sendDefaultPii default true; requires explicit scrubbing if sensitive data present.  
- tracesSampleRate controls performance tracing sampling (0.0-1.0).  
- Node SDK automatically captures uncaught exceptions and unhandled rejections.  
- Release tagging via environment or Git SHA for source map association.  
- Source maps upload required for minified Next.js code.  
- Tunnel endpoint recommended for ad-blocker bypass.  

**C. PMTL-fit inferences**  
- Inference for PMTL: separate DSN for web (client) vs api (NestJS) to keep boundaries.  
- Inference for PMTL: Sentry init in apps/web and apps/api/bootstrap only; never mix client/server.  
- Inference for PMTL: tracesSampleRate ≤0.2 in production; performance tracing dormant.  
- Inference for PMTL: release tagging from npm_package_version or Git SHA in CI.  
- Inference for PMTL: PII scrubbing policy required before enabling sendDefaultPii.  

**D. Env / config surface**  
- SENTRY_DSN (per project) – required – project boundary – secret for server, public OK for client  
- SENTRY_RELEASE – optional – version tag – auto from build  
- SENTRY_TRACES_SAMPLE_RATE – optional – sampling control – production <1.0  

**E. Implementation canon candidates for PMTL**  
- File placement candidates: apps/web/sentry.client.config.ts, apps/api/src/sentry.bootstrap.ts  
- Bootstrap seams: NestJS main.ts before app.listen; Next.js _app or middleware.  
- Must-exist artifacts: sentry.properties for release auth token.  
- Must-not-do list: hardcode DSN; import client SDK in NestJS server code.  

**F. Uncertain / PMTL-must-decide**  
- Exact NestJS + OTEL tracing correlation with Sentry (docs do not specify stable integration).  
- PMTL PII scrubbing rules and data retention policy.  

# 3. Docker Compose production

**A. Official sources**  
- https://docs.docker.com/compose/how-tos/production/  
- https://docs.docker.com/compose/how-tos/environment-variables/best-practices/  
- https://docs.docker.com/compose/  

**B. Verified upstream truths**  
- Production Compose file should remove volume bindings for application code.  
- Use different ports on host vs container in production.  
- Environment variables override via .env files or specific environment files.  
- Split configuration with multiple Compose files and `-f` flag.  
- Healthchecks required because depends_on only waits for start, not readiness.  
- Image pinning via digest or stable tag; pull policy always for deploy.  
- Logging driver json-file with max-size/max-file recommended.  

**C. PMTL-fit inferences**  
- Inference for PMTL: base compose.yaml + compose.prod.yml override for dormant monitoring lane.  
- Inference for PMTL: volumes only for data (Postgres, Meilisearch, Valkey); never mount code.  
- Inference for PMTL: healthcheck endpoints mandatory for api/web/meilisearch.  
- Inference for PMTL: secrets/env moved to .env.production (gitignored).  
- Inference for PMTL: restart policy and resource limits required for all services.  

**D. Env / config surface**  
- COMPOSE_FILE – optional – override list  
- COMPOSE_PROJECT_NAME – required – project isolation  
- Upstream uses .env files; no invented PMTL names.  

**E. Implementation canon candidates for PMTL**  
- File placement candidates: docker-compose.yml (base), docker-compose.prod.yml, infra/docker/prod/  
- Bootstrap seams: docker compose up --wait with healthchecks.  
- Must-exist artifacts: .dockerignore, /health endpoints.  
- Must-not-do list: bind-mount code in prod; depends_on without healthcheck; commit secrets in env files.  

**F. Uncertain / PMTL-must-decide**  
- Exact cpus/memory limits for PMTL services under expected load.  

# 4. Caddy

**A. Official sources**  
- https://caddyserver.com/docs/caddyfile/directives/reverse_proxy  
- https://caddyserver.com/docs/caddyfile/directives/tls  
- https://caddyserver.com/docs/caddyfile/options  
- https://caddyserver.com/docs/automatic-https  

**B. Verified upstream truths**  
- Automatic TLS enabled by default for all sites.  
- reverse_proxy forwards with X-Forwarded-* only when trusted_proxies configured.  
- trusted_proxies defines CIDR ranges for real client IP parsing.  
- TLS directive controls email, CA, protocols (min TLS 1.2 default).  
- Global options include trusted_proxies and on_demand_tls restrictions.  

**C. PMTL-fit inferences**  
- Inference for PMTL: Caddy as reverse proxy authority for web/api/admin/grafana with internal-only matchers.  
- Inference for PMTL: trusted_proxies set to private ranges + Cloudflare IPs.  
- Inference for PMTL: internal routes (/admin, /grafana) return 403 unless from trusted proxy.  
- Inference for PMTL: header_up to remove Host spoofing.  

**D. Env / config surface**  
- CADDY_ADMIN – optional – admin API  
- No mandatory upstream env; Caddyfile is primary.  

**E. Implementation canon candidates for PMTL**  
- File placement candidates: infra/caddy/Caddyfile, infra/caddy/sites/  
- Bootstrap seams: Caddyfile import per service.  
- Must-not-do list: tls insecure_skip_verify; proxy without trusted_proxies.  

**F. Uncertain / PMTL-must-decide**  
- Exact websocket support for Grafana in Caddy v2 stable with current PMTL setup.  

# 5. Cloudflare

**A. Official sources**  
- https://developers.cloudflare.com/waf/  
- https://developers.cloudflare.com/turnstile/  
- https://developers.cloudflare.com/cache/  

**B. Verified upstream truths**  
- Proxy (orange cloud) routes traffic through Cloudflare network.  
- WAF rules use custom expressions for rate limiting and blocking.  
- Turnstile requires server-side token validation.  
- Cache purge via API after content changes.  
- Bot protection includes Turnstile for challenges.  

**C. PMTL-fit inferences**  
- Inference for PMTL: orange cloud baseline for all public endpoints.  
- Inference for PMTL: Turnstile server-side validation in NestJS for login/register.  
- Inference for PMTL: cache purge webhook after Meilisearch index updates.  
- Inference for PMTL: origin protection via secret header + WAF.  

**D. Env / config surface**  
- CLOUDFLARE_TURNSTILE_SECRET – required – server validation – secret  
- CLOUDFLARE_TURNSTILE_SITEKEY – required – client – public  

**E. Implementation canon candidates for PMTL**  
- Must-not-do list: trust X-Forwarded-* without Cloudflare IP list verification.  

**F. Uncertain / PMTL-must-decide**  
- Exact WAF custom rule expressions for PMTL traffic patterns.  

# 6. Auth.js và Better Auth

**A. Official sources**  
- https://authjs.dev/  
- https://authjs.dev/getting-started  
- https://www.better-auth.com/docs  

**B. Verified upstream truths**  
- Auth.js is runtime-agnostic library based on Web APIs; requires config object and adapters for sessions.  
- Better Auth is framework-agnostic with own DB tables/migrations and plugin ecosystem.  
- Both require AUTH_SECRET for signing.  
- Auth.js now part of Better Auth project (per official site).  
- Next.js integration uses middleware and server actions.  

**C. PMTL-fit inferences**  
- Inference for PMTL: do not adopt either; keep NestJS as auth authority due to Prisma + Zod + custom business rules.  
- Inference for PMTL: never import session/callback/adapters from these libraries into apps/api.  
- Inference for PMTL: session authority must stay in NestJS guards.  

**D. Env / config surface**  
- AUTH_SECRET – required – signing – secret (both libraries)  

**E. Implementation canon candidates for PMTL**  
- Must-not-do list: import any Auth.js or Better Auth core into NestJS.  
- File placement candidates: design/auth-comparison.md only.  

**F. Uncertain / PMTL-must-decide**  
- Migration path if future switch considered (docs do not provide NestJS-specific guidance).  

# 7. Prometheus Alerting + OTEL coexistence

**A. Official sources**  
- https://prometheus.io/docs/guides/opentelemetry/  
- https://prometheus.io/docs/prometheus/latest/configuration/configuration/ (OTLP section)  

**B. Verified upstream truths**  
- Prometheus ingests OTLP metrics via otlp section.  
- OTEL Collector acts as telemetry proxy.  
- Prometheus remains authority for alerting on metrics.  
- promote_all_resource_attributes can cause high cardinality.  

**C. PMTL-fit inferences**  
- Inference for PMTL: metrics for alerting; traces for debugging only when needed.  
- Inference for PMTL: avoid over-instrumentation by not promoting all OTEL attributes.  
- Inference for PMTL: exemplars optional and experimental for correlation.  

**D. Env / config surface**  
- No specific env; configured in prometheus.yml otlp section.  

**E. Implementation canon candidates for PMTL**  
- Must-not-do list: alert on high-cardinality trace-derived metrics.  

**F. Uncertain / PMTL-must-decide**  
- Exact exemplars correlation behavior with Alertmanager (still experimental).  

# 8. Meilisearch security + keys + tenant tokens

**A. Official sources**  
- https://www.meilisearch.com/docs/capabilities/security/overview  
- https://meilisearch.com/docs/learn/security/multitenancy_tenant_tokens  
- https://www.meilisearch.com/docs/learn/security/tenant_token_reference  

**B. Verified upstream truths**  
- API keys authenticate requests; tenant tokens restrict data per user within shared index.  
- Tenant tokens are short-lived JWTs embedding search rules (filters) and API key UID.  
- Master key required for index updates and admin tasks.  
- Search key scoped for search/index operations only.  
- Tenant token generated from API key with search rules and optional expiry.  

**C. PMTL-fit inferences**  
- Inference for PMTL: frontend uses only tenant tokens; never expose raw search key.  
- Inference for PMTL: NestJS generates tenant token per user session with user-specific filters.  
- Inference for PMTL: master key never in runtime env or frontend.  
- Inference for PMTL: key rotation requires admin key for tasks.  

**D. Env / config surface**  
- MEILI_MASTER_KEY – required at bootstrap – initial key – secret, rotate  
- Search API key UID extracted via get API keys endpoint.  

**E. Implementation canon candidates for PMTL**  
- File placement candidates: apps/api/src/meilisearch/security.service.ts  
- Bootstrap seams: generate tenant token in NestJS guard before search.  
- Must-not-do list: expose master key or raw search key to browser.  

**F. Uncertain / PMTL-must-decide**  
- Exact key rotation procedure without downtime.  
- PMTL tenant token TTL and filter policy per user role.