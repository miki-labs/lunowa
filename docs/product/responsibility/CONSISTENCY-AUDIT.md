# Responsibility Specification Consistency Audit v0.1

## Status

**Accepted consistency-audit baseline for the Responsibility v0.1 specification.**

This audit cross-checks the current Responsibility artifacts against each other and against the older product-level `DATA-MODEL.md`, `CONTRACTS.md`, and `design/INTERACTIONS.md` responsibility sections.

The audit distinguishes:

- semantic contradictions that must be resolved before executable promotion;
- legacy terminology that is allowed only as an explicitly documented compatibility alias;
- broader product documents that remain valid outside Responsibility semantics but are stale inside that scope;
- implementation details that intentionally remain open.

This document is normative **only where it explicitly records a reconciliation or erratum**. It does not replace `ANNOTATION-GUIDELINES.md` or `DECISIONS.md` wholesale.

---

# 1. Audit result

Overall result:

```text
Core architecture                         PASS
Evidence / interpretation separation      PASS
Admission / identity semantics             PASS
Temporal semantic separation               PASS
Safety / authorization separation          PASS with one oracle erratum
Transition semantics                       PASS with operation normalization
Canonical state-vector vocabulary          RECONCILED in v0.1
Legacy product-doc alignment               NOT YET MIGRATED; implementation guardrail required
Executable corpus readiness                NOT YET; assignment/oracle design only
```

No finding requires abandoning the core pipeline:

```text
Authorized evidence
→ communication understanding
→ Responsibility admission
→ identity/reduction
→ evidence-relative canonical state
→ safety/actionability
→ deterministic projection
```

The main defects were **representation/terminology drift**, not failure of the underlying model.

---

# 2. Canonical semantic state vector

Transition expansion exposed that the prior shorthand `tracking_status: OPEN | RESOLVED` is overloaded. It can be confused with whether Lunowa should actively track a historical item and with whether the item is currently in attention.

The canonical semantic dimensions are now:

```text
resolution_status
live_tracking_state
attention_mode
obligation_legs[]
expected_events[]
completion_criteria[]
constraints[]
temporal_facts[]
pending_proposals[] / agreed_facts[]
uncertainties[]
risk
provenance[]
```

Conceptually:

```text
resolution_status:
  OPEN | RESOLVED

live_tracking_state:
  active live work vs inactive/historical candidate

attention_mode:
  present vs intentionally deferred
```

Exact production enums remain open.

### Compatibility rule

Existing v0.1 oracle documents that use:

```text
tracking_status: OPEN | RESOLVED
```

must be interpreted as a **legacy alias for `resolution_status` only**. It MUST NOT be interpreted as live-tracking activation or attention state.

Likewise, existing `active_obligations[]` in already-written oracles is accepted as a legacy shorthand for the currently relevant unresolved subset of the more general `obligation_legs[]` model. New oracles should use the canonical shape defined in `SCENARIO-SCHEMA.md`.

---

# 3. Obligation legs and actionability

## Finding CA-01 — `active_obligations[]` is too narrow

**Severity:** HIGH  
**Status:** RESOLVED semantically

T16 requires parallel obligation legs. T18 additionally requires a future obligation that is known but not yet actionable. High-risk scenarios may also contain a communicated requested action that is blocked by safety policy.

Therefore canonical semantics use:

```text
obligation_legs[]
```

with conceptual attributes such as:

```text
bearer
action
status
condition
actionability
authority_status / basis when material
temporal linkage
provenance
```

An `active user obligation` is a derived subset used by projection; it is not the only kind of obligation leg that can exist.

This avoids the contradiction:

```text
known future obligation
but not actionable yet
```

being forced into either “active” or “forgotten.”

---

# 4. Completion criteria

## Finding CA-02 — scenario schema omitted completion criteria

**Severity:** HIGH  
**Status:** RESOLVED semantically

