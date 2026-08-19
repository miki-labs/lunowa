# Lunowa Product Architecture

## Status

**Accepted initial architecture contract.**

This document defines the product-specific system boundaries and invariants that should guide implementation. It intentionally does **not** freeze framework/vendor choices that have not yet been validated.

Related sources:

- `../design/DESIGN.md` — intended product/UX behavior.
- `../design/INTERACTIONS.md` — interaction semantics and lifecycle behavior.
- `../design/RESPONSIVE.md` — responsive behavior.
- `DATA-MODEL.md` — conceptual data model and ownership.
- `CONTRACTS.md` — provider, AI, lifecycle, scheduler, search, sync, and send contracts.
- `IMPLEMENTATION-PLAN.md` — staged implementation plan.
- `../architecture-design.md` — reusable architecture defaults inherited from the engineering blueprint.
- `../ai-product-runtime.md` — reusable user-facing AI runtime constraints.
- `../security-privacy.md` — reusable security/privacy baseline.
- `../reliability-operability.md` — reusable reliability/operability baseline.

---

## 1. Architecture goals

The architecture exists to make Lunowa's differentiated product behavior reliable without creating startup-scale infrastructure before it is justified.

The highest-value qualities are:

1. **Trustworthy lifecycle state.** A conversation must not be hidden or resurfaced based on fragile, implicit state.
2. **Reliable Temporal Contracts.** If Lunowa promises to return something at a time or event, that promise must survive restarts, retries, provider delays, and multi-device use.
3. **Provider isolation.** Gmail- and Microsoft-specific behavior must not leak throughout the product domain.
4. **AI bounded by deterministic controls.** AI may interpret communication; deterministic application logic owns authoritative lifecycle decisions and privileged side effects.
5. **Context preservation and low latency.** Core email reading/composing remains usable even when AI, search enrichment, or background interpretation is unavailable.
6. **Simple operations.** Prefer a modular monolith and a small number of durable infrastructure primitives over distributed architecture.
7. **Rebuildable derived state.** Search indexes, summaries, embeddings, and similar acceleration layers should not become irreplaceable authorities.
8. **Explicit data authority.** Provider mailbox state and Lunowa-specific state must have clear owners.

---

## 2. Non-goals

The initial architecture should **not** assume or require:

- microservices;
- Kubernetes;
- a general event bus;
- CQRS/event sourcing as the primary persistence model;
- multiple AI providers merely for theoretical portability;
- a custom workflow engine;
- a dedicated vector database before semantic retrieval requires one;
- a dedicated search cluster before ordinary database/full-text search proves insufficient;
- native mobile applications before responsive web behavior is validated;
- complete offline-first mailbox replication;
- provider-independent support for every Gmail/Outlook edge feature;
- fully autonomous AI actions without explicit trusted product controls.

---

## 3. System shape

### 3.1 Default topology

Use a **modular monolith** as the default application architecture.

Logical components may run in more than one process when background execution requires it, but they remain one product codebase and one coherent domain unless real scaling/failure evidence later justifies separation.

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

The diagram is logical. Exact runtime deployment may begin as:

- one web/API process;
- one worker process;
- one relational database;
- one durable job/scheduling mechanism;
- provider APIs;
- one evaluated AI model/provider.

If the chosen hosting platform can safely run API and background work in one deployable unit, that is acceptable. Do not split services solely to mirror the diagram.

---

## 4. Major modules and ownership

### 4.1 Web UI

Owns:

- rendering and local interaction state;
- pane/tab state;
- draft editing state before persistence acknowledgement;
- optimistic UI where rollback is safe;
- responsive behavior;
- keyboard/accessibility behavior;
- visual interpretation of authoritative server state.

Must **not** own:

- lifecycle-state authority;
- deadline inference;
- Temporal Contract execution;
- provider OAuth secrets/tokens;
- send idempotency authority;
- authorization decisions;
- permanent provider sync cursors.

### 4.2 Application API / BFF

Owns the authenticated product-facing contract consumed by the UI.

Responsibilities:

