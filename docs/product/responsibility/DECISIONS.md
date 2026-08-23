# Responsibility Decision Ledger

## Status labels

- **FIXED** — normative for v0.1 unless stronger evidence or a scenario counterexample supersedes it.
- **STRONG DIRECTION** — preferred implementation/modeling direction, but physical representation may still change before schema freeze.
- **OPEN** — deliberately unresolved.
- **SUPERSEDED** — prior direction retained for history but no longer current.

---

## Fixed principles

| Decision | Status | Rationale |
|---|---|---|
| Preserve original sent/received communication as immutable evidence | FIXED | Normalization/AI interpretation must never rewrite what was actually communicated. |
| Message, Conversation, and Responsibility are distinct concepts | FIXED | A thread can contain multiple independent responsibility loops. |
| `Responsibility` is the canonical semantic concept name | FIXED | Waiting periods and other-party obligations are still part of the same loop; physical entity name remains open. |
| Responsibility identity follows the smallest communication-bounded operational outcome with coherent closure | FIXED | Prevents both message-level fragmentation and giant project-sized responsibilities. |
| Communication-act detection does not automatically create a Responsibility | FIXED | Courtesy, FYI, reported requests, and irrelevant third-party acts would otherwise create false tasks. |
| Admission has `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` semantics | FIXED | Allows abstention and product relevance to be explicit. |
| `No Responsibility` is a first-class correct outcome | FIXED | Essential to prevent task spam. |
| Admission `NEEDS_REVIEW` may exist before a canonical Responsibility exists | FIXED | T0-041/T0-043/T0-044 show that Responsibility existence/materiality itself can be unresolved; do not create a fake Responsibility merely to render Review. |
| Product `REVIEW` may surface either an admitted Responsibility with field-level uncertainty or a pre-admission review candidate | FIXED | T0-028 and Batch-3 admission cases need distinct internal subjects even if one UX surface is shared. |
| Public communicative force is annotated; hidden private intent is not | FIXED | Avoids mind-reading, especially under politeness, sarcasm, and social nuance. |
| Speaker and obligation bearer are separate | FIXED | Third-party assignments and commitments require this distinction. |
| Politeness and obligation strength are separate | FIXED | Polite business language may still be mandatory. |
| Capability, intention, plan, and commitment must not be silently strengthened | FIXED | Prevents creating false waiting promises or user obligations. |
| `PROPOSAL` is distinct from agreement | FIXED | Dates/terms mentioned in negotiation must not become authoritative facts before acceptance. |
| Claim and observation are separate evidence classes | FIXED | A sender saying "attached" is not the same as provider attachment evidence. |
| Evidence authority is field-specific | FIXED | No single global trust ranking correctly handles all facts. |
| Canonical state is evidence-relative, not world-omniscient | FIXED | Off-channel completion may be invisible to Lunowa. |
| Semantic similarity is candidate retrieval, not identity authority | FIXED | Avoids accidental merges. |
| False merge is considered more harmful than modest false split | FIXED | Merge can hide real obligations. |
| Reopen means the same operational outcome was never actually satisfied | FIXED | Keeps history/analytics coherent. |
| REOPEN preserves prior evidence/history and need not rewind previously satisfied action legs | FIXED | T0-029 shows a remedial current leg can be added while prior send/action history remains true. |
| New work after a genuinely closed episode normally creates a new Responsibility | FIXED | Avoids reopening historical episodes incorrectly. |
| Canonical state may contain multiple obligation legs and expected events | FIXED | Parallel signers, contingent work, and multi-party loops cannot be represented faithfully by one scalar owner. |
| `obligation_legs[]` is the canonical semantic concept; active user obligations are a derived subset | FIXED | T16/T18 show that a known leg may be parallel, contingent, safety-blocked, satisfied, or currently actionable. |
| Obligation-leg granularity follows independent bearer/actionability/closure needs, not linguistic verb count | FIXED | T0-031 prevents a bounded sequential instruction from becoming an accidental workflow graph. |
| A scalar `next_owner` is not complete canonical truth | FIXED | It may remain a convenience/projection field only. |
| `BOTH` must not be used to hide parallel/ambiguous structure | FIXED | Loses assignment semantics. |
| Completion criteria may exist inside one Responsibility | FIXED | Partial completion such as front/back document submission must not force artificial Responsibility splitting. |
| Action and constraint are distinct | FIXED | "Do not send before approval" is not a normal next action. |
| Pause/hold and cancellation are distinct | FIXED | A paused obligation can remain open. |
| Communication hold/pause and product defer/snooze are distinct | FIXED | A hold normally means waiting on a resume event; `LATER` requires a separate attention decision. |
| Delegation intent and effective delegation are distinct | FIXED | Ownership transfer needs evidence that the request was actually communicated/effected. |
| Source due, expected-event time, user target, resurface time, and follow-up time are distinct | FIXED | Prevents false deadlines and incorrect projections. |
| USER_TARGET is an orthogonal user-owned fact, not an automatic correction/override of SOURCE_DUE | FIXED | T0-026 shows Friday external due and Thursday user target can coexist. |
| `SOURCE_DUE` semantics are not changed by source legitimacy/safety status | FIXED | Safety/authority is orthogonal to what due time was actually communicated. |
| Never silently increase temporal precision | FIXED | "Friday" does not imply 17:00; ASAP does not imply an exact deadline. |
| External anchors are derived, not rewritten source facts | FIXED | Calendar changes may re-resolve event-relative time without changing the email source. |
| Material values should be source-span grounded and deterministically parsed/resolved where practical | FIXED | Reduces hallucination for dates, amounts, identity, URLs, etc. |
| Important state/facts require provenance | FIXED | Trust, debugging, correction, and evaluation depend on source traceability. |
| User preference/target does not overwrite communicated source facts | FIXED | "I plan Thursday" must not rewrite a Friday external due date. |
| User authority should be field-scoped | FIXED | Correcting one field must not freeze unrelated fields. |
| Typo normalization is derived data | FIXED | Original communication remains source evidence. |
| Material typo candidates are never silently corrected | FIXED | Dates, amounts, negation, identity, URLs, approval/rejection can reverse meaning. |
| Evaluate both typo invariance and semantic sensitivity | FIXED | Robustness must tolerate harmless noise without ignoring meaning-changing edits. |
| Accepted AI interpretation/state is persisted; UI open does not trigger random reclassification | FIXED | Contains model nondeterminism. |
| Stale AI runs cannot mutate current state | FIXED | Prevents state rollback. |
| Multi-run consensus is an uncertainty signal, not truth/authority | FIXED | Correlated model failure can remain unanimous. |
| Tracking is not compliance or authorization | FIXED | A malicious/high-risk request can be understood without being endorsed. |
| Requested action and safe/recommended next action are distinct | FIXED | High-risk requests may require verification rather than execution. |
| Prompt-injection text in email remains untrusted data | FIXED | Language understanding cannot grant tool/application authority. |
| Resolution and successful satisfaction are distinct | FIXED | Decline, cancellation, invalidation, and user-close are not success. |
| User tracking close and external-world closure are distinct | FIXED | Stopping tracking does not change counterpart expectations. |
| Resolution status, live-tracking activation, and attention/defer are orthogonal semantic dimensions | FIXED | T20 and hold/snooze traces prove that one `OPEN/RESOLVED` or lifecycle field cannot carry all three meanings. |
| Generic acknowledgement/inactivity/read state are weak completion evidence | FIXED | Prevents false completion. |
| Send attempt and reconciled provider acceptance are distinct | FIXED | Ambiguous provider timeout cannot safely imply either success or failure. |
| A reconciled send resolves only when sending is sufficient for that Responsibility's closure condition | FIXED | Provider acceptance must not be generalized into proof of document usability, approval, or other external outcomes. |
| Historical `no observed closure` does not imply live active responsibility | FIXED | Initial sync cannot treat years-old mail like live event processing. |
| Ingestion order and semantic chronology are distinct | FIXED | Late arrival of older data must not supersede later correction. |
| One focal event may produce multiple Responsibility effects | FIXED | Supersession or one message with independent outcomes can affect/create multiple aggregates. |
| `SUPERSEDE` is a terminal effect on the old Responsibility, with replacement creation represented separately | FIXED | Avoids ambiguous `RESOLVE + SUPERSEDE` double operations and identity mutation. |
| Contingent obligations preserve an activation relation to their condition/event | FIXED | Future user work must not disappear while waiting or become actionable before the condition is met. |
| `My Turn / Waiting / Later / Done` are deterministic projections over admitted Responsibility semantics; `Review` is a product projection family whose subject type must remain explicit | FIXED | UI remains simple without confusing pre-admission review with canonical Responsibility state. |
| Uncertainty should be reasoned about by cause and field | FIXED | Missing context, source ambiguity, contradiction, noise, model instability, stale analysis require different treatment. |
| Admission `NEEDS_REVIEW` and admitted-Responsibility field review are distinct | FIXED | A Responsibility may definitely exist while one field conflicts, or Responsibility existence itself may be unresolved. |
| Uncertainty does not automatically imply asking the user | FIXED | Preserve decision-reduction; prompt only for material decision-critical uncertainty with no cheaper resolution. |
| Golden cases may be `DETERMINATE / AMBIGUOUS / USER_DEPENDENT` | FIXED | Do not train/evaluate the system to overstate certainty. |
| Preserve raw human disagreement where practical | FIXED | Some communication ambiguity is genuine rather than annotation error. |
| Annotation and eval must be layered rather than one final state label | FIXED | Needed to locate failures in zoning, extraction, admission, matching, reduction, safety, or projection. |
| Do not build a generic workflow engine for v0.1 | FIXED | Product value is responsibility reduction, not arbitrary BPMN/workflow infrastructure. |
| Cross-account semantic merge is prohibited initially | FIXED | Identity, privacy, send-account, and false-merge risks dominate convenience. |
| AI failure must not block ordinary mail reading/reply/search | FIXED | AI is an enhancement layer, not the availability gate for basic email. |

