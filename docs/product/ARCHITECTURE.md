# Lunowa Product Architecture

## Status

**Accepted modular-monolith architecture contract, reconciled 2026-08-28 with Product Content, Responsibility v0.1, frozen v1 UI contract and Issue #58 implementation topology.**

This document owns intended system boundaries/invariants. It does **not** activate every capability it names. Exact activation/dependency/parallelization authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`; implementation-facing UI behavior by `../design/V1-UI-IMPLEMENTATION-CONTRACT.md`.

## 1. Architecture goals

Prioritize:

1. trustworthy accepted Responsibility state;
2. durable monitoring/Temporal promises;
3. provider/account isolation;
4. bounded AI authority;
5. Source/manual communication availability under AI failure;
6. explicit external-effect reconciliation;
7. rebuildable derived projections;
8. small understandable operations through a modular monolith.

## 2. Current v1 activation

Current target is one-provider Gmail **Minimum Complete Delegation Loop**:

- Lunowa app session;
- one Gmail ConnectedAccount;
- provider-neutral evidence persistence;
- Gmail sync/read + exact Source search + attachment evidence access;
- Responsibility persistence/reducer;
- attention/Temporal monitoring;
- Home / Needs You / Managed / Review / Moment / Source;
- contextual Reply / Reply All;
- bounded contextual AI draft with manual fallback;
- explicit immediate Send + provider reconciliation;
- integrity/reconnect/recovery;
- bounded AI interpretation behind trusted contracts.

Not current prerequisites: Microsoft, broad multi-account Scope UX, Person/CRM Product features, Pin, generic Compose/Forward parity, Send Later/generic Undo, generic workflow engine, rich native attachment preview, natural-language Search, or autonomous Send.

## 3. System shape

```text
Browser / responsive UI
        |
        v
Application API / BFF
        |
        +-----------------------------+
        |                             |
        v                             v
Trusted Product/domain            Integration ports
        |                             |
        v                             +-> Gmail adapter (v1)
PostgreSQL                          +-> Microsoft adapter (future)
        |                             +-> AI adapter (bounded)
        v                             +-> durable execution adapter
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
- provider/AI/client input is runtime-validated.

A frozen normalized evidence contract allows deterministic domain work before live Gmail completion. G31 may consume deterministic fixtures while G20/G21 build the provider lane; G40 is the integration point.

## 5. Authority layers

### Provider observations

Provider message/attachment existence/IDs, granted capabilities and provider-observed Send acceptance are authoritative only in their provider scope.

### Communication evidence

Actually sent/received communication is evidence of what was communicated, not automatic proof of unrelated external-world truth.

### Lunowa domain/product state

Lunowa owns user/account ownership, accepted Responsibility state/provenance/correction, monitoring intent, Temporal contracts, Draft/SendOperation state and supported preferences.

### Derived state

Summaries, search indexes, embeddings, aggregate attention and cached context are rebuildable and never sole critical authority.

## 6. Identity, mailbox authorization and credentials

```text
Lunowa application session != Gmail ConnectedAccount authorization
```

Better Auth owns application identity/session when activated. Gmail credentials remain Lunowa-owned provider/credential state, never Better Auth social-account authority.

Before a real Google token is durably persisted:

- encrypt/store it securely at rest;
- keep cryptographic key/secret outside ordinary DB/repository data;
- never log token material;
- authorize lookup/use by current user + ConnectedAccount ownership;
- handle revocation/invalidation explicitly;
- revoke and permanently delete tokens when intentionally no longer needed where supported.

A bounded non-persistent OAuth spike may avoid durable storage. Plaintext durable token storage is never an accepted architecture phase.

## 7. Persistence ownership and production topology

PostgreSQL is the durable application store. Production migrations follow actual FK order and single-writer ownership.

