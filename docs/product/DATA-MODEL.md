# Lunowa Data Model

## Status

**Accepted conceptual model, reconciled with Responsibility v0.1; physical schema is not yet frozen.**

This document defines durable data concepts, ownership, relationships, and invariants that should constrain implementation. Table names, child-table choices, SQL types, indexes, ORM syntax, and exact enums may change during schema design as long as the accepted semantics remain intact.

Responsibility semantics are constrained by:

- `responsibility/README.md`;
- `responsibility/DECISIONS.md`;
- `responsibility/CONSISTENCY-AUDIT.md`;
- `responsibility/SCENARIO-SCHEMA.md`;
- `responsibility/TRANSITION-SCHEMA.md`.

Related broader sources:

- `ARCHITECTURE.md`;
- `CONTRACTS.md`;
- `../design/INTERACTIONS.md`.

---

## 1. Modeling principles

1. **Conversation is not the workflow unit.** A Conversation may contain zero, one, or many Responsibilities.
2. **Preserve evidence layers.** Original communication, provider/external observations, AI interpretation, accepted domain state, safe action, and UI projection are distinct.
3. **Keep Responsibility dimensions orthogonal.** Resolution, live tracking, attention/defer, obligation/actionability, expected events, temporal facts, uncertainty, and risk are not one lifecycle enum.
4. **Provider facts and Lunowa product state have distinct authorities.** Authority is field-specific, not one global trust ranking.
5. **Persist durable promises.** Temporal Contracts/scheduled sends are durable records, not inferred UI state.
6. **Preserve provenance.** Decision-critical facts/state should resolve to source evidence/trusted observations.
7. **Support idempotency/reconciliation.** Provider ingestion and sends tolerate retries/duplicates/ambiguous outcomes.
8. **Derived projections are disposable.** Search indexes, summaries, conversation status, embeddings, and similar projections are rebuildable.
9. **Keep accepted AI state versioned.** Stale interpretation runs must not mutate current evidence revisions.
10. **Do not build a generic workflow engine.** Model only the semantic structures required by the validated Responsibility cases.

---

## 2. Entity overview

Conceptual ownership/relationships:

```text
User
 ├─ Scope
 │   └─ ScopeAccount ── ConnectedAccount
 │                       ├─ ProviderSyncState
 │                       ├─ Conversation
 │                       │   ├─ Message
 │                       │   │   └─ Attachment
 │                       │   └─ Responsibility
 │                       │       ├─ ProvenanceReference
 │                       │       ├─ FieldDecision / correction history
 │                       │       ├─ ResponsibilityTransition
 │                       │       └─ TemporalContract
 │                       │           └─ TemporalTrigger
 │                       ├─ Draft
 │                       └─ SendOperation
 │
 ├─ Pin
 └─ UserPreference

AIInterpretationRun
  -> authorized Message/Conversation evidence
  -> validated candidate interpretation
  -> deterministic/trusted Responsibility reduction

SearchDocument -> derived projection of authorized domain data
AuditEvent     -> cross-cutting durable evidence
```

`Responsibility` may physically use child rows, embedded structured columns, or another minimal relational representation for obligation legs/events/criteria. This diagram is semantic, not a mandated table graph.

---

## 3. User

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

Invariants:

- every ConnectedAccount belongs to exactly one Lunowa User until a future shared-team model is explicitly designed;
- every user-owned entity is authorization-checkable back to User without AI/client ownership claims;
- internal timestamps use unambiguous absolute representation while source/reference timezone/context is retained when semantically relevant.

---

## 4. Scope

User-understandable grouping such as `仕事`, `個人`, `大学`.

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

Rules:

- Scope defines **where to look**;
- Responsibility projections define **what requires attention**;
- one-account users need not understand scope UI;
- `全体` may be a virtual aggregate rather than a row.

---

## 5. ScopeAccount

```text
ScopeAccount {
  scope_id
  connected_account_id
  created_at
}
```

Initial rule: an account normally belongs to one primary user-created Scope. Multi-membership requires later product evidence.

---

## 6. ConnectedAccount

```text
ConnectedAccount {
  id
  user_id
  provider                 // gmail | microsoft | future
  provider_account_id
  email_address
  display_name?
  connection_state
  granted_capabilities
  credential_reference
  last_successful_sync_at?
  created_at
  updated_at
}
```

