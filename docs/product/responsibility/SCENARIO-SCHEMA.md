# Canonical Responsibility Scenario Schema

## Purpose

This document defines the annotation/evaluation contract for one canonical Responsibility scenario.

It connects:

```text
product semantics
→ human annotation
→ AI extraction
→ admission/review
→ matching/reducer behavior
→ safety policy
→ UX projection
→ regression tests
```

This is **not** a database schema, API DTO, prompt schema, or physical enum contract.

The current vocabulary is constrained by:

- `ANNOTATION-GUIDELINES.md`;
- `DECISIONS.md`;
- `CONSISTENCY-AUDIT.md`;
- `TRANSITION-SCHEMA.md` for multi-event traces;
- detailed oracle pressure, including Batch 3 admission-review cases.

---

# 1. Scenario principles

Each base scenario SHOULD isolate one primary semantic boundary and only a small number of deliberate secondary interactions.

The corpus MUST include:

- clean canonical cases;
- adversarial/boundary cases;
- controlled metamorphic variants;
- eventually organic/historical/production failures.

Do not construct scenarios merely to prove the current design correct. Prefer cases capable of falsifying a FIXED principle or killing a known semantic mutant.

A multi-message scenario MUST identify the focal evidence event being interpreted/reduced.

---

# 2. Canonical scenario shape

Conceptual YAML:

```yaml
case_id: string
title: string
category: string
oracle_type: DETERMINATE | AMBIGUOUS | USER_DEPENDENT
risk_class: LOW | NORMAL | HIGH | CRITICAL
focal_message_id: string | null

coverage:
  rules: []
  contrasts: []
  interactions: []
  transitions: []
  mutants_killed: []
  metamorphic_relations: []
  forbidden_sentinels: []
  ambiguity_families: []

context:
  current_user:
  connected_accounts: []
  focal_connected_account: null
  locale:
  timezone:
  authorized_external_context: []
  existing_responsibilities: []
  evidence_revision: null

messages:
  - id:
    connected_account_id:
    direction: inbound | outbound
    sent_at:
    observed_at:
    sender:
    recipients: []
    cc: []
    subject:
    body:
    attachments: []

expected_zoning: []
expected_communication_acts: []
expected_claims: []
expected_observations: []

expected_admission:
  decision: TRACK | DO_NOT_TRACK | NEEDS_REVIEW
  reason_codes: []

# Optional. Use when admission itself is unresolved and therefore no
# canonical Responsibility has yet been admitted.
expected_admission_review:
  reason_codes: []
  candidate_summary:
  candidate_fields: {}
  evidence_revision: null
  provenance: []
  acceptable_resolution_paths: []

# Convenience shorthand ONLY when the focal event has exactly one
# Responsibility effect.
expected_matching:
  operation: CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP
  matched_responsibility_id: null

# Canonical form when the focal event affects one or more Responsibilities.
expected_effects:
  - responsibility_ref:
    operation: CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP
    resolution_reason: null
    reason:
    field_changes: []

# Convenience shorthand when exactly one admitted Responsibility snapshot
# is material to the oracle.
expected_responsibility:
  operational_outcome:

  resolution_status: OPEN | RESOLVED
  resolution_reason: null

  live_tracking_state:
  attention_mode:

  obligation_legs: []
  expected_events: []
  completion_criteria: []

  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []

  uncertainties: []
  responsibility_risk: null
  provenance: []

# Canonical form when one focal event creates/updates multiple admitted
# Responsibilities and their separate snapshots matter to the oracle.
expected_responsibilities:
  - responsibility_ref:
    operational_outcome:
    resolution_status:
    resolution_reason:
    live_tracking_state:
    attention_mode:
    obligation_legs: []
    expected_events: []
    completion_criteria: []
    pending_proposals: []
    agreed_facts: []
    constraints: []
    temporal_facts: []
    uncertainties: []
    responsibility_risk: null
    provenance: []

expected_safety:
  requested_action: null
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: MY_TURN | WAITING | LATER | DONE | REVIEW | NONE
  subject_kind: RESPONSIBILITY | ADMISSION_REVIEW | CONVERSATION_AGGREGATE | NONE
  primary_reason:

must_hold_invariants: []
forbidden_outcomes: []

variants:
  - id:
    transformation:
    must_preserve: []
    must_change: []
    forbidden_outcomes: []

notes:
```

Physical serialization is not frozen.

---

# 3. Compatibility aliases for already-written v0.1 oracles

Some detailed Tier-0 oracles predate the consistency audit.

Until they are normalized into executable fixtures:

```text
tracking_status: OPEN | RESOLVED
```

is a legacy alias for:

```text
resolution_status
```

only.

