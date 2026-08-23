# Tier 0 Detailed Responsibility Oracles — Batch 4

## Status

**Accepted detailed-oracle expansion for the final sixteen Tier-0 base cases.**

This batch completes full layered design coverage for all 44 Tier-0 base semantic oracles.

Expanded cases:

```text
T0-005..008 — plan / intention / tentative intention / capability
T0-011..013 — preference / review / approval
T0-018..019 — material polite request / courtesy
T0-020..021 — direct assignment / CC-only recipient
T0-022..025 — authored / quoted / forwarded source authority
T0-042      — sarcasm / non-literal ambiguity
```

The purpose of this batch is not just corpus completion. These cases are the final planned schema falsifiers before a persistence-boundary freeze review.

The batch uses the reconciled vocabulary from `SCENARIO-SCHEMA.md` and preserves the distinction:

```text
communication understanding
!= admission
!= accepted Responsibility state
!= safety/actionability
!= projection
```

---

# 1. Findings introduced by this batch

## 1.1 Not every interpreted semantic distinction needs a new persisted Responsibility field

The commitment-force ladder proves that Lunowa must **understand and preserve**:

```text
firm commitment
plan
intention
tentative intention
capability
```

without automatically creating five lifecycle states or five kinds of obligation rows.

A distinction belongs in accepted Responsibility state only when it materially changes the current obligation/expected-event/actionability semantics. Otherwise the accepted interpretation/provenance layer may preserve it without duplicating it into canonical workflow state.

## 1.2 Expected-event basis may need a qualifier, not a new entity

When an existing Responsibility is already waiting for a revised document, a counterpart's:

```text
"明日送る予定です"
```

may legitimately refine the expected event to an expected date with `PLAN` basis.

By contrast:

```text
"来週なら送れそうです"
```

is capability/feasibility evidence and MUST NOT be silently promoted into a promised expected event.

The physical pressure is therefore a qualifier such as `basis_kind` / `expectation_strength` on an accepted expected event when needed, not a new workflow table.

## 1.3 Approval meaning and authority are orthogonal

`承認します` can be semantically an approval/decision while still failing to resolve a Responsibility if the speaker lacks authority to satisfy the required approval.

Therefore:

```text
communicative force = APPROVAL
!=
authoritative event satisfaction
```

The expected-event/reducer boundary already has the right place for this check.

## 1.4 DO_NOT_TRACK does not require a fake durable Review object

A determinate courtesy/FYI case may end at:

```text
interpretation -> DO_NOT_TRACK
```

with no Responsibility and no AdmissionReview.

AdmissionReview is for accepted product review state when the admission decision itself remains unresolved and must be surfaced/resolved.

## 1.5 Provenance can be compositional across source zones

Cases such as:

```text
current authored: "これお願いします。"
quoted/forwarded content: identifies what "これ" means
```

show that one accepted semantic fact may depend on multiple source spans with different roles.

The current-author span supplies **communicative force**; quoted/forwarded material may supply **referent/object/context**.

This does not require a new source entity, but provenance references should be able to distinguish support roles when explanation/re-evaluation needs it.

## 1.6 CC/recipient membership is evidence, not obligation state

Direct addressee/CC facts belong to message/provider evidence and interpretation. They do not justify a persistent `is_owner` flag independent of accepted obligation semantics.

## 1.7 Sarcasm/non-literal ambiguity fits the pre-admission Review boundary

T0-042 does not require a sarcasm state or sentiment workflow. When literal and plausible non-literal readings reverse a decision-critical obligation conclusion, Lunowa should preserve the ambiguity and avoid fabricating a firm Responsibility until sufficient evidence exists.

---

# 2. T0-005 — Plan is not a firm commitment