```text
P14 PASS -> G10 auth User/session
P13 PASS + G10 -> G19 provider-neutral evidence foundation
P13 + P14 -> P15 independent L2 freeze
P15 PASS + G19 -> G30 prelude AIInterpretationRun prerequisite
                  -> G30 frozen Responsibility tables
                  -> G31 reducer
                  -> G32 Temporal runtime

G20 Gmail consumes G19.
G50 owns Draft + initial SendOperation request state.
G51 owns provider dispatch/reconciliation transitions.
```

### G10 — auth schema

Owns app-auth User/session schema only.

### G19 — provider-neutral evidence foundation

After P13 proves upstream L2 prerequisites and G10 creates the production User target, G19 is the single writer for:

- ConnectedAccount;
- ProviderSyncState;
- Conversation;
- Message;
- Attachment metadata;
- ParticipantIdentity;
- required ownership/uniqueness indexes;
- monotonic non-negative `Conversation.semantic_evidence_revision`;
- provider-neutral normalized repositories/fixtures.

Required current L2 prerequisite keys include:

```text
connected_accounts UNIQUE(id,user_id)
conversations UNIQUE(id,connected_account_id)
participant_identities UNIQUE(id,user_id)
messages UNIQUE(id,connected_account_id)
```

`ParticipantIdentity` is evidence normalization/ownership infrastructure, not Person/CRM Product activation.

G19 contains no live Gmail API implementation and no Responsibility-owned tables.

### G30 — AIInterpretationRun prerequisite + Responsibility persistence

Frozen L2 v0.4 also references:

```text
ai_interpretation_runs UNIQUE(id,user_id)
```

G30 therefore begins with a minimal production `AIInterpretationRun` provenance/basis table, ordered before any Responsibility table referencing it. This table may reference accepted G10/G19 User/Conversation/Message targets.

Creating the table does **not** invoke a model or grant AI authority. G70 owns runtime model invocation, schemas/evals and any explicit compatible schema evolution.

After the prelude and only after P15 PASS/FREEZE, G30 creates the frozen Responsibility-owned tables in valid FK order.

Production migration rule:

> Every external FK target must be an accepted production table; proof-only fixtures never satisfy production topology.

### G32 — Temporal persistence

Owns persisted Temporal intent/currentness required by the active loop.

### G50/G51 — Draft/Send

G50 owns Draft + initial SendOperation request identity/state. G51 consumes it for provider dispatch/reconciliation transitions.

## 8. Parallel execution and merge ownership

Worktree, Docker and database namespace isolation establish execution isolation, not Git merge isolation.

When concurrent tasks touch `package.json` or `pnpm-lock.yaml`:

```text
parallel execution != parallel merge
```

Those PRs merge serially. Later PRs refresh onto the latest accepted main, regenerate the lockfile with pnpm, rerun repository verification, and rerun task proof materially affected by dependency/version changes.

No concurrent task may independently redefine a shared schema, canonical reducer, root design-token authority or other declared collision zone.

## 9. Provider integration / Gmail

G20 owns live Gmail OAuth, provider/source protocol, watch/history synchronization and attachment retrieval. It consumes G19 persistence. **G20 does not own provider Send dispatch/reconciliation.** G51 is the single implementation owner for Gmail Send serialization/dispatch/result reconciliation after G50 establishes the trusted Draft/SendOperation request state.

```text
OAuth/offline credential
-> bounded initial sync
-> users.watch / Pub/Sub signal
-> authenticate + acknowledge quickly
-> durable history reconciliation
-> normalized idempotent commit through G19
-> evidence/cursor commit
-> downstream re-evaluation
```

Required reliability:

- renew watch before expiration under current provider requirements;
- periodic safety reconciliation even with no push;
- tolerate duplicate/delayed/dropped notifications;
- stale `historyId` / HTTP 404 enters full-sync recovery;
- cursor advances only after required local durability;
- push payload never directly mutates Responsibility;
- initial historical sync does not auto-activate old unresolved-looking work.