- authenticate the user/session;
- authorize access to scopes/accounts/conversations;
- expose product-shaped APIs rather than provider-shaped APIs;
- validate client writes;
- coordinate domain services;
- return stable error semantics;
- initiate durable background work when appropriate.

The API should not become a thin pass-through to Gmail or Microsoft.

### 4.3 Identity / Account / Scope module

Owns:

- Lunowa user identity;
- connected provider accounts;
- provider-account ownership;
- user-created scopes such as `仕事`, `個人`, `大学`;
- account-to-scope membership;
- sender-account eligibility;
- account connection/reconnection state.

Important distinction:

> **Scope answers where to look. Lifecycle view answers what requires attention.**

These dimensions must remain separate in the model and API.

### 4.4 Provider Integration module

Owns adapters for external mailbox providers.

Responsibilities:

- authorization/token refresh integration;
- fetching mailbox changes;
- fetching message/thread details;
- fetching attachment bytes/metadata when required;
- sending messages;
- applying provider-supported mailbox mutations such as read/archive/trash/spam when implemented;
- normalizing provider data into internal contracts;
- mapping provider failures into internal error types;
- respecting provider rate limits and retry guidance.

Provider-specific identifiers and payloads may be persisted as boundary metadata but should not become the primary domain API.

### 4.5 Sync / Ingestion module

Owns mailbox synchronization state and idempotent ingestion.

Responsibilities:

- track provider-specific sync cursor/history/delta token per connected account;
- fetch incremental changes when supported;
- reconcile missed changes;
- normalize and upsert Messages/Conversations;
- detect new inbound communication relevant to Temporal Contracts;
- enqueue downstream interpretation/re-evaluation work;
- recover after provider reconnect or worker downtime.

The sync pipeline must tolerate duplicate delivery and repeated fetches.

### 4.6 Conversation / Communication domain

Owns normalized communication representation.

A Conversation is **not** the sole workflow state container.

It owns:

- participant/thread grouping metadata;
- normalized Message/CommunicationEvent ordering;
- conversation-level display aggregation;
- relationship to Action Items;
- aggregate attention presentation derived from current Action Items.

A conversation can contain several distinct Action Items with different states.

### 4.7 Action / Lifecycle module

This is the primary differentiated domain module.

Owns:

- ActionItem creation/update;
- lifecycle state;
- next owner;
- deadline semantics;
- attention level;
- completion/reopen behavior;
- conversation-level aggregate state;
- transition history;
- deterministic rules converting interpreted facts/events into product state.

Core rule:

> **AI understands. Rules decide state.**

An AI model may propose/extract facts. It does not directly become the authoritative owner of lifecycle state.

### 4.8 AI Interpretation module

Owns probabilistic interpretation of communication into structured candidate facts.

Examples:

- requested action;
- action owner;
- deadline candidate;
- completion signal;
- waiting-for signal;
- message intent;
- topic/title candidate;
- concise preview/summary candidate;
- provenance references;
- field-level confidence/uncertainty.

AI output is **untrusted structured input** to deterministic domain logic.

The module must support abstention/uncertainty. It must not fabricate authority merely because a model emits a confident-looking value.

### 4.9 Temporal Contract / Resurfacing module

Owns the promise that a deferred/waiting item will return under specified conditions.

Responsibilities:

- persist contract definitions;
- persist active triggers;
- create/update/cancel durable schedules;
- react to inbound replies or relevant events;
- emit idempotent resurfacing events;
- support reconciliation after downtime;
- record why a contract fired;
- prevent stale/cancelled triggers from resurfacing incorrectly.

**Do not implement Temporal Contracts using browser timers, process-memory timers, or best-effort cron-only logic without persisted state/reconciliation.**

### 4.10 Compose / Draft / Send module

Owns:

- draft persistence;
- sender account selection;
- recipients/subject/body/attachments;
- reply/reply-all/forward context;
- send-now command;
- send-later scheduling;
- send operation state;
- idempotency/retry protection;
- Undo Send semantics if Lunowa implements a deliberate send-delay window;
- post-send lifecycle re-evaluation.

The provider is authoritative for whether a message exists in the provider mailbox after successful reconciliation; Lunowa owns the local SendOperation workflow and UI state.

### 4.11 Search module