```yaml
case_id: T0-005
title: counterpart plan refines expectation without becoming a firm promise
category: commitment-force-plan
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-plan

coverage:
  rules: [R09, R27]
  contrasts: [C04, C05]
  interactions: [I202]
  mutants_killed: [M09]

context:
  current_user:
    id: user-1
  existing_responsibilities:
    - id: R1
      operational_outcome: receive revised document from counterpart
      resolution_status: OPEN
      live_tracking_state: TRACKING_ACTIVE
      obligation_legs:
        - id: leg-other-send
          bearer: OTHER_PARTY
          action: SEND_REVISED_DOCUMENT
          status: OPEN
      expected_events:
        - id: event-revised-doc
          actor: OTHER_PARTY
          event: REVISED_DOCUMENT_RECEIVED
          status: PENDING

messages:
  - id: m-plan
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "修正版を明日送る予定です。"

expected_communication_acts:
  - type: COMMITMENT
    communicative_force: PLAN
    speaker: partner@example.com
    obligation_bearer: partner@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    modality: PLANNED
    temporal_expression:
      source_text: "明日"
      semantic_kind: EXPECTED_EVENT_TIME
      precision: DATE
    provenance:
      message_id: m-plan
      source_span: "修正版を明日送る予定です"

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_RESPONSIBILITY, MATERIAL_EXPECTATION_UPDATE]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - expected-event timing/basis may be refined as planned, not firm

expected_responsibility:
  operational_outcome: receive revised document from counterpart
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-other-send
      bearer: OTHER_PARTY
      action: SEND_REVISED_DOCUMENT
      status: OPEN
  expected_events:
    - id: event-revised-doc
      actor: OTHER_PARTY
      event: REVISED_DOCUMENT_RECEIVED
      status: PENDING
      basis_kind: PLAN
      expectation_strength: PLANNED
      temporal_fact_ref: expected-time-plan
  temporal_facts:
    - id: expected-time-plan
      semantic_kind: EXPECTED_EVENT_TIME
      original_expression: "明日"
      precision: DATE
      basis_kind: PLAN
      provenance:
        message_id: m-plan
        source_span: "明日"
  uncertainties: []

expected_projection:
  bucket: WAITING
  primary_reason: existing OTHER-party delivery remains pending; plan does not create USER work

must_hold_invariants:
  - plan is preserved as weaker than firm commitment
  - the word "明日" does not create a USER deadline
  - existing Responsibility identity remains R1

forbidden_outcomes:
  - upgrade modality to FIRM
  - create a new Responsibility solely for the plan statement
  - resolve because a plan was announced
```

### Physical pressure

No new table. If current product behavior needs the distinction, `ExpectedEvent` may carry a narrow `basis_kind/expectation_strength` qualifier. Do not introduce a lifecycle state `PLANNED`.

---

# 3. T0-006 — Intention is not plan or firm commitment

```yaml
case_id: T0-006
title: stated intention remains weaker than a firm promise
category: commitment-force-intention
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-intention

coverage:
  rules: [R09, R27]
  contrasts: [C05, C06]
  interactions: [I202]
  mutants_killed: [M09]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: receive revised document from counterpart
      resolution_status: OPEN
      obligation_legs:
        - id: leg-other-send
          bearer: OTHER_PARTY
          action: SEND_REVISED_DOCUMENT
          status: OPEN
      expected_events:
        - id: event-revised-doc
          actor: OTHER_PARTY
          event: REVISED_DOCUMENT_RECEIVED
          status: PENDING

messages:
  - id: m-intention
    direction: inbound
    sender: partner@example.com
    body: "修正版を明日送ろうと思っています。"

expected_communication_acts:
  - type: COMMITMENT
    communicative_force: INTENTION
    speaker: partner@example.com
    obligation_bearer: partner@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    modality: INTENDED
    temporal_expression:
      source_text: "明日"
      semantic_kind: EXPECTED_EVENT_TIME
      precision: DATE

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_RESPONSIBILITY, MATERIAL_EXPECTATION_EVIDENCE]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - preserve intention evidence without strengthening to firm promise

expected_responsibility:
  operational_outcome: receive revised document from counterpart
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-other-send
      bearer: OTHER_PARTY
      action: SEND_REVISED_DOCUMENT
      status: OPEN
  expected_events:
    - id: event-revised-doc
      actor: OTHER_PARTY
      event: REVISED_DOCUMENT_RECEIVED
      status: PENDING
      basis_kind: INTENTION
      expectation_strength: INTENDED
  uncertainties: []

expected_projection:
  bucket: WAITING
  primary_reason: existing other-party outcome remains unresolved

must_hold_invariants:
  - intention does not become a firm commitment
  - semantic force is preserved even if the UI bucket remains the same

forbidden_outcomes:
  - normalize INTENTION to FIRM because the future event is plausible
  - create exact automation authority from intention wording
```

### Physical pressure

No new structure. The case validates that projection equality does not justify collapsing semantically distinct evidence.

---

# 4. T0-007 — Tentative intention must not be strengthened

