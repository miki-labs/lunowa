# Lunowa Security Architecture

## Status

**Accepted product-specific security architecture contract.**

This document specializes the reusable baseline in `../security-privacy.md` for Lunowa's actual trust boundaries, data, and failure modes. It does not replace `ARCHITECTURE.md`, `DATA-MODEL.md`, or `CONTRACTS.md`; it defines the security invariants those artifacts and the implementation must preserve.

Related sources:

- `ARCHITECTURE.md` — module ownership and system boundaries.
- `DATA-MODEL.md` — ownership, persistence, and concurrency concepts.
- `CONTRACTS.md` — provider, sync, AI, lifecycle, scheduler, send, search, and error contracts.
- `TECH-STACK.md` — currently accepted implementation stack and activation policy.
- `FAILURE-MODES.md` — Lunowa-specific risk catalogue and phase ownership.
- `VERIFICATION-CONTRACTS.md` — observable security/reliability acceptance contracts.
- `../security-privacy.md` — reusable security/privacy baseline.
- `../reliability-operability.md` — reusable reliability/operability baseline.

---

## 1. Security objective

Lunowa handles communication that may contain sensitive personal, academic, financial, work, authentication, and account-recovery information. The product also makes a trust-sensitive promise: it may remove communication from immediate attention and resurface it later.

The security objective is therefore broader than preventing account takeover:

1. one user must never receive another user's mailbox or workflow data;
2. provider credentials and application secrets must remain outside untrusted client/runtime surfaces;
3. untrusted email/provider/AI content must not gain authority over privileged product actions;
4. duplicate, delayed, retried, or concurrent execution must not create harmful side effects or silently corrupt lifecycle state;
5. expensive provider/AI/background paths must be bounded so bugs or abuse cannot create uncontrolled cost or resource exhaustion;
6. failure must degrade toward visible, repairable states rather than silently hiding obligations;
7. logs, analytics, support tooling, errors, and caches must not become secondary data-leak channels.

Security controls should be activated when the corresponding product surface becomes real. Do not build enterprise controls for surfaces that do not yet exist, but do not postpone architectural invariants until launch.

---

## 2. Trust boundaries

### 2.1 Browser / client

The browser is **not trusted** for authorization, lifecycle authority, provider credentials, send idempotency, or Temporal Contract execution.

Client-visible values are assumed observable and modifiable by the user or an attacker controlling the browser environment.

The client may own rendering, ephemeral UI state, draft editing before persistence acknowledgement, and safe optimistic feedback. It must not be the only enforcement point for any privileged operation.

### 2.2 Lunowa application boundary

The server-side application/API is the trusted boundary for:

- authenticated Lunowa identity;
- object/action authorization;
- scope/account ownership resolution;
- validation of client writes;
- privileged provider operations;
- send idempotency coordination;
- lifecycle and Temporal Contract mutation;
- server-side access to credentials and secrets.

Authentication answers who the actor is. Every privileged read/write must separately answer whether that actor may perform the requested operation on the specific authoritative resource.

### 2.3 Mailbox provider boundary

Gmail and future mailbox providers are external authorities for provider mailbox facts, not Lunowa workflow authority.

Provider payloads, identifiers, webhook/push notifications, message bodies, HTML, attachments, sender names, subjects, and headers are untrusted application input even when delivered by an authenticated provider API.

Provider OAuth credentials are separate from Lunowa application authentication/session state.

### 2.4 AI boundary

AI output is untrusted structured input.

AI may extract or propose facts, summaries, deadlines, owners, intent, and confidence/provenance. AI output must not directly:

- authorize data access;
- select cross-account data outside already-authorized scope;
- send a message;
- delete provider data;
- change billing/entitlement;
- execute arbitrary tool instructions embedded in email content;
- become authoritative lifecycle state without deterministic application rules.

Core rule:

> **AI understands. Deterministic application logic decides authoritative state and privileged effects.**

