# Lunowa Data Model

## Status

**Accepted conceptual model; physical schema is not yet frozen.**

This document defines the data concepts, ownership, invariants, and relationships that should constrain implementation. Table names, SQL types, indexes, and ORM syntax may change during bootstrap as long as the semantics and invariants remain intact.

Related sources:

- `ARCHITECTURE.md`
- `CONTRACTS.md`
- `../design/INTERACTIONS.md`

---

## 1. Modeling principles

1. **Do not make Conversation the workflow unit.** A Conversation can contain multiple Action Items.
2. **Separate provider facts from Lunowa product state.** Provider mailbox state is externally authoritative; lifecycle/Temporal Contract state is Lunowa-authoritative.
3. **Keep state dimensions orthogonal.** Lifecycle, attention, ownership, confidence, risk, deadline, and resurfacing are separate concepts.
4. **Persist promises.** Temporal Contracts and scheduled sends are durable records, not inferred UI state.
5. **Preserve provenance.** Important extracted facts should resolve to source message/event evidence.
6. **Support idempotency/reconciliation.** Provider ingestion and sends must tolerate retries and duplicate delivery.
7. **Derived projections are disposable.** Search indexes, summaries, aggregate status, and embeddings should be rebuildable.
8. **Prefer explicit lifecycle history for trust.** The system should be able to explain why a state changed and why an item resurfaced.

---

## 2. Entity overview

```text
User
 ├─ Scope
 │   └─ ScopeAccount ── ConnectedAccount
 │                       ├─ ProviderSyncState
 │                       ├─ Conversation
 │                       │   ├─ Message
 │                       │   │   └─ Attachment
 │                       │   └─ ActionItem
 │                       │       ├─ ProvenanceReference
 │                       │       ├─ TemporalContract
 │                       │       │   └─ TemporalTrigger
 │                       │       └─ LifecycleTransition
 │                       ├─ Draft
 │                       └─ SendOperation
 │
 ├─ Pin
 └─ UserPreference

AIInterpretationRun -> Message/Conversation -> candidate facts -> ActionItem rules
SearchDocument -> derived projection of authorized domain data
AuditEvent -> cross-cutting durable evidence
```

The exact foreign-key directions may be tuned, but ownership semantics must remain clear.

---

## 3. User

Represents one Lunowa product user.

Suggested conceptual fields:

```text
User {
  id
  primary_identity
  locale
  timezone
  created_at
  updated_at
}
```

### Invariants

- Every ConnectedAccount belongs to exactly one Lunowa User unless a future shared-team model is explicitly designed.
- Every user-owned entity must be authorization-checkable back to User without relying on AI or client-supplied ownership claims.
- `timezone` is important for Temporal Contract and Send Later display/interpretation. Persist timestamps internally in an unambiguous absolute representation; retain relevant source timezone/context separately when needed.

---

## 4. Scope

A Scope is a user-understandable grouping such as:

- `仕事`
- `個人`
- `大学`

Internal historical term `Space` should not leak into UI unless deliberately reintroduced.

Suggested fields:

```text
Scope {
  id
  user_id
  name
  icon_or_kind?
  sort_order
  created_at
  updated_at
}
```

### Rules

- Scope defines **where to look**.
- Lifecycle/state filters define **what to look at**.
- A user may have one account and no visible scope-switching UI even if a default internal Scope exists.
- `全体` can be a virtual aggregate scope rather than a persisted row.

---

## 5. ScopeAccount

Join between Scope and ConnectedAccount.

```text
ScopeAccount {
  scope_id
  connected_account_id
  created_at
}
```

### Initial rule

An account SHOULD normally belong to one primary user-created Scope to keep mental boundaries predictable. If later product evidence supports multi-membership, change deliberately rather than assuming it now.

---

## 6. ConnectedAccount

Represents one connected provider mailbox identity.

```text
ConnectedAccount {
  id
  user_id
  provider                 // gmail | microsoft | future
  provider_account_id      // stable provider/user mailbox identifier
  email_address
  display_name?
  connection_state         // active | needs_reconnect | revoked | error | removed
  granted_capabilities     // normalized capability set, not raw provider scopes as domain API
  credential_reference     // server-side secure reference; never browser-visible
  last_successful_sync_at?
  created_at
  updated_at
}
```