T0-033/T17 require one Responsibility whose operational outcome has multiple completion criteria, such as the front and back of an identity document.

Canonical scenario semantics therefore include:

```text
completion_criteria[]
```

independently of whether the physical implementation uses a child table, JSON, or a simpler specialized representation.

The criterion concept is fixed. Physical storage remains open.

---

# 5. Matching operation vs domain effects

## Finding CA-03 — one focal event can have multiple effects

**Severity:** HIGH  
**Status:** RESOLVED

T12 proves that one communication may:

```text
SUPERSEDE R1
AND
CREATE R2
```

Therefore the canonical evaluation contract supports:

```text
expected_effects[]
```

A scalar `expected_matching` remains only a convenience shorthand when exactly one Responsibility effect exists.

### Operation normalization

`SUPERSEDE` is a **terminal domain effect** on the old Responsibility. Its semantic result is conceptually:

```text
resolution_status = RESOLVED
resolution_reason = SUPERSEDED
```

If replacement work exists, `CREATE` for the replacement is a separate effect.

Do not encode the old item as two separate operations `RESOLVE + SUPERSEDE`, and do not mutate the old Responsibility's operational outcome into the replacement outcome.

Narrative shorthands such as `RESOLVE/SUPERSEDE` in earlier transition notes are superseded by this rule.

Similarly, narrative `UPDATE/RESOLVE` means “terminal RESOLVE effect with any necessary final field changes,” not two competing matching operations.

---

# 6. Hold, defer, and projection

## Finding CA-04 — hold was previously written as `WAITING/LATER`

**Severity:** HIGH  
**Status:** RESOLVED

Canonical rule:

```text
communication hold/pause != product attention defer/snooze
```

If another party/event must resume the work, a held Responsibility ordinarily projects:

```text
WAITING
```

`LATER` requires a separate intentional attention/defer policy and return condition.

Therefore the earlier Tier-0 shorthand `T0-014 -> WAITING/LATER` must be read as:

```text
base hold semantic -> WAITING
optional independent defer -> LATER
```

---

# 7. Resolution, live activation, and historical mail

## Finding CA-05 — historical semantic openness is not live activation

**Severity:** CRITICAL  
**Status:** RESOLVED semantically; physical schema OPEN

T20 demonstrates:

```text
appears unresolved in historical evidence
!=
should be active work now
```

Therefore `resolution_status` and `live_tracking_state` are separate dimensions.

A seven-year-old apparent open loop may be:

```text
resolution_status = OPEN (evidence-relative)
live_tracking_state = INACTIVE/HISTORICAL_CANDIDATE
projection = NONE or REVIEW according to product policy
```

A user may later activate tracking without rewriting historical evidence. Conversely, `USER_CLOSED` stops Lunowa tracking without claiming external-world satisfaction.

The exact physical field names/enums remain open.

---

# 8. Attention and `LATER`

## Finding CA-06 — scenario schema lacked an explicit attention dimension

**Severity:** HIGH  
**Status:** RESOLVED semantically

`LATER` is a projection over intentional defer/attention state. It must not be inferred from lifecycle/owner alone.

Canonical scenarios therefore expose an `attention_mode`-like semantic dimension. A `RESURFACE_TIME` belongs to temporal semantics; it does not by itself replace the attention decision.

---

# 9. Safety and high-risk request semantics

## Finding CA-07 — T0-037 mixed temporal semantics with legitimacy

**Severity:** HIGH  
**Status:** ERRATUM

The phrase:

```text
本日中に100万円を振り込んでください
```

contains a communicated due associated with the sender's requested transfer. Whether the request is legitimate does **not** change the temporal semantic kind.

Therefore T0-037's earlier labels:

```text
SOURCE_DUE_CANDIDATE
COMMUNICATED_REQUEST_DUE_CANDIDATE
```

are superseded by:

```text
semantic_kind = SOURCE_DUE
applies_to = communicated requested transfer
source_authority / compliance_legitimacy = UNVERIFIED
```