### 2.5 Background-job boundary

Workers, schedulers, retries, webhook handlers, sync processors, and Temporal Contract jobs are not implicitly trusted merely because they run server-side.

Every durable job that acts on user state must re-read authoritative current state and re-check the relevant ownership/version/precondition before applying a privileged mutation or external side effect.

A stale job must become a safe no-op, reconciliation request, or explicit conflict/error state rather than overwriting newer truth.

### 2.6 Third-party operational systems

Hosting, database, background-job provider, analytics, logging, email-delivery, payment, error-monitoring, CI/CD, and support systems are additional data/trust boundaries.

Only the minimum data required for their purpose should cross those boundaries. Raw mailbox content, credentials, and provider tokens must not be copied into observability/support systems by default.

---

## 3. Authorization architecture

### 3.1 Object-level authorization is mandatory

Unpredictable IDs, UUIDs, hidden routes, or client-side filtering are not authorization controls.

Every server operation using a user-controlled resource identifier must derive access from trusted ownership relationships such as:

`User -> Scope -> ConnectedAccount -> Conversation -> Message/Attachment/ActionItem/TemporalContract/Draft/SendOperation`

The exact schema may evolve, but privileged reads/writes must be scoped through authoritative ownership rather than trusting an ID supplied by the client.

### 3.2 Scope boundary before retrieval

Scope/account authorization must be applied **before**:

- search results are returned;
- AI context is assembled;
- previews/summaries are generated or retrieved;
- attachments/messages are fetched;
- background jobs load content for processing.

Filtering after cross-account retrieval is not an acceptable isolation strategy for sensitive data.

### 3.3 Negative authorization behavior

Cross-user/cross-account access must fail without leaking protected object content or mutating protected state.

Where product semantics do not require the caller to know that another user's object exists, prefer a response that does not become an enumeration oracle.

### 3.4 Optional database defense in depth

Application authorization remains mandatory. Database-level controls such as Row Level Security may be added selectively when they materially reduce blast radius and remain understandable/testable with the chosen data-access architecture.

RLS must not be treated as a substitute for application authorization semantics or as a checkbox requirement before the persistence model exists.

---

## 4. Secret and credential architecture

### 4.1 Server-only credentials

The following classes are server-side secrets unless a provider explicitly defines a public/publishable counterpart:

- database credentials/connection strings containing credentials;
- OAuth client secrets;
- mailbox refresh/access tokens;
- OpenAI or other model-provider secret keys;
- Stripe secret keys and webhook signing secrets;
- application/session encryption or signing secrets;
- background-job/provider credentials;
- operational service tokens.

They must not be placed in client-exposed environment namespaces, client bundles, source maps, public runtime configuration, logs, analytics payloads, browser storage, or committed fixtures.

### 4.2 Public identifiers are not secrets

OAuth client IDs, analytics project IDs, and payment publishable keys may be intentionally public depending on the provider contract. Their presence must not be confused with exposure of a credential capable of privileged server-side action.

### 4.3 Agent and CI access

Ordinary coding-agent environments should not receive production credentials. CI permissions should be the minimum required for verification/build/deployment responsibilities.

Changes to workflows, secret handling, deployment, auth/authz, and other guardrail surfaces require stronger review than ordinary product UI changes.

---

## 5. Untrusted communication content

### 5.1 HTML email

Email HTML is hostile input.

Rendering must prevent message content from gaining script execution, application-origin DOM authority, access to Lunowa credentials/session data, or unsafe navigation behavior.

Prefer a rendering boundary that makes the email document less trusted than the application shell. Sanitization, restrictive sandboxing/isolation, controlled link handling, appropriate security headers/CSP, and remote-resource policy should be selected based on the final implementation.

### 5.2 Remote images and tracking resources

Remote email resources can reveal user activity and can become a security/privacy boundary. They should not be fetched blindly as ordinary application resources.