```yaml
case_id: T0-007
title: tentative future orientation remains tentative
category: commitment-force-tentative
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-tentative

coverage:
  rules: [R09, R27]
  contrasts: [C06]
  interactions: [I202]
  metamorphic_relations: [MR12]
  mutants_killed: [M09]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: receive revised document from counterpart
      resolution_status: OPEN

messages:
  - id: m-tentative
    direction: inbound
    sender: partner@example.com
    body: "修正版を明日送れればと思っています。"

expected_communication_acts:
  - type: COMMITMENT
    communicative_force: TENTATIVE_INTENTION
    modality: TENTATIVE
    speaker: partner@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    temporal_expression:
      source_text: "明日"
      semantic_kind: EXPECTED_EVENT_TIME
      precision: DATE

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_RESPONSIBILITY, WEAK_EXPECTATION_EVIDENCE]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - preserve tentative expectation evidence if product state retains it

expected_responsibility:
  operational_outcome: receive revised document from counterpart
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  expected_events:
    - id: event-revised-doc
      actor: OTHER_PARTY
      event: REVISED_DOCUMENT_RECEIVED
      status: PENDING
      basis_kind: TENTATIVE_INTENTION
      expectation_strength: TENTATIVE
  uncertainties: []

expected_projection:
  bucket: WAITING
  primary_reason: the existing loop is still waiting; tentative wording is not a stronger promise

must_hold_invariants:
  - tentative wording remains distinguishable from plan/intention/firm commitment
  - no exact product promise is inferred merely from natural-sounding future language

forbidden_outcomes:
  - FIRM commitment classification
  - automatic follow-up schedule justified solely as though tomorrow were guaranteed
```

---

# 5. T0-008 — Capability is not commitment

```yaml
case_id: T0-008
title: feasibility statement does not create a promised future event
category: commitment-force-capability
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-capability

coverage:
  rules: [R09, R27]
  contrasts: [C07]
  interactions: [I202]
  mutants_killed: [M09]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: receive revised document from counterpart
      resolution_status: OPEN
      live_tracking_state: TRACKING_ACTIVE
      expected_events:
        - id: event-revised-doc
          actor: OTHER_PARTY
          event: REVISED_DOCUMENT_RECEIVED
          status: PENDING

messages:
  - id: m-capability
    direction: inbound
    sender: partner@example.com
    body: "来週なら修正版を送れそうです。"

expected_communication_acts:
  - type: INFORMATION
    communicative_force: CAPABILITY_OR_FEASIBILITY
    speaker: partner@example.com
    action_or_event: SEND_REVISED_DOCUMENT
    modality: POSSIBLE
    temporal_expression:
      source_text: "来週なら"
      semantic_kind: AVAILABILITY_OR_FEASIBILITY_CONTEXT

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_RESPONSIBILITY, RELEVANT_FEASIBILITY_EVIDENCE]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - retain capability evidence without asserting promised send time

expected_responsibility:
  operational_outcome: receive revised document from counterpart
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  expected_events:
    - id: event-revised-doc
      actor: OTHER_PARTY
      event: REVISED_DOCUMENT_RECEIVED
      status: PENDING
      temporal_fact_ref: null
  temporal_facts: []
  uncertainties: []

expected_projection:
  bucket: WAITING
  primary_reason: existing expected document remains pending; capability statement is not a promise

must_hold_invariants:
  - capability evidence must not become an accepted promised expected-event time
  - `来週` may remain interpretation/context evidence without becoming a due/expected-event fact

forbidden_outcomes:
  - create EXPECTED_EVENT_TIME=next week as though delivery were promised
  - upgrade capability to commitment
  - resolve or create a new Responsibility because of feasibility language
```

### Physical pressure

This case is important because it sets a **negative persistence boundary**: not every extracted temporal phrase belongs in `responsibility_temporal_facts`.

---

# 6. T0-011 — Preference is not agreement

```yaml
case_id: T0-011
title: expressed preference does not silently accept a pending proposal
category: proposal-preference
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-preference

coverage:
  rules: [R06, R10, R27]
  contrasts: [C09]
  interactions: [I208]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: agree on meeting time
      resolution_status: OPEN
      pending_proposals:
        - id: p1
          value: Friday 17:00
          status: PENDING

messages:
  - id: m-preference
    direction: outbound
    sender: user@example.com
    body: "金曜17時が良いと思います。"

expected_communication_acts:
  - type: INFORMATION
    communicative_force: PREFERENCE
    speaker: USER
    object: Friday 17:00
    modality: OPINION

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_NEGOTIATION_RESPONSIBILITY]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - preserve preference signal if useful; do not promote p1 to agreed fact

expected_responsibility:
  operational_outcome: agree on meeting time
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  pending_proposals:
    - id: p1
      value: Friday 17:00
      status: PENDING
  agreed_facts: []

expected_projection:
  bucket: REVIEW
  primary_reason: preference alone does not prove that an agreement was communicated/accepted

must_hold_invariants:
  - preference and agreement remain distinct
  - no agreed fact exists solely from `良いと思います`

forbidden_outcomes:
  - resolve scheduling negotiation as agreed
  - create authoritative calendar time from preference alone
```

### Physical pressure

No new structure beyond existing pending-proposal/agreed-fact details. Preference need not become a normalized table/entity.

---

# 7. T0-012 — Review commitment is not approval