---

## Strong directions

| Decision | Status | Notes |
|---|---|---|
| Physical `ActionItem` entity should eventually be renamed to `Responsibility` or equivalent | STRONG DIRECTION | Semantics fit better; exact physical naming should be chosen during schema design, not kept by inertia. |
| Physical persistence should implement the fixed orthogonal semantic dimensions rather than the existing single lifecycle enum | STRONG DIRECTION | Exact tables/columns/enums remain open even though the semantic separation is fixed. |
| Replace `active + state + completed_at` with a less contradictory resolution/activation/attention model | STRONG DIRECTION | Exact fields/enums not frozen. |
| Persist surfaced admission-level Review as a narrow accepted pre-Responsibility artifact rather than a fake Responsibility | STRONG DIRECTION | Batch 3 demonstrates a real product/domain boundary; exact table name/shape still belongs to schema-freeze review. |
| Current explicit field-authority decisions should be directly queryable | STRONG DIRECTION | Prevents stale AI or unrelated evidence from silently overriding user-resolved fields; exact physical representation remains under audit. |
| Maintain pending proposals and agreed facts separately | STRONG DIRECTION | Necessary for scheduling/negotiation; physical representation remains open. |
| Use selective extra inference/validation for ambiguous or high-risk cases rather than default multi-run inference | STRONG DIRECTION | Balances cost, latency, and stability. |
| Japanese-specific typo/IME/noise variants belong in eval coverage | STRONG DIRECTION | Product must not rely on clean-input benchmarks. |
| Organic/historical failure cases must supplement synthetic canonical cases | STRONG DIRECTION | Prevents overfitting to artificially clean examples. |

