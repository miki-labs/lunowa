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

---

## 1. Scenario principles

Each scenario SHOULD isolate one or a small number of meaningful semantic boundaries while preserving realistic email context.

The dataset MUST contain both:

- clean canonical examples;
- adversarial/boundary variants.

Later phases SHOULD add organic/historical failures rather than relying only on synthetic examples.

Do not create scenarios only to prove the current design correct. Prefer examples capable of falsifying it.

---

## 2. Required scenario fields

Conceptual schema:

```yaml
case_id: string
title: string
category: string
oracle_type: DETERMINATE | AMBIGUOUS | USER_DEPENDENT
risk_class: LOW | NORMAL | HIGH | CRITICAL

context:
  current_user:
  connected_account:
  locale:
  timezone:
  authorized_external_context: []
  existing_responsibilities: []

messages:
  - id:
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
notes:
```

The physical serialization format is not frozen; YAML is illustrative.

---

## 3. Oracle types

### DETERMINATE

Available evidence supports one clear semantic answer under the guideline.

### AMBIGUOUS

Even with the supplied context, multiple interpretations remain reasonably possible. The oracle may define required invariants/forbidden outcomes instead of forcing one label.

### USER_DEPENDENT

The correct product behavior materially depends on a user preference, relationship convention, or private context that is intentionally not universal.

---

## 4. Layered oracle requirements

Do not store only a final UI bucket.

At minimum, scenario truth should be decomposable into:

```text
zoning
communication act / claim
admission
identity/matching operation
canonical responsibility semantics
safety/actionability
product projection
```

This allows a failure such as `deadline hallucination` to be distinguished from `wrong owner`, `wrong matching`, or `projection` errors.

---

## 5. Invariants and forbidden outcomes

Every high-risk or boundary scenario SHOULD state what must never happen.

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
- mark resolved before the expected event/closure
```

Forbidden outcomes are especially important when an ambiguous case has more than one acceptable answer.

---

## 6. Perturbation families

High-value canonical cases SHOULD generate controlled variants.

### 6.1 Meaning-preserving noise

Examples:

- kana omission/insertion;
- common Japanese IME conversion error;
- punctuation/casing variation;
- minor spelling error;
- code-switching that preserves meaning;
- broken but interpretable grammar.

Expected property: decision-critical semantics remain invariant.

### 6.2 Meaning-changing minimal edits

Examples:

```text
送ってください
送らないでください
```

```text
承認します
承認しません
```

Expected property: system remains sensitive to the semantic change.

### 6.3 Context perturbation

Vary:

- To vs CC;
- sender/assignee identity;
- quoted vs current-authored text;
- inbound vs outbound direction;
- presence/absence of prior thread context;
- accepted vs pending proposal;
- old vs current evidence revision.

---

## 7. Coverage dimensions

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

Not every Cartesian-product combination is valuable. Prioritize intersections where an error changes product behavior or causes meaningful harm.

---

## 8. Initial high-priority scenario families

The first matrix pass SHOULD include at least the following families:

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

## 9. Evaluation views

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

Error cost is asymmetric. Maintain at least the following ordinal harm relations until empirical weights exist:

```text
fake completion >> visible uncertainty
missed material user obligation > unnecessary review
false merge > modest false split
invented material date/amount = critical class
wrong account/identity/authorization = critical class
```

---

## 10. Human annotation process

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

## 11. Promotion rule

A synthetic/boundary scenario becomes part of the long-lived regression suite when at least one is true:

- it protects a FIXED invariant;
- it previously caused a material failure;
- it distinguishes two semantics that are easy to collapse;
- it covers a high-risk or high-frequency real-world pattern;
- it exposes nondeterminism or typo/noise instability that can change product behavior.

Low-value redundant cases should not accumulate merely to increase dataset size.
