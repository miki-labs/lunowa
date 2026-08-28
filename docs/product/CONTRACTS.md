# Lunowa System Contracts

## Status

**Accepted logical module contracts for the one-provider Minimum Complete Delegation Loop; reconciled 2026-08-28 for Issue #58 dependency/FK ownership.**

Concrete SDK/API syntax remains implementation-open. `IMPLEMENTATION-GRAPH.md` + live GitHub Issues own activation/dependency order. Responsibility semantics remain owned by `responsibility/`.

## 1. Contract principles

1. External data enters through validated adapters.
2. Core contracts use Lunowa concepts, not vendor SDK types.
3. Evidence, interpretation, accepted state, safe action and UI projection remain distinct.
4. Background work reloads/re-authorizes/revalidates current state before effects.
5. External effects use application/domain idempotency + reconciliation.
6. Stale evidence/model/job results cannot win because they finish last.
7. Search/read models resolve only current authorized sources.
8. Current v1 activates only the one-provider complete loop.
9. Every production FK target must exist before a referencing production table is created; proof fixtures never satisfy production topology.

## 2. Application session — G10

```text
AppSession {
  user_id
  session_id
  expires_at
}
```

Application session != mailbox authorization.

G10 owns app-auth User/session production schema and protected BFF/session validation only. App sign-out does not disconnect a mailbox or resolve/stop Responsibilities.

## 3. Provider-neutral evidence persistence — G19

G19 is the single production writer for the provider-neutral evidence foundation after G10 + P13 PASS.

Minimum durable ownership:

```text
ConnectedAccount
ProviderSyncState
Conversation
Message
Attachment metadata
ParticipantIdentity
```

Required upstream invariants include:

```sql
connected_accounts UNIQUE (id, user_id);
conversations UNIQUE (id, connected_account_id);
participant_identities UNIQUE (id, user_id);
messages UNIQUE (id, connected_account_id);
```

and monotonic non-negative `Conversation.semantic_evidence_revision`.

At minimum `(connected_account_id, provider_message_id)` is unique.

G19 repositories/fixtures are provider-neutral and usable without Gmail. G19 contains no Responsibility-owned table and no live Gmail OAuth/watch/history behavior. `ParticipantIdentity` here is evidence normalization/ownership infrastructure, not Person/CRM Product scope.

## 4. AIInterpretationRun production prerequisite — G30 prelude / G70 runtime

Frozen Responsibility L2 v0.4 references:

```sql
ai_interpretation_runs UNIQUE (id, user_id)
```

Therefore G30 must create the smallest accepted production `AIInterpretationRun` provenance/basis table **before** Responsibility tables that reference it.

Minimum conceptual shape:

```text
AIInterpretationRun {
  id
  user_id
  conversation_id?
  message_id?
  schema_version
  model_config_version
  provider_model_identifier?
  basis_evidence_revision
  status
  created_at
}
```

This prelude is evidence/provenance infrastructure only:

```text
creating table != calling model != accepting AI output
```

G70 owns actual model invocation, output schemas/evals and runtime use. Any later G70 schema evolution must preserve frozen Responsibility FK compatibility or use an explicit reviewed migration.

## 5. Connected account / credential contract

```text
connectAccount(auth_result) -> ConnectedAccountConnection
```

Minimum result:

```text
provider_account_id
email_address
display_name?
granted_capabilities
credential_reference
initial_sync_hint?
```

Requirements:

- provider identity comes from provider evidence;
- mailbox credentials stay server-side;
- mailbox credential authority is Lunowa-owned, not Better Auth social-account authority;
- reconnect-required and transient failures remain distinct;
- capability absence disables only that capability.

Before a real Google token is durably stored:

- encrypt/store securely at rest;
- keep cryptographic key/secret outside ordinary app DB/repository data;
- never log token values;
- require current authenticated user + ConnectedAccount ownership for lookup/use;
- model invalidation/revocation as explicit integrity/reconnect state;
- revoke/delete when intentionally removed where supported.

A non-persistent protocol spike may avoid durable token storage. Plaintext durable token storage is never accepted.

## 6. Provider capability contract

```text
ProviderCapabilities {
  incremental_sync
  thread_identity
  attachment_fetch
  message_send
  mark_read? archive? trash? spam?
  draft_sync?
  schedule_send_native?
  contact_lookup?
}
```