---

## Open questions

| Question | Status | Why open |
|---|---|---|
| Exact physical schema for Responsibility / obligation legs / expected events / completion criteria / admission review | OPEN | Scenario/transition semantics are clearer than the minimal physical representation. |
| Exact enum names for resolution status, live-tracking activation, attention, obligation status/actionability | OPEN | Semantics are fixed; naming/cardinality are not. |
| Exact communication-act subtypes/modality enum | OPEN | Avoid taxonomy explosion before evidence. |
| Exact obligation-strength enum | OPEN | Dimension is required; labels need scenario validation. |
| Cross-thread Responsibility identity/continuation | OPEN | False merge and complexity may outweigh benefit in MVP. |
| Recurring Responsibility series | OPEN | Real need unknown; generic recurrence engine would be costly. |
| Shared/group assignment beyond conservative review | OPEN | Full collaboration engine is not an MVP requirement. |
| Calendar anchoring in MVP | OPEN | Semantics defined; product phase/integration cost unresolved. |
| Attachment-content understanding in MVP | OPEN | Metadata semantics are clearer than full document inference cost/risk. |
| Numeric risk/confidence thresholds | OPEN | Must come from eval/calibration, not intuition. |
| Numeric error weights | OPEN | Only ordinal harm ordering is currently justified. |
| Similarity thresholds for identity candidate retrieval | OPEN | Requires labeled identity data. |
| Number of AI reruns / ensemble strategy | OPEN | Should depend on observed instability/cost. |
| Historical lookback window / initial-sync activation policy | OPEN | Requires product testing and real inbox distributions. |
| Whether standing communication instructions become a separate memory/preference model | OPEN | Do not overload Responsibility with generic policy. |
| Exact high-risk authority/verification policy by action type | OPEN | Semantics require separation, but product/security policy needs implementation-specific evidence. |

