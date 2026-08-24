# Lunowa Product Architecture

## Status

**Accepted initial architecture contract, reconciled with Responsibility v0.1 semantics.**

This document defines product-specific system boundaries and invariants. It intentionally does **not** freeze physical Responsibility tables/enums, framework/vendor choices that remain open, or implementation details that have not been validated.

Related sources:

- `responsibility/README.md` — primary routing/status for Responsibility semantics;
- `responsibility/DECISIONS.md` — fixed/open/superseded Responsibility decisions;
- `responsibility/CONSISTENCY-AUDIT.md` — cross-document reconciliation and compatibility rules;
- `../design/DESIGN.md` — intended product/UX behavior;
- `../design/INTERACTIONS.md` — interaction behavior;
- `../design/RESPONSIVE.md` — responsive behavior;
- `DATA-MODEL.md` — conceptual durable model/ownership;
- `CONTRACTS.md` — provider, interpretation, domain, scheduler, search, sync, and send contracts;
- `IMPLEMENTATION-PLAN.md` — staged implementation plan;
- `../architecture-design.md`, `../ai-product-runtime.md`, `../security-privacy.md`, `../reliability-operability.md` — reusable engineering baselines.

For Responsibility semantics, the `responsibility/` directory is the primary authority.

---

## 1. Architecture goals

The architecture exists to make Lunowa's differentiated product behavior reliable without creating startup-scale infrastructure before it is justified.

Highest-value qualities:

1. **Trustworthy Responsibility state.** A real obligation must not disappear because probabilistic interpretation, stale evidence, or an overloaded lifecycle field was wrong.
2. **Reliable Temporal Contracts.** If Lunowa promises to reconsider/resurface something at a time/event, that promise survives restart, retry, provider delay, and multi-device use.
3. **Provider/account isolation.** Gmail/Microsoft and connected-account identity must not leak into unsafe semantic merging or wrong sending identity.
4. **AI bounded by trusted deterministic controls.** AI may interpret communication; trusted product/domain logic owns accepted state and privileged side effects.
5. **Context preservation and low latency.** Core reading/composing remains usable when AI/search/background enrichment is unavailable.
6. **Simple operations.** Prefer a modular monolith and a small number of durable primitives.
7. **Rebuildable derived state.** Search indexes, summaries, embeddings, and UI projections must not become sole critical authorities.
8. **Explicit authority.** Provider facts, communicated claims, user assertions, external authoritative facts, derived interpretation, and product state have distinct authority scopes.

---

## 2. Non-goals

Initial architecture should not assume or require:

- microservices or Kubernetes;
- a general event bus;
- CQRS/event sourcing as the primary persistence model;
- a custom generic workflow/BPMN engine;
- multiple AI providers merely for theoretical portability;
- a vector database/search cluster before measured need;
- native mobile apps before responsive-web product behavior is validated;
- complete offline-first mailbox replication;
- artificial provider feature parity;
- fully autonomous high-impact actions without explicit trusted product controls;
- a physical Responsibility schema more complex than scenario/runtime evidence requires.

---

## 3. System shape

Use a **modular monolith** by default.

```text
Browser / Responsive Web UI
          |
          v
Application API / BFF
          |
          +--------------------+
          |                    |
          v                    v
   Product Domain        Integration Boundaries
          |                    |
          |          +---------+---------+
          |          |                   |
          v          v                   v
 Relational DB   Gmail Adapter     Microsoft Adapter
          |
          +-------------------------+
          |                         |
          v                         v
 Durable Job/Scheduler        AI Interpretation
          |                         |
          +-----------+-------------+
                      v
              Domain Re-evaluation
```

Logical modules may run in more than one process where background execution requires it, but remain one product codebase/domain unless measured failure/scale justifies separation.

A practical initial deployment can be one web/API process, one worker process, one relational database, one durable scheduler/job system, provider APIs, and one evaluated AI model/provider.

---

## 4. Major modules and ownership

### 4.1 Web UI

Owns rendering/local interaction state, responsive behavior, keyboard/accessibility behavior, draft editing before persistence acknowledgement, and visual projection of trusted server state.

Must not own:

- canonical Responsibility authority;
- deadline/obligation inference;
- Temporal Contract execution;
- provider credentials;
- send idempotency authority;
- authorization decisions;
- permanent provider sync cursors.

