# Lunowa System Contracts

## Status

**Accepted logical module contracts, reconciled 2026-08-28 for the one-provider Minimum Complete Delegation Loop and Issue #58 dependency ownership.**

These contracts isolate provider/model/job/UI implementation from Product/domain authority. Concrete API/SDK syntax remains implementation-open. Current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

## 1. Contract principles

1. External data enters through validated adapters.
2. Core contracts use Lunowa concepts, not vendor SDK types.
3. Evidence, interpretation, accepted state, safe action and UI projection remain distinct.
4. Background work reloads/re-authorizes/revalidates current state before effects.
5. External effects define durable idempotency/reconciliation at the application/domain boundary.
6. Stale evidence/model/job results cannot win because they finish last.
7. Search/read models resolve to current authorized sources.
8. Current v1 activates only contracts required by the one-provider complete loop.

## 2. Application session contract

Application identity/session is independent from mailbox authorization.

```text
AppSession {
  user_id
  session_id
  expires_at
}
```

Server-side BFF/route handling revalidates session/authorization for protected reads/writes. App sign-out does not disconnect a mailbox or resolve/stop Responsibilities.

## 3. Connected-account contract

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
- verify provider identity from provider evidence;
- keep mailbox credentials server-side and outside normal browser APIs;
- mailbox credential authority is Lunowa-owned, not auth-library social-account authority;
- distinguish reconnect-required from transient failure;
- capability absence only disables corresponding capability.

### Credential persistence

Before a real Google token is durably stored:
- secure/encrypt it at rest/application boundary appropriate to the server architecture;
- do not store encryption key/secret with ordinary application data/repository;
- never log token values;
- lookup/use requires current authenticated user + ConnectedAccount ownership;
- revoke/delete when intentionally removed where supported;
- handle invalidation/revocation as an explicit integrity/reconnect event.

A non-persistent protocol spike may avoid durable token storage. Plaintext durable storage is never an accepted transitional contract.

## 4. Provider capability contract

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

## 5. Gmail synchronization contract

### 5.1 Sync

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

Provider batch concept:

```text
ProviderChangeBatch {
  changes[]
  next_cursor?
  cursor_valid
  has_more
}
```

Required sequence:

```text
authorize account
-> fetch provider changes
-> normalize untrusted payload
-> idempotent Source upsert
-> commit source/evidence revision
-> enqueue downstream reconsideration
-> advance provider cursor after required local durability
```

At minimum `(connected_account_id, provider_message_id)` is unique.

### 5.2 Source persistence prerequisites

Production Source persistence must satisfy the current proven upstream L2 prerequisites, including as applicable:
- `connected_accounts UNIQUE (id, user_id)`;
- `conversations UNIQUE (id, connected_account_id)`;
- `messages UNIQUE (id, connected_account_id)`;
- monotonic `Conversation.semantic_evidence_revision` with non-negative invariant.

G20 is the single production writer for ConnectedAccount / ProviderSyncState / Conversation / Message / Attachment metadata schema. Responsibility-owned tables remain gated separately.

### 5.3 Push ingress

Gmail `users.watch` / PubSub notification is a reconciliation signal, not mailbox/domain truth.

Production ingress:
- authenticate push and validate expected audience/identity claims as applicable;
- acknowledge valid request quickly;
- defer non-trivial work to durable execution;
- tolerate duplicate/delayed/dropped notifications;
- periodic reconciliation works even with no push;
- renew watch before expiration under current provider requirements.

### 5.4 Stale history recovery

Invalid/stale `startHistoryId` / provider 404 enters explicit full-sync recovery. It never becomes empty/current truth.

### 5.5 Semantic chronology / history activation

Worker order is not semantic chronology. Preserve source semantic time/relation evidence. Initial historical source ingestion never automatically activates every unresolved-looking thread as live work.

## 6. Normalized Source contract

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

Provider HTML/body/attachment bytes are untrusted. Source remains readable without Responsibility/Moment.

This normalized contract is frozen enough for deterministic Responsibility fixture work. G31 consumes this interface and therefore does not require live G20/G21 completion.

## 7. Attachment evidence access

Current CORE:
- preserve attachment existence/metadata/provenance;
- authorize every access;
- safe fetch/stream/open/download/provider fallback;
- distinguish provider/security restriction from local preview failure;
- preserve Source/Moment context.

Rich native preview and reply attachment-add remain conditional. Access/preview is not completion evidence.

## 8. Exact Source search

```text
searchSource(user_id, request) -> SearchResultPage
```

Requirements:
- V1 CORE exact/deterministic retrieval over authorized Source;
- explicit current account/scope authorization;
- no-match is truthful and preserves enough query/scope context to revise;
- stale derived index may reduce recall but never leak inaccessible data;
- semantic/NL Q&A is advertised only when separately active;
- similarity never authorizes Responsibility identity merge.

## 9. AI Responsibility-interpretation contract

### Input

Only current authorized normalized context:

```text
InterpretationInput {
  schema_version
  behavior_config_version
  evidence_revision
  locale
  timezone
  focal_message_id?
  conversation_context
  existing_responsibility_context[]?
  authorized_external_context[]?
}
```

No provider credentials, unrelated accounts or unrestricted DB access.

### Output

Structured **candidate interpretation**, e.g.:

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

Material candidate values carry source IDs/locators where practical.

AI is not authoritative for auth, provider facts, admission, identity/effects, tracking/defer, Temporal effects, send permission or external actions.

### Validation

Validate runtime schema, current authorization, source IDs/participants, deterministic provider facts, material values/source locators where practical, cross-account boundaries and evidence-revision freshness.

Matching basis revision is necessary, not sufficient.

## 10. Contextual AI draft contract

