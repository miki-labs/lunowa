# Responsibility Specification Consistency Audit v0.1

## Status

**Accepted consistency-audit baseline; source-of-truth reconciliation completed for the Responsibility-related sections of `ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md`, and `design/INTERACTIONS.md`.**

This audit records the contradictions discovered while pressure-testing Responsibility v0.1 and the canonical reconciliations that now govern annotation, scenario design, architecture, data modeling, contracts, and interaction behavior.

This document is normative where it records a reconciliation/erratum. It does not replace `ANNOTATION-GUIDELINES.md` or `DECISIONS.md`.

---

# 1. Audit result

```text
Core architecture                         PASS
Evidence / interpretation separation      PASS
Admission / identity semantics             PASS
Temporal semantic separation               PASS
Safety / authorization separation          PASS with recorded oracle erratum
Transition semantics                       PASS with operation normalization
Canonical state-vector vocabulary          RECONCILED
Architecture alignment                     RECONCILED
Data-model alignment                       RECONCILED
System-contract alignment                  RECONCILED
Interaction-semantics alignment            RECONCILED
Executable corpus readiness                NOT YET; design/oracle work remains
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

The defects found were primarily representation/terminology drift and one safety/temporal-classification erratum.

---

# 2. Canonical semantic state vector

A single `tracking_status: OPEN | RESOLVED` cannot simultaneously represent resolution, whether historical work is live, and whether attention is deferred.

Canonical semantic dimensions are:

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

Exact production enum names/cardinality remain open.

### Compatibility rule for existing v0.1 oracles

Existing detailed oracles that still use:

```text
tracking_status: OPEN | RESOLVED
```

must be interpreted as a legacy alias for `resolution_status` only.

Existing `active_obligations[]` is accepted only as a legacy shorthand for the currently relevant unresolved/actionable subset of the general `obligation_legs[]` concept.

New executable fixtures should use the reconciled `SCENARIO-SCHEMA.md` vocabulary.

---

# 3. CA-01 — `active_obligations[]` was too narrow

**Severity:** HIGH  
**Status:** RESOLVED

T16 requires parallel obligation legs. T18 requires a known future user obligation that is not actionable before an external condition. High-risk requests may also contain a communicated requested action whose execution is blocked by safety policy.

Canonical concept:

```text
obligation_legs[] {
  bearer
  action
  status
  actionability
  condition?
  authority/basis?
  temporal linkage?
  provenance
}
```

An actionable user obligation is a derived subset, not the whole canonical model.

---

# 4. CA-02 — completion criteria were missing from the scenario shape

**Severity:** HIGH  
**Status:** RESOLVED

T0-033/T17 require one Responsibility with multiple jointly required criteria, e.g. identity-document front + back.

Canonical concept:

```text
completion_criteria[]
```

Physical child-table/JSON/specialized representation remains open.

---

# 5. CA-03 — one focal event can have multiple Responsibility effects

**Severity:** HIGH  
**Status:** RESOLVED

T12 proves one communication may:

```text
SUPERSEDE R1
AND
CREATE R2
```

Canonical evaluation/runtime contract therefore supports:

```text
expected_effects[] / effects[]
```

A scalar matching operation remains shorthand only when exactly one Responsibility effect exists.

### SUPERSEDE normalization

`SUPERSEDE` is terminal on the old Responsibility and conceptually yields:

```text
resolution_status = RESOLVED
resolution_reason = SUPERSEDED
```

Replacement creation is a separate `CREATE` effect.

Do not encode `RESOLVE + SUPERSEDE` as two independent operations. Earlier narrative `RESOLVE/SUPERSEDE` or `UPDATE/RESOLVE` shorthand is superseded by this normalized operation model.

---

# 6. CA-04 — communication hold was conflated with `LATER`

**Severity:** HIGH  
**Status:** RESOLVED

Canonical rule:

```text
communication hold/pause != product attention defer/snooze
```

If work is blocked waiting on another party/event, normal projection is `WAITING`.

`LATER` requires a separate intentional attention/defer decision and return condition.

Any earlier `WAITING/LATER` hold shorthand should be read as:

```text
base hold -> WAITING
optional independent defer -> LATER
```

---

# 7. CA-05 — historical semantic openness is not live activation

**Severity:** CRITICAL  
**Status:** RESOLVED semantically; physical enum/schema OPEN

```text
appears unresolved in historical evidence
!=
should be active work now
```

A historical candidate may be:

```text
resolution_status = OPEN
live_tracking_state = inactive/historical candidate
projection = NONE or REVIEW by policy
```

User activation can make it live without rewriting source history. User tracking-close does not assert objective satisfaction.

---

# 8. CA-06 — explicit attention dimension required

**Severity:** HIGH  
**Status:** RESOLVED

`LATER` is a projection over intentional defer/attention state, not owner/lifecycle shorthand.

`RESURFACE_TIME` is a temporal fact/contract trigger and does not itself replace the attention decision.

---

# 9. CA-07 — high-risk payment oracle mixed temporal kind with legitimacy

**Severity:** HIGH  
**Status:** ERRATUM RECORDED

For:

```text
本日中に100万円を振り込んでください
```

`本日中` is still a communicated due for the requested transfer even if sender authority/legitimacy is unverified.

Earlier labels:

```text
SOURCE_DUE_CANDIDATE
COMMUNICATED_REQUEST_DUE_CANDIDATE
```

are superseded by:

```text
semantic_kind = SOURCE_DUE
applies_to = communicated requested transfer
authority/compliance_legitimacy = UNVERIFIED
```

Safety/legitimacy must not be encoded by inventing a temporal kind.

---

# 10. CA-08 — requested action vs accepted product obligation

**Severity:** HIGH  
**Status:** CLARIFIED

For an unverified/malicious request:

```text
communicated requested action = TRANSFER_MONEY
```

remains immutable source meaning.

The admitted Responsibility may instead track the neutral product loop:

```text
verify / decide / safely resolve the received payment request
```

with:

```text
safe_next_action = VERIFY_PAYMENT_REQUEST
```

Do not rewrite what the sender requested into the safe action.

---

# 11. CA-09 — send attempt vs reconciled send

**Severity:** CRITICAL  
**Status:** CONFIRMED AND PROPAGATED

```text
send command / UI click != reconciled provider acceptance
```

An ambiguous timeout is neither confirmed sent nor confirmed unsent without reconciliation.

Even provider-reconciled sending resolves a Responsibility only when successful sending is sufficient evidence for that specific operational closure condition.

Do not generalize:

```text
provider accepted message -> attachment usable / counterpart approved / external goal satisfied
```

T10 REOPEN should be interpreted as a case where prior evidence was sufficient under the then-current closure rule and later explicit failure evidence disproves satisfaction of the same outcome.

---

# 12. CA-10 — temporal semantic kind is not inferred from token/direction alone

**Severity:** MEDIUM  
**Status:** CLARIFIED

Temporal meaning depends on communication semantics and which obligation/event it applies to.

Examples:

```text
Inbound request: "明日までに送ってください"
-> SOURCE_DUE on USER obligation

