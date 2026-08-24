# Lunowa System Contracts

## Status

**Accepted logical contracts, reconciled with Responsibility v0.1; concrete API/SDK syntax is not yet frozen.**

This document defines contracts between Lunowa modules so provider details, model output, workers, or UI code cannot silently redefine domain behavior.

Responsibility-specific semantics are constrained by:

- `responsibility/README.md`;
- `responsibility/DECISIONS.md`;
- `responsibility/CONSISTENCY-AUDIT.md`;
- `responsibility/SCENARIO-SCHEMA.md`;
- `responsibility/TRANSITION-SCHEMA.md`.

Related broader sources:

- `ARCHITECTURE.md`;
- `DATA-MODEL.md`;
- `../design/INTERACTIONS.md`;
- `../ai-product-runtime.md`.

---

## 1. Contract principles

1. External systems enter through validated adapters.
2. Core contracts use Lunowa concepts, not Gmail/Microsoft SDK types.
3. Evidence, interpretation, accepted Responsibility state, safe action, and UI projection remain distinct.
4. AI returns structured candidate interpretation, not authoritative Responsibility state or authorization.
5. Durable jobs reload/re-authorize/re-check current state before effects.
6. External side effects define idempotency/reconciliation semantics explicitly.
7. Search/AI projections resolve back to current authorized records.
8. Contracts stay use-case-shaped; do not create generic workflow abstraction before required.
9. One evidence event may produce multiple Responsibility effects.
10. Stale evidence/model results cannot win merely because they complete later.

---

## 2. Provider adapter contract

Provider integrations expose normalized capabilities without forcing artificial feature parity.

### 2.1 Capabilities

```text
ProviderCapabilities {
  incremental_sync
  thread_identity
  message_send
  draft_sync?
  schedule_send_native?
  mark_read
  archive
  trash
  spam
  attachment_fetch
  contact_lookup?
}
```

### 2.2 Account connection

```text
connectAccount(auth_result) -> ConnectedAccountConnection

ConnectedAccountConnection {
  provider_account_id
  email_address
  display_name?
  granted_capabilities
  credential_reference
  initial_sync_hint?
}
```

Requirements:

- verify provider identity from provider evidence, not client-submitted email alone;
- keep credentials server-side;
- normalize account identity;
- distinguish reconnect-required from transient failure.

### 2.3 Incremental change fetch

```text
fetchChanges(account, cursor?) -> ProviderChangeBatch

ProviderChangeBatch {
  changes[]
  next_cursor?
  cursor_valid
  has_more
}
```

Normalized change kinds may include:

```text
MESSAGE_UPSERT
MESSAGE_DELETE_OR_UNAVAILABLE
THREAD_METADATA_CHANGED
MAILBOX_STATE_CHANGED
```

Duplicates are allowed at the boundary; ingestion is idempotent. Invalid cursor returns explicit resync/reconciliation state. Cursor advancement becomes locally authoritative only after the corresponding local changes are durable.

### 2.4 Fetch normalized message/thread

```text
fetchMessage(account, provider_message_id) -> NormalizedProviderMessage
fetchConversationSeed(account, provider_thread_id) -> NormalizedProviderConversation
```

```text
NormalizedProviderMessage {
  provider_message_id
  provider_thread_id?
  direction_hint?
  sender
  recipients[]
  cc[]
  bcc[]?
  subject
  text_body?
  sanitized_html_source?
  timestamp
  read_state?
  mailbox_state?
  attachments[]
  minimal_provider_metadata
}
```

Provider HTML/content remains untrusted.

### 2.5 Send message

```text
sendMessage(account, ProviderSendRequest) -> ProviderSendResult
```

```text
ProviderSendRequest {
  operation_id
  idempotency_context
  mode                  // new | reply | reply_all | forward
  reply_to_provider_message_id?
  recipients[]
  cc[]
  bcc[]
  subject
  body
  body_format
  attachments[]
}
```

```text
ProviderSendResult {
  provider_acceptance_state
  provider_message_id?
  provider_thread_id?
  provider_request_id?
}
```

Requirements:

- ambiguous timeout/error states are distinct when provider may have accepted;
- application reconciles ambiguous sends before blind retry;
- provider retry cannot bypass Lunowa SendOperation idempotency;
- provider acceptance is evidence of accepted send, not proof of unrelated external-world outcomes.

### 2.6 Mailbox mutations

Expose narrow operations (`markRead`, `archive`, `trash`, `reportSpam`) rather than a generic arbitrary provider-mutation tool available to AI/UI.

---

## 3. Sync / ingestion contract

```text
syncAccount(connected_account_id, reason) -> SyncResult
```

Reasons may include:

```text
PUSH_NOTIFICATION
POLL
USER_REFRESH
RECONNECT
RECONCILIATION
INITIAL_SYNC
```

```text
SyncResult {
  new_messages
  updated_messages
  deleted_or_unavailable_messages
  cursor_advanced
  downstream_work_enqueued
  status
}
```

### 3.1 Ingestion invariants

For each provider message:

1. authorize account ownership;
2. normalize provider payload;
3. upsert by `(connected_account_id, provider_message_id)`;
4. attach to correct local Conversation;
5. persist message/attachment metadata;
6. commit local evidence;
7. advance semantic evidence revision as appropriate;
8. enqueue interpretation/index/re-evaluation idempotently;
9. advance provider cursor only according to provider consistency semantics after required local durability.

### 3.2 Semantic chronology

Observed/worker order is not semantic authority.

A late older message MUST NOT roll back a later explicit correction solely because it was ingested last.

Normalization should preserve source sent/received time and explicit relation evidence needed by the reducer.

### 3.3 Inbound observation event

```text
InboundMessageObserved {
  message_id
  conversation_id
  connected_account_id
  semantic_time
  observed_at
  evidence_revision
}
```

Provider webhook payloads never directly mutate Responsibility attention/state.

---

## 4. AI interpretation contract

### 4.1 Input boundary

The AI receives only context authorized for the current user/feature.

Conceptual input:

```text
InterpretationInput {
  schema_version
  behavior_config_version
  evidence_revision
  locale
  timezone

  focal_message_id?

  conversation_context {
    conversation_id
    connected_account_id
    topic?
    messages[] {
      message_id
      direction
      sender
      recipients
      cc[]?
      timestamp
      subject
      text_content
      attachment_metadata[]?
    }
  }

  existing_responsibility_context[]?
  authorized_external_context[]?
}
```

Do not pass provider credentials, unrelated accounts/scopes, or unrestricted database access.

### 4.2 Output schema

The model returns structured **candidate interpretation**, not state mutation.

Conceptual output:

```text
InterpretationOutput {
  schema_version
  basis_evidence_revision

  zoning_candidates[]?

  communication_acts[] {
    act_id
    type                   // REQUEST | COMMITMENT | PROPOSAL | DECISION | CORRECTION | CANCELLATION | COMPLETION_SIGNAL | INFORMATION
    speaker
    obligation_bearer_candidate?
    obligation_bearers_candidate[]?
    assignment_shape_candidate?
    action_or_event?
    object?
    modality?
    obligation_strength?
    polarity?
    condition?
    constraints[]?
    temporal_expressions[]?
    source_message_ids[]
    source_locators[]?
  }

  communicated_claims[]?
  proposed_terms[]?

  no_responsibility_signal?

  uncertainty[] {
    field
    reason_code
    source_message_ids[]?
  }
}
```

Exact production schema may evolve. The semantic distinctions are not optional.

### 4.3 Explicit exclusions

AI output is not authoritative for:

- user authorization;
- ConnectedAccount ownership;
- send permission;
- direct Responsibility mutation;
- live activation/defer/hiding without product policy;
- irreversible provider action;
- provider-observed facts that should be deterministically read from provider data;
- cost/usage limits;
- scope membership;
- high-risk compliance legitimacy.

### 4.4 Abstention/uncertainty

The schema supports uncertainty and no reliable Responsibility signal.

Invalid output must not force a confident classification. However, model uncertainty alone also does not dictate product review; the reducer/safety layer considers source ambiguity, contradiction, risk, and deterministic observations.

### 4.5 Provenance and freshness

Material candidate fields include source message IDs/locators where practical.

`basis_evidence_revision` is required wherever stale results could race newer evidence.

```text
basis_revision matches current revision
```