The product should define an explicit remote-content policy before real mailbox rendering is considered production-ready.

### 5.3 Attachments

Attachments are untrusted even when fetched from a legitimate mailbox provider.

Before attachment processing/downloading/uploading features become real, define:

- maximum file and aggregate request sizes;
- file-count bounds;
- accepted/handled content types;
- filename normalization/display behavior;
- decompression/archive limits if archives are processed;
- malware/content handling strategy proportional to the feature;
- processing time/memory bounds;
- storage/retention/deletion behavior.

Do not load arbitrarily large bodies into application memory before rejecting them.

### 5.4 Prompt injection from communication

Message bodies, attachments, quoted text, signatures, and retrieved web content may contain instructions targeted at an AI model.

They are data, not trusted instructions. AI context construction must preserve the distinction between application/system policy and user/provider content. Privileged actions must remain gated by deterministic product controls and authorization outside model text.

---

## 6. Side-effect safety and idempotency

Any external or non-trivially reversible side effect must define retry semantics.

High-risk examples include:

- sending email;
- provider mailbox mutation;
- payment/entitlement mutation;
- account linking/unlinking;
- durable scheduling/resurfacing;
- deletion/export workflows.

UI button disabling is only a convenience control. Server-side idempotency/concurrency protection owns correctness.

For sending, preserve the existing `SendOperation`/operation-id contract: concurrent double-submit, transport retries, provider ambiguity, and worker retries must not blindly create duplicate messages. Ambiguous provider acceptance must enter an explicit reconciliation state rather than being treated as a simple failure safe to resend.

---

## 7. Concurrency and stale work

Lunowa must assume the same logical state can be changed by:

- multiple browser tabs/devices;
- user action plus mailbox sync;
- incoming provider events;
- AI interpretation completion;
- Temporal Contract workers;
- retry/reconciliation jobs.

Critical state transitions should use an explicit concurrency strategy appropriate to the invariant: transaction boundaries, conditional updates/version checks, unique constraints, row locks, idempotency records, or deterministic reduction from authoritative events/state.

A database transaction alone does not define product conflict semantics.

Particularly important:

- a stale Temporal Contract worker must not overwrite a newer user/provider-derived state;
- duplicate ingestion must not duplicate messages/actions;
- concurrent send requests must converge on one logical SendOperation;
- completion/reopen/follow-up transitions must be explainable from current authoritative state.

---

## 8. Resource and cost containment

Public or semi-public endpoints that can trigger disproportionate CPU, memory, provider requests, model usage, background work, or storage must have explicit bounds before exposure.

Likely Lunowa hotspots include:

- AI interpretation/summarization;
- mailbox sync/fetch/reconciliation;
- sending;
- search;
- attachment transfer/processing;
- OAuth/reconnect flows;
- Temporal Contract scheduling/re-evaluation;
- future billing/webhook processing.

Use the smallest useful combination of:

- request/body limits;
- per-user/account/operation rate limits;
- bounded concurrency;
- deduplication/coalescing;
- provider-aware backoff;
- daily/period quotas where necessary;
- circuit breakers/hard limits for economically dangerous paths.

Do not rely solely on cost alerts when a loop can spend materially faster than a human can react.

---

## 9. Cache, search, and derived-state isolation

Any cache, search index, summary store, preview store, or AI-derived projection containing user communication must preserve the same authorization/scope boundary as the authoritative source.

Derived data must never become a shortcut around authorization.

Cache keys must include the dimensions required to prevent cross-user/cross-account reuse. Shared/private caching behavior must be explicit for authenticated personalized content.

Search and AI projections should reference authoritative records so access can be re-resolved before content is exposed.

---

## 10. Error, logging, analytics, and support data

### 10.1 Public errors

User-facing production errors should expose stable product-safe semantics and an error/request identifier when useful, not stack traces, raw SQL/provider responses, credentials, internal filesystem paths, or sensitive mailbox content.

