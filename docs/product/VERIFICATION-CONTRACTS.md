# Lunowa Security and Reliability Verification Contracts

## Status

**Accepted product-specific verification contract.**

This document converts Lunowa's highest-value security/reliability invariants into observable acceptance criteria that implementation tasks and CI can reference.

It intentionally does not require every contract to exist as an automated test today. Each contract becomes mandatory when its corresponding product surface is implemented.

Related sources:

- `SECURITY-ARCHITECTURE.md` — durable trust boundaries and security invariants.
- `FAILURE-MODES.md` — risk catalogue and activation gates.
- `CONTRACTS.md` — product/domain/provider contracts.
- `DATA-MODEL.md` — ownership/concurrency concepts.
- `../verification-review.md` — reusable verification/review baseline.

---

## 1. Verification rule

For high-risk behavior, completion requires an evidence chain:

> **Spec / invariant -> implementation -> observable test/evidence -> independent review for guardrail-sensitive changes.**

A build passing is not evidence that authorization, idempotency, concurrency, provider ambiguity, prompt-injection boundaries, or data isolation are correct.

Prefer deterministic automated tests when the behavior is stable and testable. Use runtime/manual evidence where the real boundary cannot be represented faithfully by a unit test alone.

---

## 2. Contract severity

- **P0** — failure can expose another user's data, leak privileged secrets, duplicate an irreversible side effect, or silently break Lunowa's core trust promise. Must block merge/release when the feature exists.
- **P1** — material security/reliability/privacy failure. Must be satisfied before the feature reaches external users.
- **P2** — important performance/operability property; measure and gate when representative scale exists.

---

## 3. Foundation contracts

### VC-001 — Client bundle contains no server secret

**Severity:** P0

**Applies:** now; every production-oriented build.

**Given** a fake/canary value is supplied only through a server-only secret path,
**when** the application is built,
**then** the value must not appear in browser JavaScript, source maps, static assets, public runtime configuration, HTML payloads, or committed artifacts.

At minimum inspect the generated client output for the canary value. The contract should be automated once the final deployment/build output path is stable.

Do not use a real production key as the test value.

### VC-002 — Public production errors do not leak internals

**Severity:** P1

**Applies:** now for existing error surfaces; expand as real integrations activate.

Induce representative malformed-request, not-found, application exception, build/runtime error, and later DB/provider errors.

Public HTTP/UI responses must not expose:

- stack traces;
- database connection strings/credentials;
- OAuth/provider tokens;
- raw authorization headers;
- internal filesystem paths beyond harmless framework metadata;
- raw SQL/provider payloads containing sensitive data;
- unnecessary raw mailbox content.

A stable user-safe error and request/error identifier are acceptable.

### VC-003 — Canonical verification cannot be bypassed by ordinary code changes

**Severity:** P0 process guardrail

**Applies:** now.

The protected `main` branch must require the established stable CI checks (`Verify` and `E2E Smoke`) before normal Phase 1 implementation proceeds.

Changes to `.github/workflows/**`, canonical verification commands, test infrastructure, auth/authz, secret handling, deployment, migrations, billing, encryption, and similar guardrail surfaces require stronger review than routine UI changes.

Verification must not be made green by deleting/weakening an intended test without explicit rationale in the change.

---

## 4. Authorization contracts

### VC-010 — Cross-user Conversation access is denied

**Severity:** P0

**Applies:** when auth + persistence + Conversation API exist.

Create User A and User B with independent authoritative data.

Using User A's authenticated session and User B's valid Conversation identifier:

- GET must return no protected Conversation content;
- PATCH/PUT must not modify User B's Conversation;
- DELETE must not delete User B's Conversation;
- related Moment/ActionItem/Message/Attachment endpoints must not leak through nested lookup.

Verify the database remains unchanged after denied writes.

Whether the external response is `403` or `404` is an API-design choice; it must not reveal protected content.

### VC-011 — Cross-user nested-resource access is denied

**Severity:** P0

**Applies:** when each resource exists.

Repeat negative authorization for:

