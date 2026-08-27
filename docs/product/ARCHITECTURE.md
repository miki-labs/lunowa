# Lunowa Product Architecture

## Status

**Accepted modular-monolith architecture contract, reconciled 2026-08-28 with Product Content, Responsibility v0.1, frozen v1 UI contract and Issue #58 implementation ownership.**

This document owns system boundaries/invariants. It does **not** authorize every module/capability it names. Current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`; implementation-facing UI behavior by `../design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

## 1. Goals

Prioritize:
1. trustworthy accepted Responsibility state;
2. durable monitoring/Temporal promises;
3. provider/account isolation;
4. bounded AI authority;
5. Source/manual communication availability under AI failure;
6. explicit external-effect reconciliation;
7. rebuildable derived projections;
8. a small operable modular monolith.

## 2. Current v1 activation

Current critical path is one-provider Gmail **Minimum Complete Delegation Loop**.

Includes:
- app session;
- one Gmail ConnectedAccount;
- Source sync/read + exact Source search + attachment evidence access;
- Responsibility deterministic persistence/reducer;
- attention/Temporal monitoring;
- Home/Needs You/Managed/Review/Moment/Source;
- contextual Reply/Reply All;
- bounded contextual AI draft with manual fallback;
- explicit immediate Send + reconciliation;
- integrity/reconnect/recovery;
- bounded AI interpretation behind trusted contracts.

Not required:
- Microsoft;
- broad multi-account Scope UX;
- Person/CRM;
- Pin;
- generic Compose/Forward parity;
- Send Later / generic Undo/recall;
- generic automation;
- rich native attachment preview;
- natural-language Search.

Module existence != activation.

## 3. Shape

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
PostgreSQL                           +--> Microsoft (future)
        |                              +--> AI adapter (bounded)
        v                              +--> durable execution adapter
Durable intent/audit
        |
        v
