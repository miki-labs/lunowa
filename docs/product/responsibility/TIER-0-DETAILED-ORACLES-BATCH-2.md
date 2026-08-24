# Tier 0 Detailed Responsibility Oracles — Batch 2

## Status

**Accepted detailed-oracle expansion for Responsibility v0.1.**

This batch expands ten additional Tier-0 base assignments plus the explicit observation-confirmed counterpart required by contrast C23.

The cases were selected by semantic pressure rather than ID order. Together they exercise structures not fully covered by the first critical batch:

```text
proposal vs agreement
hold vs cancellation
delegation intent vs effective delegation
partial completion criteria
weak closure evidence
historical semantic openness vs live activation
ambiguous any-of assignment
claim vs matching provider observation
```

This document uses the reconciled vocabulary from `SCENARIO-SCHEMA.md`:

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

It does not freeze physical tables, enum names, prompt wording, or AI-provider behavior.

---

# 1. Batch-level invariants

All cases in this batch obey these rules:

1. source communication remains immutable evidence;
2. communication meaning does not by itself establish provider observation, authority, or safe external action;
3. `resolution_status`, live activation, and attention/defer are orthogonal;
4. UI buckets are deterministic projections, not canonical state;
5. one focal event may UPDATE/RESOLVE an existing Responsibility without creating a new one merely because wording or current owner changes;
6. genuine ambiguity is preserved at the narrowest material field/relationship rather than converted into a guessed whole-item state;
7. HIGH/CRITICAL cases specify explicit forbidden outcomes;
8. the human oracle is semantic truth for evaluation; model predictions must not author it.

For current live cases below, `live_tracking_state: LIVE` and `attention_mode: PRESENT` are conceptual oracle labels only. Exact production enum names remain OPEN.

---

# 2. T0-009 — Scheduling proposal remains pending, not agreed

```yaml
case_id: T0-009
title: inbound meeting-time proposal creates a pending term and a response obligation, not an agreed fact
category: proposal-negotiation
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R10, R27, R44]
  contrasts: [C08]
  interactions: [I208, I209]
  metamorphic_relations: [MR11]
  mutants_killed: [M10]
  forbidden_sentinels: [H14]

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
    direction: inbound
    sent_at: 2026-08-24T10:00:00+09:00
    observed_at: 2026-08-24T10:00:02+09:00
    sender: partner@example.com
    recipients: [user@example.com]
    cc: []
    subject: 打ち合わせ日程
    body: "金曜17時はいかがでしょうか。"
    attachments: []

expected_zoning:
  - message_id: m1
    zone: AUTHORED_CURRENT
    text: "金曜17時はいかがでしょうか。"

expected_communication_acts:
  - message_id: m1
    type: PROPOSAL
    speaker: partner@example.com
    action_or_event: MEETING_TIME_TERM
    object: meeting
    temporal_expression:
      source_text: "金曜17時"
      semantic_role: PROPOSED_TERM
      resolved_value: 2026-08-28T17:00:00+09:00
      precision: MINUTE
    provenance:
      message_id: m1
      source_span: "金曜17時はいかがでしょうか"

expected_claims: []
expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m1
    connected_account_id: acct-work

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_ACTIVE_SCHEDULING_LOOP
    - USER_RESPONSE_NEEDED

expected_matching:
  operation: CREATE
  matched_responsibility_id: null

expected_responsibility:
  operational_outcome: reach agreement on a meeting time with partner@example.com
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-user-response
      bearer: USER
      action: RESPOND_TO_MEETING_PROPOSAL
      status: OPEN
      actionability: ACTIONABLE
      basis: COMMUNICATED_PROPOSAL
      provenance:
        message_id: m1
        source_span: "いかがでしょうか"
  expected_events: []
  completion_criteria:
    - id: criterion-agreement
      criterion: A_MEETING_TIME_IS_EXPLICITLY_ACCEPTED
      status: UNSATISFIED
  pending_proposals:
    - id: proposal-1
      field: meeting_time
      value: 2026-08-28T17:00:00+09:00
      source_expression: "金曜17時"
      status: PENDING
      provenance:
        message_id: m1
        source_span: "金曜17時"
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: pending_proposals[proposal-1]
      message_id: m1
      source_span: "金曜17時"

expected_safety:
  requested_action: RESPOND_TO_MEETING_PROPOSAL
  safe_next_action: ACCEPT_REJECT_OR_COUNTERPROPOSE
  confirmation_or_review_required: false

expected_projection:
  bucket: MY_TURN
  primary_reason: user response is currently needed to advance the scheduling loop

must_hold_invariants:
  - proposed meeting time is not an agreed fact before adequate acceptance evidence
  - proposed meeting time is not a SOURCE_DUE merely because it is a date/time expression
  - resolving the proposal requires an agreement event, not merely reading the message
  - source wording and proposed value remain traceable

forbidden_outcomes:
  - store Friday 17:00 as agreed meeting time
  - create a user deadline at Friday 17:00
  - mark the scheduling Responsibility DONE on receipt
  - infer acceptance from politeness or lack of objection
```

---

# 3. T0-010 — Explicit acceptance promotes a pending proposal to agreed fact