### 4.2 Application API / BFF

Owns authenticated product-facing contracts:

- authenticate/authorize user access;
- expose Lunowa-shaped APIs rather than provider-shaped APIs;
- validate client writes;
- coordinate domain services;
- initiate durable background work;
- return stable product-level errors.

It should not be a thin pass-through to Gmail/Microsoft.

### 4.3 Identity / Account / Scope

Owns Lunowa user identity, connected accounts, account ownership, user scopes, account-to-scope membership, sender-account eligibility, and reconnect state.

Important separation:

```text
Scope = where to look
Responsibility projection = what requires attention
```

### 4.4 Provider Integration

Owns provider authorization/token refresh integration, incremental fetch, message/thread/attachment retrieval, sending, implemented mailbox mutations, normalization, provider error mapping, and rate-limit/retry compliance.

Provider-specific payloads/IDs remain boundary metadata rather than core domain APIs.

### 4.5 Sync / Ingestion

Owns provider cursor/delta state, incremental sync, reconciliation, normalized Message/Conversation upsert, idempotent duplicate handling, enqueueing interpretation/re-evaluation, and recovery after provider/worker downtime.

Provider processing order is not semantic authority. Late ingestion must not roll back newer semantic correction merely because it was processed later.

### 4.6 Conversation / Communication domain

Owns normalized communication representation:

- participant/thread grouping metadata;
- Message ordering/evidence;
- conversation-level display aggregation;
- relationship to zero/one/many Responsibilities;
- derived aggregate attention projection.

A Conversation is **not** the workflow unit and must not own one authoritative Responsibility lifecycle state.

### 4.7 Responsibility Domain

This is the primary differentiated domain module.

Owns accepted evidence-relative Responsibility semantics, including:

- Responsibility admission (`TRACK / DO_NOT_TRACK / NEEDS_REVIEW`);
- operational-outcome identity/matching;
- `CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP` effects;
- resolution status/reason;
- live-tracking activation;
- attention/defer semantics;
- obligation legs and their actionability/conditions;
- expected events;
- completion criteria;
- constraints;
- pending proposals/agreed facts;
- temporal facts and provenance;
- field-scoped uncertainty/risk;
- deterministic projection to `My Turn / Waiting / Later / Done / Review`;
- transition/explanation history.

Core rule:

> **AI understands. Trusted product rules reduce evidence into accepted Responsibility state.**

The module must not be implemented as the superseded single enum `OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN`.

### 4.8 AI Interpretation

Owns probabilistic communication interpretation into structured candidates, such as:

- zoning/communication-act candidates;
- speaker vs obligation-bearer candidates;
- requested action/event/object;
- modality/obligation-strength candidates;
- communicated claims;
- proposed terms;
- temporal expressions;
- completion/correction/cancellation signals;
- uncertainty;
- provenance/source spans.

AI output is **untrusted structured candidate input**. It does not become provider fact, authorization, or canonical state merely because it is confident.

### 4.9 Temporal Contract / Resurfacing

Owns durable product promises governing when a Responsibility is reconsidered/resurfaced.

Responsibilities:

- persist contract/trigger definitions;
- durable schedule/create/update/cancel;
- react to normalized reply/events;
- idempotent trigger execution;
- reconciliation after downtime;
- record why the contract fired;
- prevent stale/cancelled triggers from resurfacing incorrectly.

Temporal Contract is orthogonal to communication hold/pause. A hold may produce `WAITING`; `LATER` requires a separate attention/defer decision.

### 4.10 Compose / Draft / Send

Owns draft persistence, explicit sending account, recipients/body/attachments, reply/reply-all/forward context, send-now/later/undo workflow, SendOperation state, retry/idempotency, and post-send Responsibility re-evaluation.

Canonical safety rule:

```text
send attempt != reconciled provider acceptance
```

Even reconciled sending resolves a Responsibility only when sending is sufficient for that operational closure condition.

### 4.11 Search

Owns authorized product search over conversations/messages/people/files and, when useful, Responsibility metadata.

Search storage is derived/rebuildable unless a later explicit decision changes that contract. Semantic similarity may retrieve candidates but never authorizes Responsibility identity merge.

### 4.12 Person / Context

Owns lightweight communication context, not CRM pipelines/deals.

Remembered material facts require provenance and authorization.