### Invariants

- `(user_id, provider, provider_account_id)` is unique.
- Credentials/tokens are sensitive implementation state and must not be exposed through normal product APIs.
- Removing a ConnectedAccount from Lunowa does **not** delete the provider mailbox.
- Provider connection failure affects that account; unrelated accounts remain usable.

---

## 7. ProviderSyncState

Owns provider-specific incremental synchronization position and reconciliation status.

```text
ProviderSyncState {
  connected_account_id
  cursor_or_delta_token_encrypted_or_opaque?
  sync_generation
  status                    // idle | syncing | degraded | resync_required | error
  last_attempt_at?
  last_success_at?
  last_full_reconcile_at?
  last_error_code?
  updated_at
}
```

Provider-specific cursor material should remain encapsulated at the integration boundary.

### Invariants

- One current sync state per ConnectedAccount.
- Invalid cursor/token must transition to a reconciliation path rather than silently stopping sync forever.
- Sync cursor advancement must not claim success before the local changes needed for correctness are durably committed.

---

## 8. Conversation

Normalized display/thread grouping.

```text
Conversation {
  id
  connected_account_id
  provider_thread_id?
  normalized_subject?
  semantic_topic?
  first_message_at
  last_message_at
  last_inbound_at?
  last_outbound_at?
  derived_attention_state?    // cache/projection only
  derived_primary_action_item_id?
  created_at
  updated_at
}
```

### Critical invariant

`Conversation` MUST NOT own a single authoritative lifecycle enum that pretends to represent all obligations inside the thread.

Conversation-level state is a derived projection from Action Items.

### Cross-account conversation grouping

Do not merge provider threads across accounts in the initial model merely because participants/subjects look similar. Cross-account semantic grouping is a later feature and creates identity/safety ambiguity.

---

## 9. Message

Normalized provider message / communication event.

```text
Message {
  id
  conversation_id
  connected_account_id
  provider_message_id
  provider_thread_id?
  direction                 // inbound | outbound
  sender_identity
  recipient_identities
  cc_identities?
  bcc_identities?           // only where available/appropriate
  subject
  text_body?
  sanitized_html_body?
  sent_at_or_received_at
  provider_received_at?
  read_state?
  mailbox_state_snapshot?
  raw_provider_metadata?    // minimal boundary/debug metadata only
  created_at
  updated_at
}
```

### Invariants

- `(connected_account_id, provider_message_id)` is unique.
- Re-ingesting the same provider message updates/reconciles instead of creating duplicates.
- Raw HTML must be sanitized before rendering.
- Message content is untrusted data for both browser rendering and AI context.
- Provider state snapshot is a cache, not the authority if it can become stale.

---

## 10. Attachment

```text
Attachment {
  id
  message_id
  provider_attachment_id?
  filename
  mime_type
  size_bytes?
  content_disposition?
  content_reference          // provider reference or Lunowa object-store reference
  content_hash?              // optional when useful
  preview_state?
  created_at
}
```

### Rules

- Do not persist provider attachment bytes by default if metadata + on-demand fetch satisfies the product.
- Lunowa-owned object storage may be required for new compose uploads before send.
- Attachment bytes are untrusted input.

---

## 11. ParticipantIdentity / Person projection

A lightweight normalized identity may be useful for Person Context and recipient autocomplete.

```text
ParticipantIdentity {
  id
  user_id
  canonical_email
  display_name?
  organization_name?
  last_seen_at?
  derived_metadata?
}
```

This is **not** a CRM contact/deal object.

### Authority

Email addresses and message headers are communication evidence. Organization/role facts inferred by AI are derived and need provenance/confidence when shown as remembered facts.

---

## 12. ActionItem

The central workflow unit.

```text
ActionItem {
  id
  user_id
  conversation_id
  goal
  state
  next_owner
  next_action?
  deadline_at?
  deadline_timezone_or_source_context?
  attention_level
  confidence
  risk
  source_kind                // ai | deterministic | user | mixed
  user_override_state?       // if explicit override semantics are needed
  active
  completed_at?
  created_at
  updated_at
}
```

### 12.1 LifecycleState

