# Lunowa Production Failure Mode Catalogue

## Status

**Living product-specific risk catalogue.**

This document records high-value failure modes that can materially harm user trust, data isolation, correctness, availability, cost, privacy, or revenue. It is intentionally not a generic security checklist.

Use it to answer:

- what can go wrong in Lunowa;
- what invariant/control prevents or contains it;
- how the control will be verified;
- when the control becomes mandatory.

Related sources:

- `SECURITY-ARCHITECTURE.md` — durable security boundaries/invariants.
- `VERIFICATION-CONTRACTS.md` — executable acceptance contracts.
- `ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` — authoritative product behavior and state ownership.
- `../security-privacy.md`, `../reliability-operability.md`, `../production-readiness.md` — reusable baseline.

---

## 1. Priority model

### Critical

A plausible failure can expose another user's data, compromise credentials, create irreversible/duplicated external effects, silently hide obligations, corrupt authoritative state, or create severe uncontrolled cost.

### High

A plausible failure materially breaks a core user flow, privacy expectation, recoverability, or provider/commercial correctness.

### Medium

A failure causes significant performance, UX, operational burden, or bounded data-quality problems but is normally recoverable without severe trust impact.

### Activation classes

- **FOUNDATION** — invariant/control should exist before ordinary product implementation relies on the boundary.
- **FEATURE-GATE** — mandatory when the corresponding feature becomes real.
- **PUBLIC-GATE** — mandatory before meaningful external/public use.
- **PAID-GATE** — mandatory when billing/entitlement is real.
- **SCALE-GATE** — activate only when usage/measurement demonstrates need.

Do not implement a later gate merely to make the catalogue look complete.

---

## 2. Immediate high-value failure modes

| ID | Failure mode | Severity | Gate | Primary control | Primary verification |
| --- | --- | --- | --- | --- | --- |
| FM-001 | User changes a URL/API resource ID and accesses another user's Conversation/Message/Attachment/ActionItem | Critical | FEATURE-GATE: persistence/auth | server-side object authorization through authoritative ownership | cross-user GET/PATCH/DELETE negative tests |
| FM-002 | Server secret/API key is embedded in browser bundle/source map/public config | Critical | FOUNDATION | server-only secret boundary; no client-exposed env namespace | canary secret absent from built client assets/artifacts |
| FM-003 | Bug/attacker loops an expensive API and exhausts CPU/provider quota/model budget | Critical | FEATURE/PUBLIC-GATE | request limits + per-actor bounds + concurrency/dedupe/hard cost limits | burst/load abuse tests; bounded provider calls; 429/controlled rejection |
| FM-004 | Conversation list causes N+1 database queries per row | Medium/High | FEATURE-GATE: real DB list | bounded query shape; batch/join/select only required data | query-count instrumentation with representative list sizes |
| FM-005 | Filter/sort query has no useful index and degrades as data grows | Medium/High | FEATURE-GATE: real DB query | query-pattern-driven indexes | representative fixture + query plan/timing evidence |
| FM-006 | Rapid double-submit/retry creates duplicate send or other external effect | Critical | FEATURE-GATE: real send/effect | operation/idempotency key + unique/transactional server authority | concurrent same-operation requests converge to one logical effect |
| FM-007 | Payment webhook is duplicated, delayed, retried, forged, or processed out of order | Critical | PAID-GATE | signature verification + event dedupe + durable async processing + reconciliation | duplicate/reordered/retried/invalid-signature integration tests |
| FM-008 | Oversized file/attachment exhausts memory/storage/processing time | High | FEATURE/PUBLIC-GATE: attachments/uploads | early byte/count/type/processing bounds; streaming/rejection | oversized request rejected before unsafe buffering; storage/job bounded |
| FM-009 | Two tabs/devices/jobs overwrite each other's authoritative state | Critical | FEATURE-GATE: mutable persistence | explicit version/precondition/transaction/idempotency semantics | concurrent conflicting mutation tests; stale work becomes no-op/conflict |
| FM-010 | Production error leaks stack trace, SQL/provider response, token, path, or raw mail content | High/Critical | FOUNDATION/PUBLIC-GATE | stable public error envelope + sanitized server logging | induced 4xx/5xx/provider/DB failures inspected at HTTP/UI/log boundary |

These ten are mandatory inputs to implementation planning. They are not all Phase 0 implementation tasks.