```yaml
case_id: T0-012
title: user commitment to review does not imply approval
category: action-fidelity-review
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-review

coverage:
  rules: [R06, R27]
  contrasts: [C10]
  interactions: [I202]

context:
  existing_responsibilities:
    - id: R1
      operational_outcome: obtain the user's decision on contract terms
      resolution_status: OPEN

messages:
  - id: m-review
    direction: outbound
    sender: user@example.com
    body: "確認します。"

expected_communication_acts:
  - type: COMMITMENT
    communicative_force: COMMIT_TO_REVIEW
    speaker: USER
    obligation_bearer: USER
    action_or_event: REVIEW_CONTRACT
    modality: FIRM

expected_admission:
  decision: TRACK
  reason_codes: [MATERIAL_USER_COMMITMENT, EXISTING_CONTRACT_LOOP]

expected_effects:
  - responsibility_ref: R1
    operation: UPDATE
    field_changes:
      - add or refine current USER review obligation without recording approval

expected_responsibility:
  operational_outcome: obtain the user's decision on contract terms
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-review
      bearer: USER
      action: REVIEW_CONTRACT
      status: OPEN
      actionability: ACTIONABLE
      basis_kind: COMMUNICATED_COMMITMENT
  agreed_facts: []

expected_projection:
  bucket: MY_TURN
  primary_reason: USER committed to review; no approval decision exists yet

must_hold_invariants:
  - REVIEW does not semantically inflate to APPROVE
  - existing operational outcome remains open

forbidden_outcomes:
  - mark contract approved
  - resolve an approval-required Responsibility
```

---

# 8. T0-013 — Approval semantics still require authority

```yaml
case_id: T0-013
title: explicit approval can satisfy a decision only when authority requirements are met
category: action-fidelity-approval-authority
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-approve

coverage:
  rules: [R06, R13, R27]
  contrasts: [C10]
  interactions: [I202, I213]

context:
  authorized_external_context:
    - fact: USER is authorized approver for this contract decision
      authority_scope: CONTRACT_APPROVAL
  existing_responsibilities:
    - id: R1
      operational_outcome: obtain authorized USER approval for contract terms
      resolution_status: OPEN
      expected_events:
        - id: approval-event
          actor: USER
          event: AUTHORIZED_APPROVAL
          status: PENDING

messages:
  - id: m-approve
    direction: outbound
    sender: user@example.com
    body: "承認します。"

expected_communication_acts:
  - type: DECISION
    communicative_force: APPROVAL
    speaker: USER
    action_or_event: APPROVE_CONTRACT

expected_admission:
  decision: TRACK
  reason_codes: [EXISTING_RESPONSIBILITY, MATERIAL_DECISION]

expected_effects:
  - responsibility_ref: R1
    operation: RESOLVE
    resolution_reason: SATISFIED
    field_changes:
      - satisfy authorized approval event

expected_responsibility:
  operational_outcome: obtain authorized USER approval for contract terms
  resolution_status: RESOLVED
  resolution_reason: SATISFIED
  live_tracking_state: TRACKING_ACTIVE
  expected_events:
    - id: approval-event
      actor: USER
      event: AUTHORIZED_APPROVAL
      status: SATISFIED
      authority_status: VERIFIED
  agreed_facts:
    - id: approved-contract
      kind: APPROVAL_DECISION
      value: APPROVED
      authority_status: VERIFIED

expected_projection:
  bucket: DONE
  primary_reason: required authorized approval was communicated and accepted as satisfying evidence

must_hold_invariants:
  - semantic approval and authority verification are separate checks
  - changing the authorized-context premise could change resolution without changing literal wording

forbidden_outcomes:
  - treat every `承認します` from any sender as authoritative approval
  - collapse review and approval semantics
```

### Physical pressure

No new table. Authority belongs in accepted evidence/reducer policy and target-specific provenance/authority metadata. The case does not justify a generic authorization graph inside Responsibility.

---

# 9. T0-018 — Polite wording does not weaken a material request

```yaml
case_id: T0-018
title: polite business request remains a material user obligation
category: admission-politeness
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-polite

coverage:
  rules: [R06, R08, R27]
  contrasts: [C13]
  interactions: [I202, I203, I310]
  mutants_killed: [M08]

messages:
  - id: m-polite
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    body: "恐れ入りますが、本日中にご提出いただけますでしょうか。"

expected_communication_acts:
  - type: REQUEST
    communicative_force: MATERIAL_REQUEST
    obligation_bearer: USER
    action_or_event: SUBMIT_REQUESTED_ITEM
    obligation_strength: EXPECTED_OR_REQUIRED
    temporal_expression:
      source_text: "本日中に"
      semantic_kind: SOURCE_DUE
      precision: DATE_OR_DAY_WINDOW

expected_admission:
  decision: TRACK
  reason_codes: [MATERIAL_REQUEST, USER_IS_BEARER, EXPLICIT_TIME_EXPECTATION]

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: submit the requested item to the counterpart
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-submit
      bearer: USER
      action: SUBMIT_REQUESTED_ITEM
      status: OPEN
      actionability: ACTIONABLE
  temporal_facts:
    - id: due-today
      semantic_kind: SOURCE_DUE
      original_expression: "本日中に"
      precision: DATE_OR_DAY_WINDOW
      provenance:
        message_id: m-polite
        source_span: "本日中に"

expected_projection:
  bucket: MY_TURN
  primary_reason: polite surface form does not eliminate the material user request

must_hold_invariants:
  - politeness style and obligation strength are independent
  - no fake exact clock time is created from `本日中`

forbidden_outcomes:
  - DO_NOT_TRACK solely because the request is indirect/polite
  - classify as OPTIONAL solely from politeness
```