Outbound USER commitment: "明日送ります"
-> communicated time associated with USER commitment/obligation

Inbound OTHER commitment: "明日送ります"
-> EXPECTED_EVENT_TIME from the waiting perspective
```

The critical invariant is that a date token is not automatically “user deadline.”

---

# 13. CA-11 — scenario risk vs product/action risk

**Severity:** MEDIUM  
**Status:** RESOLVED conceptually

Top-level oracle `risk_class` means test/harm priority.

Responsibility/action risk is a separate product-domain dimension.

Do not silently reuse one field for both meanings.

---

# 14. CA-12 — admission review vs projection review

**Severity:** HIGH  
**Status:** CONFIRMED

`NEEDS_REVIEW` at admission means whether a Responsibility should exist is itself unsafe to decide.

A definitely `TRACK`ed Responsibility may still project `REVIEW` because a decision-critical field is conflicted.

Canonical example: T0-028 has definite user responsibility but conflicting due evidence.

---

# 15. CA-13 — stale Tier-0 transition `8/20` text

**Severity:** MEDIUM  
**Status:** HISTORICAL/SUPERSEDED

`TIER-0-SCENARIO-MATRIX.md` predates the dedicated transition expansion. Its `8/20` assignment-state text is historical.

Current authoritative transition design coverage:

```text
20 / 20 mandatory traces mapped
```

from `TRANSITION-ORACLES.md` + `TRANSITION-SCHEMA.md`.

This remains design coverage, not execution/pass evidence.

---

# 16. CA-14 — v0.1 status wording

**Severity:** LOW  
**Status:** RECONCILED

Responsibility v0.1 is an **accepted versioned semantic baseline**.

It does not mean:

- physical schema frozen;
- model/prompt frozen;
- runtime implemented;
- eval suite executed/passed;
- future counterexamples cannot produce v0.2.

---

# 17. CA-15 — broader product-doc source-of-truth drift

**Severity:** CRITICAL for implementation routing  
**Status:** RECONCILED

The audit initially identified stale Responsibility shapes in:

- `DATA-MODEL.md`;
- `CONTRACTS.md`;
- `design/INTERACTIONS.md`.

A stricter second pass also found the same stale single-lifecycle vocabulary in `ARCHITECTURE.md`. That omission in the first audit was itself corrected rather than hidden.

All four documents are now reconciled to the v0.1 semantic model:

```text
ARCHITECTURE.md
DATA-MODEL.md
CONTRACTS.md
design/INTERACTIONS.md
```

Specifically removed/superseded as canonical truth:

```text
OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN
scalar next_owner as complete state
BOTH as a core assignment solution
single deadline_at as all temporal semantics
whole-item user_override_state
follow-up as a lifecycle species
hold == LATER
```

Replacement model propagated across those documents:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
field-level uncertainty/risk
provenance
```