Invariants:

- `(user_id, provider, provider_account_id)` unique;
- credentials/tokens never appear through normal browser/product APIs;
- removing a ConnectedAccount does not delete provider mailbox data;
- one account failure must not unnecessarily disable unrelated accounts.

---

## 7. ProviderSyncState

```text
ProviderSyncState {
  connected_account_id
  cursor_or_delta_token_encrypted_or_opaque?
  sync_generation
  status
  last_attempt_at?
  last_success_at?
  last_full_reconcile_at?
  last_error_code?
  updated_at
}
```

Invariants:

- one current sync state per account;
- invalid cursor/token enters explicit reconciliation rather than silent empty success;
- cursor advancement does not claim success before required local changes are durably committed.

---

## 8. Conversation

Normalized provider/display thread grouping.

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
  derived_attention_state?          // cache/projection only
  derived_primary_responsibility_id?
  created_at
  updated_at
}
```

Critical invariants:

- Conversation MUST NOT own one authoritative Responsibility lifecycle/state;
- aggregate state is derived from Responsibilities;
- do not initially merge provider threads across accounts merely from participant/subject similarity.

---

## 9. Message

Normalized communication evidence.

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
  bcc_identities?
  subject
  text_body?
  sanitized_html_body?
  sent_at_or_received_at
  provider_received_at?
  read_state?
  mailbox_state_snapshot?
  raw_provider_metadata?
  created_at
  updated_at
}
```

Invariants:

- `(connected_account_id, provider_message_id)` unique;
- re-ingestion reconciles instead of duplicating;
- raw HTML/content is untrusted for rendering and AI context;
- provider mailbox snapshots may become stale and are reconcilable;
- actually sent/received source content remains immutable evidence even when derived normalization/interpretation changes.

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
  content_reference
  content_hash?
  preview_state?
  created_at
}
```

Rules:

- provider attachment presence/metadata is authoritative for that observed provider message, not for unrelated semantic claims;
- do not persist provider bytes by default if metadata/on-demand fetch is sufficient;
- Lunowa object storage may be needed for compose uploads;
- bytes are untrusted input.

---

## 11. ParticipantIdentity / Person projection

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

This is not a CRM deal/contact pipeline.

Message headers are communication evidence. AI-inferred organization/role facts are derived and require provenance/appropriate uncertainty when material.

---

## 12. Responsibility

The central communication-bounded operational workflow concept.

Responsibility identity follows the **smallest communication-bounded operational outcome with a coherent closure condition**.

Conceptual parent shape:

```text
Responsibility {
  id
  user_id
  conversation_id
  connected_account_id

  operational_outcome

  resolution_status          // semantic dimension; exact enum not frozen
  resolution_reason?

  live_tracking_state        // semantic dimension; exact enum not frozen
  attention_mode             // semantic dimension; exact enum not frozen

  risk?

  created_at
  resolved_at?
  updated_at
}
```

### 12.1 Resolution is not satisfaction

Conceptual reasons may include:

```text
SATISFIED
DECLINED
CANCELLED
SUPERSEDED
USER_CLOSED
INVALIDATED
DUPLICATE
```

Exact enum names remain open.

### 12.2 Live tracking is separate

A historical item may be evidence-relative `OPEN` while inactive as current work.

```text
resolution_status = OPEN
live_tracking_state = historical/inactive candidate
```

must be representable semantically without flooding `My Turn`.

### 12.3 Attention is separate

Intentional snooze/defer is independent of resolution/live activation.

A communication hold waiting on another party/event is not automatically `LATER`.

### Critical invariants

- one Conversation may have zero/one/many Responsibilities;
- completing one Responsibility does not complete the Conversation;
- field changes occur through trusted domain reduction/user commands, not arbitrary UI writes;
- state remains explainable via provenance/history;
- new evidence may update, reopen, supersede, invalidate, or create an episode according to operational identity;
- cross-account semantic auto-merge is prohibited initially.

---

## 13. ObligationLeg

Canonical semantic concept for an action obligation that belongs to a Responsibility.

A physical child table is **not mandated**, but implementation must preserve equivalent semantics where cases require them.

```text
ObligationLeg {
  id
  responsibility_id
  bearer
  action
  object?
  status
  actionability
  basis
  authority_status?
  condition?
  temporal_fact_ref?
  created_at
  satisfied_at?
  updated_at
}
```

Why this exists:

- parallel required signers;
- future contingent obligations;
- safety-blocked/unverified requested actions;
- user leg satisfied while other-party leg remains open.

`active user obligation` is a derived subset, not the complete canonical model.

Do not use scalar `BOTH` to erase individual legs or ambiguity.

---

## 14. ExpectedEvent

Represents an event/response the Responsibility is waiting for.

```text
ExpectedEvent {
  id
  responsibility_id
  actor_or_source
  event_kind
  status
  condition?
  temporal_fact_ref?
  activates_obligation_leg_id?
  provenance
}
```

The activation relationship is semantic; exact physical representation may instead place a condition on the obligation leg.

---

## 15. CompletionCriterion

Represents multiple conditions that jointly close one operational outcome without creating artificial independent Responsibilities.

```text
CompletionCriterion {
  id
  responsibility_id
  criterion_kind_or_description
  status
  provenance?
  satisfied_at?
}
```

Example: identity-document FRONT + BACK are usually criteria in one Responsibility.

Exact storage representation remains open.

---

## 16. Constraint / proposal / agreed-fact semantics

Some Responsibilities require structured semantics beyond an action leg:

```text
Constraint {
  responsibility_id
  kind_or_expression
  condition_or_anchor?
  status
  provenance
}