---

# 10. T0-019 — Courtesy is a valid No-Responsibility result

```yaml
case_id: T0-019
title: courtesy offer does not create task spam
category: admission-courtesy
oracle_type: DETERMINATE
risk_class: LOW
focal_message_id: m-courtesy

coverage:
  rules: [R04, R05, R06]
  contrasts: [C13]
  interactions: [I203]
  mutants_killed: [M03, M04]

messages:
  - id: m-courtesy
    direction: inbound
    sender: partner@example.com
    body: "何かあればお気軽にご連絡ください。"

expected_communication_acts:
  - type: INFORMATION
    communicative_force: COURTESY_OR_OPEN_OFFER
    speaker: partner@example.com
    obligation_strength: OPTIONAL_OR_FORMULAIC

expected_admission:
  decision: DO_NOT_TRACK
  reason_codes: [COURTESY_FORMULA, NO_MATERIAL_OPEN_LOOP]

expected_effects: []
expected_responsibility: null
expected_admission_review: null

expected_projection:
  bucket: NONE
  subject_kind: NONE
  primary_reason: determinate courtesy does not warrant Responsibility or Review state

must_hold_invariants:
  - No Responsibility is a first-class correct result
  - determinate DO_NOT_TRACK does not require a durable AdmissionReview merely for bookkeeping

forbidden_outcomes:
  - CREATE Responsibility
  - create REVIEW item solely because the sentence is request-like
```

### Physical pressure

This prevents `responsibility_admission_reviews` from becoming a log of every rejected candidate. Ordinary rejected AI interpretations can remain in interpretation/eval history without durable product review state.

---

# 11. T0-020 — Direct assignment creates USER obligation

```yaml
case_id: T0-020
title: explicit direct assignment grounds the user obligation bearer
category: assignment-direct
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-direct

coverage:
  rules: [R07, R27]
  contrasts: [C14]
  interactions: [I205, I206]
  metamorphic_relations: [MR07]
  forbidden_sentinels: [H03]

context:
  current_user:
    id: user-sato
    display_name: 佐藤

messages:
  - id: m-direct
    direction: inbound
    sender: manager@example.com
    recipients: [user@example.com]
    body: "佐藤さん、こちらお願いします。"

expected_communication_acts:
  - type: REQUEST
    communicative_force: DIRECT_ASSIGNMENT
    speaker: manager@example.com
    obligation_bearer: USER
    action_or_event: HANDLE_REFERENCED_WORK
    provenance:
      message_id: m-direct
      source_span: "佐藤さん、こちらお願いします"

expected_admission:
  decision: TRACK
  reason_codes: [MATERIAL_DIRECT_ASSIGNMENT, USER_EXPLICITLY_ADDRESSED]

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: complete the work explicitly assigned to the user
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-user-work
      bearer: USER
      action: HANDLE_REFERENCED_WORK
      status: OPEN
      actionability: ACTIONABLE
      basis_kind: DIRECT_REQUEST

expected_projection:
  bucket: MY_TURN
  primary_reason: USER is the explicit obligation bearer

must_hold_invariants:
  - direct assignment evidence supports bearer inference
  - recipient metadata alone is not the only evidence; current authored language matters

forbidden_outcomes:
  - UNKNOWN bearer despite explicit unambiguous assignment
```

---

# 12. T0-021 — CC membership does not create USER ownership

