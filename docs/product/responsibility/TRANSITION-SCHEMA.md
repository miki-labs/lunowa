# Canonical Responsibility Transition Trace Schema

## Purpose

`SCENARIO-SCHEMA.md` is optimized for a focal semantic event with one resulting oracle snapshot. This document extends that contract for **multi-event transition traces** where correctness depends on state evolution, semantic chronology, evidence revision, or multiple Responsibility effects.

It exists because transition expansion exposed cases that cannot be represented faithfully by one scalar matching operation. For example, one superseding message may resolve `R1` and create `R2` in the same focal event.

This is an annotation/evaluation contract, not a database or event-sourcing schema.

---

## 1. Trace shape

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

## 2. Why `expected_effects[]` is required

A single event may have more than one domain effect.

Canonical example:

```text
"先ほどのドラフトAレビュー依頼は取り下げます。
 代わりに解約通知案を月曜までに作成してください。"
```

Correct effect set:

```text
R1 -> RESOLVE / SUPERSEDE
R2 -> CREATE
```

It is incorrect to force this into one scalar operation by mutating R1's identity from `review draft A` into `write termination notice`.

For simple static cases, `SCENARIO-SCHEMA.md.expected_matching.operation` remains a convenient shorthand. Transition traces MUST use an effect list whenever one focal event affects multiple Responsibilities.

---

## 3. Semantic time vs observed time

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

When timestamps alone do not define authority, explicit correction/supersession relations and field-specific authority still govern reduction.

---

## 4. Evidence revision

Concurrency/AI traces SHOULD identify evidence revisions.

A model result is eligible to mutate current state only when its basis is valid for the current semantic evidence revision and all other validation/authorization requirements pass.

Conceptually:

```text
AIResult.basis_revision == CurrentEvidenceRevision
```

is necessary but not sufficient for apply.

A stale result may still be retained for debugging/evaluation without becoming current product state.

---

## 5. Snapshot semantics

A trace snapshot is evidence-relative, not world-omniscient.

Each snapshot should state only dimensions material to the transition, such as:

```text
tracking / resolution
obligation legs
expected events
constraints
pending proposals / agreed facts
temporal facts
uncertainties
provenance
safety/actionability
projection
```

Do not copy every unchanged field into every step merely to create verbosity. The trace must remain auditable.

---

## 6. Conditional activation

A trace may need to retain a future obligation that is not yet actionable.

Example:

```text
LEGAL_APPROVAL
    -> activates
USER_SIGN
```

The oracle MUST preserve the activation relation without projecting `MY_TURN` before the condition is satisfied.

The physical model may later represent this with:

- a condition on an obligation;
- an expected event with an activation effect;
- another minimal domain representation.

The semantic requirement is fixed; a generic workflow engine is not implied.

---

## 7. Hold vs defer

Transition traces MUST distinguish:

```text
communication hold/pause
!=
product attention defer/snooze
```

A held Responsibility waiting for counterpart/external resumption normally projects `WAITING`. It projects `LATER` only when a separate attention/defer policy intentionally hides it until a return condition.

---

## 8. Historical activation branches

Historical reconstruction may produce an apparent unresolved loop without activating it as current work.

A transition trace may branch on explicit user authority:

```text
historical candidate
  -> USER resumes tracking
  -> USER closes tracking
```

Closing tracking MUST NOT assert objective world satisfaction.

Branches should share the same pre-branch evidence and state so the effect of the user decision is isolated.

---

## 9. Trace-level invariants

Every HIGH/CRITICAL trace SHOULD define forbidden outcomes at the step where they could first occur.

Examples:

```text
send attempt -> must not resolve before reconciliation
proposal -> must not become agreed fact before acceptance
hold -> must not resolve as cancelled
old late event -> must not roll back newer correction
stale AI result -> must not mutate current revision
USER leg completed -> must not resolve while OTHER required leg remains
partial criterion -> must not mark whole Responsibility Done
```

This is stronger than checking only the final state because an unsafe transient state can be product-visible even if a later event repairs it.

---

## 10. Verification routing

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

A prompt evaluation alone does not prove runtime transition safety.
