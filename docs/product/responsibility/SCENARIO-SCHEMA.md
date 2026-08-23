# Canonical Responsibility Scenario Schema

## Purpose

This document defines how to build the canonical scenario matrix used to validate the responsibility semantics in `ANNOTATION-GUIDELINES.md`.

The matrix is not merely a prompt/eval dataset. It is the shared oracle connecting:

```text
product semantics
→ human annotation
→ AI extraction
→ matching/reducer behavior
→ safety policy
→ UX projection
→ regression tests
```

A scenario should be understandable without knowing model internals.

The schema is an **annotation/evaluation contract**, not a product database schema. Physical serialization, enum names, table design, and runtime DTOs remain open.

---

## 1. Scenario principles

Each scenario SHOULD isolate one or a small number of meaningful semantic boundaries while preserving realistic email context.

The corpus MUST contain both:

- clean canonical examples;
- adversarial/boundary variants.

Later phases SHOULD add organic/historical failures rather than relying only on synthetic examples.

Do not create scenarios only to prove the current design correct. Prefer examples capable of falsifying it.

A scenario may include prior evidence, but MUST identify which event is currently being interpreted/reduced so chronology and matching are explicit.

---

## 2. Required scenario shape

Conceptual schema:

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

expected_matching:
  operation: CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP
  matched_responsibility_id: null

expected_responsibility:
  operational_outcome:
  tracking_status:
  resolution_reason: null
  active_obligations: []
  expected_events: []
  pending_proposals: []
  agreed_facts: []
  constraints: []
  temporal_facts: []
  uncertainties: []
  provenance: []

expected_safety:
  requested_action: null
  safe_next_action: null
  confirmation_or_review_required: false

expected_projection:
  bucket: MY_TURN | WAITING | LATER | DONE | REVIEW | NONE
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

The physical serialization format is not frozen; YAML is illustrative.

---

## 3. Why the schema contains focal and coverage metadata

Detailed Tier 0 expansion demonstrated two concrete needs.

### 3.1 Focal message/event

A scenario may need prior messages to establish an existing Responsibility, correction target, conflict, or chronology. `focal_message_id` prevents a multi-message context from becoming an ambiguous “classify this whole thread” task.

Example:

```text
m1: Friday due
m2: explicit correction to Monday

focal_message_id = m2
```

The oracle can then say that m2 performs `UPDATE` on the Responsibility created from m1.

### 3.2 Coverage mapping

Coverage IDs from `COVERAGE-PLAN.md` belong next to the scenario oracle so the corpus can later be audited mechanically.

`mapped` means the scenario/test is designed to cover the obligation; it does not mean an implementation has passed it.

---

## 4. Context envelope

Annotation MUST declare which context is available. Do not silently use unavailable knowledge.

### 4.1 Connected accounts

Use `connected_accounts[]` and `focal_connected_account` rather than assuming one global mailbox. This is required for cross-account isolation scenarios.

A simple single-account case still contains one entry.

### 4.2 Authorized external context

Examples include:

- a trusted timezone for a participant;
- a verified calendar event anchor;
- trusted organization-role metadata;
- a provider observation;
- a user-confirmed field correction.

Do not place guessed social status, hidden private intent, or untrusted email claims in this section as though they were trusted context.

### 4.3 Evidence revision

`evidence_revision` is optional for static semantic cases but SHOULD be supplied for stale-analysis/concurrency cases. It represents the semantic evidence-set revision, not a UI/read-state revision.

---

## 5. Message and zoning requirements

Message bodies are untrusted communication evidence.

`expected_zoning` should distinguish where relevant:

```text
AUTHORED_CURRENT
QUOTED_HISTORY
FORWARDED_CONTENT
SIGNATURE
DISCLAIMER
STRUCTURED_METADATA
```

Quoted/forwarded text may provide context/provenance without automatically gaining current-turn request authority.

---

## 6. Communication-act oracle

Do not force one exclusive whole-message label.

Current minimal semantic act vocabulary may include:

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

An act entry may additionally express, when relevant:

```text
speaker
obligation_bearer / obligation_bearers
assignment_shape
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

These are annotation concepts. Exact production enums remain open.

---

## 7. Claims and observations

`expected_claims` and `expected_observations` MUST remain separate when the distinction affects state.

Examples:

```text
COMMUNICATED_CLAIM:
"修正版を添付しました"