It MUST NOT be interpreted as live-tracking activation or attention state.

Likewise:

```text
active_obligations[]
```

is a legacy shorthand for the currently relevant unresolved/actionable subset of:

```text
obligation_legs[]
```

New oracles SHOULD use the reconciled canonical vocabulary above.

Errata recorded in `CONSISTENCY-AUDIT.md` apply during executable serialization.

---

# 4. Focal event and coverage metadata

`focal_message_id` prevents a multi-message scenario from becoming an ambiguous “classify the thread” task.

Example:

```text
m1: Friday due
m2: explicit correction to Monday

focal_message_id = m2
```

Coverage IDs from `COVERAGE-PLAN.md` belong beside the oracle so coverage can be mechanically audited later.

`mapped` means a test/oracle is designed. It does not mean implementation has passed it.

---

# 5. Context envelope

Annotation MUST declare which context is available. Do not silently use unavailable knowledge.

## 5.1 Connected accounts

Use:

```text
connected_accounts[]
focal_connected_account
```

rather than assuming one global mailbox.

Cross-account lookalikes MUST preserve account identity and MUST NOT auto-merge under the initial product semantics.

## 5.2 Authorized external context

Examples:

- verified participant timezone;
- trusted calendar event anchor;
- trusted organizational authority metadata;
- provider observation;
- user-confirmed field correction;
- explicitly authorized user/relationship convention when relevant to admission policy.

Do not place guessed hierarchy, hidden intent, or untrusted email claims here as trusted context.

## 5.3 Evidence revision

`evidence_revision` represents the semantic authorized-evidence-set version.

It is not a UI/read-state revision.

Stale AI/concurrency and missing-context/re-evaluation scenarios SHOULD specify it when the distinction matters.

---

# 6. Message zoning

Message content is untrusted evidence.

Use zones where relevant:

```text
AUTHORED_CURRENT
QUOTED_HISTORY
FORWARDED_CONTENT
SIGNATURE
DISCLAIMER
STRUCTURED_METADATA
```

Quoted/forwarded content may provide context/provenance without automatically gaining current-turn request authority.

---

# 7. Communication-act oracle

Do not force a single whole-message label.

Current minimal semantic act vocabulary:

```text
REQUEST
COMMITMENT
PROPOSAL
DECISION
CORRECTION
CANCELLATION
COMPLETION_SIGNAL
INFORMATION
```

When a case is genuinely unresolved, the oracle may use a clearly marked candidate/ambiguous act description rather than invent a false top-level label.

A communication-act entry may additionally express:

```text
speaker
obligation_bearer / obligation_bearers
assignment_shape
communicative_force
action_or_event
object
modality
obligation_strength
polarity
condition
constraints
temporal_expression
provenance
```

Transition terms such as “rejection”, “hold”, or “resume” need not become new top-level act enums when existing act + modality/constraint/effect semantics represent them cleanly.

Exact production enums remain open.

---

# 8. Claims and observations

`expected_claims` and `expected_observations` MUST remain distinct when the distinction affects state.

Example:

```text
COMMUNICATED_CLAIM:
"修正版を添付しました"

PROVIDER_OBSERVATION:
attachments=[]
```

A claim is evidence of what was communicated, not automatic proof of the claimed external event.

Evidence authority is field-specific.

---

# 9. Admission oracle and pre-admission Review

Admission is distinct from extraction:

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

`TRACK` means a material Responsibility loop should be represented.

It does **not** mean the requested action is legitimate, authorized, or safe to execute.

`NEEDS_REVIEW` is reserved for uncertainty about the admission decision itself.

A definitely tracked Responsibility may instead contain field-scoped uncertainty and project `REVIEW`.

## 9.1 Admission Review is not a Responsibility

When:

```text
expected_admission.decision = NEEDS_REVIEW
```

because Responsibility existence/materiality/relevance itself is unresolved, the oracle SHOULD use `expected_admission_review` and SHOULD NOT invent a canonical Responsibility snapshot merely to represent UI Review.

Canonical examples:

```text
T0-041 vague `来週よろしくお願いします`
T0-043 missing referent `それでお願いします`
T0-044 user-dependent optionality/materiality
```

An admission-review oracle may record:

- why admission is unresolved;
- candidate facts that are actually grounded;
- evidence/context revision;
- provenance;
- acceptable resolution paths such as TRACK / DO_NOT_TRACK / remain review.

A later TRACK decision may CREATE a Responsibility. A DO_NOT_TRACK decision may close/dismiss the review without a fake resolved Responsibility.

## 9.2 Review UI is a union projection

User-facing `REVIEW` may originate from:

```text
A. an admitted Responsibility with material decision-critical field uncertainty
B. an admission-level review candidate before Responsibility creation
```