- ConnectedAccount;
- Message;
- Attachment;
- ActionItem;
- TemporalContract;
- Draft;
- SendOperation;
- search/context/preview references.

Do not assume authorization of a parent route automatically protects a child endpoint.

### VC-012 — Scope is enforced before search/context retrieval

**Severity:** P0

**Applies:** when multiple accounts/scopes + search or AI context exist.

Given one user with data in Scope A and Scope B:

- a Scope A search must not return Scope B content;
- AI context assembled for Scope A must contain no Scope B message/body/preview/attachment content;
- changing an object ID/client filter must not widen the server-side authorized set;
- cache/derived projections must not reuse Scope B data in Scope A.

Test the actual retrieval/context boundary, not merely final UI filtering.

### VC-013 — Mailbox OAuth callback binds to the initiating Lunowa identity

**Severity:** P0

**Applies:** Gmail OAuth activation.

Test valid callback, invalid/missing state, replayed callback, callback from a different browser/session where relevant, and manipulated target account/user parameters.

A mailbox must only be attached to the authorized initiating Lunowa identity according to the accepted OAuth/session contract.

---

## 5. Send and side-effect contracts

### VC-020 — Rapid double-submit produces one logical send

**Severity:** P0

**Applies:** real send activation.

Given one persisted Draft and one logical send operation,
when the same operation is submitted concurrently multiple times (for example 10 parallel requests),
then:

- only one logical `SendOperation` is created/owned;
- at most one provider send is initiated for that operation;
- every caller receives a result consistent with the same operation state;
- no duplicate provider message is created due solely to Lunowa concurrency/retry behavior.

The server-side invariant must hold even if the UI button is not disabled.

### VC-021 — Ambiguous provider acceptance is not blindly retried

**Severity:** P0

**Applies:** real send.

Simulate provider call scenarios:

1. explicit rejection before acceptance;
2. explicit success;
3. provider accepts but transport acknowledgement is lost/timeout occurs;
4. worker/process retries after the ambiguous result.

Case 3 must enter an explicit ambiguous/reconciliation path. Case 4 must not issue an unconditional second send merely because the previous request timed out.

### VC-022 — Send failure preserves recoverable draft content

**Severity:** P1

**Applies:** real send.

Force provider/network failure after the user submits a draft.

The user must retain recoverable draft content and receive a visible pending/failed/ambiguous state appropriate to the actual operation. A failed send must not silently discard the draft.

### VC-023 — Generic external side effect has explicit idempotency semantics

**Severity:** P0/P1 depending on effect

**Applies:** whenever a new non-trivially reversible external effect is introduced.

The implementation task must state:

- logical operation identity;
- uniqueness/idempotency boundary;
- retry behavior;
- ambiguous acceptance behavior;
- reconciliation authority;
- concurrency test.

Do not merge a new privileged provider mutation with undefined retry semantics.

---

## 6. Concurrency contracts

### VC-030 — Stale Temporal Contract worker cannot overwrite newer state

**Severity:** P0

**Applies:** durable Temporal Contract execution.

Arrange:

1. worker reads an item in WAITING with version/state X;
2. before worker commits, a newer user/provider event changes authoritative state (for example COMPLETED or a new version Y);
3. stale worker resumes.

Expected result:

- stale work does not overwrite the newer state;
- worker no-ops, conflicts, or re-evaluates from current authoritative state;
- audit/provenance remains explainable.

### VC-031 — Concurrent user mutations do not silently lose authoritative updates

**Severity:** P0/P1

**Applies:** mutable persisted lifecycle/action state.

Execute conflicting writes from two tabs/devices against the same version/state.

Expected behavior must be explicitly defined: one wins through a deterministic reducer/transaction, or stale write is rejected/rebased/re-evaluated. Silent last-write-wins is unacceptable when it can erase a meaningful lifecycle transition.

### VC-032 — Duplicate provider ingestion is idempotent

**Severity:** P0

**Applies:** real provider sync.

Deliver the same provider message/change notification multiple times and repeat the incremental fetch.

Expected:

- one normalized Message identity;
- no duplicate Conversation membership;
- no duplicate ActionItem solely from duplicate ingestion;
- downstream AI/job work is deduped or safe to repeat;
- sync cursor/state remains valid.