---

## 3. Authorization and identity failures

### FM-011 — Authentication treated as authorization

**Impact:** authenticated User A can access User B/account B data because handlers only check `session != null`.

**Control:** every privileged operation resolves resource ownership/action permission server-side.

**Gate:** FEATURE-GATE when real user data/persistence begins.

### FM-012 — Cross-account leakage inside the same user

**Impact:** `仕事`/`個人`/`大学` scope isolation is broken in search, AI context, summaries, previews, or attachment fetch.

**Control:** apply authoritative account/scope filter before retrieval/context construction, not after.

**Gate:** FEATURE-GATE as soon as multiple connected accounts/scopes exist.

### FM-013 — OAuth mailbox account linked to the wrong Lunowa user/session

**Impact:** provider authorization callback binds a mailbox to an attacker-controlled or unintended account.

**Control:** state/nonce/session binding, explicit ownership confirmation where needed, callback validation, no trust in client-supplied target user/account.

**Gate:** FEATURE-GATE: Gmail OAuth.

### FM-014 — Session/account lifecycle leaves compromised sessions active

**Impact:** password/authenticator/account change does not revoke or invalidate material sessions.

**Control:** use accepted auth provider lifecycle capabilities; define reauth/revocation semantics for sensitive changes.

**Gate:** PUBLIC-GATE according to actual enabled auth methods.

### FM-015 — Account recovery becomes weaker than normal authentication

**Impact:** takeover through recovery/linking flow.

**Control:** provider-supported secure recovery; recent-auth requirement for sensitive identity changes where applicable; user-visible security events when useful.

**Gate:** PUBLIC-GATE if Lunowa exposes reusable accounts/recovery.

---

## 4. Secrets, CI, and supply-chain failures

### FM-016 — Secret committed to Git history

**Impact:** provider/database/account compromise even after deleting the visible file.

**Control:** `.gitignore`, environment/secret store, secret scanning/push protection where available, rotation procedure.

**Gate:** FOUNDATION.

### FM-017 — Secret leaks through logs/build artifacts/test snapshots

**Impact:** credentials exposed outside intended secret store.

**Control:** redaction; do not print env/config objects; artifact review/canary tests for sensitive paths.

**Gate:** FOUNDATION/PUBLIC-GATE.

### FM-018 — Coding agent receives production credentials

**Impact:** prompt injection, accidental disclosure, or destructive production access through ordinary development execution.

**Control:** dev/test credentials only; production secrets outside ordinary agent context; least-privilege tooling.

**Gate:** FOUNDATION.

### FM-019 — CI/workflow change weakens or bypasses verification

**Impact:** malicious/incorrect code reaches protected branch by changing the guardrail itself.

**Control:** protected `Verify`/`E2E Smoke`; stronger review for `.github/workflows/**`, verification scripts, auth/security/deploy/dependency surfaces; immutable action revisions where practical.

**Gate:** FOUNDATION before normal Phase 1 implementation.

### FM-020 — Compromised dependency/build hook executes malicious code

**Impact:** secret exfiltration/build compromise/client compromise.

**Control:** reuse-first but dependency-minimal; lockfile; dependency review/monitoring; avoid unnecessary install/lifecycle execution; pin critical CI inputs.

**Gate:** FOUNDATION, expanded at PUBLIC-GATE.

---

## 5. Email content and browser-security failures

### FM-021 — Malicious HTML email executes in Lunowa application origin

**Impact:** session/data theft, unauthorized requests, UI manipulation.

**Control:** sanitization plus strong rendering isolation/sandbox policy; no message script authority; safe link handling.

**Gate:** FEATURE-GATE before real HTML email rendering.

### FM-022 — Remote image/resource leaks read/open behavior or becomes unsafe fetch path

**Impact:** privacy leakage, tracking, unwanted network access.

**Control:** explicit remote-content policy; block/proxy/consent strategy selected before production rendering.

**Gate:** FEATURE/PUBLIC-GATE: real mailbox rendering.

### FM-023 — Open redirect or unsafe link handling from message content

**Impact:** phishing/trust abuse or redirect-chain exploitation.

**Control:** explicit external-link UX/validation; do not turn arbitrary untrusted URL into privileged internal navigation.

**Gate:** FEATURE-GATE: real message rendering.

### FM-024 — CSRF on state-changing browser action