```yaml
case_id: T0-010
title: explicit acceptance closes the scheduling-negotiation outcome without claiming the meeting occurred
category: proposal-agreement
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R10, R27, R39, R44]
  contrasts: [C08, C09]
  interactions: [I208, I209]
  metamorphic_relations: [MR11]
  mutants_killed: [M10]
  forbidden_sentinels: [H14]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: reach agreement on a meeting time with partner@example.com
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      pending_proposals:
        - id: proposal-1
          proposer: USER
          field: meeting_time
          value: 2026-08-28T17:00:00+09:00
          status: PENDING
          provenance:
            message_id: m1

messages:
  - id: m1
    connected_account_id: acct-work
    direction: outbound
    sent_at: 2026-08-24T09:30:00+09:00
    observed_at: 2026-08-24T09:30:02+09:00
    sender: user@example.com
    recipients: [partner@example.com]
    cc: []
    subject: 打ち合わせ日程
    body: "金曜17時はいかがでしょうか。"
    attachments: []
  - id: m2
    connected_account_id: acct-work
    direction: inbound
    sent_at: 2026-08-24T10:00:00+09:00
    observed_at: 2026-08-24T10:00:02+09:00
    sender: partner@example.com
    recipients: [user@example.com]
    cc: []
    subject: Re: 打ち合わせ日程
    body: "では金曜17時でお願いします。"
    attachments: []

expected_zoning:
  - message_id: m2
    zone: AUTHORED_CURRENT
    text: "では金曜17時でお願いします。"

expected_communication_acts:
  - message_id: m2
    type: DECISION
    speaker: partner@example.com
    communicative_force: ACCEPTANCE
    target_proposal_id: proposal-1
    accepted_term:
      field: meeting_time
      value: 2026-08-28T17:00:00+09:00
    provenance:
      message_id: m2
      source_span: "では金曜17時でお願いします"

expected_claims:
  - type: COMMUNICATED_ACCEPTANCE
    target: proposal-1
    value: 2026-08-28T17:00:00+09:00

expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m2

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_ACTIVE_NEGOTIATION
    - EXPLICIT_ACCEPTANCE_OF_PENDING_TERM

expected_matching:
  operation: RESOLVE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: reach agreement on a meeting time with partner@example.com
  resolution_status: RESOLVED
  resolution_reason: SATISFIED
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs: []
  expected_events: []
  completion_criteria:
    - id: criterion-agreement
      criterion: A_MEETING_TIME_IS_EXPLICITLY_ACCEPTED
      status: SATISFIED
      provenance:
        message_id: m2
        source_span: "金曜17時でお願いします"
  pending_proposals:
    - id: proposal-1
      field: meeting_time
      value: 2026-08-28T17:00:00+09:00
      status: ACCEPTED
      provenance:
        message_id: m1
  agreed_facts:
    - id: agreed-meeting-time
      field: meeting_time
      value: 2026-08-28T17:00:00+09:00
      basis: EXPLICIT_ACCEPTANCE
      provenance:
        message_id: m2
        source_span: "金曜17時でお願いします"
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: agreed_facts[agreed-meeting-time]
      message_id: m2
      source_span: "金曜17時でお願いします"

expected_safety:
  requested_action: null
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: DONE
  primary_reason: the scheduling-negotiation operational outcome has been satisfied by explicit agreement

must_hold_invariants:
  - pending proposal becomes an agreed fact only because adequate acceptance evidence exists
  - DONE applies to the scheduling-negotiation outcome, not to occurrence/completion of the future meeting
  - accepted meeting time is not reclassified as a user deadline
  - proposal history remains traceable after agreement

forbidden_outcomes:
  - claim that the meeting itself already occurred
  - erase the proposal/acceptance provenance chain
  - treat a mere preference such as `17時が良いと思います` as equivalent acceptance without context
```

---

# 4. T0-014 — Communication hold blocks action but does not cancel or snooze it

```yaml
case_id: T0-014
title: explicit hold creates a blocking constraint and expected resume event while the Responsibility stays open
category: hold-constraint-actionability
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R20, R21, R27, R44]
  contrasts: [C11]
  interactions: [I205]
  transitions: [T07]
  mutants_killed: [M30]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: send the final contract after counterpart clearance
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-send
          bearer: USER
          action: SEND_FINAL_CONTRACT
          status: OPEN
          actionability: ACTIONABLE

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: 最終契約書
    body: "最終契約書を送ってください。"
    attachments: []
  - id: m2
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: Re: 最終契約書
    body: "一旦止めてください。こちらから連絡するまで進めないでください。"
    attachments: []

expected_zoning:
  - message_id: m2
    zone: AUTHORED_CURRENT

expected_communication_acts:
  - message_id: m2
    type: REQUEST
    speaker: partner@example.com
    obligation_bearer: user@example.com
    communicative_force: HOLD
    polarity: NEGATIVE
    constraints:
      - kind: DO_NOT_PROCEED
        condition: UNTIL_COUNTERPART_RESUMES
    provenance:
      message_id: m2
      source_span: "こちらから連絡するまで進めないでください"

expected_claims: []
expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m2

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_OPEN_RESPONSIBILITY
    - MATERIAL_HOLD_CONSTRAINT

expected_matching:
  operation: UPDATE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: send the final contract after counterpart clearance
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-send
      bearer: USER
      action: SEND_FINAL_CONTRACT
      status: OPEN
      actionability: BLOCKED
      condition: COUNTERPART_RESUME_RECEIVED
      provenance:
        message_id: m1
  expected_events:
    - id: event-resume
      actor: OTHER_PARTY
      event: RESUME_OR_CLEARANCE_RECEIVED
      status: PENDING
      activates_obligation_leg_id: leg-send
      provenance:
        message_id: m2
        source_span: "こちらから連絡するまで"
  completion_criteria: []
  pending_proposals: []
  agreed_facts: []
  constraints:
    - id: constraint-hold
      kind: DO_NOT_PROCEED
      status: ACTIVE
      condition: UNTIL_COUNTERPART_RESUMES
      provenance:
        message_id: m2
        source_span: "進めないでください"
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: constraints[constraint-hold]
      message_id: m2
      source_span: "こちらから連絡するまで進めないでください"

expected_safety:
  requested_action: DO_NOT_PROCEED
  safe_next_action: WAIT_FOR_COUNTERPART_RESUME
  confirmation_or_review_required: false

expected_projection:
  bucket: WAITING
  primary_reason: user work remains known but is blocked until the counterpart supplies the resume event

must_hold_invariants:
  - hold does not resolve/cancel the operational outcome
  - known future USER work remains represented while blocked
  - communication hold does not itself set attention_mode=DEFERRED
  - LATER requires a separate product/user defer decision and return contract

forbidden_outcomes:
  - resolution_status=RESOLVED merely because the work was paused
  - resolution_reason=CANCELLED
  - project LATER solely from the hold wording
  - continue presenting SEND_FINAL_CONTRACT as currently executable while the blocking constraint is active
```