PendingProposal {
  responsibility_id
  proposed_term
  status
  provenance
}

AgreedFact {
  responsibility_id
  value
  provenance
}
```

These are conceptual shapes, not mandates for separate tables.

Key rules:

- prohibition/hold constraint is not a normal next action;
- proposal is not agreement;
- pending terms become agreed facts only with adequate acceptance evidence.

---

## 17. TemporalFact

Do not model all time as one `deadline_at`.

Conceptual semantic kinds include:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
RESURFACE_TIME
FOLLOW_UP_TIME
```

```text
TemporalFact {
  id
  responsibility_id
  semantic_kind
  original_expression
  resolved_value?
  precision
  timezone_or_reference_frame?
  external_anchor_ref?
  applies_to_ref?
  provenance
  created_at
  updated_at
}
```

Rules:

- never silently increase source precision;
- external anchor resolution is derived and may change when the anchor changes;
- user target/resurface does not overwrite external source due;
- source legitimacy/safety uncertainty does not invent a new temporal kind;
- material time values retain source/reference provenance.

---

## 18. ProvenanceReference

```text
ProvenanceReference {
  id
  responsibility_id?
  interpretation_run_id?
  message_id?
  trusted_event_id?
  evidence_type
  locator_or_source_span?
  excerpt_minimal?
  field_name?
  created_at
}
```

Requirements:

- decision-critical fields/actions are traceable to source/trusted observations where practical;
- do not duplicate unnecessary full message bodies;
- model confidence does not waive provenance.

---

## 19. FieldDecision / user correction

User authority is field-scoped rather than one whole-item override state.

Conceptual shape:

```text
FieldDecision {
  id
  responsibility_id
  field
  value
  authority                // user | trusted rule | etc.
  basis_evidence_revision
  provenance?
  created_at
  superseded_at?
}
```

Physical representation may be simpler if the implementation supports only a small fixed set of corrections initially.

A correction to one field must not freeze unrelated fields forever.

---

## 20. AIInterpretationRun

```text
AIInterpretationRun {
  id
  user_id
  conversation_id?
  message_id?
  schema_version
  model_config_version
  provider_model_identifier
  basis_evidence_revision
  status
  candidate_facts_json
  latency_ms?
  usage_metadata?
  created_at
}
```

Invariants:

- candidate output is not authoritative Responsibility state;
- output is schema-validated before reduction;
- input is authorization-filtered;
- model/config/schema/basis revision are traceable;
- a stale basis revision may be retained for diagnostics but cannot mutate current state.

---

## 21. ResponsibilityTransition

Durable explanation/history for meaningful Responsibility effects/field changes.