V1 CORE-target assistance is separate from Responsibility interpretation.

```text
requestContextualDraft(DraftAssistInput) -> DraftCandidate
```

Input:

```text
DraftAssistInput {
  schema_version
  user_id
  connected_account_id
  conversation_id
  in_reply_to_message_id?
  authorized_source_context
  current_responsibility_context?
  intended_reply_goal?
}
```

Output:

```text
DraftCandidate {
  schema_version
  body
  optional_subject_suggestion?
  basis_source_ids[]
  warnings[]?
}
```

Authority rules:
- candidate body is editable text, not a send command;
- effective sender/recipient authority comes from trusted application/provider context, not model output;
- model cannot add hidden recipients or execute tools/provider actions;
- user explicitly reviews/commits Send;
- manual composer remains baseline if assistance fails;
- drafting and interpretation use separate schemas/evals even if they share transport/runtime.

## 11. AI data-control contract

Before production email AI use:
- record current project/org retention/data-control mode;
- minimize authorized context;
- use `store:false` where appropriate;
- do not describe `store:false` as equivalent to Zero Data Retention;
- avoid indiscriminate raw mail/prompt/output logging;
- if ZDR is required, verify actual eligibility/settings/endpoint-feature compatibility.

## 12. Responsibility reduction contract

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

One evidence event may produce multiple effects. Reducer preserves canonical orthogonal dimensions, field-scoped authority and provenance. The obsolete single lifecycle enum never returns as truth.

Historical evidence-relative OPEN does not imply live tracking.

## 13. Product projection contract

```text
projectConversationAttention(responsibilities[]) -> ConversationAttention
```

Possible UI projection:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Only appropriate live Responsibilities participate in current-work projection. Newest message is not status authority. Projection is deterministic/rebuildable.

## 14. Temporal Contract

Persisted contract/trigger is durable intent; scheduler/job run is execution.

```text
upsertTemporalContract(responsibility_id, spec, actor)
processTemporalTrigger(trigger_id)
```

On fire:
1. load current trigger/contract/Responsibility/evidence;
2. verify active/current version;
3. claim through domain/DB idempotency;
4. re-evaluate current evidence;
5. persist domain/attention/audit effects;
6. fire/cancel/supersede trigger state;
7. reconcile stale sibling triggers.

Trigger fire != notification/MY_TURN automatically.

### Trigger.dev adapter

If used:
- key composition/scope/TTL explicit;
- vendor key is not the sole guarantee;
- finite TTL/failed-run clearing cannot permit duplicate semantic/external effects;
- every run rechecks DB/domain currentness.

## 15. Product read-model contract

Read models distinguish:
- app session/auth;
- mailbox connection/capability;
- sync/integrity/data-through;
- accepted Responsibility projection;
- pending/failed/ambiguous mutation/effect;
- Source/provenance.

Partial/degraded/untrusted coverage cannot become true zero. UI components/read models never create domain authority.

## 16. Draft contract

G50 owns current contextual Draft persistence.

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

Payload includes sending account, reply context, recipients, subject/body and conditional accepted attachments.

Requirements:
- authorize sender/account;
- validate recipients/attachments;
- version/conflict handling or equivalent;
- idempotent autosave where used;
- preserve draft across relevant navigation/layout/re-auth recovery;
- explicit discard distinct from pane close.

## 17. Immediate SendOperation contract

G50 owns minimal request/pending schema; G51 owns provider dispatch/reconciliation transitions.

```text
requestImmediateSend(draft_id) -> SendOperation
```

`SendOperation` represents states sufficient to distinguish request/pending/dispatch/provider-unknown/provider-accepted/failed/reconciled truth.

G50 establishes durable operation identity/idempotency and intended draft snapshot. No delayed-send scheduling schema is implied.

### G51 provider dispatch

```text
dispatchSendOperation(operation_id)
```

Required:
1. claim through application/domain idempotency;
2. re-authorize current account capability;
3. validate intended draft snapshot;
4. call provider adapter;
5. record unambiguous/ambiguous result;
6. reconcile sent evidence where required;
7. feed sufficient provider/source evidence to Responsibility reducer.

Invariant:

```text
Send request != provider acceptance != operational closure
```

Timeout/unknown acceptance forbids blind duplicate retry.

### Reserved capabilities

Forward, Send Later/SCHEDULED, generic Undo/recall and silent offline queued Send are not current activation authority. Any future activation needs separate durable permission/temporal/idempotency contract.

## 18. Settings/lifecycle mutations

Reconnect, disconnect, Stop Tracking, Return Attention, defer and supported Settings distinguish request/pending/accepted/failure.

Consequential disconnect shows exact account/monitoring consequence and affected-items path. App sign-out != mailbox disconnect. Reconnect after unintended auth loss restores reassurance only after missing-interval reconciliation. Re-add after intentional disconnect never silently reactivates old delegation.

## 19. Integrity contract

Material degraded state exposes as applicable:
- affected account/capability/scope;
- what is not trustworthy;
- last trustworthy observation/data-through;
- affected live delegation scope/count;
- what remains safe/usable;
- recovery action.

Do not restore healthy Managed reassurance before reconciliation completes.

## 20. Audit/observability

Keep structured evidence sufficient to explain state changes, resurfacing, sync/send/trigger pending/reconciliation, account/provider identity, evidence revision/model/config basis and degraded intervals.

Logs are not canonical state. Never indiscriminately log secrets/full sensitive mail/model payloads.

## 21. Public-release boundary

Local/private complete-loop proof and public release are separate gates.

Public release may additionally require Google OAuth verification/security assessment, exact privacy/retention/deletion commitments, production credential rotation/recovery operations, current AI data controls and operational hardening.

Those release obligations do not establish Product-market evidence.