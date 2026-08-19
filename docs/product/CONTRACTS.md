# Lunowa System Contracts

## Status

**Accepted logical contracts; concrete API/SDK syntax is not yet frozen.**

This document defines the contracts between Lunowa's major modules. The purpose is to let implementation evolve without allowing provider details, model output, background workers, or UI code to silently redefine domain behavior.

Related sources:

- `ARCHITECTURE.md`
- `DATA-MODEL.md`
- `../design/INTERACTIONS.md`
- `../ai-product-runtime.md`

---

## 1. Contract principles

1. External systems enter through validated adapters.
2. Core domain contracts use Lunowa concepts, not Gmail/Microsoft SDK types.
3. AI returns structured candidate facts, not authoritative workflow decisions.
4. Durable jobs execute persisted intent and re-check current state before side effects.
5. Every privileged read/write is re-authorized using trusted application state.
6. Commands with external side effects define retry/idempotency semantics explicitly.
7. Search/AI projections resolve back to authoritative authorized records.
8. Contracts should be small and use-case-shaped; do not create generic abstraction frameworks before needed.

---

## 2. Provider adapter contract

Provider integrations should satisfy a normalized set of capabilities while allowing provider-specific implementation behind the boundary.

Do not force every provider into artificial feature parity. Capability checks are allowed.

### 2.1 Normalized capabilities

Conceptual capability set:

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

The product layer should ask whether a capability exists rather than branching on provider string wherever possible.

### 2.2 Account connection

Conceptual command:

```text
connectAccount(auth_result) -> ConnectedAccountConnection
```

Output:

```text
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

- verify the provider identity from the provider, not client-submitted email alone;
- store credentials only in the server-side credential boundary;
- return normalized account identity;
- expose reconnect-required errors distinctly from transient provider failure.

### 2.3 Incremental change fetch

```text
fetchChanges(account, cursor?) -> ProviderChangeBatch
```

```text
ProviderChangeBatch {
  changes[]
  next_cursor?
  cursor_valid
  has_more
}
```

Each `change` should be normalized to a small set such as:

```text
MESSAGE_UPSERT
MESSAGE_DELETE_OR_UNAVAILABLE
THREAD_METADATA_CHANGED
MAILBOX_STATE_CHANGED
```

The adapter may internally call multiple provider APIs.

Requirements:

- duplicates allowed at boundary; ingestion must be idempotent;
- invalid cursor returns explicit `RESYNC_REQUIRED`, not silent empty success;
- `next_cursor` becomes authoritative locally only after corresponding changes are durably applied.

### 2.4 Fetch normalized message/thread data

```text
fetchMessage(account, provider_message_id) -> NormalizedProviderMessage
fetchConversationSeed(account, provider_thread_id) -> NormalizedProviderConversation
```

Conceptual normalized message:

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

Sanitization for browser rendering may occur after normalization, but provider HTML must remain untrusted throughout.

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

- adapter must map ambiguous timeout/error states distinctly when the provider may have accepted the send;
- the application must reconcile ambiguous send results before blindly retrying;
- a provider SDK retry must not bypass Lunowa SendOperation idempotency rules.

### 2.6 Mailbox mutation

Use narrowly shaped operations, for example:

```text
markRead(...)
archive(...)
trash(...)
reportSpam(...)
```

Do not expose a generic arbitrary provider mutation tool to AI or UI.

---

## 3. Sync / ingestion contract

The sync pipeline converts provider changes into normalized durable communication events.

### 3.1 Account sync command

```text
syncAccount(connected_account_id, reason) -> SyncResult
```

Reason examples:

```text
PUSH_NOTIFICATION
POLL
USER_REFRESH
RECONNECT
RECONCILIATION
INITIAL_SYNC
```

Output:

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

### 3.2 Ingestion invariants

For each provider message:

1. validate account ownership;
2. normalize provider payload;
3. upsert by `(connected_account_id, provider_message_id)`;
4. attach to the correct local Conversation;
5. persist message/attachment metadata;
6. commit local state;
7. enqueue downstream interpretation/index/re-evaluation idempotently;
8. advance cursor only according to provider consistency semantics and after local durability.

### 3.3 Relevant inbound reply event

After normalization, domain logic may emit:

```text
InboundMessageObserved {
  message_id
  conversation_id
  connected_account_id
  observed_at
}
```

Temporal Contract matching consumes this normalized event and current contract state. Provider webhook payloads must never directly fire user attention changes.

---

## 4. AI interpretation contract

### 4.1 Input boundary

The AI receives only context already authorized for the current user and feature.

Conceptual input:

```text
InterpretationInput {
  schema_version
  locale
  timezone
  conversation_context {
    conversation_id
    topic?
    messages[] {
      message_id
      direction
      sender
      recipients
      timestamp
      subject
      text_content
    }
  }
  existing_action_items[]?
}
```

Do not pass provider credentials, unrelated scopes/accounts, or unrestricted database access.

### 4.2 Output schema

The model should produce structured **candidate facts**.

```text
InterpretationOutput {
  schema_version
  conversation_topic_candidate? {
    value
    confidence
    source_message_ids[]
  }

  action_candidates[] {
    candidate_key
    goal
    requested_action?
    next_owner_candidate
    deadline_candidate? {
      value
      timezone_context?
      confidence
      source_message_ids[]
    }
    waiting_for?
    completion_signal? {
      kind
      confidence
      source_message_ids[]
    }
    follow_up_signal?
    confidence
    risk_hint?
    source_message_ids[]
  }

  no_action_signal? {
    confidence
    source_message_ids[]
  }

  uncertainty[] {
    field
    reason_code
  }
}
```

The exact JSON schema may evolve, but these semantics must remain.

### 4.3 Explicit exclusions

The AI output MUST NOT be treated as authoritative for:

- user authorization;
- ConnectedAccount ownership;
- send permission;
- direct lifecycle state mutation;
- hidden/deferred state without policy/rule validation;
- irreversible provider action;
- cost/usage limits;
- scope membership.

### 4.4 Abstention

The schema must allow the model to say it is uncertain or no reliable action can be extracted.

Invalid/low-confidence output should degrade to `UNCERTAIN`/traditional mail presentation rather than forcing a confident classification.

### 4.5 Provenance

Important candidate fields should include source message IDs. The product may later add exact text locators/excerpts.

A deadline/action/completion claim shown to a user should be traceable to original communication when practical.

---

## 5. Lifecycle reducer contract

The lifecycle reducer owns authoritative ActionItem state transitions from validated facts/events.

Conceptual pure-ish function:

```text
reduceLifecycle(current_state, domain_event, policy_context)
  -> LifecycleDecision