```yaml
case_id: T0-021
title: cc-only user does not inherit a task addressed to another person
category: assignment-cc
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-cc

coverage:
  rules: [R07, R27]
  contrasts: [C14]
  interactions: [I205, I206]
  metamorphic_relations: [MR07]
  mutants_killed: [M07]

context:
  current_user:
    id: user-sato
    display_name: 佐藤

messages:
  - id: m-cc
    direction: inbound
    sender: manager@example.com
    recipients: [tanaka@example.com]
    cc: [user@example.com]
    body: "田中さん、こちらお願いします。"

expected_communication_acts:
  - type: REQUEST
    communicative_force: DIRECT_ASSIGNMENT
    speaker: manager@example.com
    obligation_bearer: tanaka@example.com
    action_or_event: HANDLE_REFERENCED_WORK

expected_admission:
  decision: DO_NOT_TRACK
  reason_codes: [CC_ONLY_USER, REQUEST_ASSIGNED_TO_OTHER, NO_USER_RELEVANT_OPEN_LOOP_IN_SUPPLIED_CONTEXT]

expected_effects: []
expected_responsibility: null

expected_projection:
  bucket: NONE
  subject_kind: NONE
  primary_reason: user is observer/CC only in supplied context

must_hold_invariants:
  - To/CC membership does not itself establish obligation bearer
  - assignment follows communicative force and addressee evidence

forbidden_outcomes:
  - create USER obligation because user@example.com appears in CC
  - create BOTH/parallel ownership without source evidence
```

### Physical pressure

No persistent `recipient_is_owner` field is justified. Provider recipient metadata remains source evidence; accepted bearer belongs on obligation semantics only after admission.

---

# 13. T0-022 — Current authored request may use quoted history as referent context

```yaml
case_id: T0-022
title: current authored request supplies force while quoted history supplies referent context
category: zoning-authored-quoted
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-current

coverage:
  rules: [R04, R27]
  contrasts: [C15]
  interactions: [I204, I214, I303]

messages:
  - id: m-current
    direction: inbound
    sender: manager@example.com
    recipients: [user@example.com]
    body: |
      これお願いします。

      > 先週の依頼: 顧客向けの見積書を作成してください。

expected_zoning:
  - message_id: m-current
    zone: AUTHORED_CURRENT
    span: "これお願いします。"
  - message_id: m-current
    zone: QUOTED_HISTORY
    span: "先週の依頼: 顧客向けの見積書を作成してください。"

expected_communication_acts:
  - type: REQUEST
    communicative_force: CURRENT_REQUEST
    speaker: manager@example.com
    obligation_bearer: USER
    action_or_event: CREATE_CUSTOMER_QUOTATION
    provenance:
      - support_role: COMMUNICATIVE_FORCE
        message_id: m-current
        source_span: "これお願いします"
      - support_role: OBJECT_CONTEXT
        message_id: m-current
        source_span: "顧客向けの見積書を作成してください"
        zone: QUOTED_HISTORY

expected_admission:
  decision: TRACK
  reason_codes: [CURRENT_AUTHORED_MATERIAL_REQUEST, REFERENT_RESOLVED_FROM_QUOTED_CONTEXT]

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: create the customer quotation requested in the current turn
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-create-quote
      bearer: USER
      action: CREATE_CUSTOMER_QUOTATION
      status: OPEN
      actionability: ACTIONABLE
  provenance:
    - role: COMMUNICATIVE_FORCE
      message_id: m-current
      source_span: "これお願いします"
    - role: OBJECT_CONTEXT
      message_id: m-current
      source_span: "顧客向けの見積書を作成してください"
      zone: QUOTED_HISTORY

expected_projection:
  bucket: MY_TURN
  primary_reason: the current sender made a material request directed to USER

must_hold_invariants:
  - quoted text alone does not gain current-turn authority
  - quoted text may legitimately resolve a referent/object for current authored force
  - provenance preserves the distinction between force source and object/context source

forbidden_outcomes:
  - ignore current request because object wording lives in quoted history
  - treat the quoted old request as an independent new current request
  - lose source-zone provenance
```

### Physical pressure

No new entity is required. `ResponsibilityProvenanceReference` should be able to carry a narrow support role such as force/object/context when multiple source spans jointly support one accepted fact.

---

# 14. T0-023 — Quoted request is not recreated by acknowledgement

```yaml
case_id: T0-023
title: acknowledgement plus quoted historical request does not recreate that request
category: zoning-quoted-history
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-ack

coverage:
  rules: [R04, R05, R27]
  contrasts: [C15]
  interactions: [I204, I214]
  metamorphic_relations: [MR19]
  mutants_killed: [M11]

messages:
  - id: m-ack
    direction: inbound
    sender: user-or-counterpart@example.com
    body: |
      了解しました。

      > 明日までに資料を送ってください。

expected_zoning:
  - zone: AUTHORED_CURRENT
    span: "了解しました。"
  - zone: QUOTED_HISTORY
    span: "明日までに資料を送ってください。"

expected_communication_acts:
  - type: INFORMATION
    communicative_force: ACKNOWLEDGEMENT
    source_span: "了解しました"

expected_admission:
  decision: DO_NOT_TRACK
  reason_codes: [NO_NEW_MATERIAL_REQUEST_IN_CURRENT_AUTHORED_TEXT]

expected_effects: []
expected_responsibility: null

expected_projection:
  bucket: NONE
  subject_kind: NONE
  primary_reason: quoted historical request has no new current-turn request authority

must_hold_invariants:
  - quoted historical request is not re-created as a new request
  - exact semantics of `了解しました` may update an already-known loop if one is supplied, but this oracle supplies no such accepted existing loop

forbidden_outcomes:
  - CREATE Responsibility from the quoted request
  - set SOURCE_DUE from the quoted `明日まで` as a new current fact
```

