# ADR 0008 — Responsibility State Is Orthogonal; UI States Are Projections

## Status

Accepted — 2026-08-23

## Context

Lunowa originally described one canonical ActionItem lifecycle:

```text
OPEN
ACTION_REQUIRED
DEFERRED
WAITING
FOLLOW_UP
COMPLETED
UNCERTAIN
```

That representation was attractive because it gave the UI one simple state machine, but Responsibility scenario and transition stress testing exposed that these values mix independent questions:

- is the operational loop resolved?;
- is an evidence-relative historical loop currently activated as live work?;
- is current attention intentionally deferred?;
- who has which obligation leg?;
- is a future user obligation contingent on another event?;
- is the product waiting on another party/external event?;
- is there decision-critical uncertainty?;
- is a follow-up action currently appropriate?;
- what temporal fact is source due vs expected event vs user target/resurface?;

Concrete counterexamples included:

- USER and another signer both owe parallel signatures;
- legal approval must occur before a known USER signature obligation becomes actionable;
- communication hold waits on another party but is not the same as snooze;
- a seven-year-old email can appear unresolved in evidence without becoming live My Turn work;
- follow-up oscillates Waiting → My Turn → Waiting inside the same Responsibility without changing its operational identity;
- one partial completion criterion can be satisfied while the Responsibility remains open;
- a material field can require Review while Responsibility existence/ownership remain clear.

The old enum therefore created contradictory combinations or encouraged more lifecycle values each time a new case appeared.

## Decision

Responsibility v0.1 uses an **orthogonal evidence-relative semantic vector** rather than one canonical lifecycle enum.

The stable conceptual dimensions are:

```text
resolution status / reason
live tracking activation
attention / defer
obligation legs / actionability / conditions
expected events
completion criteria
constraints
pending proposals / agreed facts
temporal facts
uncertainty / risk
provenance
```

Exact physical tables, fields, enum names, and cardinalities remain open until schema design.

### Responsibility is the operational unit

A Responsibility follows the smallest communication-bounded operational outcome with a coherent closure condition.

A Conversation may contain zero, one, or many Responsibilities.

### Multiple obligation legs are allowed

Canonical state may contain multiple obligation legs or expected events. A scalar `next_owner` may be derived for convenience, but it is not complete truth.

`BOTH` is not a general solution for parallel/shared assignment.

### Resolution is separate from satisfaction

A Responsibility may resolve for reasons such as:

```text
SATISFIED
DECLINED
CANCELLED
SUPERSEDED
USER_CLOSED
INVALIDATED
DUPLICATE
```

Exact reason enum remains open.

### Live activation is separate from resolution

Historical evidence may support an apparently open loop without activating it as current work.

```text
resolution = OPEN
live tracking = inactive/historical candidate
```

is semantically valid.

### Attention/defer is separate

A user/product may intentionally defer attention while the underlying Responsibility remains open.

Communication hold/pause does not itself mean defer.

### Conditional actionability is explicit

A known future obligation may exist without being actionable yet:

```text
LEGAL_APPROVAL
    -> activates
USER_SIGN
```

The system must preserve that relation without prematurely projecting My Turn.

### UI states are projections

User-facing states are deterministic projections over canonical semantics:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

Conceptually:

```text
no admitted live Responsibility -> NONE
resolved live Responsibility -> DONE
open + material decision-critical review condition -> REVIEW
open + intentional attention defer -> LATER
open + actionable USER obligation leg -> MY_TURN
open + only OTHER/EXTERNAL pending work/events -> WAITING
otherwise -> REVIEW / ordinary fallback
```

These projections may be cached/rebuilt but are not the sole canonical domain truth.

### Follow-up is an action/reason, not a lifecycle species

If an expected reply does not arrive by a trigger, current evidence is re-evaluated. When user action is warranted:

```text
WAITING
-> USER follow-up action becomes actionable
-> MY_TURN
-> reconciled follow-up send
-> WAITING again if counterpart outcome remains pending
```

The Responsibility identity remains the same.

### One event may produce multiple effects

A focal communication can legitimately:

```text
SUPERSEDE R1
AND
CREATE R2
```

Therefore reducer/eval contracts use `effects[]` when needed rather than assuming one scalar operation per event.

`SUPERSEDE` is terminal on the old Responsibility; replacement creation is separate.

## Alternatives considered

### Keep the seven-state enum and add more fields around it

Rejected as canonical truth. Even with extra fields, the enum itself invites contradictory interpretations (`DEFERRED` vs waiting hold, `FOLLOW_UP` vs current action, `UNCERTAIN` vs field-level uncertainty) and becomes an accidental authority.

### Expand the lifecycle enum with more states

Rejected. It leads toward state explosion and encodes combinations of orthogonal dimensions as bespoke values.

### Use only one scalar owner plus one deadline

Rejected. Parallel obligations, conditional activation, expected-event time, user target, and follow-up/resurface time cannot be represented safely.

### Build a generic workflow/BPMN engine

Rejected for v0.1. The semantic model requires only the minimal structures demonstrated by canonical scenarios. General workflow flexibility would increase implementation/maintenance cost without validated product value.

### Store only UI buckets

Rejected. UI simplicity is valuable, but buckets lose provenance, resolution reason, parallel obligation structure, temporal distinctions, and uncertainty/safety semantics needed for trust and correct transitions.

## Consequences

Positive:

- avoids state explosion;
- explains parallel/conditional/multi-step cases cleanly;
- preserves simple user-facing My Turn/Waiting/Later/Done/Review UX;
- makes false completion/hiding easier to test as explicit invariants;
- supports historical reconstruction without flooding current work;
- allows field-level uncertainty rather than whole-item `UNCERTAIN`;
- keeps follow-up and snooze behavior semantically precise;
- provides a stable target for scenario/transition evaluation independent of exact SQL design.

Costs/trade-offs:

- physical persistence design requires more care than one enum column;
- reducers/projections need explicit invariants;
- some concepts may require child structures or structured fields;
- agents/implementers must read semantic docs rather than infer behavior from familiar task-state patterns.

## Physical-schema rule

This ADR does **not** require one table per semantic dimension.

Schema design should choose the smallest relational representation that satisfies canonical scenarios/transitions and required queries while preserving:

- ownership/authorization;
- provenance;
- idempotency/reconciliation;
- orthogonality of the fixed semantic dimensions;
- deterministic projection;
- no generic workflow engine.

A proposed schema is invalid if it recreates the old seven-state lifecycle, scalar `BOTH`, or one `deadline_at` as complete canonical truth under different names.

## Verification

Use the canonical Responsibility artifacts as semantic truth:

- `docs/product/responsibility/DECISIONS.md`;
- `SCENARIO-SCHEMA.md`;
- `TRANSITION-SCHEMA.md`;
- `TIER-0-CRITICAL-ORACLES.md`;
- `TRANSITION-ORACLES.md`.

At minimum, any physical/domain implementation must pass cases covering:

- multiple Responsibilities in one Conversation;
- parallel obligation legs;
- conditional activation;
- hold vs defer;
- follow-up as My Turn action;
- partial completion criteria;
- REOPEN vs new episode;
- supersede + create composite effect;
- historical open vs live activation;
- field-level Review/conflict;
- temporal semantic separation.

## Revisit when

Revisit if real-user/production evidence shows the orthogonal model materially increases complexity without representing meaningful product behavior, or if canonical scenarios expose a simpler representation that preserves the same invariants.

Do not revert merely because one enum is easier to code.