### 4.13 Audit / Observability

Owns enough evidence to answer:

- why is this Responsibility here now?;
- why did a specific field/obligation change?;
- why did it resurface?;
- did a send/schedule/cancel occur and reconcile?;
- which account/provider was involved?;
- which evidence revision/model/config contributed?;
- what failed and what is pending reconciliation?

Do not indiscriminately log full message bodies/prompts.

---

## 5. Data authority

There is no one universal “source of truth.” Authority is field-specific.

### 5.1 Provider-authoritative observations

Examples:

- provider message existence/IDs;
- provider attachment presence/metadata;
- provider mailbox flags/folders where relevant;
- provider-observed sent-message acceptance/reconciliation.

These observations do not prove unrelated semantic facts such as user obligation legitimacy, attachment usability, or contract approval.

### 5.2 Immutable communication evidence

Actually sent/received communication is immutable evidence of what was communicated.

```text
Original source != normalized text != interpretation
```

A sender claim can be evidence of the communication act without being proof that the claimed external-world event occurred.

### 5.3 Lunowa-authoritative product/domain state

Lunowa owns accepted product-specific state such as:

- scopes/grouping preferences;
- pins;
- Responsibility identity and accepted evidence-relative state;
- live activation/attention decisions;
- user field corrections;
- Temporal Contracts/resurfacing history;
- draft/send workflow state;
- interpretation/config/provenance metadata.

### 5.4 Derived/rebuildable state

Examples:

- search indexes;
- embeddings;
- summaries/previews;
- conversation aggregate attention;
- cached person context;
- analytics projections.

Critical facts must not exist only in a derived projection.

---

## 6. Persistence strategy

### 6.1 Relational database as primary application store

Use a relational database by default because the domain requires authorization-checkable ownership, uniqueness/idempotency, transactions, explicit relationships, migrations, and reconciliation.

Physical Responsibility schema is deliberately **not frozen** here. It must minimally preserve the semantic dimensions fixed under `responsibility/` without building a generic workflow engine.

### 6.2 Attachments/content

Store metadata and fetch/stream provider bytes on demand where practical. Persist Lunowa-owned uploads/object storage only where product/send requirements justify it.

### 6.3 Search/index

Treat search as a projection. Prefer relational/full-text or another low-operations option before specialized infrastructure.

### 6.4 AI data

Persist only validated output/config/provenance needed for behavior, debugging, evaluation traceability, or explanation. Avoid indefinite raw prompt/body/output retention by default.

---

## 7. Dependency direction

Prefer:

```text
UI
 -> Application API
 -> Domain modules
 -> Ports/contracts
 -> Provider/DB/AI/Scheduler adapters
```

Rules:

- UI must not call privileged provider APIs directly;
- core domain contracts must not depend on provider SDK types;
- AI receives normalized authorized context, not unrestricted DB access;
- Responsibility reduction consumes validated candidates/trusted observations, not raw model prose;
- scheduler/worker invokes domain commands and must not mutate Responsibility state ad hoc;
- search results are re-authorized against current application scope.

---

## 8. Asynchronous work model

Naturally asynchronous durable work includes:

- provider sync/reconciliation;
- AI interpretation;
- search projection refresh;
- Temporal Contract triggers;
- send-later;
- retryable provider operations when semantics permit;
- post-ingestion/post-send Responsibility re-evaluation.

Material background work requires durable intent, bounded retries, idempotency/deduplication, observable status, stale-work detection, and reconciliation/permanent-failure behavior.

Do not rely on browser/process-memory timers for user-visible promises.

---

## 9. Synchronization model

### 9.1 Incremental first, reconciliation always available

Design for invalid cursors, delayed/lost notifications, worker downtime, duplicates, and provider ordering differing from local processing order.

### 9.2 Idempotent ingestion

At minimum:

```text
(connected_account_id, provider_message_id)
```

is a stable uniqueness boundary.

Reprocessing must not duplicate Messages, Responsibilities, triggers, or notifications.

### 9.3 Semantic chronology

Ingestion/worker order is not semantic chronology.

Explicit correction/supersession and source semantic time must survive out-of-order delivery. An older late event must not roll back a later authoritative correction simply because it arrived last.

### 9.4 Relevant inbound event

Provider notifications first normalize into trusted application events. They never directly mutate user attention/Responsibility state.