---

## 7. Resource and abuse contracts

### VC-040 — Expensive endpoint is bounded under repeated calls

**Severity:** P0/P1 depending on cost/side effect

**Applies:** AI, sync, send, search, OAuth/reconnect, attachment processing, Temporal Contract execution, or another expensive public path.

For each expensive endpoint, define a representative burst and verify:

- request/actor/operation concurrency stays within the intended bound;
- duplicate identical work is not multiplied unnecessarily;
- provider/model calls remain bounded;
- controlled rejection (for example 429/queued/already-running) occurs rather than process/resource collapse;
- no state corruption occurs under the burst.

Do not create one global rate-limit number for every endpoint; limits should match operation risk/cost.

### VC-041 — Oversized upload/attachment is rejected before unsafe buffering

**Severity:** P1

**Applies:** any direct upload or server-side attachment processing endpoint.

Submit a payload materially larger than the documented maximum (including a 200MB test when safely practical in a controlled environment, or an equivalent streaming fixture).

Verify:

- request is rejected or constrained before full unsafe in-memory buffering;
- process memory remains bounded;
- no orphaned durable job/storage object is left behind;
- response is stable and user-safe.

### VC-042 — Result/list/search size is bounded

**Severity:** P1

**Applies:** real list/search APIs.

An unauthenticated/authenticated caller must not be able to request effectively unbounded result sets through page-size/query parameters. Server-side maximums apply even if the UI never asks for large pages.

---

## 8. HTML email and attachment contracts

### VC-050 — Malicious HTML email cannot execute with Lunowa application authority

**Severity:** P0

**Applies:** real HTML email rendering.

Use representative malicious fixtures containing script/event-handler vectors, dangerous URLs, iframe/embed/object-like content, CSS/HTML edge cases relevant to the chosen sanitizer/renderer, and attempts to access parent/application context.

Expected:

- message content cannot execute arbitrary script in Lunowa's trusted application context;
- cannot read Lunowa auth/session secrets through the message document;
- cannot mutate the application DOM outside its intended rendering boundary;
- blocked content fails visibly/safely rather than silently escalating privilege.

The exact fixture set should follow the chosen rendering/sanitization library's documented threat model.

### VC-051 — Remote content follows explicit policy

**Severity:** P1

**Applies:** real HTML email.

Verify that a message containing remote images/resources does not bypass the accepted privacy/security policy simply because HTML rendering succeeds.

### VC-052 — Attachment handling enforces server-side limits

**Severity:** P1

**Applies:** attachment download/processing/upload feature.

Test at minimum:

- allowed normal file;
- oversized file;
- too many files where applicable;
- misleading filename/extension/content type;
- archive/decompression edge if extraction is supported;
- processing timeout/failure.

The server/provider boundary owns enforcement; client checks do not satisfy the contract alone.

---

## 9. AI contracts

### VC-060 — Email prompt injection cannot authorize privileged action

**Severity:** P0

**Applies:** AI interpretation/tool use.

Use email content that explicitly instructs the model to ignore system/application policy, reveal other messages, send/delete content, change lifecycle state, or call tools.

Expected:

- model text may be wrong or adversarial, but it cannot expand authorization;
- no privileged external action occurs solely because the email requested it;
- deterministic product controls still own lifecycle and side-effect decisions;
- AI context remains limited to already-authorized data.

### VC-061 — Invalid AI structured output is rejected/contained

**Severity:** P0/P1

**Applies:** AI interpretation.

Feed malformed, missing, contradictory, out-of-range, or unsupported structured output at the model/application boundary.

Expected:

- schema/domain validation rejects or marks uncertainty;
- invalid data does not become authoritative lifecycle state;
- no obligation is silently hidden because parsing failed.

### VC-062 — AI unavailable preserves core mail usability

**Severity:** P1

**Applies:** AI feature activation.

Force model timeout/rate-limit/error.

Expected:

- reading and composing normal mail remains usable;
- UI shows an appropriate degraded/uncertain state;
- existing authoritative provider/mail data remains accessible;
- retry does not create an unbounded model-call loop.