is necessary but not sufficient for application.

---

## 5. Responsibility reduction contract

The Responsibility reducer owns accepted evidence-relative domain effects from validated interpretation/trusted observations/user commands.

Conceptual pure-ish contract:

```text
reduceResponsibilityEvidence(
  current_responsibilities,
  evidence_event,
  policy_context
) -> ResponsibilityDecision
```

```text
ResponsibilityDecision {
  effects[] {
    responsibility_ref?
    operation              // CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP
    resolution_reason?
    field_changes[]
    reason_codes[]
  }

  field_decisions[]?
  temporal_contract_changes[]?
  attention_changes[]?
  projection_invalidations[]?
  audit_reasons[]
  requires_user_confirmation?
}
```

### 5.1 Why `effects[]`

One focal message may supersede one Responsibility and create another. Do not force one scalar lifecycle/matching operation.

`SUPERSEDE` is terminal on the old Responsibility and conceptually results in `RESOLVED/SUPERSEDED`; replacement creation is a separate `CREATE` effect.

### 5.2 Canonical semantic dimensions

Reduction preserves the orthogonal model:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs + actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
field-level uncertainty/risk
provenance
```

The superseded seven-state lifecycle enum MUST NOT be restored as canonical state.

### 5.3 Domain/evidence events

Examples:

```text
INTERPRETATION_ACCEPTED
MESSAGE_OBSERVED
USER_FIELD_CORRECTED
USER_TRACKING_ACTIVATED
USER_TRACKING_CLOSED
USER_DEFERRED
TEMPORAL_TRIGGER_FIRED
SEND_RECONCILED
PROVIDER_FACT_RECONCILED
EXTERNAL_FACT_OBSERVED
ACCOUNT_RESYNC_RECONCILED
```

Event names remain implementation-open.

### 5.4 Core transition semantics

- explicit user request may create an actionable USER obligation leg;
- user send reconciliation may satisfy a send leg, but not necessarily the whole Responsibility;
- remaining OTHER/EXTERNAL expected work projects `WAITING`;
- follow-up trigger can create a current USER follow-up action in the same Responsibility;
- hold adds/changes a constraint/expected resume event and is not cancellation;
- cancellation resolves with a non-satisfaction reason;
- same unsatisfied operational outcome can REOPEN;
- genuinely closed earlier episode plus new work normally CREATEs a new Responsibility;
- pending proposal does not become agreed fact before acceptance evidence;
- field conflict preserves evidence and can project REVIEW without erasing a definitely tracked Responsibility;
- historical evidence-relative open loop does not automatically activate live tracking.

### 5.5 False-negative safety

When material uncertainty could hide a real user obligation, prefer conservative visibility/review over unsupported `Done/Waiting/Later`.

A system that sends everything to review is also a product failure. Review is reserved for decision-critical ambiguity/risk.

---

## 6. Conversation aggregate contract

```text
projectConversationAttention(responsibilities[]) -> ConversationAttention
```

```text
ConversationAttention {
  primary_responsibility_id?
  user_facing_state         // MY_TURN | WAITING | LATER | DONE | REVIEW | NONE or client mapping
  attention_level?
  nearest_relevant_time?
  reason_code
}
```

Rules:

- only appropriate live Responsibilities participate in active-work projection;
- unresolved/uncertain work must not disappear because another Responsibility resolves;
- actionable critical/overdue USER obligation can outrank lower-risk work;
- nearest meaningful due/blocker may affect ordering;
- newest message is not the default authority for primary selection;
- projection is deterministic/testable/rebuildable.

---

## 7. Temporal Contract contract

### 7.1 Create/update

```text
upsertTemporalContract(responsibility_id, contract_spec, actor)
  -> TemporalContract
