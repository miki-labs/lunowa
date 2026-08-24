# Tier 0 Detailed Responsibility Oracles — Batch 3

## Status

**Accepted detailed-oracle expansion for Responsibility v0.1.**

This batch expands ten schema-falsifier cases chosen specifically to attack the current hybrid physical-model candidate rather than merely increase the detailed-oracle count.

Expanded cases:

```text
T0-003 — outbound USER request creates OTHER obligation
T0-004 — outbound USER commitment creates USER obligation
T0-026 — external source due vs independent USER target
T0-029 — same unsatisfied operational outcome REOPENs
T0-030 — genuinely closed episode + later work CREATEs a new Responsibility
T0-031 — sequential/conditional steps remain one Responsibility
T0-032 — one message creates two independent Responsibilities
T0-041 — genuinely vague communication requires admission review
T0-043 — missing referent/context requires admission review
T0-044 — optionality/materiality is user-context dependent
```

This batch uses the reconciled semantic vocabulary:

```text
resolution_status
live_tracking_state
attention_mode
obligation_legs[]
expected_events[]
completion_criteria[]
pending_proposals[] / agreed_facts[]
constraints[]
temporal_facts[]
uncertainties[]
provenance[]
```

A new pressure discovered by T0-041/T0-043/T0-044 is recorded explicitly: **an admission-level review item may exist before a canonical Responsibility exists**. That product/domain artifact must not be modeled as a fake Responsibility merely to make `REVIEW` renderable.

---

# 1. Conventions added by this batch

## 1.1 Admission review is pre-Responsibility

For this batch, when:

```text
expected_admission.decision = NEEDS_REVIEW
```

and the uncertainty is about whether a Responsibility should exist at all, the oracle may specify:

```text
expected_admission_review
```

instead of `expected_responsibility`.

Conceptually:

```yaml
expected_admission_review:
  reason_codes: []
  candidate_summary:
  candidate_fields: {}
  evidence_revision:
  provenance: []
  acceptable_resolution_paths: []
```

This is an evaluation concept. It does not freeze a table name.

## 1.2 `REVIEW` has two legitimate sources

Product `REVIEW` can arise from either:

```text
A. an admitted Responsibility with a material decision-critical field conflict/uncertainty
B. an admission-level review candidate where Responsibility existence itself is unresolved
```

These cases must remain distinguishable internally even if they share one user-facing Review surface.

## 1.3 User target is not a user correction

Adding:

```text
USER_TARGET = Thursday
```

does not overwrite:

```text
SOURCE_DUE = Friday
```

and therefore does not require a field-authority override record merely because it came from the user.

Field authority is for explicit correction/override of a canonical field; orthogonal user-owned facts remain their own semantic facts.

## 1.4 One linguistic instruction may remain one bounded obligation leg

A Responsibility need not create one persistent obligation leg per verb. When steps are sequential and operationally cohesive, a bounded composite action may remain one leg unless later evidence proves independent identity/actionability is needed.

This prevents the physical model from turning every sentence into a workflow graph.

---

# 2. T0-003 — Outbound USER request creates an OTHER-party obligation