Capability presence does not activate a Product feature. Current v1 requires Source read, attachment evidence access and contextual immediate Send. Forward/Send Later/etc remain inactive unless separately accepted.

## 7. Gmail synchronization — G20

G20 consumes G19 persistence and owns live Gmail OAuth/watch/history/provider behavior.

```text
syncAccount(connected_account_id, reason) -> SyncResult
```

Reasons include:

```text
INITIAL_SYNC
PUSH_SIGNAL
PERIODIC_RECONCILIATION
USER_REFRESH
RECONNECT
FULL_RESYNC
```

Required sequence:

```text
authorize account
-> fetch provider changes
-> normalize untrusted payload
-> idempotent upsert through G19 repositories
-> commit Source/evidence revision
-> enqueue downstream reconsideration
-> advance provider cursor after required local durability
```

### Push ingress

Gmail `users.watch` / Pub/Sub is a reconciliation signal, not mailbox/domain truth.

Production ingress must authenticate/validate expected push identity/audience as applicable, acknowledge valid requests quickly, defer non-trivial work, tolerate duplicate/delayed/dropped notifications, periodically reconcile without push, and renew watch before expiration.

### Stale history

Invalid/stale `startHistoryId` / HTTP 404 enters explicit full-sync recovery. It never becomes empty/current truth.

### Historical ingestion

Worker order is not semantic chronology. Historical source ingestion never automatically activates every unresolved-looking thread as current work.

## 8. Normalized Source contract

```text
NormalizedProviderMessage {
  provider_message_id
  provider_thread_id?
  sender
  recipients[]
  cc[]
  bcc[]?
  subject
  text_body?
  sanitized_html_source?
  timestamp
  mailbox_state?
  attachments[]
  minimal_provider_metadata
}
```

Provider HTML/body/attachment bytes remain untrusted. Source remains readable without Responsibility/Moment. G31 may consume deterministic normalized fixtures without live Gmail completion.

## 9. Attachment evidence access

Current CORE:

- preserve attachment existence/metadata/provenance;
- authorize every access;
- safe fetch/stream/open/download/provider fallback;
- distinguish provider/security restriction from local preview failure;
- preserve Source/Moment context.

Rich native preview and reply attachment-add remain conditional. Access/preview is not completion evidence.

## 10. Exact Source search

```text
searchSource(user_id, request) -> SearchResultPage
```

Requirements:

- V1 CORE exact/deterministic retrieval over authorized Source;
- current user/account/scope authorization;
- truthful no-match retaining enough query/scope context to revise;
- stale derived index may reduce recall but never leak inaccessible data;
- semantic/NL Q&A only when separately active;
- similarity never authorizes Responsibility identity merge.

## 11. AI Responsibility interpretation — G70

Input is only current authorized normalized context and evidence revision.

Conceptual result:

```text
InterpretationOutput {
  schema_version
  basis_evidence_revision
  communication_acts[]
  communicated_claims[]?
  proposed_terms[]?
  no_responsibility_signal?
  uncertainty[]?
}
```

Output is a structured **candidate**, never accepted state.

Validate runtime schema, current authorization, source IDs/participants, deterministic provider facts, material values/source locators where practical, cross-account boundaries and evidence-revision freshness.

AI is not authoritative for auth, provider facts, admission, Responsibility identity/effects, tracking/defer, Temporal effects, sender/recipient authority, send permission or external actions.

## 12. Contextual AI draft — G70 with G50 manual baseline

```text
requestContextualDraft(DraftAssistInput) -> DraftCandidate
```

Candidate body is editable text, not a Send command. Effective sender/recipient authority comes from trusted app/provider state. The model cannot add hidden recipients or execute provider actions. User explicitly reviews/commits Send. Manual composer remains baseline when AI fails.

Drafting and Responsibility interpretation use separate schemas/evals.

## 13. AI data-control contract

Before production email AI use:

- record current org/project retention/data-control mode;
- minimize authorized context;
- use `store:false` where appropriate;
- never describe `store:false` as equivalent to Zero Data Retention;
- avoid indiscriminate raw mail/prompt/output logging;
- if ZDR is required, verify actual eligibility/settings/endpoint-feature compatibility.

## 14. Responsibility reduction — G31

```text
reduceResponsibilityEvidence(
  current_responsibilities,
  evidence_event,
  policy_context
) -> ResponsibilityDecision
```