```

```text
TemporalContractSpec {
  kind                    // active-obligation-defer | passive-waiting | other
  triggers[] {
    type                  // TIME | REPLY_RECEIVED | DEADLINE
    at?
    deadline_policy?
  }
  desired_attention_on_fire?
  user_confirmed?
}
```

Communication hold/pause is separate from attention defer.

### 7.2 Schedule

```text
scheduleTrigger(trigger_id, trigger_at)
```

Scheduler is infrastructure; persisted contract/trigger is durable intent.

### 7.3 Fire

```text
processTemporalTrigger(trigger_id) -> TriggerProcessingResult
```

Required sequence:

1. load trigger + contract + current Responsibility/evidence;
2. verify active/current version;
3. claim idempotently;
4. re-evaluate current evidence;
5. persist resulting Responsibility/attention/resurfacing/audit effects;
6. mark trigger fired/cancelled/superseded;
7. cancel/update stale sibling triggers as rules require.

A trigger does not itself imply notification.

### 7.4 Reconciliation

Overdue active triggers are discoverable/reprocessed idempotently after downtime.

### 7.5 Reply matching

Inbound normalized events are matched to relevant current Responsibility/contract state, not provider webhook payloads alone.

---

## 8. Attention / resurfacing contract

Conceptual surfacing strength:

```text
NONE
QUIET_STATE_UPDATE
LIST_VISIBILITY
ATTENTION_LIST
NOTIFICATION
```

Attention/defer is orthogonal to Responsibility resolution/live activation.

`LATER` requires intentional defer semantics and a return condition; a communication hold waiting on someone else ordinarily remains `WAITING`.

---

## 9. Draft contract

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

```text
DraftPayload {
  connected_account_id
  conversation_id?
  mode
  in_reply_to_message_id?
  recipients[]
  cc[]
  bcc[]
  subject
  body
  body_format
  attachment_ids[]
}
```

Requirements:

- authorize sending account;
- validate recipients/attachments;
- optimistic conflict detection or equivalent;
- autosave idempotent;
- draft survives navigation/viewport changes.

Explicit discard is distinct from closing a pane.

---

## 10. Send operation contract

```text
requestSend(draft_id, mode, scheduled_for?) -> SendOperation
```

Modes:

```text
IMMEDIATE
UNDO_DELAY
SCHEDULED
```

API returns durable operation state, never fictional `sent=true` before provider evidence.

### 10.1 Undo Send

For Lunowa-controlled delay:

```text
PENDING/CANCELLABLE
 -> user cancels -> CANCELLED
 -> window expires -> DISPATCHING
```

After irreversible provider dispatch, generic Lunowa recall is unavailable unless separately implemented/provider-supported.

### 10.2 Worker dispatch

```text
dispatchSendOperation(operation_id)
```

Required:

1. claim idempotently;
2. re-authorize account/user state;
3. verify schedule/cancellation/current draft snapshot;
4. call provider adapter;
5. record unambiguous or ambiguous result;
6. reconcile sent message when necessary;
7. apply Responsibility effect only after sufficient evidence for the specific closure condition.

### 10.3 Ambiguous provider result

Timeout after dispatch may mean unknown acceptance.

Never blindly retry as definitely unsent. Reconcile first or surface guarded unresolved state.

---

## 11. Search contract

```text
search(user_id, SearchRequest) -> SearchResultPage
```

```text
SearchRequest {
  query
  scope_id_or_all
  result_types[]?
  cursor?
  limit
}
```

Results resolve to current authorized sources.

Rules:

- default current Scope;
- broadening to All is explicit;
- stale projection may reduce recall but never leak inaccessible data;
- semantic similarity/search is not Responsibility merge authority;
- conversation/message result opens ordinary conversation unless intentionally represented as a Responsibility/action result.

---

## 12. Person Context contract

```text
getPersonContext(participant_id, scope) -> PersonContext
```

```text
PersonContext {
  identity
  organization?
  recent_conversations[]
  current_open_responsibilities[]
  recent_files[]
  remembered_facts[] {
    value
    uncertainty_or_confidence?
    provenance
  }
}
```

Respect authorization/scope. No CRM pipeline/deal semantics in v1.

---

## 13. Attachment preview contract

```text
getAttachmentPreview(attachment_id) -> PreviewDescriptor
```

```text
PreviewDescriptor {
  mode
  content_url_or_stream_reference
  filename
  mime_type
  size_bytes?
  expires_at?
}
```

Requirements:

- re-authorize ownership;
- do not expose provider credentials in URLs;
- use short-lived signed/streamed access as needed;
- preserve conversation if preview fails;
- sanitize/render supported types safely.

Opening/previewing an attachment is not completion evidence by itself.

---

## 14. User correction contract

User correction is field-scoped where practical.

```text
correctResponsibility(responsibility_id, correction, expected_evidence_revision?)
  -> ResponsibilityResult
