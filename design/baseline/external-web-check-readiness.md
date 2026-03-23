# EXTERNAL_WEB_CHECK_READINESS

File này chốt một chuyện rất dễ bị lẫn:

- `design/` có cover được loại web-check nào
- loại nào chỉ live host mới chứng minh được
- loại nào không phải design owner của PMTL

Nó không thay `security.md`, `infra.md`, `seo-geo/strategy.md`, hay `email-provider-decision.md`.
Nó chỉ là owner cho câu hỏi:

`khi dùng tool ngoài để scan website, PMTL đã sẵn sàng ở mức design tới đâu?`

> Security owner: `baseline/security.md`
> Infra owner: `baseline/infra.md`
> WAF owner: `baseline/waf-antibot-strategy.md`
> Observability owner: `baseline/observability-architecture.md`
> SEO/GEO owner: `seo-geo/strategy.md`
> Email auth owner: `baseline/email-provider-decision.md`
> Implementation truth: `tracking/implementation-mapping.md`

---

## Status semantics

| Status | Nghĩa |
|---|---|
| `design-covered` | design đã có owner doc, policy, và acceptance baseline đủ để code/config đúng |
| `runtime-evidence-required` | design đã có policy nhưng chỉ live host scan mới chứng minh pass/fail thật |
| `external-intelligence-only` | đây không phải thứ design PMTL sở hữu trực tiếp; chỉ có thể theo dõi/đối chiếu từ source ngoài |

---

## Web-check readiness matrix

| Check family | Status | Canonical owner docs | Design expectation | Runtime proof still required |
|---|---|---|---|---|
| SSL/TLS certificate | `runtime-evidence-required` | `baseline/security.md`, `baseline/infra.md`, `ops/deploy-runbook.md` | HTTPS-only, Cloudflare `Full (strict)`, TLS floor `1.2+`, HSTS enabled | live cert chain, expiry, issuer, edge mode, mixed-content absence |
| Cipher suites / protocol posture | `runtime-evidence-required` | `baseline/security.md`, `baseline/infra.md` | design only fixes minimum transport stance; không pin suite list trong design | live TLS scanner / SSL Labs / edge scan |
| HTTP security headers | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `baseline/waf-antibot-strategy.md`, `baseline/frontend-architecture.md` | CSP, HSTS, Referrer-Policy, Permissions-Policy, nosniff are mandatory | live header scan per host/surface |
| Firewall / WAF presence | `design-covered` + `runtime-evidence-required` | `baseline/waf-antibot-strategy.md`, `infra/cloudflare/waf-rules.md`, `infra/cloudflare/change-runbook.md` | Cloudflare is edge WAF, with exact rate/challenge rules | live zone config, challenge behavior, analytics |
| `security.txt` | `design-covered` + `runtime-evidence-required` | `baseline/security.md` | public `/.well-known/security.txt` required before launch | live GET check on production host |
| Malware / phishing reputation | `runtime-evidence-required` | `baseline/security.md`, `baseline/storage-lifecycle.md` | uploads hardened, executable/html public upload blocked, public asset serving constrained | Google Safe Browsing / vendor scanners / reputation tools |
| DNS records (`A`, `AAAA`, `MX`, `TXT`) | `runtime-evidence-required` | `baseline/infra.md`, `baseline/email-provider-decision.md` | Cloudflare DNS baseline + SMTP domain auth expectations | live DNS lookup |
| SPF / DKIM / DMARC | `design-covered` + `runtime-evidence-required` | `baseline/email-provider-decision.md` | SPF include, DKIM auth, DMARC policy are mandatory before launch email trust | DNS + mail-tester / receiver validation |
| Server location / IP info | `external-intelligence-only` | `baseline/infra.md` | single-VPS + Cloudflare posture is known in design | geo/IP lookup is external observation |
| Traceroute / open ports | `runtime-evidence-required` | `baseline/infra.md`, `ops/deploy-runbook.md` | only intended ingress/services should be reachable | live port scan / traceroute |
| Redirect chain | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `seo-geo/strategy.md`, `ops/deploy-runbook.md` | HTTP→HTTPS and canonical host redirect required | live redirect chain scan |
| Tech stack detection | `external-intelligence-only` | `baseline/frontend-architecture.md`, `baseline/infra.md` | design knows intended stack; external detector may infer imperfectly | live fingerprint tool |
| Cookies / tracking | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `baseline/frontend-architecture.md` | auth cookies hardened; analytics/tracking must stay intentional | live cookie scan in browser |
| Sitemap / crawl rules | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `baseline/frontend-architecture.md` | `robots.txt`, `sitemap.xml`, disallow private/member/admin routes | live fetch and search-engine validation |
| Performance / response time | `design-covered` + `runtime-evidence-required` | `baseline/infra.md`, `baseline/observability-architecture.md`, `baseline/sla-slo.md`, `seo-geo/strategy.md` | budgets, SLOs, search-first profile, monitor targets are defined | live PSI/Lighthouse/CWV/latency checks |
| Social tags / metadata | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `seo-geo/structured-data.md`, `baseline/frontend-architecture.md` | OG/Twitter/canonical/JSON-LD required on public pages | live HTML/meta scrape |
| WHOIS | `external-intelligence-only` | none | domain registration is not a PMTL design artifact | live WHOIS service |
| Wayback / archive history | `external-intelligence-only` | none | archive presence depends on external crawlers and time | live archive lookup |
| Global ranking / related domains | `external-intelligence-only` | none | traffic/domain intelligence is external market signal | live ranking/intelligence provider |
| Carbon footprint estimate | `external-intelligence-only` | `baseline/high-traffic-resilience-plan.md` (indirect) | design can reduce weight and waste, but carbon score is tool-dependent external estimate | live calculator |

