# Canonical Responsibility Transition Trace Schema

## Purpose

`SCENARIO-SCHEMA.md` is optimized for one focal semantic event. This document extends that contract for multi-event traces where correctness depends on state evolution, semantic chronology, evidence revision, branching, or multiple Responsibility effects.

This is an annotation/evaluation contract, not a database or event-sourcing schema.

It is constrained by `DECISIONS.md` and `CONSISTENCY-AUDIT.md`.

---

# 1. Trace shape

Conceptual form:

```yaml
trace_id: T01
title: string
oracle_type: DETERMINATE | AMBIGUOUS | USER_DEPENDENT
risk_class: LOW | NORMAL | HIGH | CRITICAL

coverage:
  transitions: []
  rules: []
  interactions: []
  mutants_killed: []
  forbidden_sentinels: []

context:
  current_user:
  connected_accounts: []
  locale:
  timezone:
  authorized_external_context: []

initial_state:
  evidence_revision:
  responsibilities: []

steps:
  - step_id:
    semantic_time:
    observed_time:

    event:
      kind: MESSAGE | PROVIDER_OBSERVATION | EXTERNAL_FACT | USER_COMMAND | TEMPORAL_TRIGGER | AI_RESULT
      source_id:
      payload:

    interpretation:
      communication_acts: []
      claims: []
      observations: []
      uncertainties: []

    expected_effects:
      - responsibility_ref:
        operation: CREATE | UPDATE | RESOLVE | REOPEN | SUPERSEDE | INVALIDATE | NO_OP
        resolution_reason: null
        reason:
        field_changes: []

    expected_evidence_revision:
      before:
      after:

    expected_snapshot:
      responsibilities: []
      accepted_interpretation_basis_revision:

    expected_safety:
      safe_next_action:
      elevated_review_required:

    expected_projection: []

    must_hold: []
    forbidden_outcomes: []

branches: []
notes:
```

Physical serialization is not frozen.

---

# 2. Effects are canonical; combined operation shorthand is not

A single event may affect more than one Responsibility.

Canonical example:

```text
"先ほどのドラフトAレビュー依頼は取り下げます。
 代わりに解約通知案を月曜までに作成してください。"
```

Correct effect set:

```text
R1 -> SUPERSEDE
R2 -> CREATE
```

`SUPERSEDE` is terminal on R1 and conceptually yields:

```text
R1.resolution_status = RESOLVED
R1.resolution_reason = SUPERSEDED
```

If replacement work exists, its `CREATE` is a separate effect.

Do not encode:

```text
R1 -> RESOLVE + SUPERSEDE
```

as two independent operations, and do not mutate R1's operational outcome into R2's outcome.

Likewise narrative text such as `UPDATE/RESOLVE` should be normalized to the terminal operation (`RESOLVE`) with any final field changes carried in that effect.

For a simple single-effect focal event, `SCENARIO-SCHEMA.md.expected_matching` may remain a shorthand. Multi-effect cases use `expected_effects[]`.

---

# 3. Semantic time vs observed time

Each step may record both:

```text
semantic_time
observed_time
```

because:

```text
observed later != semantically newer
```

This is mandatory for out-of-order ingestion/reconciliation traces.

Timestamps alone do not establish authority. Explicit correction/supersession relations and field-specific authority still govern reduction.

---

# 4. Evidence revision and stale AI

Concurrency/AI traces SHOULD identify evidence revisions.

A model result is eligible to mutate current state only if its basis is valid for the current semantic evidence revision **and** all other validation/authorization/domain requirements pass.

Conceptually:

```text
AIResult.basis_revision == CurrentEvidenceRevision
```

is necessary but not sufficient.

A stale result may be retained for diagnostics/evaluation without becoming current product state.

---

# 5. Snapshot semantics

A snapshot is evidence-relative, not world-omniscient.

When material to the trace, snapshot semantics should distinguish:

```text
resolution_status
live_tracking_state
attention_mode
obligation_legs[]
expected_events[]
completion_criteria[]
constraints[]
pending_proposals / agreed_facts
temporal_facts[]
uncertainties[]
risk
provenance[]
safety/actionability
projection
```

Exact physical enum/table representation remains open.

Existing transition notes that use legacy `tracking_status: OPEN/RESOLVED` should be interpreted as resolution-status shorthand only.

Do not copy every unchanged field into every step merely to create verbosity; the trace must remain auditable.

---

# 6. Obligation actionability and conditional activation

A trace may need to retain an obligation leg that is known but not currently actionable.

Example:

```text
LEGAL_APPROVAL
    -> activates
USER_SIGN
```

The oracle MUST preserve the activation relation without projecting `MY_TURN` before approval.