**Impact:** attacker origin causes send, lifecycle mutation, account change, or other state change using user's session.

**Control:** framework/auth-provider CSRF/origin protections appropriate to cookie/session design; same-site/cookie/origin semantics verified rather than assumed.

**Gate:** FEATURE-GATE when corresponding state-changing endpoint exists.

### FM-025 — Unsafe server-side fetch creates SSRF

**Impact:** attacker-controlled email/link/resource causes Lunowa server to reach internal/metadata/private endpoints.

**Control:** avoid arbitrary server fetch; allowlist/proxy policy; URL/IP/protocol/rebinding protections if fetch feature is necessary.

**Gate:** FEATURE-GATE only if server-side remote fetching is introduced.

---

## 6. AI-specific failures

### FM-026 — Prompt injection in email overrides Lunowa policy

**Impact:** model attempts to disclose data, send/delete, change state, or treat attacker text as trusted instructions.

**Control:** message content remains data; deterministic authorization/action gates outside prompts; no automatic privileged tools from raw content.

**Gate:** FEATURE-GATE: AI interpretation.

### FM-027 — AI context contains another account/user's communication

**Impact:** severe privacy breach even if final response appears harmless.

**Control:** authorized retrieval before context assembly; no model-side filtering as security boundary.

**Gate:** FEATURE-GATE: AI + multi-account data.

### FM-028 — Hallucinated deadline/owner silently changes lifecycle state

**Impact:** Lunowa hides/resurfaces communication incorrectly and breaks core trust promise.

**Control:** structured candidate facts + provenance/confidence + deterministic reducer + uncertainty fallback.

**Gate:** FEATURE-GATE: AI interpretation.

### FM-029 — Missing/failed AI result silently hides obligation

**Impact:** false sense of safety; missed communication.

**Control:** AI degradation returns to normal mail UI/uncertain attention state; missing interpretation cannot equal safe-to-hide.

**Gate:** FEATURE-GATE: AI interpretation.

### FM-030 — AI/API loop creates runaway model cost

**Impact:** financial/resource outage.

**Control:** per-operation dedupe, bounded retries/concurrency, user/account quotas/hard cost limits when public.

**Gate:** FEATURE/PUBLIC-GATE: AI.

---

## 7. Provider sync and Temporal Contract failures

### FM-031 — Duplicate provider notification creates duplicate Message/ActionItem/work

**Impact:** duplicate UI/state/actions/cost.

**Control:** idempotent normalization/upsert; provider IDs/version/cursor semantics; downstream dedupe.

**Gate:** FEATURE-GATE: Gmail sync.

### FM-032 — Missed/delayed provider event prevents resurfacing

**Impact:** obligation remains hidden after reply/event.

**Control:** incremental sync plus reconciliation path; Temporal Contract reevaluation from authoritative persisted state.

**Gate:** FEATURE-GATE: Temporal Contracts with provider events.

### FM-033 — Stale sync cursor/history token causes permanent drift

**Impact:** Lunowa silently diverges from mailbox.

**Control:** explicit invalid-cursor recovery/full reconciliation path and observable sync health.

**Gate:** FEATURE-GATE: real sync.

### FM-034 — Stale Temporal Contract worker overwrites newer state

**Impact:** completed item becomes FOLLOW_UP or hidden/resurfaced incorrectly.

**Control:** worker re-reads current authoritative state/version/preconditions; stale execution no-ops/reduces again.

**Gate:** FEATURE-GATE: durable scheduling.

### FM-035 — Timezone/DST/clock handling fires contract at wrong time

**Impact:** trust failure; late/early resurfacing.

**Control:** explicit stored temporal semantics, timezone-aware scheduling, deterministic clock abstraction in tests, reconciliation after downtime.

**Gate:** FEATURE-GATE: Temporal Contracts.

### FM-036 — Worker/provider outage permanently loses scheduled work

**Impact:** item never returns.

**Control:** durable persisted promise separate from ephemeral worker execution; retry/reconciliation/recovery query for overdue work.

**Gate:** FEATURE-GATE: Temporal Contracts.

---

## 8. Send and external-side-effect failures

### FM-037 — Provider accepted send but Lunowa times out and retries blindly

**Impact:** duplicate email.

**Control:** explicit ambiguous-acceptance state; reconcile before resend; SendOperation authority.