Owns product search semantics across the currently authorized scope.

Search may index:

- conversations/messages;
- people/participants;
- attachment metadata;
- action/task metadata.

Search storage is derived/rebuildable unless a later accepted decision states otherwise.

Start with the simplest search mechanism that meets latency/relevance requirements. Do not introduce a dedicated vector/search service before measured need.

### 4.12 Person / Context module

Owns lightweight communication context, not a CRM.

May provide:

- normalized participant identity;
- recent conversations/topics;
- recent files;
- evidence-backed remembered facts when implemented;
- source links/provenance.

Do not introduce deals, pipelines, arbitrary CRM objects, or sales process semantics into the core domain without a new product decision.

### 4.13 Audit / Observability module

Owns enough durable evidence to answer:

- why did this Action Item change state?;
- why did this item resurface?;
- did Lunowa send/schedule/cancel this operation?;
- which provider/account was involved?;
- which interpretation/config version contributed?;
- what failed and is retry/reconciliation pending?

Do not indiscriminately log full message bodies or model prompts. Privacy-sensitive content requires explicit need, retention, and access control.

---

## 5. Data authority

Lunowa has multiple authorities; do not collapse them into one universal source of truth.

### 5.1 Provider-authoritative state

The external mail provider remains authoritative for mailbox facts such as:

- existence of provider messages;
- provider message/thread identifiers;
- provider delivery state;
- provider mailbox flags/labels/folders where relevant;
- attachment availability at the provider;
- final reconciliation of sent mail with provider mailbox state.

Lunowa may cache/normalize this data for product performance, but the cache must be reconcilable.

### 5.2 Lunowa-authoritative state

Lunowa is authoritative for product-specific state such as:

- scopes/grouping preferences;
- pin state;
- Action Items;
- lifecycle state;
- next owner;
- attention level;
- Temporal Contracts;
- resurfacing history;
- user corrections/overrides;
- Lunowa draft/send workflow state;
- interpretation provenance/config metadata;
- local display preferences/pane widths where persisted server-side.

### 5.3 Derived/rebuildable state

Treat these as derived unless a later decision changes the contract:

- search indexes;
- embeddings;
- generated summaries/previews;
- aggregate conversation attention state;
- cached person context;
- analytics projections.

Derived state must not be the only place a critical user-visible fact exists.

---

## 6. Persistence strategy

### 6.1 Relational database as primary application store

A relational database is the default authoritative store for Lunowa-specific durable state because the domain requires:

- ownership constraints;
- uniqueness/idempotency constraints;
- transactional updates;
- explicit relationships between accounts, conversations, messages, Action Items, contracts, drafts, and operations;
- safe migrations and reconciliation.

Exact database product is not fixed by this document.

### 6.2 Attachments/content storage

Do not copy every provider attachment into Lunowa storage by default.

Prefer:

- store attachment metadata needed for UI/search;
- fetch/stream provider bytes on demand when practical;
- cache only when product latency/offline requirements justify it;
- use a separate object-store boundary if Lunowa must persist generated/local uploads before send.

### 6.3 Search/index storage

Search index is a projection of authorized domain data.

The initial implementation should prefer existing relational/full-text capabilities or another low-operations option before introducing specialized infrastructure.

### 6.4 AI data

Persist only AI output/config/provenance required for product behavior, debugging, eval traceability, or user explanation.

Do not default to storing unlimited raw prompts/retrieved message bodies/model responses indefinitely.

---

## 7. Dependency direction

Prefer this dependency shape:

```text
UI
 -> Application API
 -> Domain modules
 -> Ports / contracts
 -> Provider/DB/AI/Scheduler adapters
```

Important rules:

- UI must not call Gmail/Microsoft APIs directly for privileged mailbox operations.
- Domain modules must not depend on provider SDK types.
- Provider adapters may depend on domain contracts; domain contracts must not depend on provider implementation details.
- AI interpretation may depend on normalized message/context contracts, not on unrestricted database access.
- Lifecycle rules consume validated interpretation facts/events; they do not consume raw model prose.
- Scheduler/worker code invokes domain commands; it must not mutate lifecycle tables ad hoc.
- Search projection code may read domain data but search results must be re-authorized through current application scope before exposing sensitive data.

