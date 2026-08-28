# Lunowa Product Architecture

## Status

**Accepted modular-monolith architecture contract, reconciled 2026-08-28 with Product Content, Responsibility v0.1, frozen v1 UI contract and Issue #58 implementation graph.**

This document owns system boundaries and invariants. It does **not** authorize every capability it names. Current activation, dependency and parallelization authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`; implementation-facing UI behavior by `../design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

## 1. Architecture goals

Prioritize:

1. trustworthy accepted Responsibility state;
2. durable monitoring and Temporal promises;
3. provider/account isolation;
4. bounded AI authority;
5. Source/manual communication availability under AI failure;
6. explicit external-effect reconciliation;
7. rebuildable derived projections;
8. small, understandable operations through a modular monolith.

## 2. Current v1 activation

The current critical path is one-provider Gmail **Minimum Complete Delegation Loop**.

Current loop includes:

- Lunowa app session;
- one Gmail ConnectedAccount;
- provider-neutral Source persistence;
- Gmail sync/read + exact Source search + attachment evidence access;
- Responsibility deterministic persistence/reducer;
- attention/Temporal monitoring;
- Home / Needs You / Managed / Review / Moment / Source;
- contextual Reply / Reply All;
- bounded contextual AI draft with manual fallback;
- explicit immediate Send + provider reconciliation;
- integrity/reconnect/recovery;
- bounded AI interpretation behind trusted contracts.

Not current prerequisites:

- Microsoft;
- broad multi-account Scope UX;
- Person/CRM or Pin;
- generic fresh Compose / Forward parity;
- Send Later / generic Undo or recall;
- generic workflow/rule engine;
- rich native attachment preview;
- natural-language/semantic Q&A Search;
- autonomous Send.

Module existence is not implementation authorization.

## 3. System shape

```text
Browser / responsive UI
        |
        v
Application API / BFF
        |
        +------------------------------+
        |                              |
        v                              v
Trusted Product/domain             Integration ports
        |                              |
        v                              +--> Gmail adapter (v1)
PostgreSQL                           +--> Microsoft adapter (future)
        |                              +--> AI adapter (bounded)
        v                              +--> durable execution adapter
Durable intent / audit
        |
        v
Domain re-evaluation / read models
```

Workers may run separately, but provider/AI/job systems remain adapters around one application/domain authority.

## 4. Dependency direction

```text
UI
-> BFF/application contracts
-> trusted domain
-> ports
-> DB/provider/AI/job adapters
```

Rules:

- browser never owns provider credentials, authorization, sync cursors, Send idempotency or Responsibility truth;
- core domain does not depend on vendor SDK types;
- workers invoke domain commands rather than mutate accepted state ad hoc;
- search/read models are re-authorized and rebuildable;
- all provider/AI/client input is validated at runtime.

A frozen normalized Source contract allows deterministic domain work before live Gmail completion. G31 may consume deterministic Source fixtures while G20/G21 build the provider lane; G40 is the integration point.

## 5. Authority layers

### Provider-authoritative observations

Provider message/attachment existence/IDs, granted capabilities and provider-observed send acceptance are authoritative only within their provider scope.

### Communication evidence

Actually sent/received communication is immutable evidence of what was communicated, not automatic proof of unrelated external-world truth.

### Lunowa domain/product state

Lunowa owns user/account ownership, accepted Responsibility state/provenance/correction, monitoring intent, Temporal Contracts, Draft/SendOperation state and supported user preferences.

### Derived state

Summaries, search indexes, embeddings, aggregate attention and cached context are rebuildable and never the sole critical authority.

## 6. Identity, mailbox authorization and credentials

Application authentication and mailbox authorization remain separate:

```text
Lunowa session != Gmail ConnectedAccount credential/capability
```

Better Auth owns app identity/session when activated. Gmail credentials stay in Lunowa-owned provider/credential services and are never authoritative through Better Auth social-account rows.

Before any real Google token is durably persisted:

- encrypt/store token material securely at rest;
- keep encryption key/secret outside ordinary DB/repository data;
- never log token material;
- authorize lookup/use by current user + ConnectedAccount ownership;
- handle revocation/invalidation explicitly;
- revoke and permanently delete tokens when no longer needed where supported.

A bounded non-persistent OAuth protocol spike may avoid durable token storage. Plaintext durable token storage is never an accepted architecture phase.

## 7. Persistence ownership and topological order

PostgreSQL is the durable application store. Production migrations follow actual FK dependency order and single-writer ownership.

```text
P14 proof
  -> G10 auth User/session
       -> G19 provider-neutral Source schema
            -> G30 Responsibility schema after P15 freeze
                 -> G31 reducer
                      -> G32 Temporal persistence/runtime

G20 Gmail consumes G19 Source schema.
G50 owns Draft + initial SendOperation request schema.
G51 adds provider dispatch/reconciliation transitions.
```

### G10 — auth schema

Owns app-auth User/session schema only.

### G19 — provider-neutral Source persistence

After P13 proves the upstream L2 prerequisites and G10 creates the real User identity target, G19 is the single production writer for:

- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- required ownership/uniqueness indexes;
- monotonic non-negative `Conversation.semantic_evidence_revision`.

G19 contains **no live Gmail API implementation**. Its normalized repositories/fixtures must work independently of provider adapters.