---

## 10. Responsibility-state architecture

### 10.1 Responsibility is the operational workflow unit

A Conversation can contain zero, one, or many Responsibilities.

Responsibility identity follows the smallest communication-bounded operational outcome with a coherent closure condition.

### 10.2 Canonical orthogonal dimensions

The stable semantic vector is:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
uncertainty/risk
provenance
```

Exact physical enums/tables remain open.

### 10.3 Projection, not lifecycle truth

`My Turn`, `Waiting`, `Later`, `Done`, and `Review` are deterministic projections.

Typical shape:

```text
inactive historical/no admitted live Responsibility -> NONE
resolved live Responsibility -> DONE
open + material decision-critical ambiguity -> REVIEW
open + intentional attention defer -> LATER
open + actionable USER obligation leg -> MY_TURN
open + only OTHER/EXTERNAL pending work/events -> WAITING
otherwise -> REVIEW/fallback
```

`FOLLOW_UP` is normally a current user action after a trigger, not a canonical lifecycle species.

### 10.4 Composite effects

One evidence event may affect multiple Responsibilities. Supersession can terminate `R1` and create `R2` in one focal event.

Do not force every focal event into one scalar matching operation.

---

## 11. AI architecture

### 11.1 AI output is candidate interpretation

AI must not directly:

- authorize reads/writes;
- send/delete/archive mail;
- change account scope;
- execute irreversible provider actions;
- decide high-impact compliance;
- mutate accepted Responsibility state without validation/reduction;
- bypass Temporal Contract/safety rules.

### 11.2 Versioned structured output

Material interpretation uses versioned structured output with source message IDs/locators and uncertainty/provenance where practical.

AI results record the evidence revision/config basis needed for stale-result rejection.

### 11.3 Deterministic/trusted decision boundary

```text
Authorized normalized communication
        -> AI interpretation + deterministic parsers/observations
        -> validated candidates
        -> admission + identity + reducer + safety policy
        -> accepted evidence-relative Responsibility state
        -> deterministic projection / Temporal Contract policy