Safety/legitimacy metadata must not be encoded by inventing a different temporal kind.

## Finding CA-08 — communicated requested action vs accepted product obligation

**Severity:** HIGH  
**Status:** CLARIFIED

For a malicious or unverified request:

```text
communication act requested_action = TRANSFER_MONEY
```

must remain preserved as source meaning.

The admitted Responsibility does not have to assert that the transfer is a legitimate duty. It may track the neutral operational loop:

```text
resolve / verify / decide the received payment request
```

while safety policy derives:

```text
safe_next_action = VERIFY_PAYMENT_REQUEST
```

The requested transfer and its source due remain provenance-bearing communication facts. They are not silently rewritten into the safe action.

---

# 10. Send reconciliation

## Finding CA-09 — send attempt must not close an outcome

**Severity:** CRITICAL  
**Status:** CONFIRMED

Canonical rule:

```text
send command / UI click != reconciled provider acceptance
```

A provider timeout with unknown acceptance cannot safely mean either `sent` or `unsent` without reconciliation.

Where a transition oracle resolves after send reconciliation, that is valid only when reconciled sending is sufficient evidence for the specific operational closure condition.

### T10 clarification

T10's REOPEN example should be read as a case where the system had **then-adequate evidence under its closure policy** that the required signed file was delivered (for example, reconciled send plus the expected attachment evidence), and later explicit failure evidence shows the same operational outcome was not actually satisfied.

It must not be generalized into:

```text
provider accepted any message -> usable document delivery proved
```

---

# 11. Temporal direction semantics

## Finding CA-10 — source due is direction-independent

**Severity:** MEDIUM  
**Status:** CLARIFIED

`SOURCE_DUE` means a due/required time explicitly communicated for an obligation in source communication. It is not limited to inbound requests.

Examples:

```text
Inbound request to USER: "明日までに送ってください"
-> SOURCE_DUE on USER obligation

Outbound USER commitment: "明日送ります"
-> communicated time on USER commitment / obligation

Inbound OTHER commitment: "明日送ります"
-> EXPECTED_EVENT_TIME from the user's waiting perspective
```

The exact physical representation may attach a temporal fact to the obligation/event leg. The critical rule is not to infer temporal kind from the date token alone.

---

# 12. Scenario risk vs Responsibility/action risk

## Finding CA-11 — `risk_class` has two possible meanings

**Severity:** MEDIUM  
**Status:** RESOLVED conceptually

`risk_class` at the top of an oracle describes **test/scenario harm priority**.

Canonical Responsibility semantics may separately contain product/action risk for a specific obligation or safe-action decision.

These must not be silently treated as the same field.

---

# 13. Review semantics

## Finding CA-12 — admission review and projection review are different

**Severity:** HIGH  
**Status:** CONFIRMED

`NEEDS_REVIEW` at admission means Lunowa cannot safely decide whether a trackable Responsibility should exist.

A Responsibility can instead be definitely `TRACK` while a decision-critical field is uncertain, producing product projection:

```text
REVIEW
```

T0-028 is the canonical example: the user obligation exists, but the due field conflicts.

Do not convert all field ambiguity into admission uncertainty.

---

# 14. Tier-0 assignment vs transition coverage

## Finding CA-13 — Tier-0 matrix contains stale `8/20` transition text

**Severity:** MEDIUM  
**Status:** SUPERSEDED by dedicated transition artifacts

`TIER-0-SCENARIO-MATRIX.md` was written before `TRANSITION-ORACLES.md`. Its `8/20` transition scorecard and “remaining 12” section are historical assignment-state text.

Current authoritative coverage-design status is:

```text
20 / 20 mandatory transition traces mapped
```

as defined by `TRANSITION-ORACLES.md` and `TRANSITION-SCHEMA.md`.

This is still **design coverage**, not runtime execution/pass evidence.

---

# 15. Status wording