**Gate:** FEATURE-GATE: real send.

### FM-038 — Provider SDK automatic retry bypasses Lunowa idempotency model

**Impact:** duplicate external effect despite application-level operation ID.

**Control:** understand/configure SDK retry semantics and keep provider call within SendOperation reconciliation contract.

**Gate:** FEATURE-GATE: real send.

### FM-039 — Send fails after draft UI disappears

**Impact:** user loses content and trust.

**Control:** persisted draft/autosave; failure preserves recoverable content and exposes retry state.

**Gate:** FEATURE-GATE: real send.

---

## 9. Database, query, cache, and concurrency failures

### FM-040 — Broad query fetches unauthorized rows then filters in application/UI

**Impact:** leak through logs/cache/AI/bugs even if UI hides rows.

**Control:** ownership/scope predicate at authoritative query boundary.

**Gate:** FEATURE-GATE: real persistence.

### FM-041 — Missing pagination/bounds allows huge search/list response

**Impact:** resource exhaustion/latency/cost.

**Control:** bounded pagination/result size and query complexity.

**Gate:** FEATURE/PUBLIC-GATE: real list/search.

### FM-042 — Cache key omits user/account/scope

**Impact:** one user's private result reused for another.

**Control:** private caching policy; identity/scope dimensions in cache key; reauthorization before exposing derived records.

**Gate:** FEATURE-GATE if personalized caching is introduced.

### FM-043 — Regex/search/parser pathological input causes CPU exhaustion

**Impact:** application slowdown/DoS.

**Control:** bounded input/query complexity; avoid dangerous unbounded regex/parser behavior; timeout/limits.

**Gate:** FEATURE/PUBLIC-GATE for affected endpoint.

### FM-044 — Database connection exhaustion under burst/background work

**Impact:** global outage from a small workload spike.

**Control:** connection-aware pooling/runtime configuration; bounded job/request concurrency; realistic load test.

**Gate:** PUBLIC-GATE, earlier if serverless/runtime limits require it.

---

## 10. Attachment/file failures

### FM-045 — Client-side file-size validation is bypassed

**Impact:** server still accepts harmful payload.

**Control:** server/provider-boundary enforcement; client validation only UX convenience.

**Gate:** FEATURE-GATE: upload/attachment processing.

### FM-046 — Archive/decompression bomb expands far beyond compressed size

**Impact:** CPU/memory/storage exhaustion.

**Control:** do not automatically expand archives without bounded decompressed size/count/depth/time.

**Gate:** FEATURE-GATE only if archive inspection/extraction exists.

### FM-047 — Filename/content-type trusted as executable truth

**Impact:** unsafe rendering/download or parser confusion.

**Control:** normalize display names; treat declared MIME/extension as untrusted metadata; choose handling by product policy.

**Gate:** FEATURE-GATE: attachments.

---

## 11. Billing/commercial failures

### FM-048 — Duplicate webhook grants/revokes entitlement twice

**Impact:** incorrect access/revenue state.

**Control:** provider event ID dedupe + idempotent domain transition.

**Gate:** PAID-GATE.

### FM-049 — Webhook order differs from expected business sequence

**Impact:** stale payment event overwrites newer entitlement truth.

**Control:** authoritative provider object/status reconciliation; event processing must not assume arrival order.

**Gate:** PAID-GATE.

### FM-050 — Lunowa entitlement drifts from payment provider

**Impact:** paying user loses access or unpaid user retains it indefinitely.

**Control:** explicit commercial authority + periodic/on-demand reconciliation + constrained repair path.

**Gate:** PAID-GATE.

### FM-051 — Billing endpoint/API retry creates duplicate subscription/charge-side effect

**Impact:** financial harm/support burden.

**Control:** provider-supported idempotency + Lunowa operation semantics.

**Gate:** PAID-GATE.

---

## 12. Privacy, logging, deletion, and recovery failures

### FM-052 — Raw mailbox content enters analytics/logging by default

**Impact:** unnecessary third-party exposure/retention.

**Control:** metadata-first telemetry; explicit reviewed exception for content; redaction.

**Gate:** FOUNDATION/PUBLIC-GATE.

### FM-053 — User deletion removes visible row but leaves durable secrets/content indefinitely

**Impact:** privacy/legal/trust failure.

**Control:** explicit deletion/retention contract across DB, provider credentials, derived state, storage, jobs, backups/processors as applicable.