---

# 5. T0-015 — Explicit cancellation resolves without claiming satisfaction

```yaml
case_id: T0-015
title: authoritative cancellation closes tracking with CANCELLED semantics, not SATISFIED
category: cancellation-resolution-reason
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R21, R39, R40]
  contrasts: [C11, C25]
  interactions: [I210]
  transitions: [T08]
  mutants_killed: [M30]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: review the requested contract draft
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-review
          bearer: USER
          action: REVIEW_CONTRACT_DRAFT
          status: OPEN
          actionability: ACTIONABLE

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: 契約書レビュー
    body: "契約書のレビューをお願いします。"
    attachments: [draft.pdf]
  - id: m2
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: Re: 契約書レビュー
    body: "この件はもう不要です。レビュー依頼を取り下げます。"
    attachments: []

expected_communication_acts:
  - message_id: m2
    type: CANCELLATION
    speaker: partner@example.com
    target_outcome: review the requested contract draft
    provenance:
      message_id: m2
      source_span: "レビュー依頼を取り下げます"

expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m2

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_OPEN_RESPONSIBILITY
    - EXPLICIT_WITHDRAWAL_BY_REQUESTER

expected_matching:
  operation: RESOLVE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: review the requested contract draft
  resolution_status: RESOLVED
  resolution_reason: CANCELLED
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-review
      bearer: USER
      action: REVIEW_CONTRACT_DRAFT
      status: CANCELLED
      actionability: NOT_ACTIONABLE
  expected_events: []
  completion_criteria: []
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: resolution_reason
      message_id: m2
      source_span: "取り下げます"

expected_safety:
  requested_action: null
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: DONE
  primary_reason: no further work is required because the request was cancelled

must_hold_invariants:
  - cancellation is terminal for the old requested outcome unless later communication creates/reopens work under identity rules
  - cancellation is not evidence that the requested work was successfully performed
  - history/source request remains preserved

forbidden_outcomes:
  - resolution_reason=SATISFIED when no review was performed
  - keep the USER review leg actionable after authoritative cancellation
  - delete the Responsibility/history as though the request never existed
```

---

# 6. T0-016 — Delegation intent/commitment does not transfer ownership

```yaml
case_id: T0-016
title: saying that Tanaka will be asked does not create an effective Tanaka obligation when Tanaka was not addressed
category: delegation-intent
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R07, R22, R27]
  contrasts: [C12]
  interactions: [I205]
  transitions: [T09]
  mutants_killed: [M31]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: obtain the latest figures from Tanaka for the manager
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-user-obtain
          bearer: USER
          action: OBTAIN_LATEST_FIGURES_FROM_TANAKA
          status: OPEN
          actionability: ACTIONABLE

messages:
  - id: m1
    direction: inbound
    sender: manager@example.com
    recipients: [user@example.com]
    subject: 最新数値
    body: "田中さんから最新の数値をもらってください。"
    attachments: []
  - id: m2
    direction: outbound
    sender: user@example.com
    recipients: [manager@example.com]
    cc: []
    subject: Re: 最新数値
    body: "田中さんにお願いしておきます。"
    attachments: []

expected_communication_acts:
  - message_id: m2
    type: COMMITMENT
    speaker: user@example.com
    obligation_bearer: user@example.com
    action_or_event: REQUEST_FIGURES_FROM_TANAKA_IN_FUTURE
    modality: INTENDED_FUTURE_DELEGATION
    provenance:
      message_id: m2
      source_span: "田中さんにお願いしておきます"

expected_claims:
  - type: COMMUNICATED_DELEGATION_INTENT_OR_COMMITMENT
    target_person: tanaka@example.com
    effective_request_observed: false

expected_observations:
  - type: PROVIDER_RECIPIENT_OBSERVATION
    message_id: m2
    tanaka_is_recipient: false

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_USER_RESPONSIBILITY
    - DELEGATION_NOT_YET_EFFECTIVE

expected_matching:
  operation: UPDATE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: obtain the latest figures from Tanaka for the manager
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-user-obtain
      bearer: USER
      action: OBTAIN_LATEST_FIGURES_FROM_TANAKA
      status: OPEN
      actionability: ACTIONABLE
      basis: ORIGINAL_MANAGER_REQUEST_PLUS_USER_COMMITMENT_TO_DELEGATE
  expected_events: []
  completion_criteria: []
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: obligation_legs[leg-user-obtain]
      message_id: m1
    - field: delegation_intent
      message_id: m2
      source_span: "お願いしておきます"

expected_safety:
  requested_action: OBTAIN_LATEST_FIGURES_FROM_TANAKA
  safe_next_action: SEND_ACTUAL_REQUEST_TO_TANAKA
  confirmation_or_review_required: false

expected_projection:
  bucket: MY_TURN
  primary_reason: Tanaka has not yet received an effective request, so the user still has current work

must_hold_invariants:
  - speaker/user commitment to delegate is not evidence that delegation already occurred
  - Tanaka is not assigned a canonical obligation merely because Tanaka is mentioned
  - recipient/provider observation can help establish whether a delegation communication was actually sent

forbidden_outcomes:
  - move the Responsibility to WAITING on Tanaka solely from `お願いしておきます`
  - create an OTHER_PARTY obligation for Tanaka without an effective communication/equivalent trusted event
  - mark the user's obligation satisfied merely because the user described an intention to delegate
```