```yaml
case_id: T0-003
title: outbound request creates an other-party obligation and waiting state
category: direction-request-temporal
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m1

coverage:
  rules: [R07, R23, R27, R44]
  contrasts: [C02]
  interactions: [I201, I205, I206]
  forbidden_sentinels: []

context:
  current_user:
    id: user-1
    email: user@example.com
  connected_accounts:
    - id: acct-work
      provider: gmail
      email: user@example.com
  focal_connected_account: acct-work
  locale: ja-JP
  timezone: Asia/Tokyo
  existing_responsibilities: []

messages:
  - id: m1
    connected_account_id: acct-work
    direction: outbound
    sent_at: 2026-08-24T09:00:00+09:00
    observed_at: 2026-08-24T09:00:02+09:00
    sender: user@example.com
    recipients: [partner@example.com]
    cc: []
    subject: 修正版
    body: "修正版を明日までに送ってください。"
    attachments: []

expected_zoning:
  - message_id: m1
    zone: AUTHORED_CURRENT

expected_communication_acts:
  - type: REQUEST
    speaker: user@example.com
    obligation_bearer: partner@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    object: revised_document
    obligation_strength: REQUIRED
    temporal_expression:
      source_text: "明日までに"
      semantic_kind: SOURCE_DUE
      resolved_value: 2026-08-25
      precision: DATE
    provenance:
      message_id: m1
      source_span: "修正版を明日までに送ってください"

expected_claims: []
expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m1
    connected_account_id: acct-work

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_OUTBOUND_REQUEST
    - OTHER_PARTY_IS_EXPLICIT_OBLIGATION_BEARER
    - USER_RELEVANT_OPEN_LOOP

expected_effects:
  - responsibility_ref: R1
    operation: CREATE
    field_changes:
      - create OTHER_PARTY obligation leg
      - create SOURCE_DUE for that leg

expected_responsibility:
  operational_outcome: receive the requested revised document from partner@example.com
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-other-send
      bearer: OTHER_PARTY
      action: SEND_REVISED_DOCUMENT
      status: OPEN
      actionability: ACTIONABLE_BY_BEARER
      basis: COMMUNICATED_REQUEST
      temporal_fact_ref: due-1
  expected_events:
    - id: event-doc-received
      actor: OTHER_PARTY
      event: REVISED_DOCUMENT_RECEIVED
      status: PENDING
      temporal_fact_ref: due-1
  completion_criteria: []
  constraints: []
  temporal_facts:
    - id: due-1
      semantic_kind: SOURCE_DUE
      original_expression: "明日までに"
      resolved_value: 2026-08-25
      precision: DATE
      applies_to: leg-other-send
      provenance:
        message_id: m1
        source_span: "明日までに"
  uncertainties: []

expected_safety:
  requested_action: REQUEST_OTHER_TO_SEND_REVISED_DOCUMENT
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: WAITING
  primary_reason: no actionable USER leg exists; the counterpart bears the requested obligation

must_hold_invariants:
  - outbound direction does not assign the requested action back to USER
  - SOURCE_DUE can qualify an OTHER_PARTY obligation; temporal kind is not synonymous with USER deadline
  - send/reply account remains acct-work
  - request evidence and due remain provenance-grounded

forbidden_outcomes:
  - create USER obligation to send the revised document
  - project MY_TURN merely because USER authored the message
  - reinterpret the due as USER_TARGET
  - mark the loop complete merely because the request email was sent
```

### Schema pressure

No new physical structure is required. The existing normalized obligation-leg and expected-event candidate supports this case. `TemporalFact.kind=SOURCE_DUE` must be linkable to a non-USER leg.

---

# 3. T0-004 — Outbound USER commitment creates a USER obligation

```yaml
case_id: T0-004
title: outbound firm commitment creates a user obligation whose communicated time remains source-grounded
category: direction-commitment-temporal
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R07, R09, R23, R27, R44]
  contrasts: [C02, C03]
  interactions: [I201, I202, I206]
  metamorphic_relations: [MR06]
  forbidden_sentinels: [H03]

context:
  current_user:
    id: user-1
    email: user@example.com
  connected_accounts:
    - id: acct-work
      provider: gmail
      email: user@example.com
  focal_connected_account: acct-work
  locale: ja-JP
  timezone: Asia/Tokyo
  existing_responsibilities: []

messages:
  - id: m1
    connected_account_id: acct-work
    direction: outbound
    sender: user@example.com
    recipients: [partner@example.com]
    sent_at: 2026-08-24T09:00:00+09:00
    observed_at: 2026-08-24T09:00:02+09:00
    subject: 修正版
    body: "修正版を明日送ります。"
    attachments: []

expected_communication_acts:
  - type: COMMITMENT
    speaker: user@example.com
    obligation_bearer: user@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    modality: FIRM
    temporal_expression:
      source_text: "明日"
      semantic_kind: SOURCE_DUE
      resolved_value: 2026-08-25
      precision: DATE
    provenance:
      message_id: m1
      source_span: "修正版を明日送ります"

expected_claims:
  - type: COMMUNICATED_FUTURE_COMMITMENT
    claimant: USER
    content: send revised document on 2026-08-25
    authority_scope: what USER publicly promised

expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m1

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_OUTBOUND_USER_COMMITMENT
    - USER_IS_OBLIGATION_BEARER

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: fulfill the user's communicated promise to send the revised document
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-user-send
      bearer: USER
      action: SEND_REVISED_DOCUMENT
      status: OPEN
      actionability: ACTIONABLE
      basis: COMMUNICATED_COMMITMENT
      temporal_fact_ref: due-1
  expected_events: []
  completion_criteria: []
  constraints: []
  temporal_facts:
    - id: due-1
      semantic_kind: SOURCE_DUE
      original_expression: "明日"
      resolved_value: 2026-08-25
      precision: DATE
      applies_to: leg-user-send
      provenance:
        message_id: m1
        source_span: "明日"
  uncertainties: []

expected_projection:
  bucket: MY_TURN
  primary_reason: USER publicly committed to an unresolved future action

must_hold_invariants:
  - user-sent commitment text is source evidence for what USER promised
  - unspoken private intent cannot replace the communicated date
  - the same surface phrase inbound from OTHER would produce a different bearer/projection
  - sending the commitment message is not fulfillment of the promised future send

forbidden_outcomes:
  - assign the obligation to OTHER_PARTY because the user is waiting for a future date
  - mark R1 resolved when the commitment itself is sent
  - rewrite the communicated due based on a hidden personal target
```