Cycles between domain modules should be avoided. Cross-module workflows should be coordinated by application services/commands/events with explicit contracts.

---

## 8. Asynchronous work model

The following work is naturally asynchronous and should be represented as durable jobs/events when failure would otherwise lose required work:

- provider sync;
- provider change reconciliation;
- AI interpretation;
- search projection/index refresh;
- Temporal Contract time triggers;
- send-later operations;
- retryable provider sends/mutations when semantics permit;
- post-ingestion/post-send lifecycle re-evaluation.

### 8.1 Required properties

For materially important background work:

- durable intent/state;
- bounded retries;
- idempotent handling or deduplication;
- observable status;
- stale-work detection;
- reconciliation/recovery path;
- explicit permanent-failure behavior.

Do not rely on `setTimeout`, browser background execution, or unpersisted process memory for user-visible promises.

---

## 9. Synchronization model

### 9.1 Incremental first, reconciliation always available

Use provider-supported incremental change mechanisms where practical, but design for the possibility that:

- a cursor/token becomes invalid;
- notifications are delayed/lost;
- a worker was offline;
- duplicate changes arrive;
- provider ordering differs from local processing order.

Each account needs a reconciliation path capable of restoring correct mailbox projection from provider authority.

### 9.2 Idempotent ingestion

At minimum, provider messages must have a stable uniqueness boundary such as:

```text
(connected_account_id, provider_message_id)
```

Upsert/reprocessing the same provider message must not create duplicate Messages, Action Items, reply triggers, or user notifications.

### 9.3 New reply detection

Inbound communication should be processed as a domain event after normalization. Temporal Contracts may subscribe to the semantic event `relevant inbound reply received`, but provider webhook/notification payloads themselves must not directly mutate contract state.

---

## 10. Lifecycle architecture

### 10.1 Action Item is the workflow unit

A Conversation can contain multiple Action Items.

Do **not** put one authoritative lifecycle enum directly on Conversation and assume it represents every obligation inside the thread.

### 10.2 Canonical initial lifecycle states

```text
OPEN
ACTION_REQUIRED
DEFERRED
WAITING
FOLLOW_UP
COMPLETED
UNCERTAIN
```

These are internal domain states. User-facing labels may remain simpler (`対応が必要`, `あとで`, `待ち`, `完了`).

### 10.3 Orthogonal fields

Lifecycle state must not absorb every concern. Keep separate fields/concepts for:

- `next_owner`;
- `attention_level`;
- `deadline`;
- `confidence`;
- `risk`;
- `temporal_contract`;
- `provenance`.

Do not create state explosions such as `URGENT_WAITING_WITH_DEADLINE`.

### 10.4 Conversation aggregate

Conversation-level display state is a projection of active Action Items.

It should surface the item currently most deserving of attention using deterministic ordering/rules that can incorporate both lifecycle class and attention/deadline.

The aggregate is derived and can be recomputed.

---

## 11. AI architecture

### 11.1 AI output is candidate evidence

AI may extract structured facts from normalized messages/context. It must not directly:

- authorize data access;
- send mail;
- delete/archive messages;
- change account scope;
- create an irreversible provider mutation;
- declare a lifecycle state authoritative without domain validation;
- bypass Temporal Contract safety rules.

### 11.2 Structured output

Material AI interpretation should use a versioned structured schema with field-level provenance/confidence where practical.

### 11.3 Deterministic decision boundary

Use this flow:

```text
Normalized communication
        -> AI extraction / deterministic parsers
        -> validated candidate facts
        -> lifecycle rules
        -> authoritative ActionItem state
        -> attention / Temporal Contract policy
```

### 11.4 Safe fallback

If AI fails, times out, returns invalid structured output, or confidence is too low:

- core mail remains readable/actionable;
- affected interpretation becomes unavailable/uncertain;
- do not hide an Action Item merely because the model could not decide;
- fall back toward traditional conversation presentation and conservative attention.

The most dangerous early false negative is: **a real user obligation is incorrectly classified as safely hidden/completed/waiting**.