```

Where:

```text
LifecycleDecision {
  action_item_changes[]
  temporal_contract_changes[]
  attention_changes[]
  audit_reasons[]
  requires_user_confirmation?
}
```

### 5.1 Domain events

Examples:

```text
INTERPRETATION_ACCEPTED
USER_DEFERRED
USER_CORRECTED_STATE
USER_SENT_REQUIRED_REPLY
INBOUND_MESSAGE_OBSERVED
TEMPORAL_TRIGGER_FIRED
DEADLINE_CHANGED
SEND_RECONCILED
EXPLICIT_COMPLETION_OBSERVED
ACCOUNT_RESYNC_RECONCILED
```

### 5.2 Initial transition semantics

#### OPEN

May transition to:

- `ACTION_REQUIRED`
- `WAITING`
- `COMPLETED`
- `UNCERTAIN`

based on validated evidence.

#### ACTION_REQUIRED -> DEFERRED

Requires:

- an action exists;
- user does not need to attend now;
- an executable Temporal Contract exists;
- for early/high-risk active obligations, user confirmation may be required before hiding.

#### DEFERRED -> ACTION_REQUIRED

When active Temporal Contract fires and the obligation remains unresolved.

#### ACTION_REQUIRED -> WAITING

When strong evidence shows the user's required action was completed and the next owner is another party/event.

A successful Lunowa send of the required response can be strong evidence when mapped to the relevant ActionItem.

#### WAITING -> FOLLOW_UP

When the agreed/passive follow-up condition fires and completion/reply has not occurred.

#### FOLLOW_UP -> WAITING

After a follow-up is successfully sent/reconciled and the system is again waiting on the other party.

#### * -> COMPLETED

Completion must be conservative. Strong explicit evidence or user confirmation is preferred.

#### COMPLETED -> new active work

New relevant inbound communication may create a new ActionItem or reopen one when goal identity is sufficiently clear.

### 5.3 False-negative safety rule

When uncertainty is material, prefer keeping an obligation visible/uncertain over hiding it as completed/waiting/deferred.

The reducer may use confidence and risk together; confidence alone is insufficient.

---

## 6. Conversation aggregate contract

The UI needs one primary chip/state for a Conversation.

Conceptual projection:

```text
projectConversationAttention(action_items[]) -> ConversationAttention
```

```text
ConversationAttention {
  primary_action_item_id?
  user_facing_state          // action_required | deferred | waiting | completed | none
  attention_level
  deadline_at?
  reason_code
}
```

### Rules

- only active Action Items participate;
- `UNCERTAIN` must not disappear merely because another task is completed;
- nearest/high-risk user-owned obligation can outrank a lower-risk state;
- projection is deterministic and testable;
- projection is derived and rebuildable.

Do not hard-code UI list ordering independently from the same domain projection rules.

---

## 7. Temporal Contract contract

### 7.1 Create/update contract

```text
upsertTemporalContract(action_item_id, contract_spec, actor)
  -> TemporalContract