```

Potential corrections:

- responsibility should/should-not be tracked;
- obligation bearer/action;
- source due interpretation;
- user target/defer/return condition;
- completion/resolution reason;
- reopen;
- Temporal Contract change/deactivation.

Requirements:

- persist user authority/provenance;
- record meaningful domain transition/audit;
- correction to one field does not freeze unrelated fields;
- stale AI result cannot immediately overwrite the correction;
- user target does not rewrite external source fact;
- user tracking-close does not assert objective satisfaction.

---

## 15. Client error contract

Stable product categories may include:

```text
AUTH_REQUIRED
ACCOUNT_RECONNECT_REQUIRED
FORBIDDEN
NOT_FOUND
CONFLICT
VALIDATION_ERROR
PROVIDER_TEMPORARY_FAILURE
PROVIDER_RATE_LIMITED
PROVIDER_AMBIGUOUS_RESULT
AI_UNAVAILABLE
SEARCH_UNAVAILABLE
ATTACHMENT_PREVIEW_UNAVAILABLE
SCHEDULE_OPERATION_FAILED
INTERNAL_RETRYABLE
INTERNAL_FATAL
```

UI explains impact/recovery rather than raw technical exceptions.

---

## 16. Job contract

```text
JobEnvelope {
  job_id
  job_type
  entity_id
  idempotency_key?
  attempt
  created_at
  not_before?
  correlation_id?
  basis_evidence_revision?
}
```

Workers:

- load current authoritative state;
- do not trust stale job payload for authorization/domain truth;
- use bounded retry;
- expose permanent failure;
- make effects idempotent/reconcilable;
- avoid putting full bodies/credentials in queue payloads when references suffice.

---

## 17. Versioning contract

Version material behavior inputs such as:

- AI structured-output schema;
- behavior/reducer config where mixed semantics require traceability;
- model/prompt/config identifier;
- evidence revision;
- Temporal Contract version;
- search projection version;
- public/client API only when compatibility requires it.

Do not version every internal function.

---

## 18. Testing implications

### Provider/sync

- duplicate ingestion;
- invalid cursor;
- provider transient/rate-limit errors;
- ambiguous send timeout;
- normalization;
- reconnect/resync;
- out-of-order ingestion preserving semantic correction.

### Responsibility/domain

- zero/one/many Responsibilities in one Conversation;
- request vs no-responsibility admission;
- multiple obligation legs;
- conditional activation;
- partial completion criteria;
- proposal/counterproposal/agreement;
- hold vs cancellation vs defer;
- send leg -> Waiting vs whole-outcome completion;
- follow-up as action in same Responsibility;
- REOPEN vs new episode;
- supersede old + create replacement in one event;
- field-scoped conflict/review;
- historical open vs live activation;
- user correction not overwritten by stale AI;
- cross-account lookalikes not auto-merged.

### Scheduler

- duplicate trigger execution;
- cancellation/version race;
- downtime/overdue reconciliation;
- reply before scheduled time;
- stale sibling trigger ignored.

### Send

- client double-submit;
- worker retry;
- undo cancellation;
- scheduled send after restart;
- ambiguous provider acceptance;
- reconciled send only closes appropriate operational outcome.

### Authorization/safety

- cross-user/account access rejected;
- search/AI context respects scope;
- attachment access re-authorized;
- prompt-injection text cannot gain tool authority;
- high-risk requested action is separated from safe next action.

Canonical semantic truth for these tests is supplied by `responsibility/` scenarios/transition oracles; passing prompt eval alone is insufficient.

---

## 19. Contract change rule

A change is contract-significant when it changes:

- authority/ownership;
- Responsibility admission/identity/resolution/actionability/projection semantics;
- provider normalization;
- Temporal Contract guarantees;
- send idempotency/irreversibility;
- authorization/data exposure;
- AI schema/decision boundary;
- search scope;
- user-visible error/recovery behavior.

Such changes update this document and relevant Responsibility decisions/scenarios/tests in the same durable change.