### Schema pressure

This case strengthens the distinction between `USER_TARGET` and a source-grounded commitment time. A user-authored fact is not automatically a private preference; it can be authoritative external-facing source evidence.

---

# 4. T0-026 — External source due and USER target coexist

```yaml
case_id: T0-026
title: user target augments rather than overwrites an external source due
category: temporal-user-intent-field-authority
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: null

coverage:
  rules: [R23, R28, R29]
  contrasts: [C18]
  interactions: [I225]
  mutants_killed: [M15]
  forbidden_sentinels: [H04]

context:
  current_user:
    id: user-1
  existing_responsibilities:
    - id: R1
      operational_outcome: submit requested report
      resolution_status: OPEN
      live_tracking_state: TRACKING_ACTIVE
      obligation_legs:
        - id: leg-submit
          bearer: USER
          action: SUBMIT_REPORT
          status: OPEN
      temporal_facts:
        - id: due-source
          semantic_kind: SOURCE_DUE
          original_expression: "金曜まで"
          resolved_value: 2026-08-28
          precision: DATE

input_event:
  kind: USER_COMMAND
  payload:
    action: SET_PERSONAL_TARGET
    responsibility_id: R1
    value: 2026-08-27
    original_expression: "木曜までに終わらせたい"

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_RESPONSIBILITY

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - add USER_TARGET temporal fact

expected_responsibility:
  operational_outcome: submit requested report
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-submit
      bearer: USER
      action: SUBMIT_REPORT
      status: OPEN
      temporal_fact_ref: due-source
  temporal_facts:
    - id: due-source
      semantic_kind: SOURCE_DUE
      original_expression: "金曜まで"
      resolved_value: 2026-08-28
      precision: DATE
      status: CURRENT
    - id: target-user
      semantic_kind: USER_TARGET
      original_expression: "木曜までに終わらせたい"
      resolved_value: 2026-08-27
      precision: DATE
      status: CURRENT
      authority: USER
  uncertainties: []

expected_projection:
  bucket: MY_TURN
  primary_reason: USER still bears the open submission obligation

must_hold_invariants:
  - SOURCE_DUE remains Friday
  - USER_TARGET remains Thursday
  - both may be used for ordering/planning but answer different questions
  - adding USER_TARGET is not a correction of SOURCE_DUE
  - no field-override record is required solely because a separate USER_TARGET exists

forbidden_outcomes:
  - change SOURCE_DUE to Thursday
  - mark Friday superseded
  - create a new Responsibility merely to represent the personal target
  - treat USER_TARGET as evidence that the counterpart communicated Thursday
```

### Schema pressure

This case **narrows the responsibility of `ResponsibilityFieldDecision`**. The field-decision structure should represent explicit authority/correction decisions, not every user-authored semantic fact. `USER_TARGET` belongs in `TemporalFact` with USER provenance/authority.

---

# 5. T0-029 — Same unsatisfied operational outcome REOPENs