---

# 7. T0-017 — Effective delegation creates an other-party expectation inside the same outcome

```yaml
case_id: T0-017
title: an actual reconciled request to Tanaka can move the same operational loop into waiting
category: effective-delegation
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m3

coverage:
  rules: [R07, R22, R27, R44]
  contrasts: [C12]
  interactions: [I205, I206, I311]
  transitions: [T09]
  mutants_killed: [M31]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: obtain the latest figures from Tanaka for the manager
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-user-delegate
          bearer: USER
          action: REQUEST_FIGURES_FROM_TANAKA
          status: OPEN
          actionability: ACTIONABLE

messages:
  - id: m3
    direction: outbound
    sender: user@example.com
    recipients: [tanaka@example.com]
    cc: []
    subject: 最新数値のお願い
    body: "田中さん、最新の数値をお願いします。"
    attachments: []

expected_communication_acts:
  - message_id: m3
    type: REQUEST
    speaker: user@example.com
    obligation_bearer: tanaka@example.com
    action_or_event: PROVIDE_LATEST_FIGURES
    object: latest_figures
    obligation_strength: REQUIRED_OR_EXPECTED_BY_CONTEXT
    provenance:
      message_id: m3
      source_span: "最新の数値をお願いします"

expected_observations:
  - type: PROVIDER_RECIPIENT_OBSERVATION
    message_id: m3
    recipient: tanaka@example.com
  - type: PROVIDER_SEND_RECONCILIATION
    message_id: m3
    acceptance_state: RECONCILED_ACCEPTED

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_OPERATIONAL_OUTCOME
    - EFFECTIVE_DELEGATION_COMMUNICATED

expected_matching:
  operation: UPDATE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: obtain the latest figures from Tanaka for the manager
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-user-delegate
      bearer: USER
      action: REQUEST_FIGURES_FROM_TANAKA
      status: SATISFIED
      actionability: NOT_ACTIONABLE
      provenance:
        message_id: m3
    - id: leg-tanaka-provide
      bearer: tanaka@example.com
      action: PROVIDE_LATEST_FIGURES
      status: OPEN
      actionability: ACTIONABLE_FOR_OTHER_PARTY
      basis: COMMUNICATED_REQUEST
      provenance:
        message_id: m3
        source_span: "最新の数値をお願いします"
  expected_events:
    - id: event-figures
      actor: OTHER_PARTY
      event: LATEST_FIGURES_RECEIVED
      status: PENDING
      provenance:
        message_id: m3
  completion_criteria:
    - id: criterion-figures
      criterion: REQUESTED_FIGURES_ARE_RECEIVED
      status: UNSATISFIED
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: obligation_legs[leg-tanaka-provide]
      message_id: m3

expected_safety:
  requested_action: null
  safe_next_action: WAIT_FOR_TANAKA
  confirmation_or_review_required: false

expected_projection:
  bucket: WAITING
  primary_reason: the user's current delegation action is complete and the next material event belongs to Tanaka

must_hold_invariants:
  - the Responsibility identity remains the same because the operational outcome remains obtaining the figures
  - an effective request requires communication/provider evidence, not mere internal intent
  - Tanaka need not be a Lunowa user to be the bearer/source of an expected event
  - WAITING does not mean the whole Responsibility is resolved

forbidden_outcomes:
  - CREATE a new independent Responsibility solely for the delegation message when it serves the same operational outcome
  - remain MY_TURN solely because USER still ultimately cares about the outcome despite having no current required action
  - resolve before the figures are actually obtained or otherwise the outcome is closed
```

---

# 8. T0-033 — Partial completion criteria keep one Responsibility open