PROVIDER_OBSERVATION:
attachments=[]
```

A claim can be valid evidence of **what was communicated** without being authoritative evidence that the claimed external-world event occurred.

Evidence authority is field-specific; do not define one global ranking that applies to every fact.

---

## 8. Admission oracle

Admission is distinct from communication-act extraction.

```text
TRACK
DO_NOT_TRACK
NEEDS_REVIEW
```

`TRACK` means a material responsibility loop should be represented. It does not mean the sender's requested action is legitimate, authorized, or safe to execute.

`NEEDS_REVIEW` should be used when the **admission decision itself** is not safely determined. A tracked Responsibility may instead contain field-scoped uncertainty and project `REVIEW` when its existence is clear but a decision-critical field is conflicted.

This distinction prevents deadline ambiguity from incorrectly erasing a clear user obligation.

---

## 9. Matching oracle

Matching uses:

```text
CREATE
UPDATE
RESOLVE
REOPEN
SUPERSEDE
INVALIDATE
NO_OP
```

The oracle must distinguish:

- explicit correction from unrelated/later conflict;
- REOPEN from genuinely new episode;
- candidate similarity from merge authority;
- same-account from prohibited initial cross-account merge.

For multi-event transition traces, each focal event SHOULD have its own matching/reduction step rather than one vague final matching label.

---

## 10. Responsibility semantic shape

The Responsibility oracle is state-vector-like and evidence-relative.

### 10.1 Active obligations

An obligation entry may carry semantic attributes such as:

```yaml
- id:
  bearer:
  action:
  object:
  status:
  basis:
  condition:
  temporal_fact_ref:
  provenance:
```

This allows one Responsibility to represent parallel obligation legs without pretending a scalar `next_owner` is complete truth.

### 10.2 Expected events

Expected-event entries should identify who/event the user is waiting on and any temporal linkage.

### 10.3 Temporal facts

Temporal facts SHOULD distinguish at least:

```text
SOURCE_DUE
EXPECTED_EVENT_TIME
USER_TARGET
RESURFACE_TIME
FOLLOW_UP_TIME
```

Other candidate kinds may be used in an ambiguous oracle, but MUST NOT silently become authoritative source due dates.

Each material temporal fact should preserve:

```text
original expression
semantic kind
resolved value if justified
precision
reference frame / anchor when relevant
provenance
```

### 10.4 Field-scoped conflict

When a material field has contradictory evidence, preserve the candidates and annotate uncertainty at that field. Do not delete one source merely to force a single value.

---

## 11. Safety/actionability oracle

The safety layer explicitly separates:

```text
sender/requested action
≠
safe product next action
```

For example:

```text
requested_action = TRANSFER_MONEY
safe_next_action = VERIFY_PAYMENT_REQUEST
```

`confirmation_or_review_required: true` means an **additional elevated safety/verification requirement** exists. A value of `false` does not authorize autonomous mail sending or other side effects; ordinary human-commit interaction rules still apply.

Prompt-injection/tool-like text inside email remains untrusted communication content and cannot create application authority.

---

## 12. Projection oracle

Do not store only a final UI bucket, but every canonical scenario SHOULD state the expected projection after reduction/safety policy.

Conceptual projection buckets:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Typical rule shape:

```text
resolved -> DONE
open + material review condition -> REVIEW
open + deferred attention -> LATER
open + at least one USER obligation -> MY_TURN
open + only OTHER/EXTERNAL pending obligations/events -> WAITING
no trackable responsibility -> NONE
```

Exact prioritization among multiple Responsibilities remains a deterministic product rule and may be tested separately.

---

## 13. Oracle types

### DETERMINATE

Available evidence supports one clear semantic answer under the guideline.

### AMBIGUOUS

Even with the supplied context, multiple interpretations remain reasonably possible. The oracle may define required invariants/forbidden outcomes instead of forcing one field value.

A scenario can still deterministically require `REVIEW` because a specific field is genuinely ambiguous.

### USER_DEPENDENT

Correct product behavior materially depends on a user preference, relationship convention, or private context that is intentionally not universal.

---

## 14. Layered oracle requirements

Do not store only a final UI bucket.

At minimum, scenario truth should be decomposable into:

```text
zoning
communication act / claim
provider/external observation when applicable
admission
identity/matching operation
canonical responsibility semantics
safety/actionability
product projection
```

This allows a failure such as `deadline hallucination` to be distinguished from `wrong owner`, `wrong matching`, `unsafe CTA`, or `projection` errors.

---

## 15. Invariants and forbidden outcomes

Every HIGH/CRITICAL or boundary scenario SHOULD state what must never happen.

Example:

```text
Input:
"修正版は明日こちらから送ります"

Must hold:
- expected event is tied to the other party
- source wording/provenance is preserved