```yaml
case_id: T0-029
title: later failure evidence reopens the same delivery outcome without erasing prior history
category: identity-reopen-completion-evidence
oracle_type: DETERMINATE
risk_class: CRITICAL
focal_message_id: m-failure

coverage:
  rules: [R16, R39, R41]
  contrasts: [C20]
  interactions: [I210, I211]
  transitions: [T10]
  mutants_killed: [M37]
  forbidden_sentinels: [H01, H02]

context:
  current_user:
    id: user-1
  existing_responsibilities:
    - id: R1
      operational_outcome: deliver a usable signed contract to the counterpart
      resolution_status: RESOLVED
      resolution_reason: SATISFIED
      live_tracking_state: TRACKING_ACTIVE
      obligation_legs:
        - id: leg-send-original
          bearer: USER
          action: SEND_SIGNED_CONTRACT
          status: SATISFIED
      provenance:
        - provider reconciliation previously established accepted send under then-available closure policy

messages:
  - id: m-failure
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "添付が壊れて開けません。再送お願いします。"

expected_communication_acts:
  - type: INFORMATION
    action_or_event: REPORT_DELIVERY_FAILURE
    object: signed_contract_attachment
  - type: REQUEST
    obligation_bearer: USER
    action_or_event: RESEND_USABLE_SIGNED_CONTRACT

expected_claims:
  - type: COMMUNICATED_FAILURE_CLAIM
    fact: prior delivered artifact unusable

expected_admission:
  decision: TRACK
  reason_codes:
    - SAME_OPERATIONAL_OUTCOME_NOT_ACTUALLY_SATISFIED
    - EXPLICIT_FAILURE_EVIDENCE

expected_effects:
  - responsibility_ref: R1
    operation: REOPEN
    field_changes:
      - resolution_status RESOLVED -> OPEN
      - preserve prior resolution event/history
      - add remedial USER resend obligation leg

expected_responsibility:
  operational_outcome: deliver a usable signed contract to the counterpart
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-send-original
      bearer: USER
      action: SEND_SIGNED_CONTRACT
      status: SATISFIED
    - id: leg-resend-remedial
      bearer: USER
      action: RESEND_USABLE_SIGNED_CONTRACT
      status: OPEN
      actionability: ACTIONABLE
      basis: FAILURE_EVIDENCE
  expected_events: []
  completion_criteria: []
  uncertainties: []

expected_projection:
  bucket: MY_TURN
  primary_reason: the same operational outcome is unresolved again and USER now owes a remedial resend

must_hold_invariants:
  - Responsibility identity R1 is preserved
  - prior resolved event/history remains auditable
  - prior send leg need not be rewritten from SATISFIED back to OPEN; a new remedial leg may represent the new current action
  - REOPEN means the operational closure condition was not actually satisfied, not merely that the topic returned

forbidden_outcomes:
  - CREATE a new independent Responsibility solely for the same failed delivery outcome
  - erase prior resolution/send provenance
  - keep R1 DONE despite explicit material failure evidence
  - rewrite historical leg status merely to make current projection easier
```

### Schema pressure

This case supports append-like obligation-leg history inside one aggregate. It argues **against** modeling reopen as a reversible lifecycle scalar that rewinds every prior child row.

---

# 6. T0-030 — Genuinely closed prior episode + later work CREATEs R2

```yaml
case_id: T0-030
title: genuinely closed first-draft review remains closed when later final-version review is requested
category: identity-new-episode
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m3

coverage:
  rules: [R17]
  contrasts: [C20]
  interactions: [I210, I211]
  transitions: [T11]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: review first draft
      resolution_status: RESOLVED
      resolution_reason: SATISFIED
      live_tracking_state: TRACKING_ACTIVE

messages:
  - id: m3
    direction: inbound
    sender: partner@example.com
    body: "別件ですが、最終版もレビューお願いします。"

expected_communication_acts:
  - type: REQUEST
    obligation_bearer: USER
    action_or_event: REVIEW_FINAL_VERSION
    object: final_version

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_NEW_OPERATIONAL_OUTCOME
    - PRIOR_EPISODE_GENUINELY_CLOSED

expected_effects:
  - responsibility_ref: R2
    operation: CREATE

expected_responsibility:
  id: R2
  operational_outcome: review the final version
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-review-final
      bearer: USER
      action: REVIEW_FINAL_VERSION
      status: OPEN
  provenance:
    - message_id: m3

expected_projection:
  bucket: MY_TURN

must_hold_invariants:
  - R1 remains RESOLVED
  - R2 receives a distinct opaque identity
  - topic/participants similarity cannot reopen R1 by itself
  - no broad project-level Responsibility is invented to merge all future reviews

forbidden_outcomes:
  - REOPEN R1 solely because the same project/participants are involved
  - mutate R1 operational outcome from first-draft review to final-version review
  - merge R1/R2 via embedding or subject similarity
```