```text
ResponsibilityTransition {
  id
  responsibility_id
  operation                 // CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP when recorded
  reason_code
  actor_kind
  source_event_id?
  interpretation_run_id?
  evidence_revision?
  occurred_at
}
```

A focal event may produce multiple effects across multiple Responsibilities; the event/effect model must not assume one scalar operation globally.

`SUPERSEDE` is terminal on the old Responsibility and conceptually yields `RESOLVED/SUPERSEDED`. Replacement creation is a separate effect.

Not every incidental field write requires a transition row; meaningful domain changes should remain explainable.

---

## 22. TemporalContract

Persisted product promise governing attention/reconsideration, not a replacement for Responsibility resolution semantics.

```text
TemporalContract {
  id
  user_id
  responsibility_id
  status                    // exact enum open
  contract_kind             // active-obligation defer | passive waiting | other
  created_by
  version
  activated_at
  resolved_at?
  created_at
  updated_at
}
```

Active user obligations require more conservative auto-hiding than passive waiting.

Communication hold/pause is not itself a TemporalContract defer decision.

---

## 23. TemporalTrigger

```text
TemporalTrigger {
  id
  temporal_contract_id
  trigger_type              // TIME | REPLY_RECEIVED | DEADLINE | future
  trigger_at?
  status
  idempotency_key
  fired_at?
  failure_count
  last_error_code?
  created_at
  updated_at
}
```

Invariants:

- time triggers are durable;
- execution idempotent;
- current contract version/state is checked before effect;
- cancel/supersede invalidates stale triggers;
- overdue triggers are discoverable/reconcilable;
- trigger firing re-evaluates current Responsibility evidence before projection/actionability changes.

---

## 24. ResurfacingEvent

```text
ResurfacingEvent {
  id
  responsibility_id
  temporal_contract_id?
  trigger_id?
  reason_code
  attention_before?
  attention_after?
  created_at
}
```

Resurfacing is distinct from OS/browser notification. Notification strength is a separate attention-policy decision.

---

## 25. Pin

```text
Pin {
  user_id
  conversation_id
  created_at
}
```

Pin is orthogonal to Responsibility state and survives Responsibility changes until user removes it.

---

## 26. Draft

```text
Draft {
  id
  user_id
  connected_account_id
  conversation_id?
  mode
  in_reply_to_message_id?
  recipients
  cc
  bcc
  subject
  body_format
  body
  signature_state?
  status
  version
  created_at
  updated_at
}
```

Draft survives ordinary navigation. Sending account is explicit. Autosave must not silently overwrite a newer concurrent edit.

---

## 27. DraftAttachment / Upload

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

Abandoned uploads follow explicit retention cleanup.

---

## 28. SendOperation

```text
SendOperation {
  id
  user_id
  draft_id
  connected_account_id
  idempotency_key
  kind                      // immediate | undo_delay | scheduled
  status                    // pending | cancellable | dispatching | ambiguous | provider_accepted | reconciled | cancelled | failed
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

Invariants:

- idempotency prevents duplicate sends;
- ambiguous provider acceptance is not blindly retried;
- provider-reconciled send is distinct from send attempt;
- reconciliation closes a Responsibility only when successful sending is sufficient evidence for its operational closure condition;
- sending identity remains explicit.

---

## 29. ProviderMutationOperation

Optional durable record if archive/read/trash/spam operations eventually require retry/reconciliation beyond direct calls.

Do not introduce it preemptively.

---

## 30. SearchDocument

Derived search projection, whether represented literally as a table or through database full-text facilities.

```text
SearchDocument {
  id
  user_id
  scope_keys
  source_type
  source_id
  searchable_text
  metadata
  projection_version
  updated_at
}
```

Must be rebuildable and never bypass current authorization.

---

## 31. UserPreference

Non-critical preferences such as appearance, density, pane widths, default scope, localization, and exposed AI-assistance preferences.

Do not put safety-critical Responsibility rules into an opaque generic preference blob.

---

## 32. AuditEvent

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

Useful for account/security/send/scheduler and other cross-cutting actions not captured by ResponsibilityTransition alone.

Avoid indiscriminate full-content logging.

---

## 33. Conversation aggregate projection

The UI may need one primary status/chip although authority lives in multiple Responsibilities.

Conceptually:

```text
ConversationAttentionProjection {
  conversation_id
  primary_responsibility_id?
  user_facing_state          // MY_TURN | WAITING | LATER | DONE | REVIEW | NONE or UI mapping
  attention_level?
  nearest_relevant_time?
  reason_code
  derived_at
}
```

Projection is deterministic/rebuildable.

Primary selection should prefer material actionable user work (especially critical/overdue), then nearest relevant deadline/blocker, rather than newest message or a fixed legacy lifecycle ranking.

Uncertainty in one Responsibility must not disappear because another Responsibility is resolved.

---

## 34. State/effect examples

### New inbound request

```text
Message evidence
 -> REQUEST candidate + source due
 -> admission TRACK
 -> CREATE Responsibility
 -> USER obligation leg actionable
 -> projection MY_TURN