Admission:

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

Effects:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP
```

One evidence event may produce multiple effects. Reducer preserves orthogonal dimensions, field-scoped authority and provenance. The obsolete single lifecycle enum never returns as truth. Historical evidence-relative OPEN does not imply live tracking.

## 15. Product projection

```text
projectConversationAttention(responsibilities[]) -> ConversationAttention
```

Possible projection:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Only appropriate live Responsibilities participate. Newest message is not status authority. Projection is deterministic/rebuildable.

## 16. Temporal contract — G32

Persisted temporal intent/trigger is durable truth; scheduler/job run is execution.

```text
upsertTemporalContract(responsibility_id, spec, actor)
processTemporalTrigger(trigger_id)
```

On fire:

1. load current trigger/contract/Responsibility/evidence;
2. verify active/current version;
3. claim via domain/DB idempotency;
4. re-evaluate current evidence;
5. persist accepted domain/attention/audit effects;
6. fire/cancel/supersede trigger state;
7. reconcile stale siblings.

Trigger fire != notification/MY_TURN automatically.

If Trigger.dev is used, key composition/scope/TTL is explicit and vendor idempotency is never the sole guarantee.

## 17. Product read models — G11/G40

Read models keep separate axes for:

- app session/auth;
- mailbox connection/capability;
- sync/integrity/data-through;
- accepted Responsibility projection;
- pending/failed/ambiguous mutations/effects;
- Source/provenance.

Partial/degraded/untrusted coverage cannot become true zero. UI/read models never create domain authority.

## 18. Draft — G50

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

Requirements: authorize sender/account; validate recipients/accepted attachments; preserve version/conflict semantics; idempotent autosave where used; preserve draft across relevant navigation/layout/re-auth recovery; explicit discard distinct from pane close.

## 19. Immediate SendOperation — G50/G51

G50 owns request/pending schema; G51 owns provider dispatch/reconciliation transitions.

```text
requestImmediateSend(draft_id) -> SendOperation
```

SendOperation distinguishes request/pending/dispatch/provider-unknown/provider-accepted/failed/reconciled truth. G50 establishes durable operation identity/idempotency and intended draft snapshot.

G51 sequence:

1. claim application/domain idempotency;
2. re-authorize account capability;
3. validate intended draft snapshot;
4. call provider adapter;
5. record unambiguous/ambiguous result;
6. reconcile sent Source evidence;
7. feed sufficient evidence to Responsibility reducer.

Invariant:

```text
Send request != provider acceptance != operational closure
```

Timeout/unknown acceptance forbids blind duplicate retry.

Forward, Send Later/SCHEDULED, generic Undo/recall and silent offline queued Send are not current activation authority.

## 20. Settings/lifecycle mutations

Reconnect, disconnect, Stop Tracking, Return Attention, defer and supported Settings distinguish request/pending/accepted/failure.

App sign-out != mailbox disconnect. Reconnect after unintended auth loss restores reassurance only after missing-interval reconciliation. Re-add after intentional disconnect never silently reactivates old delegation.

## 21. Integrity

Material degraded state exposes as applicable:

- affected account/capability/scope;
- what is not trustworthy;
- last trustworthy observation/data-through;
- affected live delegation scope/count;
- what remains safe/usable;
- recovery action.

Do not restore healthy Managed reassurance before reconciliation completes.

## 22. Audit/observability

Keep structured evidence sufficient to explain state changes, resurfacing, sync/send/trigger pending/reconciliation, account/provider identity, evidence revision/model/config basis and degraded intervals.

Logs are not canonical state. Never indiscriminately log secrets/full sensitive mail/model payloads.

## 23. Repository merge contract

Parallel runtime/worktree isolation does not guarantee merge independence.

`package.json` and `pnpm-lock.yaml` are serialized merge assets. Concurrent branches touching them may execute in parallel but merge one at a time; later branches refresh onto current accepted main, regenerate the lockfile with pnpm, rerun repository verification, and rerun task proof materially affected by dependency changes.

## 24. Public-release boundary

Local/private complete-loop proof and public release are separate gates.

Public release may additionally require Google OAuth verification/security assessment, exact privacy/retention/deletion commitments, production credential rotation/recovery, current AI data controls and operational hardening.

Those obligations do not establish Product-market evidence.