Public OAuth verification/security assessment is a release gate distinct from local/private complete-loop proof.

## 10. Normalized evidence / Source

Provider-neutral evidence preserves:

- account ownership;
- provider message/thread identifiers at the boundary;
- source chronology;
- normalized text/safe renderable source;
- attachment metadata/provenance;
- participant identity evidence;
- semantic evidence revision;
- idempotent uniqueness.

Processing order is not semantic chronology. Source loading is not Responsibility admission.

## 11. Responsibility domain

Responsibility is the communication-bounded operational outcome and preserves orthogonal dimensions: resolution, live tracking, attention/defer, obligation/actionability, expected events, temporal facts, uncertainty/risk and provenance/evidence revision.

Admission/effects:

```text
TRACK / DO_NOT_TRACK / NEEDS_REVIEW
CREATE / UPDATE / RESOLVE / REOPEN / SUPERSEDE / INVALIDATE / NO_OP
```

`MY_TURN / WAITING / LATER / DONE / REVIEW / NONE` are deterministic projections, not a lifecycle enum.

## 12. Temporal/background execution

Persisted DB/domain intent is authority; job runtime executes attempts.

Every material async operation requires durable intent/source reason, DB/domain idempotency, currentness validation, bounded retry/failure behavior and reconciliation evidence.

Trigger.dev may optimize execution but never replaces domain currentness/idempotency. Trigger fire means “reconsider current truth now”, not automatically notify or project MY_TURN.

## 13. UI / BFF / read models

UI owns rendering, focus/input and local pre-ack editing; never domain truth. BFF exposes authenticated Lunowa-shaped contracts rather than provider passthrough APIs.

Read models keep separate axes for app session, mailbox connection/capability, sync/integrity/data-through, accepted Responsibility projection, pending/failed/ambiguous effects and Source/provenance.

Request/click is not accepted state until authoritative persistence/reconciliation completes.

## 14. Draft / Send

Current v1 activates contextual Reply/Reply All + explicit immediate Send.

```text
G50 trusted Draft + SendOperation request identity/state
-> G51 Gmail serialization/dispatch/result reconciliation
-> sent Source reconciliation
-> trusted Responsibility re-evaluation
```

Invariant:

```text
send request != provider acceptance != Responsibility outcome satisfied
```

Forward, Send Later, generic Undo/recall and silent offline queued Send remain deferred/conditional.

## 15. AI

Two bounded model uses share transport but not authority/schema/eval:

1. Responsibility interpretation candidates;
2. editable contextual reply-draft candidates.

AI never owns auth, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, sender/recipient authority or Send permission.

If AI fails, Source/manual communication remains usable and accepted state is preserved.

## 16. Search / attachments

Authorized exact Source search is V1 CORE and consumes G19/G20 evidence. Search projections are re-authorized/rebuildable; similarity never authorizes Responsibility merge. Natural-language Search remains conditional.

Attachment CORE is authorized evidence access/open/download/provider fallback. Rich native preview is not a complete-loop prerequisite. Viewing an attachment is not operational completion.

## 17. Observability / privacy

Record enough structured evidence to explain state changes, resurfacing, evidence revision, account/provider identity and pending/failed/reconciled external effects.

Do not indiscriminately log credentials, full mail bodies, prompts or model outputs. Provider/AI data-control facts are rechecked at activation/release because they change.

## 18. Failure posture

Dependency failure never fabricates domain truth:

- AI failure != No Responsibility;
- push failure != Source loss when reconciliation remains healthy;
- auth loss != Responsibility resolution;
- preview failure != global monitoring failure;
- Send timeout != definitely sent/unsent;
- partial sync != true zero.

Healthy reassurance returns only after affected-scope reconciliation.

## 19. Scaling posture

Do not add microservices, Kubernetes, Redis, vector DB, custom event bus or generic workflow infrastructure without measured need.