### Schema pressure

No additional parent episode table is justified. The Responsibility row itself is the operational episode. A future relation such as `related_to` may be added only if product evidence proves it useful; identity correctness does not require it here.

---

# 7. T0-031 — Sequential conditional work remains one Responsibility

```yaml
case_id: T0-031
title: cohesive review-then-if-acceptable-sign-return instruction remains one bounded Responsibility
category: identity-sequential-conditional
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R02, R03, R20]
  contrasts: [C21]
  interactions: [I211]
  mutants_killed: [M01, M32]

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "契約書を確認し、問題なければ署名して返送してください。"
    attachments: [agreement.pdf]

expected_communication_acts:
  - type: REQUEST
    obligation_bearer: USER
    action_or_event: REVIEW_AND_IF_ACCEPTABLE_SIGN_RETURN
    object: agreement.pdf
    condition: SIGN_RETURN only if review outcome is acceptable

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_SEQUENTIAL_COHESIVE_REQUEST
    - ONE_OPERATIONAL_CLOSURE

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: disposition the contract review and, if acceptable, return the signed contract
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-contract-disposition
      bearer: USER
      action: REVIEW_AND_IF_ACCEPTABLE_SIGN_RETURN
      status: OPEN
      actionability: ACTIONABLE
      basis: COMMUNICATED_REQUEST
  constraints:
    - id: c1
      type: CONDITIONAL_ACTION
      condition: REVIEW_RESULT_ACCEPTABLE
      governed_action: SIGN_AND_RETURN
  completion_criteria: []
  uncertainties: []

expected_safety:
  requested_action: REVIEW_AND_IF_ACCEPTABLE_SIGN_RETURN
  safe_next_action: REVIEW_CONTRACT
  confirmation_or_review_required: true

expected_projection:
  bucket: MY_TURN
  primary_reason: USER must begin by reviewing the contract

must_hold_invariants:
  - sequential verbs do not automatically imply separate Responsibilities
  - one bounded obligation leg may represent a cohesive conditional instruction without a generic workflow graph
  - signing remains a separate high-impact safe-action decision even though it belongs to the same operational outcome
  - if review finds a problem, the reducer may derive a different current safe action without changing Responsibility identity

forbidden_outcomes:
  - CREATE separate Responsibilities for review/sign/return solely because three verbs appear
  - expose SIGN as the immediate safe CTA before review
  - resolve after merely opening the attachment
  - create a generic condition-expression engine for this single bounded condition
```

### Schema pressure

This case prevents `obligation_legs` from degenerating into “one database row per verb.” It supports keeping bounded local condition detail in typed semantic details while the current actionable obligation remains relational/queryable.

---

# 8. T0-032 — One message creates two independent Responsibilities