Initial behavior should bias conservatively around hiding.

---

## 12. Temporal Contract architecture

### 12.1 Contract is durable domain state

A Temporal Contract is not UI copy. It is a persisted promise with executable triggers.

Minimum MVP triggers:

- scheduled time;
- relevant reply received;
- deadline-related trigger/safety fallback.

Additional trigger types may be added only when product value is validated.

### 12.2 Deterministic scheduler boundary

The scheduler executes persisted trigger intent. It does not ask an LLM at wake-up time whether the promise should exist.

When a trigger fires:

1. load current contract/action state;
2. verify trigger is still active/current;
3. acquire/idempotently claim execution;
4. apply deterministic re-evaluation;
5. create a resurfacing/audit event if attention should change;
6. cancel/supersede stale sibling triggers as required.

### 12.3 Reconciliation

On worker restart or scheduler outage, the system must be able to find overdue active triggers and process them safely.

No user promise may depend solely on a transient scheduled callback.

---

## 13. Send architecture

### 13.1 Send command

Sending should have an explicit durable operation record before or atomically with the side-effect workflow when retries/Undo Send/Send Later are involved.

### 13.2 Idempotency

Repeated client submits or worker retries must not accidentally send duplicate mail.

Use an internal send-operation/idempotency key independent of provider-generated sent-message IDs.

### 13.3 Undo Send

If Lunowa offers Undo Send, the safest initial model is a **Lunowa-controlled delay before provider send**, not an assumption that every provider supports recalling a delivered message.

The UI must not imply recall after irreversible provider delivery unless the provider-specific capability has been verified and implemented.

### 13.4 Send Later

Send Later is another durable scheduled operation and must follow the same persisted-state/reconciliation principles as Temporal Contracts.

---

## 14. Search architecture

Search must respect the active authorization/scope boundary.

### 14.1 Searchable concepts

Potential result classes:

- Conversation;
- Message;
- Person/participant;
- File/attachment.

### 14.2 Scope

Default search scope is current user-selected Scope. Explicit user action may broaden to `全体`.

Do not silently search personal/work scopes together when the UI says the user is scoped to one.

### 14.3 Semantic search

Semantic/fuzzy retrieval may be added, but it is a retrieval layer rather than an authority. Results must resolve back to current authorized domain records.

---

## 15. Authentication, authorization, and trust boundaries

### 15.1 User session

All product APIs operate under an authenticated Lunowa user/session.

### 15.2 Provider credentials

Provider access/refresh tokens are server-side secrets/sensitive credentials.

Requirements:

- never ship refresh tokens/client secrets into browser bundles;
- encrypt/protect stored provider credentials using the selected platform's supported secret/encryption mechanisms;
- request the minimum provider scopes required for implemented features;
- treat reconnect/revocation as expected lifecycle events;
- account removal from Lunowa must not imply provider mailbox deletion.

### 15.3 Authorization

Every read/write must verify ownership/access based on trusted application state.

AI/search/retrieval context must be assembled only after authorization filtering.

### 15.4 Untrusted content

Email bodies, attachments, HTML, links, provider payloads, and retrieved text are untrusted content.

They must never acquire system/tool authority merely because they appear in an AI prompt or rendered view.

---

## 16. Failure and degraded behavior

Core principle:

> **Core email access should degrade independently from AI intelligence.**

### Provider unavailable/rate-limited

- show cached/stale content where safe and label sync state;
- preserve drafts;
- queue/retry only within bounded semantics;
- expose account-specific reconnect/failure state;
- do not blank unrelated accounts.

### AI unavailable

- conversation reading/composing/sending remain available;
- hide or mark unavailable only the AI-derived enhancement;
- do not invent lifecycle certainty;
- retry asynchronously only within cost/latency bounds.

### Scheduler unavailable

- persist contracts/operations;
- recover overdue work on restart;
- surface operational health because this dependency underpins product trust.

### Search unavailable

- do not break inbox/thread navigation;
- allow basic browsing;
- present a recoverable search failure.

### Attachment preview unavailable

- preserve conversation;
- offer download/open-through-provider path when safe and supported.

---

## 17. Observability and audit requirements