**Gate:** PUBLIC-GATE before deletion promise is exposed.

### FM-054 — Backup exists but cannot be restored

**Impact:** permanent loss of authoritative non-reconstructable state.

**Control:** identify reconstructable provider data vs Lunowa-owned state; documented/tested restore path proportional to beta/paid risk.

**Gate:** PRIVATE-BETA/PUBLIC-GATE depending on data value.

### FM-055 — Support/repair requires broad direct production DB editing

**Impact:** accidental corruption/privacy breach; unrepeatable operations.

**Control:** constrained scripts/admin/reconciliation operations with narrow scope and auditability when incidents justify them.

**Gate:** PUBLIC/PAID-GATE when real users depend on state.

---

## 13. UX trust and correctness failures

### FM-056 — List jumps/reorders after background update while user is acting

**Impact:** wrong conversation/action selected; user loses control.

**Control:** stable interaction semantics; reconcile updates without unsafe selection/list jumps.

**Gate:** FEATURE-GATE: real/live updates.

### FM-057 — Uncertain AI result displayed as certain

**Impact:** user relies on incorrect deadline/action.

**Control:** confidence/provenance/uncertainty semantics in domain + UI; safe fallback.

**Gate:** FEATURE-GATE: AI.

### FM-058 — Scope changes but stale UI/search/AI result from previous scope remains visible

**Impact:** privacy/confusion and possible cross-context action.

**Control:** scope-bound request/cache identity; cancel/invalidate stale responses; authoritative scope on server.

**Gate:** FEATURE-GATE: multiple scopes.

### FM-059 — Optimistic UI reports success before external effect is durably accepted

**Impact:** user believes send/state change completed when it did not.

**Control:** distinguish local pending, server accepted, provider confirmed/ambiguous states where material.

**Gate:** FEATURE-GATE: real send/provider effects.

---

## 14. Operational and availability failures

### FM-060 — Provider outage blocks all mail UI because enrichment is synchronous

**Impact:** core product unusable during AI/provider/background degradation.

**Control:** preserve normalized/persisted mail UI and clear degraded behavior; nonessential enrichment off critical path.

**Gate:** FEATURE/PUBLIC-GATE.

### FM-061 — Retry storm amplifies provider outage

**Impact:** quota/cost exhaustion and slower recovery.

**Control:** bounded exponential/provider-aware backoff, jitter where appropriate, concurrency limits, circuit/open-state behavior for repeated failure.

**Gate:** FEATURE-GATE: real external integrations.

### FM-062 — No actionable signal for stuck sync/send/Temporal Contract

**Impact:** silent trust failure persists until user complains.

**Control:** structured operation status, error identifiers, targeted alerts/health views for material stuck states.

**Gate:** PRIVATE-BETA/PUBLIC-GATE.

### FM-063 — Operator loses GitHub/domain/cloud/database/payment account access

**Impact:** product/revenue cannot be repaired or controlled.

**Control:** MFA + securely stored provider-supported recovery material/backup authenticator + control-plane inventory.

**Gate:** PUBLIC/PAID-GATE.

---

## 15. Performance risks that are not security architecture

These matter, but should remain measurement-driven rather than becoming premature architecture:

- N+1 queries;
- missing/poor indexes;
- over-fetching large message bodies;
- unnecessary AI reprocessing;
- excessive React/render work;
- slow search query plans;
- attachment streaming/storage bottlenecks;
- database connection pressure.

For these, prefer representative fixtures, query-count/plan evidence, profiling, and user-visible latency measurements before introducing caches, denormalization, search clusters, queues, or microservices.

---

## 16. Triage rule for new failures

When a new concern appears, add it here only if it is durable and materially changes implementation/release decisions.

For each new entry answer:

1. **Asset/impact:** what user/business property is harmed?
2. **Trigger/attacker:** what actually causes it?
3. **Authority/invariant:** what source of truth decides correct behavior?
4. **Preventive control:** what blocks/reduces it?
5. **Detective control:** how would we know it happened?
6. **Recovery:** how do we return to correct state?
7. **Verification:** what observable test/evidence proves the control?
8. **Gate:** when does this become mandatory?

Do not solve a hypothetical failure with costly infrastructure unless the feature/risk exists. Do not defer a Critical architectural invariant merely because current traffic is small.