Domain re-evaluation / read models
```

Workers may run separately, but vendor SDK/job/AI systems remain adapters around one application/domain authority.

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
- workers call domain commands rather than mutating accepted state ad hoc;
- search/read models are re-authorized/rebuildable;
- all external/provider/AI data are validated.

A frozen interface may enable parallel implementation before its real adapter exists. G31 can consume deterministic normalized Source fixtures while G20/G21 build the live Gmail lane; G40 is their integration point.

## 5. Authority layers

### Provider observations
Provider message/attachment IDs/existence, granted capabilities and provider-observed sent acceptance are authoritative only within their provider scope.

### Communication evidence
Sent/received source is immutable evidence of what was communicated, not automatic proof of unrelated external-world truth.

### Lunowa domain/product state
Owns user/account ownership, accepted Responsibility state/provenance/correction, monitoring intent, Temporal Contracts, Draft/SendOperation state and supported preferences.

### Derived state
Summaries, embeddings/indexes, aggregate attention/read models and cached context are rebuildable and never sole critical authority.

## 6. Identity / account / credentials

Application authentication and mailbox authorization are separate:

```text
Lunowa session != Gmail ConnectedAccount credential/capability
```

Better Auth owns app identity/session if activated. Gmail credentials stay in Lunowa-owned provider/credential services.

Before any real Google token is durably persisted:
- secure/encrypt token material at rest/application boundary;
- keep cryptographic key/secret separate from ordinary DB/repository data;
- never log token material;
- user + ConnectedAccount ownership gates lookup/use;
- revoke/delete when intentionally no longer needed where provider support permits;
- invalidation/revocation produces explicit reconnect/integrity behavior.

A bounded non-persistent protocol spike may avoid durable storage; plaintext durable token storage is never an architecture stage.

## 7. Persistence ownership

Use PostgreSQL as durable system of record with explicit single-writer sequencing.

### Auth schema
P14 proof -> G10 production app-auth User/session schema.

### Source/provider schema
P13 must first prove current L2 upstream prerequisites. Then G20 owns production:
- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- required ownership/uniqueness indexes;
- `Conversation.semantic_evidence_revision`.

### Responsibility schema
P13/P14 -> P15 independent freeze -> G30 production Responsibility migrations.

### Temporal
G32 owns persisted Temporal intent/currentness required by current loop.

### Draft/Send
G50 owns minimal Draft + initial SendOperation request schema; G51 consumes that schema for provider dispatch/reconciliation transitions.

No concurrent task may independently redefine a shared persistence collision zone.

## 8. Provider integration / Gmail

Provider adapters own OAuth/token lifecycle, fetch/normalize, attachment access, sending and provider error mapping. Vendor types stay inside adapters.

Gmail v1:

```text
OAuth/offline credential
-> initial sync
-> users.watch / PubSub signal
-> authenticated quick acknowledgement
-> durable history reconciliation
-> normalized idempotent Source commit
-> evidence/cursor commit
-> downstream re-evaluation
```

Reliability:
- watch renewal;
- periodic reconciliation even with no push;
- duplicate/delayed/dropped notification tolerance;
- stale-history 404/full-sync recovery;
- cursor advance after required local durability;
- notification body never directly changes Responsibility.

Public OAuth verification/security assessment is a release gate separate from local/private complete-loop proof.

## 9. Sync / normalized Source

Sync owns provider cursor/delta state, full/incremental reconciliation, Source upsert, duplicate/out-of-order handling and evidence revision advancement.

Stable uniqueness includes:

```text
(connected_account_id, provider_message_id)
```

Processing order is not semantic chronology. Initial history ingestion is evidence loading, not automatic live Responsibility activation.

The normalized Source/evidence interface is intentionally vendor-free and deterministic-fixture-friendly so domain work can proceed independently from Gmail adapter completion.

## 10. Responsibility domain

Owns communication-bounded operational outcomes and preserves orthogonal dimensions:
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

`MY_TURN / WAITING / LATER / DONE / REVIEW / NONE` are projections, not one canonical lifecycle.

## 11. Temporal / background execution

Persisted DB/domain intent is authority; job runtime executes attempts.

Every material async job has:
- durable intent/source reason;
- domain/DB idempotency;
- currentness/stale validation;
- bounded retry/failure;
- reconciliation evidence.

Trigger.dev idempotency scope/TTL/failed-run behavior can optimize execution but cannot be the only guarantee.

Trigger fire = reconsider now, not automatically notify/MY_TURN.

## 12. UI / BFF / read models

UI owns rendering/focus/input and pre-ack local editing, never domain truth.

BFF exposes authenticated Lunowa-shaped contracts.

Read models separate:
- app session;
- mailbox connection/capability;
- sync/integrity;
- accepted Responsibility projection;
- pending/failed/ambiguous mutation;
- Source/provenance.

Click/request != accepted state until authoritative commit/reconciliation.

## 13. Draft / Send

Current v1 = contextual Reply/Reply All + explicit **immediate** Send.

G50 establishes minimal durable Draft and initial SendOperation request identity/state. G51 serially adds provider dispatch/reconciliation transitions.

Canonical:

```text
send request != provider acceptance != Responsibility outcome satisfied
```

Forward, Send Later, generic Undo/recall and silent offline queued Send remain deferred/conditional.

## 14. AI

Two bounded model uses share transport but not authority/schema/eval:

### Responsibility interpretation
Produces structured communication/claim/obligation/temporal/uncertainty/provenance candidates for trusted reduction.

### Contextual draft assistance
Produces editable reply-body candidate inside an authorized current Moment/Conversation. Sender/recipients and Send authority remain trusted application state.

AI never owns auth, provider facts, admission/identity/effects, tracking/defer, Temporal effects or Send permission.

If AI fails, Source/manual communication remains usable and accepted state is not replaced by fabricated certainty.

## 15. Search / attachments

Authorized exact Source search is CORE. Search data are derived/re-authorized and similarity never authorizes Responsibility merge. NL/semantic Q&A remains conditional.

Attachment CORE is authorized evidence access/open/download/provider fallback. Rich native preview is not required for complete-loop acceptance. Viewing an attachment is not operational completion.

## 16. Observability / privacy

Record enough structured evidence to explain state changes, resurfacing, source/evidence revision, account/provider identity and pending/failed/reconciled external effects.

Do not indiscriminately log tokens, full mail bodies or model payloads. Provider/AI data controls are rechecked at activation/release because they change.

## 17. Failure posture

Dependency failure never fabricates domain truth:
- AI failure != No Responsibility;
- push failure != source loss if reconciliation remains healthy;
- auth loss != Responsibility resolution;
- preview failure != global monitoring failure;
- Send timeout != definitely sent/unsent;
- partial sync != true zero.

Restore healthy reassurance only after affected scope reconciliation.

## 18. Scaling posture

Do not add microservices, Kubernetes, Redis, vector DB, custom event bus or generic workflow infrastructure without measured need.