```

Conceptual spec:

```text
TemporalContractSpec {
  kind                    // active_obligation | passive_waiting
  triggers[] {
    type                  // TIME | REPLY_RECEIVED | DEADLINE
    at?
    deadline_policy?
  }
  desired_attention_on_fire
  user_confirmed?
}
```

### 7.2 Schedule trigger

```text
scheduleTrigger(trigger_id, trigger_at)
```

The scheduler is infrastructure; the database record is the durable intent.

### 7.3 Fire trigger

```text
processTemporalTrigger(trigger_id) -> TriggerProcessingResult
```

Required sequence:

1. load trigger + contract + ActionItem in current transaction/consistency boundary;
2. verify trigger status is active;
3. verify contract version/status is current;
4. claim using idempotent compare/update;
5. run lifecycle re-evaluation;
6. persist resulting transition/resurfacing/audit;
7. mark trigger fired/cancelled/superseded;
8. cancel or update sibling triggers as rules require.

### 7.4 Reconciliation

```text
reconcileOverdueTriggers(now) -> count/results
```

Must discover active time triggers whose `trigger_at <= now` and process them idempotently.

### 7.5 Reply-trigger matching

On `InboundMessageObserved`, evaluate active reply triggers associated with the relevant Conversation/ActionItem.

A provider notification is not sufficient; matching happens against normalized current domain state.

---

## 8. Attention/resurfacing contract

Resurfacing and notification are distinct.

Conceptual levels:

```text
NONE
QUIET_STATE_UPDATE
LIST_VISIBILITY
ATTENTION_LIST
NOTIFICATION
```

MVP may implement only a subset.

The Temporal Contract decides when the item should be reconsidered; Attention Policy decides how strongly to surface it.

This separation prevents every scheduler trigger from becoming an intrusive notification.

---

## 9. Draft contract

### 9.1 Save draft

```text
saveDraft(draft_id?, expected_version?, payload) -> Draft
```

Payload:

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

- authorize sending account ownership;
- validate recipients/attachments;
- optimistic version conflict detection or equivalent;
- autosave is idempotent;
- draft survives navigation/viewport changes.

### 9.2 Discard

Explicit discard deletes/marks discarded the Lunowa draft and orphaned temporary uploads according to retention policy.

Do not infer discard from closing a pane.

---

## 10. Send operation contract

### 10.1 Request send

```text
requestSend(draft_id, mode, scheduled_for?) -> SendOperation
```

Possible modes:

```text
IMMEDIATE
UNDO_DELAY
SCHEDULED
```

The API returns durable operation state, not a fictional `sent=true` before provider dispatch/reconciliation.

### 10.2 Undo Send

For `UNDO_DELAY`:

```text
PENDING/CANCELLABLE
 -> user cancels before cancellable_until -> CANCELLED
 -> window expires -> DISPATCHING
```

After provider dispatch becomes irreversible, generic Lunowa Undo is no longer available.

### 10.3 Worker dispatch

```text
dispatchSendOperation(operation_id)
```

Required:

1. claim operation idempotently;
2. re-authorize account/user state;
3. verify not cancelled and schedule due;
4. build ProviderSendRequest from frozen send snapshot or protected draft version;
5. call adapter;
6. record unambiguous or ambiguous provider result;
7. reconcile provider sent message when needed;
8. update related lifecycle state only after appropriate send success/reconciliation evidence.

### 10.4 Ambiguous provider result

Timeout after dispatch can mean unknown acceptance.

Never automatically retry an ambiguous send as though definitely unsent. First use provider-specific reconciliation if available; otherwise surface a guarded failure requiring resolution.

---

## 11. Search contract

### 11.1 Query

```text
search(user_id, SearchRequest) -> SearchResultPage
```

```text
SearchRequest {
  query
  scope_id_or_all
  result_types[]?        // conversation | message | person | file
  cursor?
  limit
}
```

### 11.2 Result

```text
SearchResult {
  type
  source_id
  conversation_id?
  title
  snippet
  match_locations?
  timestamp?
  authorized_scope_context
}
```

### 11.3 Rules

- default to current Scope;
- broadening to All must be explicit;
- result source must be current and authorized at response time;
- stale search projection may reduce recall temporarily but must not leak inaccessible data;
- click behavior follows design spec: conversation/message result opens `会話` and jumps/highlights when possible; status/action result may open `今の要点` only when intentionally represented as such.

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
  current_open_action_items[]
  recent_files[]
  remembered_facts[] {
    value
    confidence?
    provenance
  }
}
```