```yaml
case_id: T0-032
title: one message with two independently completable outcomes creates two Responsibilities
category: multiplicity-split-composite-effects
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R02, R03, R15]
  contrasts: [C21, C22]
  interactions: [I229]
  mutants_killed: [M01, M32]
  forbidden_sentinels: [H07]

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "契約書を確認してください。来週の候補日も3つください。"
    attachments: [contract.pdf]

expected_communication_acts:
  - id: a1
    type: REQUEST
    obligation_bearer: USER
    action_or_event: REVIEW_CONTRACT
    object: contract.pdf
  - id: a2
    type: REQUEST
    obligation_bearer: USER
    action_or_event: PROVIDE_THREE_AVAILABILITY_OPTIONS
    object: next_week_availability

expected_admission:
  decision: TRACK
  reason_codes:
    - TWO_INDEPENDENT_OPERATIONAL_OUTCOMES

expected_effects:
  - responsibility_ref: R1
    operation: CREATE
    field_changes:
      - operational_outcome=review contract
  - responsibility_ref: R2
    operation: CREATE
    field_changes:
      - operational_outcome=provide three availability options

expected_responsibilities:
  - id: R1
    operational_outcome: review contract.pdf
    resolution_status: OPEN
    live_tracking_state: TRACKING_ACTIVE
    obligation_legs:
      - id: leg-review
        bearer: USER
        action: REVIEW_CONTRACT
        status: OPEN
    provenance:
      - message_id: m1
        source_span: "契約書を確認してください"
  - id: R2
    operational_outcome: provide three availability options for next week
    resolution_status: OPEN
    live_tracking_state: TRACKING_ACTIVE
    obligation_legs:
      - id: leg-dates
        bearer: USER
        action: PROVIDE_THREE_AVAILABILITY_OPTIONS
        status: OPEN
    provenance:
      - message_id: m1
        source_span: "来週の候補日も3つください"

expected_projection:
  bucket: MY_TURN
  primary_reason: Conversation contains two open USER-owned Responsibilities; Moment selection policy chooses one primary at a time

must_hold_invariants:
  - one Message may create multiple Responsibilities
  - both Responsibilities can point provenance to the same source message without sharing identity
  - completing R1 must not complete R2
  - Conversation projection must still expose remaining work when either R1 or R2 resolves

forbidden_outcomes:
  - collapse both independent outcomes into one giant Responsibility merely because they share one message
  - create only one Responsibility and lose the other request
  - completing review marks availability request Done
```

### Schema pressure

This case validates multi-aggregate effects from one source event and makes normalized provenance/correlation useful. It does not require a message-to-Responsibility join table beyond the existing provenance model unless query evidence later justifies one.

---

# 9. T0-041 — Genuine vague communication creates admission review, not a fake Responsibility

```yaml
case_id: T0-041
title: genuinely vague phrase preserves admission uncertainty without inventing an action
category: ambiguity-admission
oracle_type: AMBIGUOUS
risk_class: NORMAL
focal_message_id: m1

coverage:
  rules: [R45, R47, R48]
  interactions: [I228]
  ambiguity_families: [O01]
  mutants_killed: [M25]
  forbidden_sentinels: [H15]

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "来週よろしくお願いします。"

expected_communication_acts:
  - type: INFORMATION_OR_INDIRECT_REQUEST_CANDIDATE
    speaker: partner@example.com
    action_or_event: UNKNOWN
    communicative_force: AMBIGUOUS
    provenance:
      message_id: m1
      source_span: "来週よろしくお願いします"

expected_admission:
  decision: NEEDS_REVIEW
  reason_codes:
    - SOURCE_AMBIGUITY
    - MATERIALITY_UNRESOLVED
    - ACTION_UNRESOLVED

expected_effects: []

expected_admission_review:
  reason_codes:
    - SOURCE_AMBIGUITY
    - ACTION_UNRESOLVED
  candidate_summary: possible future expectation exists, but no grounded operational action can be admitted
  candidate_fields:
    temporal_expression: "来週"
    action: UNKNOWN
    bearer: UNKNOWN
  provenance:
    - message_id: m1
      source_span: "来週よろしくお願いします"
  acceptable_resolution_paths:
    - contextual evidence later supports TRACK -> CREATE Responsibility
    - trusted context shows formulaic/nonmaterial -> DO_NOT_TRACK
    - user explicitly resolves the ambiguity

expected_projection:
  bucket: REVIEW
  primary_reason: admission itself is unresolved; there is no accepted canonical Responsibility yet

must_hold_invariants:
  - do not invent a concrete action from `よろしくお願いします`
  - do not invent an exact deadline from `来週`
  - admission review is not a Responsibility row with fake UNKNOWN state
  - review UI may surface the candidate while canonical Responsibility count remains zero

forbidden_outcomes:
  - create USER obligation with fabricated action
  - create exact date/time
  - mark DO_NOT_TRACK solely because wording is polite/vague
  - create an admitted Responsibility merely to have something to render in Review
```

### Schema pressure

This is the strongest new physical-model pressure in Batch 3. A surfaced admission-review result needs durable accepted product state **before Responsibility creation**. It cannot live inside `Responsibility.semantic_details_jsonb` because no Responsibility is admitted yet.

---

# 10. T0-043 — Missing referent/context creates admission review