Before public dependence on Lifecycle/Temporal Contract behavior, the system should expose enough evidence to diagnose:

- sync lag/failure by provider account;
- active/overdue scheduler jobs;
- Temporal Contract trigger execution and failures;
- duplicate-prevention/idempotency conflicts;
- send operation state and provider result;
- AI interpretation latency/failure/config version;
- lifecycle transitions and their evidence/provenance;
- search projection lag when relevant.

Do not log full sensitive communication content by default.

---

## 18. Architectural invariants

These are intentionally strong constraints.

1. **Conversation is not the single lifecycle-state owner; ActionItem is.**
2. **AI interpretation does not directly own authoritative lifecycle state.**
3. **Temporal Contract execution is durable and deterministic; no transient timer is sufficient.**
4. **Provider-specific API types do not leak into core domain contracts.**
5. **Provider mailbox state and Lunowa-specific workflow state have distinct authorities.**
6. **Core mail reading/composing must remain usable when AI is degraded.**
7. **User scope boundaries are enforced before retrieval/search/AI context exposure.**
8. **Send retries and client retries must not cause duplicate email sends.**
9. **Derived indexes/summaries are not sole authorities for critical facts.**
10. **A real user obligation must not be hidden solely because AI output is missing/uncertain.**
11. **External payloads are validated/normalized at provider boundaries.**
12. **Privileged provider credentials never become browser-delivered secrets.**

Future implementation should prefer mechanical enforcement for these invariants where practical through types, module boundaries, database constraints, tests, and job/idempotency design.

---

## 19. Technology choices: accepted vs open

### Accepted architectural choices

- responsive web-first product;
- modular monolith default;
- relational primary application database;
- durable background execution/scheduling;
- provider adapters for Gmail and Microsoft;
- one initial evaluated AI provider/model is sufficient;
- deterministic lifecycle authority around structured extracted facts;
- rebuildable search/AI projections where practical.

### Not yet fixed

The following must be selected during bootstrap after inspecting current ecosystem/hosting constraints and existing repository code:

- frontend framework;
- backend/runtime framework;
- relational database product;
- ORM/query layer;
- auth/session implementation;
- hosting/deployment platform;
- durable job/scheduler implementation;
- search implementation;
- AI provider/model;
- object storage if needed;
- observability stack.

Do not invent these choices in isolated implementation tasks. Make them explicitly during bootstrap, reuse mature platform/official capabilities where possible, and record only costly-to-reverse decisions.

---

## 20. Known architectural risks

### R1. False-negative action hiding

Risk: a true user obligation is classified as safe to hide.

Mitigation direction:

- conservative lifecycle rules;
- uncertainty state;
- provenance;
- evals around action/deadline/completion extraction;
- safety resurfacing conditions.

### R2. Broken Temporal Contract promise

Risk: an item does not return when promised.

Mitigation direction:

- durable scheduling;
- idempotency;
- overdue reconciliation;
- observability;
- multi-device server authority.

### R3. Provider sync drift

Risk: local representation becomes stale or misses messages.

Mitigation direction:

- incremental sync plus reconciliation;
- provider-authoritative raw mailbox state;
- reconnect/full-resync path;
- account-level health.

### R4. Duplicate send

Risk: retries send the same email more than once.

Mitigation direction:

- durable SendOperation;
- idempotency key;
- provider-result reconciliation;
- UI disables/reflects in-flight state without relying on UI alone.

### R5. Privacy expansion through AI/search

Risk: personal/work data crosses scopes or excessive content is retained/logged.

Mitigation direction:

- authorization before retrieval;
- minimal retention;
- explicit data ownership;
- no indiscriminate prompt/output logging.

### R6. Premature infrastructure

Risk: implementation slows because the product is split into fashionable services before product demand is validated.

Mitigation direction:

- modular monolith;
- managed/reused infrastructure;
- add components only when measured failure/scale/product need justifies them.

---

## 21. Change rule

Change this architecture when stronger product/implementation evidence invalidates an assumption.

Do not preserve a design merely for consistency. When changing a durable invariant or authority boundary, update this document and add a decision record if the reason will matter to future agents/contributors.