```yaml
case_id: T0-033
title: receiving/sending only the front of a required front-and-back identity document does not complete the operational outcome
category: completion-criteria-partial
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R03, R39, R41, R44]
  contrasts: [C22]
  interactions: [I224]
  transitions: [T17]
  forbidden_sentinels: [H01]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: provide both required sides of the identity document
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-provide-id
          bearer: USER
          action: PROVIDE_REQUIRED_ID_DOCUMENT
          status: OPEN
          actionability: ACTIONABLE
      completion_criteria:
        - id: criterion-front
          criterion: FRONT_SIDE_PROVIDED
          status: UNSATISFIED
        - id: criterion-back
          criterion: BACK_SIDE_PROVIDED
          status: UNSATISFIED

messages:
  - id: m1
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: 本人確認書類
    body: "本人確認書類の表裏を送ってください。"
    attachments: []
  - id: m2
    direction: outbound
    sender: user@example.com
    recipients: [partner@example.com]
    subject: Re: 本人確認書類
    body: "まず表面を送ります。"
    attachments:
      - filename: id-front.jpg
        semantic_role: FRONT_SIDE

expected_communication_acts:
  - message_id: m2
    type: COMMITMENT
    speaker: user@example.com
    obligation_bearer: user@example.com
    action_or_event: PROVIDE_FRONT_SIDE_NOW
    provenance:
      message_id: m2
      source_span: "まず表面を送ります"

expected_observations:
  - type: PROVIDER_SEND_RECONCILIATION
    message_id: m2
    acceptance_state: RECONCILED_ACCEPTED
  - type: PROVIDER_ATTACHMENT_OBSERVATION
    message_id: m2
    filename: id-front.jpg
    semantic_role: FRONT_SIDE

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_MULTI_CRITERION_RESPONSIBILITY
    - PARTIAL_COMPLETION_OBSERVED

expected_matching:
  operation: UPDATE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: provide both required sides of the identity document
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-provide-id
      bearer: USER
      action: PROVIDE_REMAINING_BACK_SIDE
      status: OPEN
      actionability: ACTIONABLE
  expected_events: []
  completion_criteria:
    - id: criterion-front
      criterion: FRONT_SIDE_PROVIDED
      status: SATISFIED
      provenance:
        message_id: m2
        provider_observation: id-front.jpg reconciled in accepted send
    - id: criterion-back
      criterion: BACK_SIDE_PROVIDED
      status: UNSATISFIED
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: completion_criteria[criterion-front]
      message_id: m2
    - field: completion_criteria[criterion-back]
      message_id: m1
      source_span: "表裏"

expected_safety:
  requested_action: PROVIDE_REQUIRED_ID_DOCUMENT
  safe_next_action: PROVIDE_REMAINING_BACK_SIDE
  confirmation_or_review_required: false

expected_projection:
  bucket: MY_TURN
  primary_reason: one required completion criterion remains unsatisfied

must_hold_invariants:
  - FRONT and BACK are criteria of one cohesive operational outcome in this scenario
  - satisfying one criterion does not resolve the Responsibility
  - provider/send evidence grounds the satisfied criterion; merely opening an attachment would not
  - the remaining criterion is explicit rather than inferred from a generic `not done` flag

forbidden_outcomes:
  - resolution_status=RESOLVED after FRONT only
  - project DONE after FRONT only
  - split FRONT and BACK into independent Responsibilities without evidence of independent closure
  - treat attachment read/open state as proof that a required side was provided
```

---

# 9. T0-035 — Generic thanks is weak closure evidence

```yaml
case_id: T0-035
title: generic acknowledgement does not satisfy an explicit approval outcome
category: weak-completion-evidence
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m3

coverage:
  rules: [R39, R41, R45]
  contrasts: [C24]
  interactions: [I227]
  ambiguity_families: [O05]
  mutants_killed: [M16]
  forbidden_sentinels: [H02]

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
  existing_responsibilities:
    - id: R1
      operational_outcome: obtain explicit counterpart approval of the submitted draft
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      obligation_legs:
        - id: leg-counterpart-approve
          bearer: OTHER_PARTY
          action: APPROVE_OR_REJECT_DRAFT
          status: OPEN
          actionability: ACTIONABLE_FOR_OTHER_PARTY
      expected_events:
        - id: event-approval
          actor: OTHER_PARTY
          event: EXPLICIT_APPROVAL_OR_REJECTION
          status: PENDING

messages:
  - id: m3
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: Re: ドラフト確認
    body: "ありがとうございます。"
    attachments: []

expected_communication_acts:
  - message_id: m3
    type: INFORMATION
    speaker: partner@example.com
    communicative_force: ACKNOWLEDGEMENT
    closure_strength: WEAK
    provenance:
      message_id: m3
      source_span: "ありがとうございます"

expected_claims:
  - type: COMMUNICATED_ACKNOWLEDGEMENT
    content: thanks/receipt-like social acknowledgement
    explicit_approval: false
    explicit_closure: false

expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m3

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_MATERIAL_WAITING_LOOP
    - ACKNOWLEDGEMENT_INSUFFICIENT_FOR_CLOSURE

expected_matching:
  operation: UPDATE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: obtain explicit counterpart approval of the submitted draft
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs:
    - id: leg-counterpart-approve
      bearer: OTHER_PARTY
      action: APPROVE_OR_REJECT_DRAFT
      status: OPEN
      actionability: ACTIONABLE_FOR_OTHER_PARTY
  expected_events:
    - id: event-approval
      actor: OTHER_PARTY
      event: EXPLICIT_APPROVAL_OR_REJECTION
      status: PENDING
  completion_criteria:
    - id: criterion-explicit-outcome
      criterion: EXPLICIT_APPROVAL_OR_OTHER_TERMINAL_OUTCOME
      status: UNSATISFIED
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: weak_acknowledgement
      message_id: m3
      source_span: "ありがとうございます"

expected_safety:
  requested_action: null
  safe_next_action: WAIT_FOR_EXPLICIT_APPROVAL_OR_FOLLOW_UP_POLICY
  confirmation_or_review_required: false

expected_projection:
  bucket: WAITING
  primary_reason: the expected approval outcome remains unsatisfied

must_hold_invariants:
  - social acknowledgement is not automatically approval/completion
  - completion semantics depend on the operational closure condition, not generic positive tone
  - an explicit stronger closure message may resolve this loop; that is a different evidence case

forbidden_outcomes:
  - resolution_status=RESOLVED solely because `ありがとうございます` was received
  - resolution_reason=SATISFIED solely from positive sentiment
  - delete the expected approval event
  - create a new Responsibility merely for the acknowledgement
```