Conceptually an obligation leg may include:

```text
condition
actionability
status
```

The physical model may later use:

- a condition on an obligation leg;
- an expected event with an activation effect;
- another minimal representation.

The semantic requirement is fixed; a generic workflow engine is not implied.

---

# 7. Hold vs attention defer

Transition traces MUST distinguish:

```text
communication hold/pause
!=
product attention defer/snooze
```

A held Responsibility waiting for counterpart/external resumption normally projects `WAITING`.

It projects `LATER` only when a separate attention/defer decision intentionally removes it from present attention and a return condition exists.

---

# 8. Send attempt vs reconciled send

A send command, button press, dispatch attempt, timeout, and provider-reconciled accepted message are distinct evidence events.

Canonical rule:

```text
send attempt != reconciled provider acceptance
```

An ambiguous provider result MUST NOT be treated as confirmed completion or confirmed failure without appropriate reconciliation.

Even reconciled sending resolves a Responsibility only when successful sending is sufficient evidence for the specific operational closure condition.

Do not generalize:

```text
provider accepted message -> attachment usable / counterpart approved / external goal satisfied
```

---

# 9. Historical activation branches

Historical reconstruction may produce an evidence-relative open loop without activating it as live work.

A trace may branch on explicit user authority:

```text
historical candidate
  -> USER resumes tracking
  -> USER closes tracking
```

The pre-branch state should distinguish:

```text
resolution_status = OPEN
live_tracking_state = inactive/historical candidate
```

or an equivalent semantic representation.

Closing tracking MUST NOT assert objective world satisfaction.

---

# 10. Completion criteria and parallel legs

Transition traces must distinguish:

```text
one Responsibility with multiple criteria
```

from:

```text
multiple independent Responsibilities
```

A partial criterion completion does not resolve the whole Responsibility.

Likewise, one signer completing one obligation leg does not resolve a shared operational outcome while another required leg remains open.

---

# 11. Temporal anchor transitions

An event-relative source expression remains immutable evidence while its derived resolution may change with an authoritative external anchor.

Example:

```text
source: "会議開始の1時間前まで"
anchor Meeting-X: 15:00 -> 16:30
resolved due: 14:00 -> 15:30
```

The source expression/provenance remains unchanged.

`SOURCE_DUE`, `EXPECTED_EVENT_TIME`, `USER_TARGET`, `RESURFACE_TIME`, and `FOLLOW_UP_TIME` remain distinct semantic kinds.

Source legitimacy/safety uncertainty is represented separately from temporal kind.

---

# 12. Projection discipline

Projection remains derived from the reconciled semantic vector.

Typical sequence-sensitive rules:

```text
open + actionable USER leg -> MY_TURN
open + only OTHER/EXTERNAL pending work -> WAITING
open + material review condition -> REVIEW
open + intentional attention defer -> LATER
resolved live loop -> DONE
historical inactive candidate -> NONE or REVIEW, not automatic MY_TURN
```

A transient unsafe projection is still a failure even if a later event repairs it.

---

# 13. Trace-level invariants

Every HIGH/CRITICAL trace SHOULD define forbidden outcomes at the earliest step where they could occur.

Examples:

```text
send attempt -> must not resolve before sufficient reconciliation
proposal -> must not become agreed fact before acceptance
hold -> must not resolve as cancelled
old late event -> must not roll back newer correction
stale AI result -> must not mutate current revision
USER leg completed -> must not resolve while OTHER required leg remains
partial criterion -> must not mark whole Responsibility Done
conditional leg -> must not become actionable before activation condition
historical candidate -> must not automatically flood My Turn
```

---

# 14. Verification routing

A transition oracle identifies semantic truth; the runtime layer that can violate it determines the primary executable test.

| Concern | Primary verification |
| --- | --- |
| identity/reducer transition | deterministic domain tests |
| provider send ambiguity/reconciliation | provider integration tests |
| temporal follow-up | scheduler + reducer integration |
| out-of-order sync | ingestion/reconciliation integration |
| stale AI basis revision | AI runtime concurrency integration |
| external calendar anchor update | temporal resolver integration |
| cross-account effects | authorization + integration tests |
| historical activation | domain/product integration tests |

A prompt evaluation alone does not prove runtime transition safety.

---

# 15. Promotion rule

Before a transition trace becomes executable regression truth:

- normalize legacy terminology using `CONSISTENCY-AUDIT.md`;
- represent every focal step as explicit effect(s);
- preserve semantic/observed chronology where relevant;
- record evidence revision for stale-analysis races;
- provide step-level forbidden outcomes for material hazards;
- verify the owning runtime layer, not only AI interpretation.