```

### 11.4 Safe fallback

If AI fails/times out/returns invalid output:

- core mail remains usable;
- do not fabricate certainty;
- preserve existing accepted state until evidence/policy justifies change;
- favor visibility over unsafe hiding for material possible obligations;
- do not route all harmless uncertainty into intrusive user questions.

---

## 12. Temporal Contract architecture

Temporal Contract is durable domain intent, not UI copy.

Initial trigger semantics may include scheduled time, relevant reply, and deadline-related triggers.

When a trigger fires:

1. load current contract + Responsibility/evidence state;
2. verify trigger/contract version is current;
3. claim idempotently;
4. re-evaluate current evidence;
5. update attention/actionability/projection if warranted;
6. record resurfacing/audit evidence;
7. cancel/supersede stale sibling triggers.

Scheduler downtime requires overdue reconciliation.

A trigger does not automatically mean notification.

---

## 13. Send architecture

Use durable SendOperation semantics where retries, Undo Send, or Send Later matter.

Repeated client submits/worker retries must not cause duplicates.

Undo Send should initially be a Lunowa-controlled pre-provider delay rather than fictional recall after irreversible delivery.

Ambiguous provider acceptance requires reconciliation before retry/completion assumptions.

---

## 14. Search architecture

Search respects authorization/scope before exposure.

Potential result classes: Conversation, Message, Person, Attachment/File, and intentionally represented Responsibility state/result.

Semantic/fuzzy retrieval is retrieval only; results resolve back to current authorized domain records.

---

## 15. Authentication, authorization, and trust boundaries

- all product APIs operate under authenticated Lunowa user/session;
- provider tokens/credentials remain server-side protected secrets;
- every privileged read/write is re-authorized from trusted state;
- AI/search context is assembled only after authorization filtering;
- email bodies, attachments, HTML, links, provider payloads, and retrieved text remain untrusted content;
- understanding text does not grant that text system/tool authority.

---

## 16. Failure and degraded behavior

Core rule:

> **Core email access degrades independently from AI intelligence.**

Provider failure should isolate to affected account where possible and preserve safe cached content/drafts.

AI failure keeps reading/composing/sending available and must not invent Responsibility certainty.

Scheduler failure preserves durable contracts and reconciles overdue work.

Search failure must not break ordinary inbox/thread navigation.

Attachment-preview failure preserves the conversation and safe download/external alternatives where available.

---

## 17. Observability and audit requirements

Before users depend on Responsibility/Temporal Contract behavior, expose enough evidence to diagnose:

- sync lag/failure by account;
- scheduler trigger execution/overdue failures;
- send state and ambiguous/reconciled provider result;
- AI interpretation latency/failure/config/evidence revision;
- Responsibility effects/field changes and provenance;
- stale-result rejection;
- search projection lag when relevant.

Do not log full sensitive communication content by default.

---

## 18. Architectural invariants

1. **Conversation is not the single workflow-state owner; Responsibility is the communication-bounded operational unit.**
2. **Evidence, interpretation, accepted domain state, safe action, and UI projection are distinct layers.**
3. **Responsibility state is orthogonal; do not restore the superseded seven-value monolithic lifecycle enum.**
4. **AI interpretation does not directly own accepted Responsibility state or privileged side effects.**
5. **Temporal Contract execution is durable/reconcilable; no transient timer is sufficient.**
6. **Provider-specific API types do not leak into core domain contracts.**
7. **Provider observations and Lunowa-specific state have distinct, field-scoped authorities.**
8. **Core mail reading/composing remains usable when AI is degraded.**
9. **Scope/account boundaries are enforced before retrieval/search/AI context exposure.**
10. **Send retries must not cause duplicate email; ambiguous acceptance requires reconciliation.**
11. **Derived indexes/summaries are not sole authorities for critical facts.**
12. **A real material user obligation must not be hidden solely because interpretation is missing/uncertain.**
13. **Cross-account semantic similarity does not authorize Responsibility merge.**
14. **Prompt-injection/tool-like text inside communication never gains system/tool authority.**
15. **Privileged provider credentials never become browser-delivered secrets.**

Prefer mechanical enforcement through types, module boundaries, DB constraints, tests, evidence revision checks, and idempotency where practical.

---

## 19. Technology choices: accepted vs open

### Accepted architectural choices

- responsive web-first;
- modular monolith;
- relational primary application database;
- durable background execution/scheduling;
- provider adapters for Gmail/Microsoft;
- one initial evaluated AI provider/model is sufficient;
- accepted Responsibility/domain authority around validated structured evidence;
- rebuildable search/AI projections.

Current concrete stack selections live in `TECH-STACK.md`/ADRs rather than this architecture document.

### Responsibility implementation remains open

Do not freeze here:

- exact Responsibility/obligation/event tables;
- exact enum names for resolution/live tracking/attention/actionability;
- whether completion criteria are rows/JSON/specialized structure;
- cross-thread identity;
- recurrence/group workflow machinery.

---

## 20. Known architectural risks

### R1. False-negative obligation hiding

Risk: a true material user obligation becomes invisible because of wrong admission, owner, completion, defer, or projection.

Mitigations: layered evaluation, conservative completion, field-level uncertainty, provenance, high-harm forbidden outcomes, deterministic projection.

### R2. Broken Temporal Contract promise

Mitigations: durable scheduling, idempotency, overdue reconciliation, observability, server authority.

### R3. Provider sync drift / semantic rollback

Mitigations: incremental sync + reconciliation, stable provider IDs, semantic chronology, evidence revision, late-event tests.

### R4. Duplicate/ambiguous send

Mitigations: durable SendOperation, idempotency key, ambiguous-result reconciliation, explicit sending identity.

### R5. Privacy/authority expansion through AI/search

Mitigations: authorization-before-retrieval, account isolation, minimal retention, untrusted-content boundary, no prompt/tool authority from email.

### R6. False Responsibility merge

Mitigations: operational-outcome identity, false-merge bias, cross-account prohibition, similarity only for candidate retrieval.

### R7. Premature workflow/schema infrastructure

Mitigations: modular monolith, reuse-first managed infrastructure, scenario-driven minimal schema, no generic workflow engine.

---

## 21. Change rule

Change this architecture when stronger product/runtime evidence invalidates an assumption.

Do not preserve an old lifecycle/model merely for consistency. When a durable invariant or authority boundary changes, update this document, `responsibility/DECISIONS.md`, affected scenarios/evals, and an ADR when the rationale will matter to future agents/contributors.