The UI may unify them visually, but tests/application contracts must preserve `subject_kind` so actions do not confuse “resolve a field conflict” with “admit/dismiss a candidate.”

---

# 10. Matching/effect oracle

Canonical operations:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP
```

## 10.1 Composite effects

When one focal event changes more than one Responsibility, use `expected_effects[]`.

Example:

```text
R1 -> SUPERSEDE
R2 -> CREATE
```

Do not mutate R1's operational outcome into R2's replacement outcome.

One source message can also create multiple independent Responsibilities. In that case `expected_responsibilities[]` records separate snapshots when needed.

## 10.2 SUPERSEDE semantics

`SUPERSEDE` is terminal on the old Responsibility and conceptually yields:

```text
resolution_status = RESOLVED
resolution_reason = SUPERSEDED
```

Replacement creation, if any, is a separate `CREATE` effect.

Narrative shorthand such as `RESOLVE/SUPERSEDE` is not the canonical operation model.

## 10.3 REOPEN vs new episode

```text
same operational outcome was never actually satisfied -> REOPEN
prior episode genuinely closed + later new operational work -> CREATE
```

Similarity alone is not merge authority.

REOPEN does not imply every prior obligation leg/history row must be reset. Prior completed actions may remain historically satisfied while a new remedial leg becomes current.

---

# 11. Canonical Responsibility semantic vector

The Responsibility oracle is evidence-relative and state-vector-like.

## 11.1 Resolution status

Conceptually:

```text
OPEN
RESOLVED
```

Resolution reason is separate, for example:

```text
SATISFIED
DECLINED
CANCELLED
SUPERSEDED
USER_CLOSED
INVALIDATED
DUPLICATE
```

Exact enums remain open.

## 11.2 Live-tracking activation

Historical semantic openness is distinct from live work activation.

A historical item may be evidence-relative OPEN while remaining an inactive historical candidate that does not enter `MY_TURN`.

Exact representation remains open.

## 11.3 Attention

Attention/defer is orthogonal:

```text
present attention
intentional defer/snooze
```

A communication hold does not itself imply attention defer.

## 11.4 Obligation legs

Canonical obligation-leg semantics may include:

```yaml
- id:
  bearer:
  action:
  object:
  status:
  actionability:
  basis:
  authority_status:
  condition:
  temporal_fact_ref:
  provenance:
```

This supports:

- parallel signers;
- contingent future work;
- safety-blocked requested actions;
- satisfied vs still-open legs.

`active user obligations` are derived from these dimensions.

### Granularity rule

Do not create one persistent obligation leg per linguistic verb by default.

Separate legs when independent bearer/actionability/closure/query pressure requires them. A bounded sequential/conditional instruction may remain one cohesive leg plus typed condition/constraint detail when that is the smallest faithful model.

## 11.5 Expected events

Expected events identify who/what the product is waiting for and any condition/temporal linkage.

## 11.6 Completion criteria

`completion_criteria[]` represents multiple conditions that jointly close one operational outcome without forcing artificial Responsibility splitting.

Example:

```text
one Responsibility: provide identity document
criteria: FRONT + BACK
```

## 11.7 Risk

Top-level scenario `risk_class` is test-priority/harm classification.

`responsibility_risk` is the product/domain risk associated with being wrong about this Responsibility/action.

They are not automatically the same field.

---

# 12. Temporal facts

Distinguish at least:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
RESURFACE_TIME
FOLLOW_UP_TIME
```

`SOURCE_DUE` means an explicitly communicated due/required time for an obligation. It is not limited by message direction or bearer and does not become a different temporal kind merely because source legitimacy is uncertain.

Safety/authority metadata belongs separately.

A USER-authored `USER_TARGET` is an orthogonal fact, not automatically an override/correction of `SOURCE_DUE`.

Each material temporal fact should preserve:

```text
original expression
semantic kind
resolved value if justified
precision
reference frame / anchor
applies_to when relevant
provenance
```

Never silently upgrade source precision.

External anchor resolution remains derived.

---

# 13. Field-scoped uncertainty

When a material field has contradictory evidence, preserve the candidate evidence and uncertainty at that field.

Do not delete evidence merely to force one value.

Typical causes include:

```text
SOURCE_AMBIGUITY
MISSING_CONTEXT
CONFLICTING_EVIDENCE
SOURCE_NOISE
AMBIGUOUS_ASSIGNMENT
STALE_ANALYSIS
MODEL_UNCERTAINTY
HIGH_RISK_UNVERIFIED_REQUEST
USER_DEPENDENT_MATERIALITY
```

Exact storage enums remain open.