Forbidden:
- invent user deadline = tomorrow
- project My Turn solely from the word "tomorrow"
- mark resolved before expected-event/closure evidence
```

Forbidden outcomes are especially important when an ambiguous case has more than one acceptable field value.

---

## 16. Perturbation / metamorphic variants

High-value canonical cases SHOULD generate controlled variants.

A variant should state:

```text
transformation
must_preserve
must_change
forbidden_outcomes
```

### 16.1 Meaning-preserving noise

Examples:

- kana omission/insertion;
- common Japanese IME conversion error;
- punctuation/casing variation;
- minor spelling error;
- code-switching that preserves meaning;
- broken but interpretable grammar.

Expected property: decision-critical semantics remain invariant.

### 16.2 Meaning-changing minimal edits

Examples:

```text
送ってください
送らないでください
```

```text
承認します
承認しません
```

Expected property: relevant decision-critical fields change while unrelated fields remain stable.

### 16.3 Context perturbation

Vary:

- To vs CC;
- sender/assignee identity;
- quoted vs current-authored text;
- inbound vs outbound direction;
- presence/absence of prior thread context;
- accepted vs pending proposal;
- account scope;
- old vs current evidence revision.

---

## 17. Coverage dimensions

The matrix SHOULD systematically cover intersections of these dimensions rather than only accumulating random cases:

```text
direction
communication act
modality / obligation strength
admission
assignment shape
identity operation
temporal semantics
proposal/agreement state
constraint/condition
resolution reason
message zoning
attachment evidence
source noise
uncertainty cause
risk class
account scope
AI freshness
ingestion chronology
historical vs live processing
```

Not every Cartesian-product combination is valuable. Prioritize intersections where an error changes product behavior or causes meaningful harm. Corpus-level obligations live in `COVERAGE-PLAN.md`.

---

## 18. Initial high-priority scenario families

The first matrix pass SHOULD include at least:

1. direct inbound/outbound Request/Commitment four-quadrant cases;
2. `DO_NOT_TRACK` courtesy/FYI/receipt/newsletter cases;
3. indirect Japanese business requests and optionality;
4. plan/intention/tentative vs firm commitment;
5. proposal/counterproposal/acceptance/rejection;
6. deadline correction vs conflicting evidence;
7. source due vs expected-event time vs user target;
8. relative time, timezone, EOD, event-relative anchors;
9. multiple requests in one message;
10. sequential steps vs independent outcomes;
11. partial completion criteria;
12. reopen vs new episode;
13. parallel signers / group ambiguity;
14. delegation intent vs effective delegation;
15. hold/pause vs cancellation;
16. quoted/forwarded/reported requests;
17. claim-vs-provider-observation conflicts;
18. attachment-only and contradictory attachment cases;
19. typo/IME/noise invariance and sensitivity;
20. sarcasm/rhetorical/non-literal decision-critical ambiguity;
21. high-risk payment/contract/login requests;
22. prompt-injection text in email;
23. stale AI runs;
24. out-of-order provider ingestion;
25. historical initial sync/open-loop ambiguity;
26. cross-account lookalikes that must not merge;
27. user field correction/target vs source fact;
28. strong/weak completion signals;
29. user decline vs user tracking close;
30. genuine human disagreement/oracle ambiguity.

---

## 19. Evaluation views

The same scenario corpus should support separate scorecards for:

```text
zoning accuracy
act/claim extraction
responsibility admission
identity operation
owner/obligation accuracy
temporal-fact correctness
resolution safety
provenance coverage
safety/actionability behavior
UX projection
run stability
typo invariance
semantic sensitivity
```

Raw overall accuracy is insufficient.

Error cost is asymmetric. Maintain at least:

```text
fake completion >> visible uncertainty
missed material user obligation > unnecessary review
false merge > modest false split
invented material date/amount = critical class
wrong account/identity/authorization = critical class
```

---

## 20. Human annotation process

For important boundary cases, prefer independent annotation before adjudication.

Where practical preserve:

```text
raw_annotations
adjudicated_oracle
oracle_type
adjudication_reason
```

Annotators should not see the model's current prediction before recording the human oracle; otherwise anchoring can contaminate the evaluation set.

---

## 21. Promotion rule

A synthetic/boundary scenario becomes part of the long-lived regression suite when at least one is true:

- it protects a FIXED invariant;
- it previously caused a material failure;
- it distinguishes two semantics that are easy to collapse;
- it covers a high-risk or high-frequency real-world pattern;
- it kills a mandatory semantic mutant;
- it exposes nondeterminism or typo/noise instability that can change product behavior.

Low-value redundant cases should not accumulate merely to increase dataset size.