---

## Expanded tool-name mapping

Phần này map trực tiếp theo tên check mà các web-audit tools thường dùng, để agent không phải tự suy diễn từ matrix nhóm phía trên.

| Tool/category label | Status | Canonical owner docs | Design interpretation |
|---|---|---|---|
| Archive History | `external-intelligence-only` | none | Wayback/archive presence do crawler ngoài và thời gian quyết định |
| Block List Check | `external-intelligence-only` | `baseline/security.md`, `baseline/email-provider-decision.md` | reputation/blocklist là external signal; design chỉ giảm rủi ro qua mail auth, upload hardening, anti-abuse |
| Carbon Footprint | `external-intelligence-only` | `baseline/high-traffic-resilience-plan.md`, `baseline/infra.md` | design giảm weight/waste nhưng không own carbon score tuyệt đối |
| Cookies | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `baseline/frontend-architecture.md` | auth/tracking cookie posture phải intentional, scan live mới thấy thực tế |
| DNS Server | `runtime-evidence-required` | `baseline/infra.md` | authoritative DNS phải do Cloudflare own; live NS lookup mới chứng minh |
| DNS Records | `runtime-evidence-required` | `baseline/infra.md`, `baseline/email-provider-decision.md` | `A/AAAA/MX/TXT` phải đúng theo host + mail auth plan |
| DNSSEC | `design-covered` + `runtime-evidence-required` | `baseline/infra.md` | DNSSEC phải được bật ở Cloudflare zone trước launch |
| Site Features | `design-covered` + `runtime-evidence-required` | `ui/PAGE_INVENTORY.md`, `baseline/frontend-architecture.md` | public feature surface do page inventory own; live scan chỉ xác nhận host đang expose gì |
| Firewall Types | `design-covered` + `runtime-evidence-required` | `baseline/waf-antibot-strategy.md`, `infra/cloudflare/waf-rules.md` | Cloudflare là edge WAF authority; live fingerprint chỉ là evidence |
| Get IP Address | `runtime-evidence-required` | `baseline/infra.md` | design biết có Cloudflare + single VPS, nhưng live DNS/IP lookup mới ra public IP chain |
| Headers | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `baseline/waf-antibot-strategy.md` | scanner terms cho generic response headers; live host mới chứng minh đủ thiếu |
| HSTS | `design-covered` + `runtime-evidence-required` | `baseline/security.md` | HSTS bắt buộc ở production; scan live mới thấy header thật |
| HTTP Security | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `baseline/waf-antibot-strategy.md` | composite family gồm CSP, HSTS, nosniff, referrer policy, permissions policy, cookie posture |
| Linked Pages | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `seo-geo/content-cluster-map.md` | internal linking, orphan prevention, hub-to-detail coverage là design concern; crawl live mới chứng minh |
| Mail Config | `design-covered` + `runtime-evidence-required` | `baseline/email-provider-decision.md`, `baseline/security.md` | SMTP, SPF, DKIM, DMARC, anti-enumeration, delivery policy phải có từ design |
| Open Ports | `runtime-evidence-required` | `baseline/infra.md`, `ops/deploy-runbook.md` | chỉ intended ingress/services được reachable; port scan mới chứng minh |
| Quality Check | `external-intelligence-only` | `baseline/external-web-check-readiness.md` | đây là composite score của tool ngoài; PMTL chỉ own từng thành phần security/SEO/perf riêng |
| Global Rank | `external-intelligence-only` | none | traffic/rank signal là dữ liệu thị trường ngoài |
| Redirects | `design-covered` + `runtime-evidence-required` | `baseline/security.md`, `seo-geo/strategy.md`, `ops/deploy-runbook.md` | HTTP->HTTPS + canonical host redirect phải đúng |
| Robots.txt | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `baseline/frontend-architecture.md` | robots public và disallow đúng private/member/admin routes |
| Screenshot | `runtime-evidence-required` | `ui/PAGE_INVENTORY.md`, `baseline/frontend-architecture.md` | screenshot là live evidence của surface/render hiện hành, không phải design artifact riêng |
| Security.txt | `design-covered` + `runtime-evidence-required` | `baseline/security.md` | `/.well-known/security.txt` là required disclosure artifact |
| Sitemap | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `baseline/frontend-architecture.md` | sitemap index + sub-sitemaps là canonical expectation |
| Social Tags | `design-covered` + `runtime-evidence-required` | `seo-geo/strategy.md`, `seo-geo/structured-data.md` | OG/Twitter/canonical/JSON-LD phải đủ trên public pages |
| SSL Certificate | `runtime-evidence-required` | `baseline/security.md`, `baseline/infra.md`, `ops/deploy-runbook.md` | cert chain/issuer/expiry luôn cần live proof |
| Uptime Status | `design-covered` + `runtime-evidence-required` | `baseline/observability-architecture.md`, `baseline/infra.md`, `ops/health-contract.md` | external uptime monitor là recommended phase 1; live checks mới chứng minh |
| Tech Stack | `external-intelligence-only` | `baseline/frontend-architecture.md`, `baseline/infra.md` | detector ngoài có thể fingerprint sai; design chỉ own intended stack |
| Known Threats | `external-intelligence-only` | `baseline/security.md`, `baseline/waf-antibot-strategy.md` | threat feeds/reputation/malware lists là external intelligence; design chỉ own hardening posture |
| TLS Version | `runtime-evidence-required` | `baseline/security.md`, `baseline/infra.md` | floor `TLS 1.2+`, prefer `1.3`; live scanner mới thấy version thực |
| Trace Route | `runtime-evidence-required` | `baseline/infra.md`, `ops/deploy-runbook.md` | live network path/exposure only |
| TXT Records | `runtime-evidence-required` | `baseline/infra.md`, `baseline/email-provider-decision.md` | TXT bao gồm SPF/DMARC/domain verification; DNS lookup mới chứng minh |
| Whois Lookup | `external-intelligence-only` | none | domain registration không phải design artifact |
| More / composite scanner checks | `external-intelligence-only` | `baseline/external-web-check-readiness.md` | nếu tool thêm score tổng hợp hoặc vendor-specific heuristics, phải map về 3 lớp status này thay vì claim pass bằng design |