The prior implementation stop condition is therefore **satisfied** at the documentation-semantic level.

This does **not** mean physical schema implementation should begin from intuition: implementation must still derive the minimal representation from the reconciled documents + canonical scenarios/transition oracles.

---

# 18. What remains deliberately open

The audit does not freeze:

- table/child-table/JSON representation of obligation legs/events/criteria;
- exact enum names for resolution/live activation/attention/actionability;
- exact AI output DTO/JSON schema;
- model/provider/prompt;
- numeric confidence/risk thresholds;
- cross-thread Responsibility identity;
- recurring Responsibility series;
- full shared/group workflow machinery;
- calendar integration phase;
- historical lookback policy;
- exact high-risk verification/authorization policy.

Do not turn semantic clarity into premature schema/framework complexity.

---

# 19. Remaining promotion gates

Before Responsibility v0.1 becomes an executable domain/runtime contract:

1. remaining Tier-0 base assignments must be expanded into full layered oracles;
2. existing detailed-oracle legacy aliases and CA-07 erratum must be normalized during executable serialization;
3. C23 must have explicit claim-only and observation-confirmed serialized inputs;
4. HIGH/CRITICAL forbidden outcomes must be executable at the owning verification layer;
5. a coverage linter/equivalent must ensure mandatory IDs do not disappear;
6. model predictions must not be used to author the human oracle;
7. physical schema must demonstrate the fixed semantic dimensions without reintroducing the superseded lifecycle model;
8. provider/scheduler/concurrency/security invariants require integration/runtime tests, not prompt eval alone.

---

# 20. Final audit conclusion

The stable v0.1 separation is:

```text
resolution
× live tracking activation
× attention
× obligation/actionability
× expected events / completion criteria
× temporal facts
× uncertainty/risk
× provenance
```

The broader product architecture, conceptual data model, logical contracts, and interaction specification now use that same semantic model.

The next uncertainty is no longer “which document is authoritative?” It is whether the remaining canonical oracles expose a counterexample that forces v0.2, and what **minimal physical representation** can satisfy the validated semantics without turning Lunowa into a generic workflow system.