### 10.2 Server logs

Detailed server-side diagnostics may exist, but sensitive data must be minimized/redacted. Do not log by default:

- access/refresh tokens;
- OAuth client secrets;
- session secrets;
- full authorization headers;
- raw email bodies/attachments;
- model prompts containing unnecessary mailbox content;
- payment secrets;
- database credentials.

### 10.3 Analytics and support

Analytics/support tooling should receive identifiers and event metadata sufficient for product/incident diagnosis without copying raw communication content unless a reviewed feature explicitly requires it.

---

## 11. Failure posture

Security-sensitive failure should move toward visible, bounded, recoverable states.

Examples:

- uncertain AI interpretation -> preserve/raise uncertainty; do not silently hide an obligation;
- AI unavailable -> normal mail reading/composing continues;
- send acknowledgement ambiguous -> reconcile before blind resend;
- stale worker -> no-op/re-evaluate from current state;
- provider sync cursor invalid -> controlled reconciliation/full sync path;
- authz uncertainty -> fail closed;
- secret/configuration missing -> fail startup/operation safely rather than substitute a client-visible fallback;
- remote/attachment content unsafe or oversized -> reject or offer a constrained fallback.

---

## 12. Activation by implementation phase

This document records durable invariants. Implementation should activate controls with the corresponding real surface.

### Runtime / Phase 0 foundation

Required now:

- no committed/runtime-client secret leakage;
- secure environment separation assumptions;
- production-safe error defaults;
- CI/verification protection for guardrail files once repository Ruleset is configured;
- no privileged feature implemented only in the browser.

### Fake-data UI

Required:

- no real sensitive mailbox fixtures;
- rendered sample HTML must not create a false security assumption for real email rendering;
- preserve server-authority boundaries in component/API design even if data is fake.

### Persistence / auth

Required:

- object-level authorization model;
- cross-user negative tests;
- ownership-aware query patterns;
- concurrency/version strategy for mutable authoritative state;
- session/account lifecycle behavior appropriate to enabled auth features.

### Gmail read/sync

Required:

- mailbox credential protection;
- provider payload validation;
- idempotent ingestion/reconciliation;
- HTML/remote-content policy before real rendering;
- cross-account isolation in search/context/preview paths.

### Real send

Required:

- SendOperation idempotency;
- concurrent/double-submit tests;
- provider ambiguity/reconciliation behavior;
- safe retries and draft preservation.

### Temporal Contracts / background work

Required:

- durable persisted trigger state;
- stale-worker/version checks;
- retry/reconciliation behavior;
- bounded scheduling/re-evaluation work.

### AI interpretation

Required:

- structured-output validation;
- prompt-injection boundary;
- provenance/confidence/abstention handling;
- no model-owned authorization/lifecycle/side effects;
- bounded model cost/usage.

### Attachments / uploads

Required before public use:

- size/count/type/processing/storage limits;
- safe download/render behavior;
- abuse/memory exhaustion verification.

### Billing

Required when activated:

- verified webhook authenticity;
- duplicate-event handling/idempotency;
- asynchronous/retriable processing;
- reconciliation of Lunowa entitlement state with provider authority;
- no raw card-data handling unless intentionally reviewed.

---

## 13. Security architecture review triggers

Update this document, the relevant threat/failure entry, and verification contract when a change materially introduces or alters:

- identity/auth/account recovery;
- authorization/multi-account boundaries;
- Gmail/Microsoft scopes or token storage;
- public APIs/webhooks;
- raw HTML/attachment processing;
- AI tool/action capability;
- search/derived caches containing mailbox content;
- durable jobs/Temporal Contract execution;
- payment/entitlement;
- deletion/export/retention;
- deployment/runtime trust boundary;
- secret/CI permissions;
- new sensitive third-party data processor.

Do not add controls solely because a checklist mentions them. Tie each control to a real Lunowa asset, boundary, failure mode, or release surface.