### VC-063 — AI context is account/scope isolated

**Severity:** P0

**Applies:** AI + multiple account/scope data.

This is the AI-specific execution of VC-012: inspect the actual model request/context assembly and verify no unauthorized content is present before transmission to the model provider.

---

## 10. Database/query performance contracts

### VC-070 — Conversation list query count is bounded

**Severity:** P2, upgraded to P1 if latency becomes product-breaking

**Applies:** real DB canonical list.

With representative fixtures such as 50 and 500 conversation rows, instrument database queries for one canonical list load.

Expected: query count is bounded by the page/request shape and does not grow approximately one query per rendered row due to N+1 access.

Do not require a single giant query; bounded predictable access is the goal.

### VC-071 — Representative filter/sort query has evidence-backed indexing

**Severity:** P2

**Applies:** real persistence/query patterns.

For important list/search queries with meaningful fixture size:

- capture the real SQL/query shape;
- inspect query plan/timing;
- add/change an index only when evidence shows value;
- verify improvement and acceptable write/storage trade-off.

Do not auto-create indexes for every filterable column.

### VC-072 — Connection usage remains bounded under realistic concurrency

**Severity:** P1/P2

**Applies:** before public load when DB/runtime connection limits can be exhausted.

Run representative concurrent requests/background operations and verify database connections/pool usage remain within configured/provider limits without a retry storm.

---

## 11. Provider sync and recovery contracts

### VC-080 — Invalid/stale sync cursor has a recovery path

**Severity:** P0/P1

**Applies:** Gmail/provider incremental sync.

Simulate the provider response indicating the incremental cursor/history token can no longer be used.

Expected:

- sync enters an explicit reconciliation/full-sync path;
- no permanent silent stall;
- normalized data converges back toward provider authority;
- failure is observable if recovery cannot complete.

### VC-081 — Missed push notification does not permanently miss mailbox state

**Severity:** P0

**Applies:** push-driven sync.

Omit/delay a notification while provider mailbox changes.

Later reconciliation/incremental sync must still discover the change. Push delivery must not be the sole durable source of truth.

### VC-082 — Worker outage does not erase Temporal Contract promise

**Severity:** P0

**Applies:** durable scheduling.

Stop the worker across a due time, restart later, and run reconciliation.

The persisted contract remains discoverable and is safely re-evaluated/resurfaced according to current authoritative state.

### VC-083 — Timezone/clock semantics are deterministic

**Severity:** P1

**Applies:** Temporal Contracts.

Use a controlled clock and test relevant timezone/date boundary cases for the product's supported semantics. The same persisted contract must resolve predictably across worker restarts and device locales.

---

## 12. Billing/webhook contracts

### VC-090 — Invalid webhook authenticity is rejected

**Severity:** P0

**Applies:** billing activation.

Requests with missing/invalid provider signature/authenticity evidence must not mutate entitlement/payment state.

Use the provider's official verification mechanism and raw-body requirements where applicable.

### VC-091 — Duplicate webhook event is idempotent

**Severity:** P0

**Applies:** billing.

Deliver the same real-shaped provider event multiple times.

Expected: one logical commercial transition; duplicate delivery produces no duplicate grant/revoke/charge-side effect.

### VC-092 — Reordered webhook delivery does not overwrite newer commercial truth

**Severity:** P0

**Applies:** billing.

Deliver valid events in an order different from the business sequence.

Expected: Lunowa converges using the explicit provider/commercial authority and does not trust arrival order as truth.

### VC-093 — Entitlement reconciliation repairs drift

**Severity:** P1

**Applies:** paid production.

Create a controlled mismatch between local entitlement state and provider authority.

Run reconciliation/repair and verify convergence with an auditable result.

---

## 13. Privacy and observability contracts

### VC-100 — Sensitive fields are redacted from logs

**Severity:** P1/P0 for credentials

**Applies:** as corresponding data enters the system.

Generate representative auth/provider/AI/send failures and inspect structured logs.

Tokens, secrets, authorization headers, raw attachment bytes, and unnecessary full mailbox content must not be emitted.