---

# 10. T0-038 — Historical apparent openness does not auto-activate live work

```yaml
case_id: T0-038
title: an old apparently unresolved request may remain evidence-relative open without becoming live My Turn work
category: historical-activation
oracle_type: AMBIGUOUS
risk_class: CRITICAL
focal_message_id: m-old

coverage:
  rules: [R13, R42, R44, R45, R47]
  contrasts: [C29]
  interactions: [I222, I308]
  transitions: [T20]
  ambiguity_families: [O10]
  mutants_killed: [M26]
  forbidden_sentinels: [H01]

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
  authorized_external_context:
    - initial_sync_at: 2026-08-24T09:00:00+09:00
    - no trusted off-channel completion data is available
  existing_responsibilities: []

messages:
  - id: m-old
    direction: inbound
    sent_at: 2019-08-24T09:00:00+09:00
    observed_at: 2026-08-24T09:01:00+09:00
    sender: old-partner@example.com
    recipients: [user@example.com]
    subject: 資料のお願い
    body: "明日までに資料を送ってください。"
    attachments: []

expected_communication_acts:
  - message_id: m-old
    type: REQUEST
    speaker: old-partner@example.com
    obligation_bearer: user@example.com
    action_or_event: SEND_DOCUMENT
    temporal_expression:
      source_text: "明日までに"
      semantic_kind: SOURCE_DUE
      resolved_value_relative_to_source_time: 2019-08-25
      precision: DATE
    provenance:
      message_id: m-old
      source_span: "明日までに資料を送ってください"

expected_observations:
  - type: INITIAL_HISTORICAL_SYNC_OBSERVATION
    message_id: m-old
    observed_at: 2026-08-24T09:01:00+09:00
  - type: NO_OBSERVED_CLOSURE_IN_AUTHORIZED_EVIDENCE

expected_admission:
  decision: TRACK
  reason_codes:
    - HISTORICAL_MATERIAL_REQUEST_EXISTS
    - LIVE_ACTIVATION_REQUIRES_SEPARATE_POLICY_OR_USER_AUTHORITY

expected_matching:
  operation: CREATE
  matched_responsibility_id: null

expected_responsibility:
  operational_outcome: historical request to send the requested document
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: HISTORICAL_CANDIDATE_INACTIVE
  attention_mode: null
  obligation_legs:
    - id: historical-user-leg
      bearer: USER
      action: SEND_DOCUMENT
      status: APPARENTLY_UNRESOLVED_IN_AVAILABLE_EVIDENCE
      actionability: NOT_LIVE_UNTIL_ACTIVATED
      basis: HISTORICAL_COMMUNICATION_EVIDENCE
  expected_events: []
  completion_criteria: []
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts:
    - id: old-source-due
      semantic_kind: SOURCE_DUE
      original_expression: "明日までに"
      resolved_value: 2019-08-25
      precision: DATE
      provenance:
        message_id: m-old
        source_span: "明日までに"
  uncertainties:
    - cause: MISSING_CONTEXT
      field: external_world_closure
      material: true
      detail: seven years of off-channel or unavailable evidence may contain completion/cancellation
    - cause: HISTORICAL_ACTIVATION_POLICY
      field: live_tracking_state
      material: true
      detail: exact lookback/activation policy remains a product decision
  provenance:
    - field: historical_user_leg
      message_id: m-old
      source_span: "資料を送ってください"

expected_safety:
  requested_action: SEND_DOCUMENT
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: null
  acceptable_buckets: [NONE, REVIEW]
  primary_reason: the old loop may be semantically open in evidence, but live activation is intentionally separate and conservative

must_hold_invariants:
  - source relative time resolves against 2019 source context, never 2026 ingestion time
  - no observed closure is not proof that the obligation is still live in the world
  - historical semantic openness is distinct from live-tracking activation
  - automatic live MY_TURN is forbidden without activation policy/user authority
  - user later choosing `追跡する` may activate the same historical Responsibility without rewriting source evidence

forbidden_outcomes:
  - project live MY_TURN automatically from initial import merely because no closure was observed
  - reinterpret `明日` relative to the 2026 sync date
  - mark the historical request objectively completed solely because it is old
  - discard source/provenance because the item is inactive
```

### Ambiguity note