Field-scoped uncertainty inside a TRACKed Responsibility is distinct from admission-level uncertainty before a Responsibility exists.

---

# 14. Safety/actionability oracle

Separate:

```text
communicated requested action
!=
accepted product-domain obligation
!=
safe product next action
```

For a high-risk unverified payment request:

```text
communicated requested action = TRANSFER_MONEY
Responsibility may track = resolve/verify/decide the request
safe next action = VERIFY_PAYMENT_REQUEST
```

The sender's requested action and source facts remain preserved with provenance; they are not rewritten into the safe action.

`confirmation_or_review_required: true` denotes an additional elevated verification/confirmation requirement. `false` does not authorize autonomous side effects.

Prompt-injection/tool-like text inside email has no application authority.

---

# 15. Projection oracle

Projection is derived, deterministic product state/surface behavior.

Responsibility-side conceptual rule shape:

```text
no admitted live Responsibility -> NONE
resolved live Responsibility -> DONE
open + material field-review condition -> REVIEW
open + intentionally deferred attention -> LATER
open + actionable USER obligation leg -> MY_TURN
open + only OTHER/EXTERNAL pending work/events -> WAITING
otherwise -> REVIEW / ordinary fallback
```

Admission-side rule:

```text
unresolved accepted AdmissionReview selected for surfacing -> REVIEW
```

Therefore `REVIEW` is a product projection family, not proof that its subject is an admitted Responsibility.

Historical inactive candidates MUST NOT become live `MY_TURN` merely because they appear evidence-relative OPEN.

A hold blocked on another party/event normally projects `WAITING`; `LATER` requires separate defer semantics.

---

# 16. Oracle types

### DETERMINATE

Available evidence supports one clear semantic answer.

### AMBIGUOUS

Even with supplied context, multiple interpretations remain reasonably possible, or supplied context is explicitly insufficient and the oracle preserves that limitation.

The oracle may specify invariants/forbidden outcomes rather than force one field value.

### USER_DEPENDENT

Correct product behavior materially depends on a user preference, relationship convention, or private context that is not universal.

Where practical, preserve raw independent annotations and adjudication rationale.

---

# 17. Layered oracle requirement

A promoted executable scenario must be decomposable into the relevant path.

For admitted Responsibility cases:

```text
zoning
communication act / claim
provider/external observation
admission
matching/effects
canonical Responsibility semantics
safety/actionability
projection
must-hold / forbidden outcomes
```

For admission-review cases:

```text
zoning
communication act / candidate facts
provider/external/context evidence
admission = NEEDS_REVIEW
admission-review state / provenance / revision
projection or non-surfacing policy
resolution paths
must-hold / forbidden outcomes
```

A final bucket alone is not a valid oracle.

---

# 18. Invariants and forbidden outcomes

Every HIGH/CRITICAL or semantic-boundary scenario SHOULD specify what must never occur at the earliest unsafe point.

Examples:

```text
proposal -> must not become agreed fact before acceptance
weak completion claim -> must not resolve material loop
stale AI result -> must not mutate current revision
high-risk request -> must not become executable merely from source request/confidence
historical candidate -> must not flood live My Turn
admission ambiguity -> must not create a fake Responsibility merely to render Review
missing context -> must not fabricate referent/action
```

---

# 19. Metamorphic variants

A controlled variant should state:

```text
transformation
must_preserve
must_change
forbidden_outcomes
```

Meaning-preserving noise should preserve decision-critical semantics.

Meaning-changing minimal edits must change the relevant fields while unrelated context remains stable.

Important families include:

- Japanese typo/IME noise;
- punctuation/spacing;
- politeness rewrite;
- code-switching;
- To vs CC;
- inbound vs outbound;
- negation;
- date/amount mutation;
- proposal → acceptance;
- fresh → stale evidence revision;
- current-authored ↔ quoted/forwarded placement;
- context-envelope enrichment for missing-context review.

---

# 20. Coverage and promotion

Corpus-level obligations live in `COVERAGE-PLAN.md`.

A case is promoted when it protects at least one material invariant, contrast, interaction, transition, mutant, high-harm failure, metamorphic relation, or organic regression.

Before executable promotion:

- apply `CONSISTENCY-AUDIT.md` errata/aliases;
- serialize both sides of mandatory contrasts;
- provide explicit must-hold/forbidden outcomes for HIGH/CRITICAL cases;
- preserve admission-review vs admitted-Responsibility subject identity;
- do not expose annotators to current model predictions before oracle creation;
- retain genuine ambiguity rather than forcing false certainty;
- verify coverage IDs mechanically or with an equivalent linter.

Raw overall accuracy is insufficient; correctness, safety, stability, provenance, admission quality, and semantic robustness must remain separable evaluation views.