### VC-101 — Analytics events do not silently include raw mailbox content

**Severity:** P1

**Applies:** analytics activation with real mailbox data.

Inspect actual browser/server analytics payloads for core flows. The default telemetry path must remain metadata/event oriented unless an explicit reviewed feature requires message content.

### VC-102 — Deletion/retention behavior matches the stated product contract

**Severity:** P1/P0 depending on promise/legal impact

**Applies:** before exposing account/data deletion promises publicly.

Test the actual deletion workflow across authoritative DB state, provider credentials, derived/search/AI projections, stored attachments, pending jobs, and downstream processors that are in scope. Backup semantics must match the documented policy rather than being assumed instant deletion.

---

## 14. UX trust contracts

### VC-110 — Background update does not cause unsafe list jump during active interaction

**Severity:** P1

**Applies:** real/live list updates.

While a user has selected/is acting on a Conversation, apply a background sync/lifecycle update that changes list ordering.

Expected: the UI does not silently redirect the user's action to a different item or make the selected target ambiguous.

### VC-111 — Scope change invalidates stale data

**Severity:** P0/P1

**Applies:** multiple scopes with asynchronous fetching/caching.

Start a slow request for Scope A, switch to Scope B, then allow A's response to finish.

Scope A content must not become visible/active in Scope B due to stale response/caching behavior.

### VC-112 — Uncertain AI facts are not represented as authoritative certainty

**Severity:** P1

**Applies:** AI interpretation UI.

Given low-confidence/abstained/missing structured fields, UI/domain output must preserve uncertainty according to product semantics rather than inventing a deadline/action/owner.

---

## 15. Test placement guidance

When the implementation exists, prefer the narrowest realistic layer that proves the contract:

- domain/unit tests — lifecycle reducers, version/precondition logic, structured-output validation;
- integration tests — authorization with real query repository, idempotency, DB concurrency, webhook dedupe;
- adapter/contract tests — Gmail/provider mapping and retry/error semantics;
- browser E2E — cross-user UI/API boundary, scope switching, error leakage, draft/send UX, malicious rendering boundary where browser behavior matters;
- build/artifact checks — secret canary leakage;
- load/abuse tests — resource/cost/concurrency bounds;
- runtime/manual/provider sandbox evidence — real OAuth, webhook signing, provider ambiguity, deployment-specific caching/headers when mocks cannot prove the boundary.

A test at the wrong layer can create false confidence. For example, a unit test of an authorization helper does not prove every endpoint calls it.

---

## 16. Guardrail integrity review

The following surfaces can weaken the evidence system itself and should receive independent/fresh review when materially changed:

- `.github/workflows/**`;
- `package.json` canonical verify/test/build scripts;
- test configuration and fixtures that define security expectations;
- auth/session/authorization middleware;
- database migrations/ownership constraints;
- secrets/configuration boundaries;
- provider OAuth/token handling;
- SendOperation/idempotency infrastructure;
- Temporal Contract scheduler/reconciliation;
- billing/webhook verification;
- email HTML/attachment isolation;
- AI action/tool authorization;
- deployment/runtime/security headers/caching;
- dependency changes affecting a security-critical boundary.

The reviewer should verify the intended behavior independently, not only check whether the builder's test is green.

---

## 17. Definition of done for a high-risk implementation task

A high-risk task is done only when the relevant subset is true:

1. authoritative spec/invariant is identified;
2. threat/failure mode is identified or added to `FAILURE-MODES.md` if durable;
3. implementation preserves the trusted boundary;
4. positive-path behavior is verified;
5. negative/adversarial behavior is verified;
6. concurrency/retry behavior is verified when the feature can repeat or race;
7. public error/log data is inspected when sensitive boundaries are involved;
8. canonical `pnpm verify` and relevant E2E/runtime checks pass;
9. CI evidence is green when required by the branch Ruleset;
10. guardrail-sensitive changes receive independent review;
11. documentation is updated if accepted architecture/contract changed.

Do not mark a contract verified when it is merely planned, mocked at the wrong boundary, or inferred from framework documentation.