---

# 15. T0-024 — FYI forwarding does not transfer obligation

```yaml
case_id: T0-024
title: forwarded request remains historical/context evidence when current sender only says FYI
category: zoning-forward-fyi
oracle_type: DETERMINATE
risk_class: NORMAL
focal_message_id: m-forward-fyi

coverage:
  rules: [R04, R05, R27]
  contrasts: [C16]
  interactions: [I204, I214]
  mutants_killed: [M12]

messages:
  - id: m-forward-fyi
    direction: inbound
    sender: colleague@example.com
    recipients: [user@example.com]
    body: |
      FYI

      --- Forwarded message ---
      To: tanaka@example.com
      資料を明日までに作成してください。

expected_zoning:
  - zone: AUTHORED_CURRENT
    span: "FYI"
  - zone: FORWARDED_CONTENT
    span: "資料を明日までに作成してください。"

expected_communication_acts:
  - type: INFORMATION
    communicative_force: FYI
    speaker: colleague@example.com

expected_admission:
  decision: DO_NOT_TRACK
  reason_codes: [FORWARDED_REQUEST_NOT_REASSIGNED, CURRENT_AUTHORED_TEXT_IS_INFORMATIONAL]

expected_effects: []
expected_responsibility: null

expected_projection:
  bucket: NONE
  subject_kind: NONE
  primary_reason: forwarding plus FYI does not transfer the original obligation to USER

must_hold_invariants:
  - forwarded request keeps its original discourse scope
  - current sender did not make a new request to USER

forbidden_outcomes:
  - create USER obligation from forwarded request
  - copy forwarded due date into a new USER source due
```

---

# 16. T0-025 — Authored request can adopt forwarded content as object/context

```yaml
case_id: T0-025
title: current authored request can use forwarded content to specify the requested work
category: zoning-forward-authored-request
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m-forward-request

coverage:
  rules: [R04, R07, R27]
  contrasts: [C16]
  interactions: [I204, I214, I303]
  metamorphic_relations: [MR20]
  mutants_killed: [M12]

messages:
  - id: m-forward-request
    direction: inbound
    sender: manager@example.com
    recipients: [user@example.com]
    body: |
      これお願いします。

      --- Forwarded message ---
      顧客向けの回答案を作成してください。

expected_zoning:
  - zone: AUTHORED_CURRENT
    span: "これお願いします。"
  - zone: FORWARDED_CONTENT
    span: "顧客向けの回答案を作成してください。"

expected_communication_acts:
  - type: REQUEST
    communicative_force: CURRENT_REQUEST
    speaker: manager@example.com
    obligation_bearer: USER
    action_or_event: CREATE_CUSTOMER_RESPONSE_DRAFT
    provenance:
      - support_role: COMMUNICATIVE_FORCE
        source_span: "これお願いします"
      - support_role: OBJECT_CONTEXT
        source_span: "顧客向けの回答案を作成してください"
        zone: FORWARDED_CONTENT

expected_admission:
  decision: TRACK
  reason_codes: [CURRENT_AUTHORED_REQUEST, USER_IS_BEARER, FORWARDED_CONTENT_RESOLVES_OBJECT]

expected_effects:
  - responsibility_ref: R1
    operation: CREATE

expected_responsibility:
  operational_outcome: create the customer response draft currently requested by the manager
  resolution_status: OPEN
  live_tracking_state: TRACKING_ACTIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-response-draft
      bearer: USER
      action: CREATE_CUSTOMER_RESPONSE_DRAFT
      status: OPEN
      actionability: ACTIONABLE
  provenance:
    - role: COMMUNICATIVE_FORCE
      source_span: "これお願いします"
    - role: OBJECT_CONTEXT
      source_span: "顧客向けの回答案を作成してください"
      zone: FORWARDED_CONTENT

expected_projection:
  bucket: MY_TURN
  primary_reason: current sender explicitly requests action from USER

must_hold_invariants:
  - new authority comes from current authored text, not from forwarding itself
  - forwarded content may resolve what `これ` refers to
  - provenance keeps both roles

forbidden_outcomes:
  - DO_NOT_TRACK merely because details are in forwarded text
  - treat the old forwarded sender as current obligation assigner
  - create two Responsibilities for one current bounded request
```

---

# 17. T0-042 — Sarcastic/non-literal ambiguity must not fabricate a commitment