`NONE` versus `REVIEW` is intentionally not frozen here because the exact historical lookback/activation UX remains OPEN. The invariant under test is that **neither option silently becomes live `MY_TURN`**.

---

# 11. T0-040 — Any-of group assignment is material but does not establish unique USER ownership

```yaml
case_id: T0-040
title: any-of assignment involving the user remains a tracked shared-assignment ambiguity rather than assigning every recipient
category: ambiguous-group-assignment
oracle_type: AMBIGUOUS
risk_class: HIGH
focal_message_id: m1

coverage:
  rules: [R07, R45, R47, R48]
  contrasts: [C14]
  interactions: [I205, I217, I228, I310]
  ambiguity_families: [O06]
  mutants_killed: [M25, M35]
  forbidden_sentinels: [H03, H15]

context:
  current_user:
    id: user-sato
    email: sato@example.com
  connected_accounts:
    - id: acct-work
      provider: gmail
      email: sato@example.com
  focal_connected_account: acct-work
  locale: ja-JP
  timezone: Asia/Tokyo
  authorized_external_context:
    - tanaka@example.com and sato@example.com are distinct recipients
    - no assignment-selection/claim state is available
  existing_responsibilities: []

messages:
  - id: m1
    direction: inbound
    sender: manager@example.com
    recipients: [tanaka@example.com, sato@example.com]
    cc: []
    subject: 本日の対応
    body: "田中さんか佐藤さん、どちらか本日中に対応お願いします。"
    attachments: []

expected_communication_acts:
  - message_id: m1
    type: REQUEST
    speaker: manager@example.com
    obligation_bearers_candidate: [tanaka@example.com, sato@example.com]
    assignment_shape: ANY_OF
    action_or_event: HANDLE_REQUEST
    obligation_strength: REQUIRED_FOR_GROUP_OUTCOME
    temporal_expression:
      source_text: "本日中に"
      semantic_kind: SOURCE_DUE
      resolved_value: 2026-08-24
      precision: DATE
    provenance:
      message_id: m1
      source_span: "田中さんか佐藤さん、どちらか本日中に対応お願いします"

expected_observations:
  - type: PROVIDER_MESSAGE_OBSERVED
    message_id: m1
  - type: ASSIGNMENT_SELECTION_OBSERVATION
    value: NOT_AVAILABLE

expected_admission:
  decision: TRACK
  reason_codes:
    - MATERIAL_SHARED_ASSIGNMENT
    - CURRENT_USER_IS_A_CANDIDATE_BEARER
    - UNIQUE_BEARER_NOT_ESTABLISHED

expected_matching:
  operation: CREATE
  matched_responsibility_id: null

expected_responsibility:
  operational_outcome: ensure one of the named assignees handles the requested work by the communicated due
  resolution_status: OPEN
  resolution_reason: null
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs: []
  expected_events: []
  completion_criteria:
    - id: criterion-any-assignee-completes
      criterion: ONE_AUTHORIZED_NAMED_ASSIGNEE_HANDLES_REQUEST
      status: UNSATISFIED
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts:
    - id: group-due
      semantic_kind: SOURCE_DUE
      original_expression: "本日中に"
      resolved_value: 2026-08-24
      precision: DATE
      applies_to: shared_assignment
      provenance:
        message_id: m1
        source_span: "本日中に"
  uncertainties:
    - cause: AMBIGUOUS_ASSIGNMENT
      field: obligation_bearer
      material: true
      candidates: [tanaka@example.com, sato@example.com]
      assignment_shape: ANY_OF
      detail: the source requires one of the named people, not both, and no current selection is known
  provenance:
    - field: assignment_shape
      message_id: m1
      source_span: "田中さんか佐藤さん、どちらか"

expected_safety:
  requested_action: HANDLE_REQUEST
  safe_next_action: REVIEW_OR_COORDINATE_ASSIGNMENT
  confirmation_or_review_required: true

expected_projection:
  bucket: REVIEW
  primary_reason: the user may be responsible, but the source does not establish that both candidates individually owe the action

must_hold_invariants:
  - ANY_OF assignment is not equivalent to assigning both recipients individual required legs
  - current USER participation makes the request material enough not to disappear
  - uncertainty is specifically assignment-related; action/due may still be clear
  - v0.1 may conservatively review this case without implementing a generic group-workflow engine

forbidden_outcomes:
  - create two required obligation legs as though both Tanaka and Sato must act
  - assign USER as unique bearer solely because USER is the current account holder
  - drop the Responsibility as irrelevant merely because another candidate exists
  - invent which person accepted/claimed the work
```

### Schema-pressure note

This oracle deliberately does **not** introduce a production `assignment_mode` table or generic team workflow. The semantic source relation `ANY_OF` and the unresolved bearer uncertainty must be representable; the minimal physical representation remains an implementation-design question.

---

# 12. C23 explicit counterpart — matching provider observation can satisfy an attachment-delivery outcome

This is the explicit second serialized input required by contrast C23. It is a counterpart to T0-034, not a new Tier-0 base ID.

