# Lunowa Product Architecture

## Status

**Accepted modular-monolith architecture contract, reconciled 2026-08-28 with Product Content, Responsibility v0.1, frozen v1 UI contract, and Issue #58 implementation activation boundaries.**

This document owns system boundaries/invariants. It does **not** authorize every module/capability it names. Current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`; implementation-facing UI behavior by `../design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

## 1. Architecture goals

Prioritize:
1. trustworthy accepted Responsibility state;
2. durable monitoring/Temporal promises;
3. provider/account isolation;
4. bounded AI authority;
5. Source/manual communication availability during AI failure;
6. explicit external-effect reconciliation;
7. rebuildable derived projections;
8. a small, operable modular monolith.

## 2. Current v1 activation boundary

The current critical path is **one-provider Gmail Minimum Complete Delegation Loop**.

Current activation may include:
- Lunowa app session;
- one Gmail ConnectedAccount;
- source sync/read + attachment evidence access;
- Responsibility deterministic persistence/reducer;
- attention/Temporal monitoring;
- Home/Needs You/Managed/Review/Moment/Source;
- contextual Reply/Reply All;
- explicit immediate Send + provider reconciliation;
- integrity/reconnect/recovery;
- bounded AI interpretation after trusted contracts exist.

Architecture names but current v1 does **not** require:
- Microsoft provider;
- broad multi-account Scope UX;
- Person/CRM context;
- Pin;
- generic fresh Compose/Forward parity;
- Send Later or generic Undo/recall;
- generic automation/workflow engine;
- rich native attachment preview;
- natural-language Search.

Module existence != current activation.

## 3. System shape

Use a modular monolith by default:

```text
Browser / responsive UI
        |
        v
Application API / BFF
        |
        +------------------------------+
        |                              |
        v                              v
Product/domain modules            Integration ports
        |                              |
        v                              +--> Gmail adapter (v1 active)
PostgreSQL                           +--> Microsoft adapter (future)
        |                              +--> AI adapter (bounded, later)
        v                              +--> durable execution adapter
Durable intent / audit
        |
        v
Domain re-evaluation / read models
```

Logical workers may execute separately, but provider SDKs, job runtime and AI remain adapters around one application/domain authority.

## 4. Dependency direction

Prefer:

```text
UI
-> application/BFF contracts
-> trusted domain services
-> ports
-> DB/provider/AI/job adapters
```

Rules:
- browser never owns provider credentials, authorization, sync cursors, Send idempotency or Responsibility truth;
- core domain does not depend on Gmail/Trigger/OpenAI SDK types;
- workers call domain commands; they do not mutate accepted state ad hoc;
- search/read-models are re-authorized and rebuildable;
- external/provider/AI data are validated before trusted use.

## 5. Authority layers

No single universal source of truth exists. Keep these distinct:

### Provider-authoritative observations
- provider message/attachment existence and IDs;
- provider mailbox capability/permission observations;
- provider-observed sent-message acceptance/reconciliation.

### Communication evidence
Actually sent/received source is immutable evidence of what was communicated; it is not automatically proof of external-world truth.

### Lunowa-authoritative state
- user/account ownership;
- accepted Responsibility state/provenance/corrections;
- live monitoring intent;
- Temporal Contracts;
- Draft/SendOperation state;
- supported preferences.

### Derived/rebuildable projections
- summaries;
- embeddings/search index;
- aggregate attention/read models;
- cached context.

Critical facts must not live only in a derived projection.

## 6. Identity / account / session

Application authentication and mailbox authorization are separate.

```text
Lunowa session
!=
Gmail ConnectedAccount credential/capability
```

Better Auth, if activated, owns application identity/session only. Mailbox credentials remain Lunowa-owned provider secrets scoped by authenticated user + ConnectedAccount.

ConnectedAccount failure/revocation must not imply app sign-out, Responsibility resolution, or unrelated-account failure.

## 7. Persistence

Use PostgreSQL as durable system of record.

Persistence must support:
- ownership/authorization;
- provider ID uniqueness;
- sync cursor/currentness;
- Responsibility invariants/provenance/evidence revisions;
- Temporal durable intent;
- Draft/SendOperation idempotency/reconciliation;
- audit/recovery evidence.

### Responsibility gate