```

### User defers attention

```text
OPEN Responsibility + actionable USER leg
 -> explicit/validated attention defer
 -> TemporalContract + return trigger
 -> attention_mode deferred
 -> projection LATER
```

The external source due remains unchanged.

### User sends requested item but confirmation is part of the outcome

```text
send reconciled
 -> USER send leg satisfied
 -> OTHER expected confirmation remains
 -> Responsibility remains OPEN
 -> projection WAITING
```

### Follow-up trigger

```text
WAITING
 -> trigger fires + current evidence re-evaluated
 -> USER follow-up leg/action becomes actionable
 -> projection MY_TURN
 -> reminder reconciled
 -> OTHER approval/reply remains expected
 -> projection WAITING
```

`FOLLOW_UP` is an action/reason, not a canonical lifecycle enum.

### Hold

```text
counterpart: wait until legal clears
 -> constraint + expected resume/approval event
 -> Responsibility remains OPEN
 -> projection WAITING
```

A separate user/product defer may additionally yield `LATER`.

### Reopen vs new episode

```text
same operational outcome was not actually satisfied
 -> REOPEN same Responsibility

genuinely closed earlier outcome + later new work
 -> CREATE new Responsibility
```

### Supersession

```text
one message withdraws R1 and establishes replacement R2
 -> SUPERSEDE R1
 -> CREATE R2
```

---

## 35. Deletion and retention semantics

Distinguish:

- provider message deletion/unavailability;
- scope/filter invisibility;
- Lunowa cache awaiting reconciliation/retention cleanup;
- connected-account removal;
- deletion of Lunowa metadata such as Pin/TemporalContract;
- user-requested product/account data deletion.

Do not overload one `deleted` boolean.

---

## 36. Concurrency/versioning requirements

Explicitly protect at least:

- draft autosave/version conflicts;
- Responsibility reduction racing with new evidence;
- AI run basis revision becoming stale;
- Temporal Contract update/cancel racing trigger execution;
- duplicate/out-of-order provider ingestion;
- SendOperation retries/client double-submit/ambiguous provider result;
- reconnect/resync racing ordinary incremental sync.

Use uniqueness constraints, transactions, compare-and-set/versioning, or locking only where justified by the invariant.

---

## 37. Physical-schema implementation rule

Before implementing the first real Responsibility schema:

1. start from `responsibility/DECISIONS.md`, `CONSISTENCY-AUDIT.md`, canonical scenarios, and transition oracles;
2. preserve the fixed semantic dimensions while choosing the smallest relational representation that satisfies required queries/invariants;
3. do **not** resurrect the superseded seven-state lifecycle, scalar `BOTH` owner, one `deadline_at`, or whole-item override as canonical truth;
4. use native relational constraints for ownership/idempotency where appropriate;
5. avoid generic polymorphic workflow/EAV structures merely for flexibility;
6. JSON is acceptable for provider-specific opaque metadata and versioned AI candidate facts when appropriate, but not as an excuse to erase core constraints;
7. index actual flows: account sync, conversation list/projection, active Responsibility work, temporal triggers, drafts, sends, search;
8. keep migrations staged/reversible once user data exists;
9. add only the child structures proven necessary by scenario/transition evidence.

An implementation change that removes a high-value invariant must trigger an explicit spec/decision update rather than silently changing the model.