### G30 — Responsibility persistence

P13/P14 -> P15 independent freeze -> G30 production Responsibility migrations. G30 FKs reference the already-accepted G19 production Source schema, never proof-only fixture tables.

### G32 — Temporal persistence

Owns persisted Temporal intent/currentness required by the active loop.

### G50/G51 — Draft/Send

G50 owns minimal Draft + initial SendOperation request identity/state. G51 serially consumes it for provider dispatch/reconciliation transitions.

No concurrent task may independently redefine a shared persistence collision zone.

## 8. Provider integration / Gmail

G20 owns live Gmail OAuth, provider protocol, watch/history synchronization, attachment retrieval and send adapter behavior. It **consumes** G19 persistence rather than owning Source schema.

```text
OAuth/offline credential
-> bounded initial sync
-> users.watch / Pub/Sub signal
-> authenticate + acknowledge quickly
-> durable history reconciliation
-> normalized idempotent commit through G19 repositories
-> evidence/cursor commit
-> downstream re-evaluation
```

Required reliability:

- renew watch before expiration under current provider requirements;
- periodic safety reconciliation even when no push arrives;
- tolerate duplicate/delayed/dropped notifications;
- stale `historyId` / HTTP 404 enters full-sync recovery;
- cursor advances only after required local durability;
- push payload never directly mutates Responsibility state;
- initial historical sync does not auto-activate old unresolved-looking work.

Public OAuth verification/security assessment is a release gate distinct from local/private complete-loop proof.

## 9. Normalized Source contract

The provider-neutral Source layer preserves:

- account ownership;
- provider message/thread identifiers as boundary metadata;
- source chronology;
- normalized text/sanitized renderable source;
- attachment metadata/provenance;
- evidence revision;
- idempotent uniqueness such as `(connected_account_id, provider_message_id)`.

Processing order is not semantic chronology. Source loading is not Responsibility admission.

## 10. Responsibility domain

Responsibility is the communication-bounded operational outcome and preserves orthogonal dimensions:

- resolution/reason;
- live tracking;
- attention/defer;
- obligation/actionability/conditions;
- expected events;
- completion criteria;
- constraints/proposals/agreed facts;
- temporal facts;
- uncertainty/risk;
- provenance/evidence revision.

Admission/effects:

```text
TRACK / DO_NOT_TRACK / NEEDS_REVIEW
CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP
```

`MY_TURN / WAITING / LATER / DONE / REVIEW / NONE` are deterministic projections, not a canonical lifecycle enum.

## 11. Temporal / background execution

Persisted database/domain intent is authority; job runtime executes attempts.

Every material async operation requires:

- durable intent/source reason;
- domain/database idempotency;
- currentness/stale validation;
- bounded retry/failure behavior;
- reconciliation evidence.

Trigger.dev facilities may optimize execution but do not replace Lunowa's durable currentness/idempotency. Trigger fire means “reconsider current truth now”, not automatically notify or project MY_TURN.

## 12. UI / BFF / read models

UI owns rendering, focus/input and pre-ack local editing; it never owns domain truth.

BFF exposes authenticated Lunowa-shaped contracts rather than provider-shaped passthrough APIs.

Read models keep distinct:

- app session;
- mailbox connection/capability;
- sync/integrity/data-through;
- accepted Responsibility projection;
- pending/failed/ambiguous mutation/effect;
- Source/provenance.

Request/click is not accepted state until authoritative persistence/reconciliation completes.

## 13. Draft / Send

Current v1 activates contextual Reply/Reply All + explicit **immediate** Send.

```text
send request != provider acceptance != Responsibility outcome satisfied
```

Forward, Send Later, generic Undo/recall and silent offline queued Send remain deferred/conditional.

## 14. AI

Two bounded model uses share transport but not authority/schema/eval:

1. Responsibility interpretation candidates;
2. editable contextual reply-draft candidates.

AI never owns auth, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, sender/recipient authority or Send permission.

If AI fails, Source/manual communication remains usable and accepted state is preserved rather than replaced by fabricated certainty.

## 15. Search / attachments

Authorized exact Source search is V1 CORE and consumes the G19/G20 Source layer. Search data are derived/re-authorized; similarity never authorizes Responsibility merge. Natural-language/semantic Q&A is conditional.

Attachment CORE is authorized evidence access/open/download/provider fallback. Rich native preview is not a complete-loop prerequisite. Viewing an attachment is not operational completion.

## 16. Observability / privacy

Record enough structured evidence to explain state changes, resurfacing, evidence revision, account/provider identity and pending/failed/reconciled external effects.

Do not indiscriminately log credentials, full mail bodies, prompts or model outputs. Provider/AI data-control facts are rechecked at activation/release because they change.

## 17. Failure posture

Dependency failure never fabricates domain truth:

- AI failure != No Responsibility;
- push failure != Source loss when reconciliation remains healthy;
- auth loss != Responsibility resolution;
- preview failure != global monitoring failure;
- Send timeout != definitely sent or definitely unsent;
- partial sync != true zero.

Healthy reassurance returns only after affected-scope reconciliation.

## 18. Scaling posture

Do not add microservices, Kubernetes, Redis, vector DB, custom event bus or generic workflow infrastructure without measured need.