---

## Launch-safe interpretation

### Ready at design level

PMTL hiện đã `design-covered` hoặc `design-covered + runtime-evidence-required` cho:

- HTTPS/TLS stance
- security headers
- Cloudflare WAF / anti-bot posture
- `security.txt`
- DNS/email-auth expectations
- redirect policy
- cookies/tracking policy
- robots/sitemap/social metadata policy
- internal-link/crawl coverage policy
- uptime-monitor posture
- performance/SLO posture

### Not provable from design alone

Các mục sau không bao giờ được gọi là `pass` chỉ vì doc đã đẹp:

- cert chain / TLS posture thật
- open ports / traceroute / server exposure
- live headers
- live DNS / SPF / DKIM / DMARC
- live redirect chain
- live performance
- malware/phishing reputation

Chúng cần scan trên host thật sau deploy.

### Not owned by design

Những mục sau không nên trộn vào câu hỏi “design đã sẵn sàng chưa”:

- WHOIS
- Wayback history
- global rank
- related-domain intelligence
- carbon score tuyệt đối

Chúng là external intelligence, không phải implementation contract.

---

## Required evidence pack before calling a host "web-check ready"

Khi PMTL có runtime thật, tối thiểu phải lưu evidence cho mỗi host public/admin/api:

1. TLS/HTTPS:
   - cert issuer
   - expiry
   - HTTP→HTTPS redirect
   - HSTS present
2. Security headers:
   - CSP
   - Referrer-Policy
   - Permissions-Policy
   - X-Content-Type-Options
3. DNS/email:
   - `A` / `AAAA`
   - `MX`
   - SPF
   - DKIM
   - DMARC
4. SEO/crawl:
   - `robots.txt`
   - `sitemap.xml`
   - canonical tags
   - OG / Twitter tags
5. Exposure:
   - open-port snapshot
   - redirect chain snapshot
6. Performance:
   - homepage
   - search page
   - one wisdom detail
   - one member-protected route check from authenticated synthetic flow if available

---

## External intelligence consumption rule

Các category mang status `external-intelligence-only` không bị bỏ mặc; chúng chỉ không phải implementation contract trực tiếp.

Rule:

- không dùng điểm tổng hợp của tool ngoài làm launch gate duy nhất
- mọi finding từ tool ngoài phải được map về một trong 3 lớp:
  - implementation/runtime fix thật
  - operational evidence cần thu thập
  - market/reputation intelligence chỉ để theo dõi
- các family sau nên được review định kỳ sau khi có host thật:
  - block list / domain reputation
  - archive history
  - global rank
  - tech stack fingerprint drift
  - carbon estimate
  - known-threat reputation feeds
- cadence tối thiểu:
  - pre-launch baseline scan
  - post-launch smoke scan
  - monthly review cho public production host
- nếu tool ngoài báo `quality score` thấp nhưng không map được về owner category cụ thể, kết luận đúng là:
  - `signal để review thêm`
  - không phải `bằng chứng fail design`

---

## Rule for PMTL agents

- không dùng `design-ready` để claim website đã pass tool scan
- khi user hỏi kiểu “web check đã ổn chưa”, phải trả theo 3 lớp:
  - design-covered
  - runtime-evidence-required
  - external-intelligence-only
- nếu runtime chưa tồn tại, kết luận đúng chỉ có thể là:
  - `design sẵn sàng để build/check`
  - không phải `host đã pass`