Rules:

- respect current scope/authorization;
- remembered facts require provenance when material;
- no CRM pipeline/deal semantics in v1;
- context may degrade gracefully if AI memory/enrichment is unavailable.

---

## 13. Attachment preview contract

```text
getAttachmentPreview(attachment_id) -> PreviewDescriptor
```

```text
PreviewDescriptor {
  mode                // inline_pdf | image | text | download | external
  content_url_or_stream_reference
  filename
  mime_type
  size_bytes?
  expires_at?
}
```

Requirements:

- re-authorize attachment/message/account ownership;
- do not expose long-lived raw provider credentials in URLs;
- use short-lived signed/streamed access when necessary;
- preserve conversation state if preview fails;
- sanitize/render only supported types safely.

---

## 14. User correction contract

Trust requires a path to correct the system.

```text
correctActionItem(action_item_id, correction) -> ActionItem
```

Potential corrections:

- mark as no action required;
- mark action required;
- change deadline;
- change next owner;
- complete;
- reopen;
- change/deactivate Temporal Contract.

Requirements:

- persist actor as user;
- record meaningful LifecycleTransition/AuditEvent;
- user correction should outrank stale AI interpretation until new strong evidence or explicit product rules justify reconsideration;
- do not immediately overwrite a user correction with the same old interpretation result.

---

## 15. Client error contract

The application API should return stable product-level errors rather than raw provider/model exceptions.

Conceptual categories:

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

UI copy should explain impact and recovery rather than technical stack traces.

---

## 16. Job contract

Every durable job should carry:

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
}
```

Worker behavior:

- load authoritative current state;
- no trust in stale job payload for authorization/state;
- bounded retry policy by job type;
- dead/permanent failure observable;
- side effects idempotent or reconciled.

Do not put entire message bodies or credentials into queue payloads when stable entity references suffice.

---

## 17. Versioning contract

Version material behavior inputs:

- AI structured-output schema;
- lifecycle rule version when necessary for migration/debug;
- model/prompt/config identifier;
- search projection version if rebuild behavior changes;
- Temporal Contract version;
- public/client API only when compatibility requires it.

Avoid versioning every internal function. Version only where mixed/stale data or regression traceability needs it.

---

## 18. Testing implications

These contracts imply specific tests.

### Provider contract tests

- duplicate message ingestion;
- invalid sync cursor;
- rate limit/transient errors;
- ambiguous send timeout;
- provider payload normalization;
- reconnect.

### Lifecycle tests

- multiple Action Items in one Conversation;
- action required -> deferred -> resurfaced;
- send -> waiting;
- waiting -> follow-up;
- completion/reopen;
- uncertainty preserves visibility;
- user correction not overwritten by stale AI output.

### Scheduler tests

- duplicate trigger execution;
- trigger cancelled before fire;
- contract updated while old trigger pending;
- downtime/overdue reconciliation;
- reply arrives before scheduled time;
- stale sibling trigger ignored.

### Send tests

- client double-submit;
- worker retry;
- undo cancellation;
- scheduled send after restart;
- ambiguous provider acceptance.

### Authorization tests

- cross-user account/message access rejected;
- cross-scope search does not leak when scope is restricted;
- AI context excludes unauthorized data;
- attachment access re-authorized.

---

## 19. Contract change rule

A change is contract-significant when it changes:

- authority/ownership;
- lifecycle semantics;
- provider normalization;
- Temporal Contract guarantees;
- send idempotency/irreversibility;
- authorization/data exposure;
- AI schema/decision boundary;
- search scope semantics;
- user-visible error/recovery behavior.

Such changes should update this document and relevant tests/specs in the same change.