```yaml
case_id: T0-043
title: missing referent is missing context, not a license to fabricate a Responsibility
category: missing-context-admission
oracle_type: AMBIGUOUS
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R45, R47]
  interactions: [I228]
  ambiguity_families: [O07]

context:
  authorized_external_context:
    - prior referent intentionally unavailable in ContextEnvelope

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "それでお願いします。"

expected_communication_acts:
  - type: DECISION_OR_REQUEST_CANDIDATE
    speaker: partner@example.com
    action_or_event: UNKNOWN
    object: UNKNOWN_REFERENT
    communicative_force: UNRESOLVED_DUE_TO_MISSING_CONTEXT
    provenance:
      message_id: m1
      source_span: "それでお願いします"

expected_admission:
  decision: NEEDS_REVIEW
  reason_codes:
    - MISSING_CONTEXT
    - REFERENT_UNRESOLVED

expected_effects: []

expected_admission_review:
  reason_codes:
    - MISSING_CONTEXT
  candidate_summary: current utterance depends on a missing referent and cannot ground an operational outcome
  candidate_fields:
    referent: UNKNOWN
    action: UNKNOWN
    bearer: UNKNOWN
  provenance:
    - message_id: m1
      source_span: "それでお願いします"
  acceptable_resolution_paths:
    - retrieve authorized prior context and re-evaluate the same evidence revision lineage
    - user supplies/resolves referent
    - dismiss if trusted context establishes no trackable Responsibility

expected_projection:
  bucket: REVIEW
  primary_reason: required context is missing, so Responsibility admission cannot be completed safely

must_hold_invariants:
  - classify the cause as MISSING_CONTEXT rather than SOURCE_AMBIGUITY when the absent context could resolve it
  - context retrieval must respect account/scope authorization
  - no operational outcome exists until the referent is grounded
  - later context enrichment may create a Responsibility without rewriting m1

forbidden_outcomes:
  - invent the referent from unrelated same-subject/thread similarity
  - create an action/object without evidence
  - use unauthorized cross-account context to resolve the referent
  - permanently DO_NOT_TRACK merely because the first context envelope was incomplete
```

### Schema pressure

A durable admission-review item needs an evidence/context revision so later authorized context can resolve it idempotently. This strengthens the case for a narrow pre-admission review record rather than using an AI run as product truth.

---

# 11. T0-044 — User-dependent optionality/materiality

```yaml
case_id: T0-044
title: optional wording remains user-context dependent when relationship convention is unspecified
category: user-dependent-admission-pragmatics
oracle_type: USER_DEPENDENT
risk_class: NORMAL
focal_message_id: m1

coverage:
  rules: [R06, R08, R45, R47, R48]
  interactions: [I310]
  ambiguity_families: [O02, O03]
  mutants_killed: [M28]

context:
  current_user:
    id: user-1
  authorized_external_context:
    - no trusted relationship convention for this sender is supplied

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "お時間があれば目を通しておいてください。"

expected_communication_acts:
  - type: REQUEST
    speaker: partner@example.com
    obligation_bearer_candidate: USER
    action_or_event: REVIEW_MATERIAL
    obligation_strength: OPTIONAL_OR_EXPECTED_DEPENDING_ON_AUTHORIZED_RELATIONSHIP_CONTEXT
    provenance:
      message_id: m1
      source_span: "お時間があれば目を通しておいてください"

expected_admission:
  decision: NEEDS_REVIEW
  reason_codes:
    - USER_DEPENDENT_MATERIALITY
    - RELATIONSHIP_CONVENTION_UNAVAILABLE

expected_effects: []

expected_admission_review:
  reason_codes:
    - USER_DEPENDENT_MATERIALITY
  candidate_summary: the communicative act is review-like, but whether Lunowa should track it depends on an authorized user/relationship convention not universal language truth
  candidate_fields:
    action: REVIEW_MATERIAL
    obligation_strength: USER_DEPENDENT
  provenance:
    - message_id: m1
      source_span: "お時間があれば目を通しておいてください"
  acceptable_resolution_paths:
    - known user convention says such requests are expected -> TRACK
    - known user convention says such mail is optional/FYI -> DO_NOT_TRACK
    - no convention -> remain review candidate or use conservative product policy

expected_projection:
  bucket: REVIEW
  primary_reason: product tracking relevance is user-dependent even though the public communicative act can be described

must_hold_invariants:
  - politeness/softening does not automatically mean OPTIONAL
  - do not infer speaker's hidden private intent as fact
  - authorized user convention may affect product admission without rewriting source communication
  - relationship policy belongs outside immutable source facts

forbidden_outcomes:
  - universal TRACK because the phrase contains `ください`
  - universal DO_NOT_TRACK because the phrase contains `お時間があれば`
  - assert that the sender secretly requires completion without evidence
  - mutate source wording/obligation strength history after user preference is learned
```