Canonical initial values:

```text
OPEN
ACTION_REQUIRED
DEFERRED
WAITING
FOLLOW_UP
COMPLETED
UNCERTAIN
```

### 12.2 NextOwner

```text
USER
OTHER_PARTY
BOTH
EXTERNAL_EVENT
NONE
UNKNOWN
```

### 12.3 AttentionLevel

```text
NONE
LOW
NORMAL
HIGH
CRITICAL
```

### 12.4 Confidence

Do not assume one scalar confidence is sufficient forever. Initial implementation may have a coarse overall confidence plus field-level confidence in interpretation records.

Conceptually:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

or a bounded numerical value if evaluation/calibration supports it.

### 12.5 Risk

Risk represents product harm if the state/action is wrong, not model confidence.

Example conceptual levels:

```text
LOW
NORMAL
HIGH
```

A high-confidence inference can still be high-risk and require conservative behavior.

### Critical invariants

- One Conversation may have zero, one, or many Action Items.
- ActionItem state transitions occur through lifecycle/domain logic, not arbitrary UI/database writes.
- `deadline_at` must preserve enough source/provenance context to explain it.
- Completing one Action Item does not automatically complete the entire Conversation.
- New communication can reopen/replace/create Action Items after a prior completion.

---

## 13. ProvenanceReference

Connects a durable product fact/action to evidence.

```text
ProvenanceReference {
  id
  action_item_id?
  interpretation_run_id?
  message_id
  evidence_type             // requested_action | deadline | completion | waiting | topic | other
  quote_start_or_locator?   // implementation-specific locator, not necessarily raw quote storage
  quote_excerpt?            // minimal if needed for UI; respect retention/privacy
  field_name?
  created_at
}
```

### Requirements

- A user should be able to jump from important inferred facts to the source message where practical.
- Provenance is especially important for deadline, completion, waiting, and action-required claims.
- Do not store unnecessary duplicate full message bodies in provenance records.

---

## 14. AIInterpretationRun

Represents one versioned model interpretation of normalized communication/context.

```text
AIInterpretationRun {
  id
  user_id
  conversation_id?
  message_id?
  schema_version
  model_config_version
  provider_model_identifier
  status                    // succeeded | invalid_output | failed | timeout | skipped
  candidate_facts_json      // validated structured output, not arbitrary raw prose
  latency_ms?
  usage_metadata?
  created_at
}
```

Optional/raw model output retention should be minimal and justified.

### Invariants

- `candidate_facts_json` is not authoritative lifecycle state.
- Structured output must be schema validated before use.
- Authorization-filtered input only.
- Model/config version should be traceable for regressions.

---

## 15. LifecycleTransition

Durable explanation/history for meaningful ActionItem changes.

```text
LifecycleTransition {
  id
  action_item_id
  from_state?
  to_state
  reason_code
  actor_kind                // system_rule | user | provider_event | admin_repair
  source_event_id?
  interpretation_run_id?
  occurred_at
}
```

### Purpose

Allows support/debug/trust questions such as:

- Why did this become `待ち`?
- Why did it reopen?
- Was this user-corrected or AI-derived?

Not every incidental field change needs a transition row; lifecycle-affecting changes do.

---

## 16. TemporalContract

A persisted promise governing when an Action Item can leave/return to attention.

```text
TemporalContract {
  id
  user_id
  action_item_id
  status                    // active | fired | cancelled | superseded | completed
  contract_kind             // active_obligation | passive_waiting | other
  created_by                // user | rule | user_confirmed_rule
  version
  activated_at
  resolved_at?
  created_at
  updated_at
}
```

### Active vs passive

- **Active obligation:** the user still owes an action. Automatic hiding should be conservative and initially may require user approval.
- **Passive waiting:** user has acted and waits on another party/event. More automation is safer.

---

## 17. TemporalTrigger

Executable trigger belonging to a Temporal Contract.

```text
TemporalTrigger {
  id
  temporal_contract_id
  trigger_type              // TIME | REPLY_RECEIVED | DEADLINE | future
  trigger_at?               // required for time-based trigger
  status                    // active | claimed | fired | cancelled | superseded | failed
  idempotency_key
  fired_at?
  failure_count
  last_error_code?
  created_at
  updated_at
}
```