```yaml
case_id: T0-042
title: decision-critical non-literal ambiguity stays pre-admission review instead of becoming a firm user commitment
category: pragmatic-ambiguity-sarcasm
oracle_type: AMBIGUOUS
risk_class: HIGH
focal_message_id: m-sarcasm

coverage:
  rules: [R06, R45, R47, R48]
  ambiguity_families: [O04]
  mutants_killed: [M28]

messages:
  - id: m-sarcasm
    direction: outbound
    sender: user@example.com
    body: "はいはい、どうせ今回も全部私がやればいいんですよね。"

expected_zoning:
  - zone: AUTHORED_CURRENT
    span: "はいはい、どうせ今回も全部私がやればいいんですよね。"

expected_communication_acts:
  - candidates:
      - communicative_force: LITERAL_SELF_ASSIGNMENT_OR_COMMITMENT
      - communicative_force: SARCASTIC_COMPLAINT_WITHOUT_FIRM_COMMITMENT
    decision_critical_difference: whether USER actually accepted a broad work obligation

expected_admission:
  decision: NEEDS_REVIEW
  reason_codes: [PRAGMATIC_AMBIGUITY, NON_LITERAL_READING_CHANGES_OBLIGATION_EXISTENCE]

expected_admission_review:
  reason_codes: [PRAGMATIC_AMBIGUITY]
  candidate_summary: possible literal self-commitment conflicts with plausible sarcastic complaint reading
  candidate_fields:
    possible_bearer: USER
    possible_action: broad/all-work commitment
    alternate_reading: no firm commitment communicated
  provenance:
    - message_id: m-sarcasm
      source_span: "全部私がやればいいんですよね"
  acceptable_resolution_paths:
    - TRACK after sufficient contextual/user confirmation
    - DO_NOT_TRACK when contextual evidence supports complaint/non-commitment
    - remain NEEDS_REVIEW if ambiguity remains material

expected_effects: []
expected_responsibility: null

expected_projection:
  bucket: REVIEW
  subject_kind: ADMISSION_REVIEW
  primary_reason: non-literal interpretation changes whether a Responsibility should exist

must_hold_invariants:
  - hidden private intent is not asserted as fact
  - literal surface reading is not automatically authoritative when plausible non-literal reading reverses obligation semantics
  - no fake Responsibility is created merely to render Review

forbidden_outcomes:
  - create a firm USER obligation `DO_EVERYTHING`
  - classify sarcasm with certainty solely from model confidence
  - treat emotional tone as authorization for any action
```

### Physical pressure

No sarcasm table/state is justified. The existing pre-admission Review artifact plus candidate interpretation/provenance is sufficient.

---

# 18. Batch-4 physical-model pressure summary

After the final sixteen cases:

```text
New accepted aggregate/table required?                 NO
AdmissionReview boundary still sufficient?             YES
Hybrid Responsibility aggregate still sufficient?      YES
New lifecycle/state dimension required?                NO
Generic workflow/relationship engine required?         NO
ExpectedEvent qualifier/basis refinement useful?       YES
Provenance support-role refinement useful?              YES
FieldDecision needs broader scope?                     NO
semantic_details boundary still viable?                YES
```

The strongest refinements are **fields/metadata inside already justified boundaries**, not new domain entities.

### Candidate refinements before exact DDL

```text
responsibility_expected_events:
  basis_kind / expectation_strength when material

responsibility_provenance_refs:
  support_role such as COMMUNICATIVE_FORCE / OBJECT_CONTEXT / OBSERVATION_SUPPORT

responsibility_admission_reviews:
  only durable/surfaced unresolved admission decisions; DO_NOT_TRACK does not create one by default
```

---

# 19. Tier-0 detailed-oracle completion state

With this batch:

```text
base semantic assignments:       44 / 44
detailed layered base oracles:   44 / 44
mandatory transition traces:     20 / 20
C23 claim-vs-observation pair:   explicit at specification level
```

This is still design/evaluation truth, not execution evidence.

Remaining promotion work includes:

```text
normalize legacy aliases in first eight detailed oracles during executable serialization
serialize all controlled variants and metamorphic assertions
build coverage linter/equivalent
execute human-adjudicated corpus independent of model predictions
bind forbidden outcomes to reducer/integration/security tests
```

---

# 20. Conclusion

The final planned Tier-0 schema falsifiers do **not** justify another persistence entity.

They instead reinforce the current layering:

```text
Message/provider evidence
      ↓
Interpretation + zoning + communicative-force qualifiers
      ↓
Admission
      ├─ DO_NOT_TRACK -> no product Responsibility state
      ├─ NEEDS_REVIEW -> narrow AdmissionReview when durable/surfaced
      └─ TRACK -> accepted Responsibility aggregate
                         ↓
                      projection
```

The correct next step is therefore a **physical schema boundary freeze review**, not another round of speculative table invention.