```yaml
case_id: T0-034-C23-OBSERVED
title: communicated attachment-delivery claim plus matching provider observation can satisfy the narrow delivery-presence outcome
category: claim-observation-confirmation
oracle_type: DETERMINATE
risk_class: HIGH
focal_message_id: m2

coverage:
  rules: [R11, R13, R27, R39]
  contrasts: [C23]
  interactions: [I212, I213]
  mutants_killed: [M13, M37, M38]

context:
  current_user:
    id: user-1
    email: user@example.com
  connected_accounts:
    - id: acct-work
      provider: gmail
      email: user@example.com
  focal_connected_account: acct-work
  existing_responsibilities:
    - id: R1
      operational_outcome: receive the promised revised contract as an attachment to the counterpart message
      resolution_status: OPEN
      live_tracking_state: LIVE
      attention_mode: PRESENT
      expected_events:
        - id: event-revised-attachment
          actor: OTHER_PARTY
          event: REVISED_CONTRACT_ATTACHMENT_OBSERVED
          status: PENDING

messages:
  - id: m2
    direction: inbound
    sender: partner@example.com
    recipients: [user@example.com]
    subject: Re: 契約書修正版
    body: "修正版を添付しました。"
    attachments:
      - provider_attachment_id: att-1
        filename: contract-revised.pdf
        mime_type: application/pdf

expected_communication_acts:
  - message_id: m2
    type: COMPLETION_SIGNAL
    speaker: partner@example.com
    action_or_event: CLAIM_REVISED_DOCUMENT_DELIVERED
    object: revised_contract
    provenance:
      message_id: m2
      source_span: "修正版を添付しました"

expected_claims:
  - type: COMMUNICATED_CLAIM
    fact: REVISED_DOCUMENT_ATTACHED
    value: true

expected_observations:
  - type: PROVIDER_ATTACHMENT_OBSERVATION
    message_id: m2
    attachment_count: 1
    attachments:
      - provider_attachment_id: att-1
        filename: contract-revised.pdf
        mime_type: application/pdf

expected_admission:
  decision: TRACK
  reason_codes:
    - EXISTING_MATERIAL_WAITING_LOOP
    - COMMUNICATED_CLAIM_MATCHES_RELEVANT_PROVIDER_OBSERVATION

expected_matching:
  operation: RESOLVE
  matched_responsibility_id: R1

expected_responsibility:
  operational_outcome: receive the promised revised contract as an attachment to the counterpart message
  resolution_status: RESOLVED
  resolution_reason: SATISFIED
  live_tracking_state: LIVE
  attention_mode: PRESENT
  obligation_legs: []
  expected_events:
    - id: event-revised-attachment
      actor: OTHER_PARTY
      event: REVISED_CONTRACT_ATTACHMENT_OBSERVED
      status: SATISFIED
      provenance:
        message_id: m2
        provider_attachment_id: att-1
  completion_criteria:
    - criterion: EXPECTED_REVISED_CONTRACT_ATTACHMENT_IS_OBSERVED
      status: SATISFIED
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance:
    - field: completion_claim
      message_id: m2
      source_span: "修正版を添付しました"
    - field: provider_attachment_observation
      message_id: m2
      provider_attachment_id: att-1

expected_safety:
  requested_action: null
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: DONE
  primary_reason: the narrow attachment-delivery outcome is supported by matching communication and provider observation

must_hold_invariants:
  - provider observation establishes attachment presence on the observed message, not document correctness or legal validity
  - this case closes only the narrow operational outcome defined above
  - a broader outcome such as `deliver a usable/valid signed contract` would require stronger evidence and must not be silently inferred

forbidden_outcomes:
  - generalize provider attachment presence into proof that file contents are correct, uncorrupted, approved, or legally valid
  - claim all attachment/completion statements are true merely because this matched case is resolvable
```

---

# 13. What this batch proves

After Batch 1 + Batch 2, the detailed corpus now has explicit layered examples for eighteen of the forty-four Tier-0 base cases, plus the required explicit C23 observation counterpart.

The new pressure points are important:

```text
Proposal status must exist separately from agreed facts.
Hold needs constraint + blocked actionability + expected resume event.
Cancellation needs terminal resolution reason distinct from satisfaction.
Delegation requires evidence that the delegation communication became effective.
One Responsibility may require multiple completion criteria.
Weak positive/social language is not enough for terminal closure.
Historical evidence-relative openness does not imply live activation.
Any-of assignment cannot be faked with scalar BOTH or “assign everyone”.
Claim and provider observation can converge for a narrow fact without creating a global evidence hierarchy.
```

None of these findings requires a generic workflow engine.

---

# 14. Remaining highest-value detailed expansion

The next detailed batch should prioritize semantic boundaries that still lack a full one-event oracle despite transition coverage:

```text
T0-003 / T0-004 outbound request-vs-commitment direction pair
T0-005..008 commitment-force ladder
T0-011..013 preference / review / approval distinctions
T0-018..025 politeness / courtesy / direct-vs-CC / quote / forward zoning
T0-026 source due vs user target
T0-029 / T0-030 reopen vs new episode
T0-031 / T0-032 one sequential outcome vs independent outcomes
T0-041..044 genuine ambiguity / missing context / sarcasm / user-dependent optionality
```

Before physical schema freeze, at minimum expand the cases that can falsify a proposed minimal schema. In particular, a schema proposal must be tested against:

- parallel and any-of assignment;
- contingent actionability;
- partial completion criteria;
- proposal/agreement state;
- cancellation/supersession/reopen identity;
- historical inactive openness;
- field-level conflict/review;
- temporal-kind separation;
- cross-account isolation.

A schema that cannot represent one of those without ad-hoc overloaded fields should be rejected before migration code exists.