### Schema pressure

The product may eventually maintain sender/user communication preferences, but this case does **not** justify embedding a general relationship-policy engine in Responsibility. Admission-review persistence should store the unresolved product decision; external user preference/context may resolve it.

---

# 12. Cross-case conclusions from Batch 3

The ten cases jointly establish the following physical/modeling constraints:

```text
1. Source due may belong to USER or OTHER obligation legs.
2. User-authored commitment evidence can create source-grounded USER obligations.
3. USER_TARGET is an orthogonal fact, not a field correction.
4. REOPEN preserves Responsibility identity/history without rewinding every prior child record.
5. Genuine later work gets a new Responsibility row; no broad project episode is required.
6. Obligation legs are not one-row-per-verb workflow nodes.
7. One source event can CREATE multiple independent Responsibilities.
8. Admission-level REVIEW can exist before any Responsibility exists.
9. Missing-context review needs durable revision/provenance, not model-run ephemera.
10. User-dependent product admission must not rewrite public source meaning.
```

The eighth result materially changes the preferred physical boundary.

---

# 13. New physical-model pressure — Admission Review

The current Responsibility aggregate cannot represent T0-041/T0-043/T0-044 without one of three bad choices:

```text
A. create fake Responsibilities with UNKNOWN state
B. treat AIInterpretationRun candidate output as product truth
C. introduce a narrow accepted pre-admission review artifact
```

A is rejected because `NEEDS_REVIEW` means Responsibility existence itself is unresolved.

B is rejected because model output is candidate interpretation, may be stale/versioned, and must not become authoritative product state merely because it can be queried.

Therefore **C is the preferred candidate**.

Conceptual minimum:

```text
ResponsibilityAdmissionReview {
  id
  user_id
  conversation_id
  connected_account_id

  status
  reason_codes
  candidate_summary_jsonb

  evidence_revision
  source_event_key
  interpretation_run_id?

  admitted_responsibility_id?

  created_at
  resolved_at?
}
```

Key invariants:

```text
- it is not a Responsibility;
- it carries provenance/evidence revision;
- duplicate evidence does not create duplicate review items;
- resolving it to TRACK may CREATE a Responsibility;
- resolving it to DO_NOT_TRACK does not require a fake resolved Responsibility;
- stale AI cannot rewrite a user-resolved admission decision;
- Review UI may combine these items with admitted Responsibilities that have field-level review conditions, but internal identity/type remains explicit.
```

Exact table/enum names remain open.

---

# 14. Physical-model falsification result after Batch 3

The prior hybrid candidate still survives, but its boundary should now be read as:

```text
accepted Responsibility domain:
  responsibilities
  responsibility_obligation_legs
  responsibility_expected_events
  responsibility_temporal_facts
  responsibility_field_decisions
  responsibility_provenance_refs
  responsibility_domain_events
  semantic_details_jsonb

pre-admission accepted review domain:
  responsibility_admission_reviews   # candidate name only

separate evidence/inference domain:
  messages/provider observations
  AI interpretation runs
```

This is still substantially smaller and safer than either:

```text
a fake Responsibility for every ambiguous email
```

or:

```text
a generic workflow/collaboration engine
```

---

# 15. Detailed-oracle progress

Before this batch:

```text
18 / 44 base Tier-0 cases fully layered
```

After this batch:

```text
28 / 44 base Tier-0 cases fully layered
```

Remaining base cases:

```text
T0-005..008
T0-011..013
T0-018..025
T0-027/028/034/036/037/039 are already in the first critical batch
T0-042
```

The next batch should prioritize the remaining language/interpretation cases that can still falsify persistence boundaries:

```text
commitment-force ladder
preference/review/approval
material request vs courtesy
direct assignment vs CC
quote/forward zoning
sarcasm/non-literal ambiguity
```

If those do not require new canonical persistence structures, the physical model will be close to schema-freeze review.