---

## Superseded / rejected decisions

| Prior direction | Current status | Replacement |
|---|---|---|
| One canonical lifecycle enum: `OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN` | SUPERSEDED for Responsibility semantics | Orthogonal resolution/live-activation/attention/obligation semantics; UI buckets are projections. |
| `tracking_status: OPEN/RESOLVED` as a complete tracking model | SUPERSEDED as complete model | Treat legacy `tracking_status` as resolution-status shorthand only; live activation and attention are separate. |
| One scalar `next_owner` completely represents Responsibility state | SUPERSEDED | Multiple obligation legs/expected events are conceptually allowed; scalar owner is only convenience/projection. |
| `BOTH` as a general owner value | REJECTED as core solution | Represent parallel obligations or conservative ambiguity instead. |
| `active_obligations[]` as the only canonical obligation representation | SUPERSEDED as complete model | General `obligation_legs[]` with condition/actionability; active obligations are a derived subset. |
| One `deadline_at` captures temporal semantics | SUPERSEDED | Source due, expected event, user target, resurface, follow-up are distinct. |
| Whole-item `user_override_state` | SUPERSEDED | Field-scoped user authority/corrections. |
| Identity follows broad terminal/project outcome | SUPERSEDED | Smallest communication-bounded operational outcome with coherent closure. |
| Latest processed message/result wins | REJECTED | Use semantic chronology, explicit correction/supersession relations, and current evidence-set revision. |
| Any detected Request should create a task | REJECTED | Responsibility Admission Gate. |
| Admission `NEEDS_REVIEW` should be represented by a fake UNKNOWN Responsibility | REJECTED | Preserve a distinct pre-admission review subject until TRACK is accepted. |
| One obligation row per linguistic verb | REJECTED | Normalize only independently meaningful bearer/actionability/closure units. |
| Every USER-originated semantic fact belongs in a field-override mechanism | REJECTED | Orthogonal facts such as USER_TARGET keep their own semantic type/provenance. |
| AI confidence alone determines automation/review | REJECTED | Combine evidence quality, contradiction, risk, source ambiguity, deterministic validation, and model instability. |
| Repeated AI consensus is sufficient proof | REJECTED | Consensus is only one uncertainty signal. |
| User-close means objective completion | REJECTED | Tracking close and external resolution are distinct. |
| Communication hold automatically means `LATER` | REJECTED | Hold normally waits on another event; `LATER` requires separate attention defer. |
| Safety/legitimacy uncertainty should be encoded by inventing temporal kinds such as `SOURCE_DUE_CANDIDATE` | REJECTED | Preserve `SOURCE_DUE`; represent authority/legitimacy separately. |
| One scalar matching operation is sufficient for every focal event | REJECTED | Use `effects[]` when one event changes multiple Responsibilities. |

---

## Current validation state

The following Responsibility artifacts are mutually constrained by the current semantic/audit baseline:

```text
ANNOTATION-GUIDELINES.md
SCENARIO-SCHEMA.md
TRANSITION-SCHEMA.md
COVERAGE-PLAN.md
TIER-0-SCENARIO-MATRIX.md
TIER-0-CRITICAL-ORACLES.md
TIER-0-DETAILED-ORACLES-BATCH-2.md
TIER-0-DETAILED-ORACLES-BATCH-3.md
TRANSITION-ORACLES.md
CONSISTENCY-AUDIT.md
PHYSICAL-MODEL-DESIGN.md
PHYSICAL-MODEL-AUDIT.md
PHYSICAL-MODEL-AUDIT-BATCH-3.md
```

Coverage mapping is design-complete for all mandatory rule/contrast/interaction/mutant/metamorphic/high-harm/ambiguity/transition inventories. Detailed Tier-0 expansion is currently 28/44. This is not implementation or pass evidence.

The prior source-of-truth conflict has been reconciled across:

```text
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/design/INTERACTIONS.md
```

The remaining pre-schema work is to:

- expand the remaining schema-falsifier Tier-0 cases into full layered oracles;
- normalize legacy oracle aliases/errata into executable fixtures;
- pressure-test the current hybrid Responsibility aggregate plus narrow pre-admission Review boundary;
- perform a schema-freeze review that maps every proposed persisted structure to concrete oracle/query/invariant pressure;
- only then write Drizzle/PostgreSQL migrations.

Any scenario or production evidence that breaks a FIXED principle must trigger an explicit versioned decision review rather than an ad-hoc exception.