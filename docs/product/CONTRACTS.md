# Lunowa System Contracts

## Status

**Accepted logical module contracts, reconciled 2026-08-28 for the current one-provider Minimum Complete Delegation Loop.**

These contracts isolate provider/model/job/UI implementation from Product/domain authority. Concrete API/SDK syntax remains implementation-open. Current activation order is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

## 1. Contract principles

1. External data enters through validated adapters.
2. Core contracts use Lunowa concepts, not vendor SDK types.
3. Evidence, interpretation, accepted state, safe action and UI projection remain distinct.
4. Background work reloads/re-authorizes/revalidates current state before effects.
5. External effects define durable idempotency/reconciliation at the application/domain boundary.
6. Stale evidence/model/job results cannot win because they finish last.
7. Search/read models resolve back to current authorized records.
8. Current v1 activates only contracts required by the one-provider complete loop.

## 2. Provider capabilities

Conceptual capability description:

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

Capability presence does not activate a Product feature. Current v1 requires Gmail source read, attachment evidence access and contextual immediate send. Forward/Send Later/etc remain inactive unless separately accepted.

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
- credentials server-side;
- normalize account identity;
- distinguish app session from mailbox authorization;
- distinguish reconnect-required from transient failure;
- do not use auth-library social-account rows as mailbox-sync authority.

## 4. Gmail synchronization contract

### 4.1 Initial / incremental fetch

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

### 4.2 Required sequence

```text
authorize ConnectedAccount
-> fetch provider changes
-> normalize untrusted payload
-> upsert Message/Conversation/Attachment metadata idempotently
-> commit local evidence/evidence revision
-> enqueue downstream reconsideration as needed
-> advance provider cursor only after required durability
```

At minimum `(connected_account_id, provider_message_id)` is unique.

### 4.3 Push ingress

Gmail `users.watch` / PubSub notification is a **signal to reconcile**, never domain truth.

Ingress requirements:
- authenticate production PubSub push as applicable;
- validate expected audience/identity claims;
- acknowledge valid push quickly;
- defer non-trivial work to durable execution;
- duplicate/delayed/dropped notifications converge through reconciliation;
- one-event/sec/user provider limit is tolerated;
- periodic reconciliation works even with no push;
- renew watch before expiration (at least every 7 days; daily current provider recommendation).

### 4.4 Stale history recovery

If current `history.list` start history is stale/invalid and provider returns 404, enter explicit full-sync reconciliation. Never convert invalid cursor into empty/current truth.

### 4.5 Semantic chronology

Worker/ingestion order is not semantic chronology. Preserve source timestamps/relation evidence; old late evidence may not overwrite a later authoritative correction solely because processed later.

### 4.6 Historical activation

Initial historical source ingestion never automatically turns every apparently unfinished thread into a live Responsibility.

## 5. Normalized source contract

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

Provider HTML/body/attachment bytes are untrusted.

Source remains readable without a Responsibility/Moment.

## 6. Attachment evidence access

Current CORE contract:
- preserve provider attachment existence/metadata/provenance;
- authorize every access;
- fetch/stream/open/download/provider-fallback safely;
- distinguish provider/security restriction from local preview failure;
- preserve return to Source/Moment context.

Native rich preview and reply attachment-add remain conditional.

Attachment access/preview is not completion evidence.

## 7. AI interpretation contract

### 7.1 Input

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

Never include provider credentials/unrelated accounts/unrestricted DB access.

### 7.2 Output

AI returns structured **candidate interpretation**, for example:

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

AI output is not authoritative for auth, account ownership, send permission, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, or high-impact external authorization.

### 7.3 Validation

Before candidate use validate:
- runtime schema;
- current user/account authorization;
- referenced message/participant existence;
- provider-observed facts where deterministic;
- source locators/material values where practical;
- cross-account boundaries;
- evidence revision freshness.

Matching basis revision is necessary but not sufficient for acceptance.

### 7.4 Data-control activation

Production email interpretation must record current provider retention/data-control posture. `store: false` may be used where appropriate but must not be represented as equivalent to organization-level Zero Data Retention.

## 8. Responsibility reduction contract

Conceptual boundary:

```text
reduceResponsibilityEvidence(
  current_responsibilities,
  evidence_event,
  policy_context
) -> ResponsibilityDecision
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

Admission:

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

One evidence event may emit multiple effects.

Reducer preserves canonical orthogonal dimensions and field-scoped authority/provenance. It never restores the obsolete one-enum lifecycle.

Historical evidence-relative OPEN does not imply current live tracking.

## 9. Conversation/product projection

```text
projectConversationAttention(responsibilities[]) -> ConversationAttention
```

Projection may expose:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Rules:
- only appropriate live Responsibilities participate in current-work projection;
- unresolved work cannot disappear because another Responsibility resolved;
- current actionable USER work may outrank waiting work;
- newest message is not status authority;
- projection is deterministic/rebuildable.

## 10. Temporal Contract

Persisted contract/trigger is durable intent; scheduler/job run is execution.

### Create/update

```text
upsertTemporalContract(responsibility_id, spec, actor)
```

Current trigger types may include TIME / REPLY_RECEIVED / DEADLINE where accepted.

### Fire

```text
processTemporalTrigger(trigger_id)
```

Required:
1. load current trigger/contract/Responsibility/evidence;
2. verify active/current version;
3. claim via domain/DB idempotency;
4. re-evaluate current evidence;
5. persist resulting attention/domain/audit changes;
6. mark/cancel/supersede trigger state;
7. reconcile stale sibling triggers as required.

A trigger does not itself mean notification or MY_TURN.

### Trigger.dev execution contract

If Trigger.dev is used:
- explicit key composition/scope/TTL where keys are used;
- vendor key is not sole domain guarantee;
- failed-run key clearing and finite TTL cannot allow duplicate semantic/external effects;
- every run rechecks DB/domain currentness.

## 11. Attention contract

User-facing surfacing strength remains separate from operational state:

```text
NONE
QUIET_STATE_UPDATE
LIST_VISIBILITY
ATTENTION_LIST
NOTIFICATION
```

Intentional defer/LATER needs a return condition. Waiting on another actor/event is ordinarily WAITING, not LATER.

## 12. Product read-model contract

Implementation read models must distinguish at least:
- app session/auth;
- ConnectedAccount capability/auth;
- sync/integrity/data-through;
- accepted Responsibility projection;
- pending/failed/ambiguous mutation/effect;
- Source/provenance.

True zero requires canonical Product zero conditions; partial/degraded/untrusted coverage cannot be simplified to zero.

UI components/read models do not create domain authority.

## 13. Draft contract

Current v1 baseline is contextual reply.

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

Payload includes current sending account, reply context, recipients, subject/body and conditional attachments.

Requirements:
- authorize sender/account;
- validate recipients/attachments;
- version/conflict handling or equivalent;
- idempotent autosave where used;
- preserve draft across navigation/layout/auth-recovery where architecture permits;
- explicit discard distinct from closing a pane.

## 14. Send contract — current activation

Current v1 request:

```text
requestImmediateSend(draft_id) -> SendOperation
```

`SendOperation` must represent request/pending/dispatch/provider-unknown/provider-accepted/failed/reconciled states sufficient for truth.

### Provider dispatch

```text
dispatchSendOperation(operation_id)
```

Required:
1. claim through application/domain idempotency;
2. re-authorize current user/account capability;
3. freeze/validate intended draft snapshot;
4. call provider adapter;
5. record unambiguous or ambiguous provider result;
6. reconcile provider sent evidence when required;
7. feed accepted evidence into Responsibility reducer.

Invariant:

```text
Send request != provider acceptance != operational closure
```

Timeout/unknown acceptance never permits blind duplicate retry.

### Reserved/deferred send capabilities

These contract shapes may be designed later but are **not current activation authority**:
- Forward parity;
- Send Later / SCHEDULED;
- generic Undo Send/recall window;
- silent offline queued Send.

If later activated, each needs a separately accepted durable permission/temporal/idempotency contract.

## 15. Gmail provider send adapter

Conceptual:

```text
sendMessage(account, ProviderSendRequest) -> ProviderSendResult
```

Request includes operation ID, explicit sender/account context, reply mode, recipients/body and accepted attachments.

Result carries provider acceptance state and provider IDs/request evidence where available.

Provider acceptance is communication evidence only; it cannot independently resolve an unrelated operational outcome.

## 16. Search

```text
search(user_id, SearchRequest) -> SearchResultPage
```

Rules:
- current authorization predicates always applied;
- exact/basic Source search may be current CORE;
- semantic/NL search advertised only when capability active;
- stale derived index may reduce recall, never leak data;
- search similarity never authorizes Responsibility merge.

## 17. Settings / lifecycle mutations

For reconnect, disconnect, Stop Tracking, Return Attention, defer and supported settings:
- request/pending/accepted/failure state distinct;
- UI never displays requested value as accepted before authoritative commit;
- consequential disconnect shows affected account/monitoring consequences;
- app sign-out != mailbox disconnect;
- reconnect after unintended auth loss preserves monitoring intent only after missing-interval reconciliation;
- re-adding after intentional disconnect does not silently reactivate old delegation.

## 18. Integrity contract

Integrity is orthogonal to Responsibility state.

A material degraded state should expose as applicable:
- affected account/capability/scope;
- what is no longer trustworthy;
- last trustworthy observation/data-through;
- affected live delegation scope/count;
- what remains safe/usable;
- recovery action.

Do not restore healthy Managed reassurance before reconciliation completes.

## 19. Audit / observability contract

Keep enough structured evidence to explain:
- state/field changes;
- resurfacing;
- send/sync/trigger pending/reconciliation;
- account/provider involvement;
- evidence revision/model/config basis;
- degraded intervals.

Never use logs as canonical state and do not log secrets/full sensitive mail indiscriminately.

## 20. Public-release contract boundary

Local/private complete-loop proof and public release are separate gates.

Public release may additionally require:
- Google OAuth verification/security assessment for actual scopes/deployment;
- privacy/retention/deletion commitments;
- production credential encryption/rotation/revocation;
- operational recovery/backup/monitoring;
- current AI data-control posture.

These obligations are not Product-discovery evidence and do not convert implementation into PMF.