### Initial MVP trigger types

```text
TIME
REPLY_RECEIVED
DEADLINE
```

### Invariants

- Active time triggers have durable `trigger_at`.
- Trigger execution is idempotent.
- A trigger is checked against the current contract version/state before acting.
- Cancelling/superseding a contract invalidates its old triggers.
- Overdue active triggers are discoverable for reconciliation after downtime.

---

## 18. ResurfacingEvent

Records a product-level return to attention.

```text
ResurfacingEvent {
  id
  action_item_id
  temporal_contract_id?
  trigger_id?
  reason_code
  attention_before?
  attention_after
  created_at
}
```

This is distinct from an OS/browser notification. Resurfacing may mean:

- state update only;
- quiet list visibility;
- move into attention list;
- user notification.

Notification strength is an attention-policy decision, not a property of every trigger.

---

## 19. Pin

User-controlled override for easy retrieval.

```text
Pin {
  user_id
  conversation_id
  created_at
}
```

### Invariants

- Pin is orthogonal to lifecycle state.
- State changes do not remove a Pin.
- User explicitly removes it.

---

## 20. Draft

Lunowa-persisted draft state.

```text
Draft {
  id
  user_id
  connected_account_id
  conversation_id?
  mode                      // new | reply | reply_all | forward
  in_reply_to_message_id?
  recipients
  cc
  bcc
  subject
  body_format
  body
  signature_state?
  status                    // editing | scheduled | sending | sent | discarded | error
  version                   // optimistic concurrency/autosave
  created_at
  updated_at
}
```

### Invariants

- Draft survives ordinary navigation/layout changes.
- Autosave updates must not silently overwrite a newer edit from another active client without conflict handling.
- Sending account is explicit.
- Draft deletion/discard semantics are distinct from provider mailbox deletion.

Provider-native draft synchronization may be added later if product requirements justify complexity; Lunowa local draft authority is sufficient for the first vertical slice unless a provider constraint requires otherwise.

---

## 21. DraftAttachment / Upload

For files added in Lunowa before send:

```text
DraftAttachment {
  id
  draft_id
  filename
  mime_type
  size_bytes
  storage_reference
  upload_status
  created_at
}
```

Storage lifecycle must delete abandoned uploads according to retention policy.

---

## 22. SendOperation

Durable side-effect workflow for Send Now / Undo Send / Send Later.

```text
SendOperation {
  id
  user_id
  draft_id
  connected_account_id
  idempotency_key
  kind                      // immediate | undo_delay | scheduled
  status                    // pending | cancellable | dispatching | provider_accepted | reconciled | cancelled | failed
  scheduled_for?
  cancellable_until?
  provider_result_id?
  provider_message_id?
  attempt_count
  last_error_code?
  created_at
  updated_at
}
```

### Invariants

- `idempotency_key` unique within appropriate user/account boundary.
- Repeated request for the same operation must not cause duplicate sends.
- Once irreversible provider dispatch is confirmed, Lunowa must not falsely advertise generic recall unless separately implemented.
- Send Later operations are recoverable after scheduler/worker downtime.

---

## 23. ProviderMutationOperation

Optional generalized durable record if archive/read/trash/spam mutations require retry/reconciliation beyond direct request/response.

Do not create this abstraction preemptively if direct provider operations are simple/reliable enough for v1.

If introduced:

```text
ProviderMutationOperation {
  id
  connected_account_id
  target_kind
  target_provider_id
  mutation_kind
  idempotency_key?
  status
  attempt_count
  created_at
  updated_at
}
```

---

## 24. SearchDocument

Derived search projection.

```text
SearchDocument {
  id
  user_id
  scope_keys
  source_type               // conversation | message | person | attachment
  source_id
  searchable_text
  metadata
  projection_version
  updated_at
}
```

Actual implementation may use relational full-text indexes rather than a literal table.

### Invariants

- Rebuildable from authoritative domain data.
- Never bypass current authorization when returning results.
- Scope membership changes must be reflected/re-authorized even if the search projection is stale.

---

## 25. UserPreference

Non-critical preferences such as:

- appearance;
- density;
- preferred pane widths;
- default scope;
- reduced AI assistance setting if exposed;
- localization preferences.

Do not mix safety-critical lifecycle rules into generic preference blobs.

---

## 26. AuditEvent

Cross-cutting audit/support record for materially important actions that do not fit LifecycleTransition alone.

```text
AuditEvent {
  id
  user_id
  event_type
  entity_type
  entity_id
  actor_kind
  reason_code?
  metadata_minimal
  occurred_at
}
```

Potential events:

- account connected/reconnected/removed;
- Temporal Contract created/changed/cancelled/fired;
- send scheduled/cancelled/dispatched/failed;
- user corrected Action Item state;
- security-sensitive account action.

Avoid turning AuditEvent into indiscriminate full-content logging.

---

## 27. Conversation aggregate projection

The UI needs one primary status/chip per Conversation even though workflow authority lives in Action Items.

Define a deterministic projection such as:

```text
ConversationAttentionProjection {
  conversation_id
  primary_action_item_id?
  user_facing_state
  attention_level
  nearest_deadline?
  derived_at
}
```

This may be materialized/cached or computed.

### Initial ordering concept

A starting ordering may be:

```text
FOLLOW_UP
> ACTION_REQUIRED
> DEFERRED
> WAITING
> COMPLETED
```

but this is **not** sufficient by itself: deadline/attention can affect priority. The actual reducer should be tested against representative scenarios before being frozen.

---

## 28. State-transition examples

### New inbound request

```text
Message(inbound)
 -> interpretation: user requested to submit document by 8/22
 -> ActionItem(ACTION_REQUIRED, next_owner=USER, deadline=8/22)
```

### User defers

```text
ACTION_REQUIRED
 -> user approves deferral / rule allows deferral
 -> DEFERRED
 -> TemporalContract(active)
 -> TIME trigger + optional REPLY trigger
```

### Contract fires

```text
DEFERRED
 -> trigger claimed
 -> current state validated
 -> ACTION_REQUIRED
 -> ResurfacingEvent
```

### User sends requested item

```text
send reconciled
 -> completion signal for user's requested action
 -> WAITING, next_owner=OTHER_PARTY
 -> optional passive TemporalContract for reply/follow-up
```

### No reply

```text
WAITING
 -> passive timeout trigger
 -> FOLLOW_UP
 -> suggested follow-up draft may be prepared
```

### Completion

```text
WAITING or FOLLOW_UP
 -> strong explicit completion evidence / user confirmation
 -> COMPLETED
```

### Reopen

```text
COMPLETED
 -> new relevant inbound request
 -> new ActionItem or existing ActionItem re-opened according to goal identity
```

Do not assume every new message mutates the same Action Item.

---

## 29. Deletion and retention semantics

Physical retention rules are not yet finalized, but the model must distinguish:

- provider message deleted at provider;
- message no longer visible because scope/filter changed;
- Lunowa cached copy awaiting reconciliation/retention cleanup;
- user removed account from Lunowa;
- user deleted Lunowa-specific metadata such as Pin/Temporal Contract;
- user requested product/account data deletion.

Do not overload one `deleted` boolean across these semantics.

---

## 30. Concurrency/versioning requirements

At minimum, explicitly protect:

- draft autosave/version conflicts;
- ActionItem lifecycle updates racing with new provider messages;
- Temporal Contract update/cancel racing with trigger execution;
- duplicate provider ingestion;
- SendOperation retries/client double-submit;
- account reconnect/resync racing with ordinary incremental sync.

Use database uniqueness constraints, transactions, compare-and-set/version fields, or locking only where justified by the specific invariant.

---

## 31. Physical-schema implementation rule

When implementing the first real schema:

1. start from these ownership/invariants;
2. use the chosen relational database's native constraints where appropriate;
3. avoid polymorphic JSON blobs for core relationships simply to move faster;
4. JSON is acceptable for provider-specific opaque metadata and versioned AI candidate facts when schema evolution benefits outweigh query constraints;
5. add indexes from actual query flows: account sync, conversation list, ActionItem attention/deadline, active triggers, drafts, send operations, search;
6. keep migrations reversible/staged when user data already exists.

Any implementation change that removes a high-value invariant above should update this document or be rejected.