## Finding CA-14 — `candidate` vs `accepted baseline`

**Severity:** LOW  
**Status:** RECONCILED

The v0.1 Responsibility semantics are accepted as a **versioned semantic baseline** for scenario/evaluation work.

This does not mean:

- physical schema is frozen;
- model/prompt is frozen;
- runtime implementation exists;
- scenario suite has executed/passed;
- future counterexamples cannot produce v0.2.

Use `accepted v0.1 semantic baseline` rather than an ambiguous “candidate” label at routing entry points.

---

# 16. Legacy product documents

## Finding CA-15 — older accepted documents still contain superseded Responsibility shapes

**Severity:** CRITICAL for implementation routing  
**Status:** GUARDED, NOT FULLY MIGRATED

The following older sections predate the Responsibility v0.1 work:

### `DATA-MODEL.md`

Still contains:

```text
ActionItem.state
OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN
scalar next_owner including BOTH
single deadline_at
whole-item user_override_state
active + completed_at
```

### `CONTRACTS.md`

Still contains:

```text
action_candidates.next_owner_candidate
one deadline_candidate
reduceLifecycle(current_state, ...)
ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN transition graph
```

### `design/INTERACTIONS.md`

Still calls the same seven values “Internal Action Item states” and describes `FOLLOW_UP`/`DEFERRED` as lifecycle states.

These documents remain useful for their broader module/data/UX concerns, but the listed Responsibility-specific shapes are **not current semantic authority**.

### Implementation stop condition

Do not implement or generate migrations for the old `ActionItem` lifecycle shape merely because it is present in an older accepted document.

Before the domain/persistence/lifecycle implementation phase, reconcile those sections against:

```text
responsibility/ANNOTATION-GUIDELINES.md
responsibility/DECISIONS.md
responsibility/SCENARIO-SCHEMA.md
responsibility/TRANSITION-SCHEMA.md
responsibility/CONSISTENCY-AUDIT.md
```

This is a hard source-of-truth routing rule, not an optional cleanup task.

---

# 17. What remains deliberately open

The audit does **not** freeze:

- table/child-table/JSON representation of obligation legs;
- exact enum names for resolution/live activation/attention/actionability;
- whether completion criteria are normalized rows or a smaller specialized structure;
- exact AI structured-output schema;
- model/provider choice;
- numeric confidence/risk thresholds;
- cross-thread Responsibility identity;
- recurring Responsibility series;
- full group/shared-assignment machinery;
- calendar integration phase;
- historical lookback window;
- exact high-risk policy/authorization rules.

Do not convert audit clarity into premature physical-schema complexity.

---

# 18. Promotion gates after this audit

Before Responsibility v0.1 becomes an executable domain/runtime contract:

1. new detailed oracles must use the reconciled `SCENARIO-SCHEMA.md` vocabulary;
2. existing detailed-oracle legacy aliases/errata above must be normalized during executable serialization;
3. `DATA-MODEL.md`, `CONTRACTS.md`, and relevant `INTERACTIONS.md` responsibility sections must be reconciled before implementation of the domain lifecycle/state layer;
4. remaining Tier-0 base assignments must be expanded into full layered oracles;
5. C23 must have both explicit serialized claim-only and observation-confirmed inputs;
6. all mandatory high-harm forbidden outcomes must be executable at their owning verification layer;
7. a coverage linter/equivalent must verify mandatory IDs do not disappear during corpus edits;
8. model predictions must not be used to author the human oracle.

---

# 19. Final audit conclusion

The audit found **no reason to discard the Responsibility architecture**, but it did find one major modeling refinement:

```text
OPEN/RESOLVED
```

cannot carry three different meanings.

The stable semantic separation is now:

```text
resolution
× live tracking activation
× attention
× obligation/actionability
× uncertainty/risk
× temporal facts
```

This is the canonical interpretation for v0.1 until a stronger counterexample or production evidence justifies a versioned amendment.