Physical Responsibility L2 remains blocked until executable proof + independent freeze (Issues #13/#14/#15). Production Responsibility migrations/runtime cannot bypass that gate.

Non-Responsibility foundation work may proceed when its own user-ID/schema contracts are proven.

## 8. Provider integration

Provider adapters own OAuth/token lifecycle integration, fetch/normalize, attachment retrieval, sending, implemented mailbox mutations and provider error mapping.

Provider-specific payload/SDK types stay inside adapters.

### Gmail v1 pattern

```text
OAuth/offline credential
-> initial sync
-> users.watch / PubSub signal
-> authenticated quick acknowledgement
-> durable history reconciliation
-> normalized idempotent upsert
-> evidence/cursor commit
-> downstream domain re-evaluation
```

Required reliability:
- watch renewal;
- periodic reconciliation even without push;
- duplicate/delayed/dropped notification tolerance;
- stale-history 404/full-sync recovery;
- cursor advances only after required local durability;
- notification body never directly mutates Responsibility.

Public OAuth verification/security-assessment is a release gate, separate from local/private vertical proof.

## 9. Sync / ingestion

Sync owns:
- ProviderSyncState;
- incremental/full reconciliation;
- Message/Conversation/Attachment metadata upsert;
- duplicate/out-of-order handling;
- evidence revision advancement;
- downstream work enqueueing.

At minimum:

```text
(connected_account_id, provider_message_id)
```

is a stable uniqueness boundary.

Processing order is not semantic chronology. Late old evidence may not roll back a later authoritative correction merely because it arrived later to a worker.

Initial historical sync is evidence loading, not automatic live Responsibility activation.

## 10. Responsibility domain

The Responsibility module owns accepted communication-bounded operational outcomes.

Must preserve orthogonal dimensions such as:
- resolution/reason;
- live tracking;
- attention/defer;
- obligation legs/actionability/conditions;
- expected events;
- completion criteria;
- constraints/proposals/agreed facts;
- temporal facts;
- field uncertainty/risk;
- provenance/evidence revision.

It owns admission and effects:

```text
TRACK / DO_NOT_TRACK / NEEDS_REVIEW
CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP
```

`MY_TURN / WAITING / LATER / DONE / REVIEW / NONE` are deterministic projections, not one canonical lifecycle enum.

## 11. Temporal / background execution

Persisted database/domain intent is authority. A job runtime executes attempts.

Material async work includes:
- provider sync/reconciliation;
- Temporal triggers;
- AI interpretation;
- provider Send reconciliation;
- rebuildable search/read-model work.

Every material job requires:
- durable intent or source reason;
- idempotency/deduplication at the owning domain boundary;
- currentness/stale-work validation;
- bounded retry/failure behavior;
- observable reconciliation.

### Trigger.dev boundary

Current Trigger.dev idempotency behavior (scope, TTL, failed-run clearing) cannot serve as the only durable guarantee. DB/domain currentness remains final authority.

A trigger fire means **reconsider now**, not automatically notify, Follow-up, or Needs You.

## 12. UI / BFF / read models

UI owns local rendering/focus/input/draft editing before acknowledgement. It does not own domain truth.

BFF/API owns authenticated Product-shaped contracts and write validation.

Read models should expose separate axes for:
- session/auth;
- provider connection/capability;
- sync/integrity;
- accepted Responsibility projection;
- pending/failed mutation/effect;
- Source/provenance.

A UI click/request does not become accepted state until the authoritative boundary confirms/reconciles it.

## 13. Draft / Send architecture

Current v1 activation is contextual Reply/Reply All + explicit **immediate** Send.

Draft/SendOperation architecture must represent:
- explicit sending account;
- recipients/body/conditional attachments;
- draft persistence/versioning sufficient for the active flow;
- request/pending/ambiguous/accepted/failed states;
- retry/double-submit idempotency;
- provider sent-message reconciliation;
- post-send Responsibility re-evaluation.

Canonical rule:

```text
send request != provider acceptance != Responsibility outcome satisfied
```

Forward, Send Later, generic Undo/recall and silent offline queueing remain capability-conditional/deferred until separately activated.

## 14. AI interpretation

AI receives only authorized normalized context and returns structured candidate interpretation.

AI may help extract:
- communication acts/claims;
- obligation-bearer/action/event candidates;
- temporal expressions;
- correction/cancellation/completion signals;
- uncertainty/provenance.

AI never owns:
- auth/authorization;
- provider observations;
- Responsibility admission/identity/effects;
- live tracking/defer;
- Temporal effect;
- Send permission/destructive provider action.

Model output must pass runtime schema, source/provenance/material-value, authorization and evidence-revision validation.

If AI fails, Source/manual communication stays usable and accepted state is not replaced by fabricated certainty.

## 15. Search / context

Exact/ordinary authorized Source search may use PostgreSQL indexes/full-text first. Search is derived and cannot authorize cross-account Responsibility merge.

Person/Context and semantic/NL retrieval remain conditional modules, not current v1 critical-path requirements.

## 16. Attachments

Store provider metadata and fetch/stream bytes on demand where practical.

Current CORE requirement is safe authorized evidence access/open/download/provider fallback. Rich native preview is not required for complete-loop acceptance.

Attachment presence is provider evidence; opening/previewing does not prove operational completion.

## 17. Observability / privacy

Record enough to answer:
- why state changed/resurfaced;
- what source/evidence revision contributed;
- which account/provider was involved;
- what mutation/job/send is pending/failed/reconciled;
- what integrity interval is trustworthy.

Do not indiscriminately log full mail bodies, tokens, model prompts or outputs.

AI/provider data controls are rechecked at activation/release because they are volatile.

## 18. Failure posture

A dependency failure must never fabricate domain truth.

Examples:
- AI failure != No Responsibility;
- push delivery failure != provider/source truth loss if reconciliation remains healthy;
- provider auth loss != Responsibility resolution;
- attachment preview failure != global monitoring failure;
- Send timeout != definitely unsent/sent;
- partial sync != true zero.

Integrity UI reports the affected scope and last trustworthy observation, then restores reassurance only after reconciliation.

## 19. Scaling posture

Do not add microservices, Kubernetes, Redis, vector DB, custom event bus or generic workflow infrastructure without measured need.

Scale the modular monolith/relational design until a concrete reliability/performance/organizational constraint justifies separation.