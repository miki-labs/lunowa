# Responsibility Decision Ledger

## Status labels

- **FIXED** — normative for v0.1 unless stronger evidence or a scenario counterexample supersedes it.
- **STRONG DIRECTION** — preferred direction, but scenario coverage or implementation evidence may still change it before schema freeze.
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
| New work after a genuinely closed episode normally creates a new Responsibility | FIXED | Avoids reopening historical episodes incorrectly. |
| Canonical state may contain multiple active obligations/expected events | FIXED | Parallel signers and other multi-party loops cannot be represented faithfully by one scalar owner. |
| A scalar `next_owner` is not complete canonical truth | FIXED | It may remain a convenience/projection field only. |
| `BOTH` must not be used to hide parallel/ambiguous structure | FIXED | Loses assignment semantics. |
| Action and constraint are distinct | FIXED | "Do not send before approval" is not a normal next action. |
| Pause/hold and cancellation are distinct | FIXED | A paused obligation can remain open. |
| Delegation intent and effective delegation are distinct | FIXED | Ownership transfer needs evidence that the request was actually communicated/effected. |
| Source due, expected-event time, user target, resurface time, and follow-up time are distinct | FIXED | Prevents false deadlines and incorrect projections. |
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
| Generic acknowledgement/inactivity/read state are weak completion evidence | FIXED | Prevents false completion. |
| Historical `no observed closure` does not imply live active responsibility | FIXED | Initial sync cannot treat years-old mail like live event processing. |
| Ingestion order and semantic chronology are distinct | FIXED | Late arrival of older data must not supersede later correction. |
| `My Turn / Waiting / Later / Done / Review` are deterministic projections, not canonical source state | FIXED | UI mental model remains simple without corrupting domain semantics. |
| Uncertainty should be reasoned about by cause and field | FIXED | Missing context, source ambiguity, contradiction, noise, model instability, stale analysis require different treatment. |
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
| Physical `ActionItem` entity should eventually be renamed to `Responsibility` or equivalent | STRONG DIRECTION | Semantics fit better, but rename itself has little product value and should wait until schema alignment. |
| Model responsibility state as a vector rather than the existing single lifecycle enum | STRONG DIRECTION | `DEFERRED`, `UNCERTAIN`, and `FOLLOW_UP` mix orthogonal dimensions in the current model. |
| Replace `active + state + completed_at` with a less contradictory tracking/resolution model | STRONG DIRECTION | Exact fields/enums not frozen. |
| Maintain pending proposals and agreed facts separately | STRONG DIRECTION | Necessary for scheduling/negotiation; physical representation remains open. |
| Support completion criteria within one Responsibility | STRONG DIRECTION | Handles partial completion without artificial splitting. |
| Use selective extra inference/validation for ambiguous or high-risk cases rather than default multi-run inference | STRONG DIRECTION | Balances cost, latency, and stability. |
| Japanese-specific typo/IME/noise variants belong in eval coverage | STRONG DIRECTION | Product must not rely on clean-input benchmarks. |
| Organic/historical failure cases must supplement synthetic canonical cases | STRONG DIRECTION | Prevents overfitting to artificially clean examples. |

---

## Open questions

| Question | Status | Why open |
|---|---|---|
| Exact physical schema for Responsibility / obligations / expected events | OPEN | Scenario matrix should drive minimal implementable shape. |
| Exact lifecycle/tracking/resolution enum values | OPEN | Semantics are fixed; names/cardinality are not. |
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

---

## Superseded / rejected decisions

| Prior direction | Current status | Replacement |
|---|---|---|
| One canonical lifecycle enum: `OPEN/ACTION_REQUIRED/DEFERRED/WAITING/FOLLOW_UP/COMPLETED/UNCERTAIN` | SUPERSEDED for responsibility semantics | Orthogonal/state-vector semantics; UI buckets become projections. |
| One scalar `next_owner` completely represents Responsibility state | SUPERSEDED | Multiple active obligations/expected events are conceptually allowed; scalar owner is only convenience/projection. |
| `BOTH` as a general owner value | REJECTED as core solution | Represent parallel obligations or conservative ambiguity instead. |
| One `deadline_at` captures temporal semantics | SUPERSEDED | Source due, expected event, user target, resurface, follow-up are distinct. |
| Whole-item `user_override_state` | SUPERSEDED | Field-scoped user authority/corrections. |
| Identity follows broad terminal/project outcome | SUPERSEDED | Smallest communication-bounded operational outcome with coherent closure. |
| Latest processed message/result wins | REJECTED | Use semantic chronology, explicit correction/supersession relations, and current evidence-set revision. |
| Any detected Request should create a task | REJECTED | Responsibility Admission Gate. |
| AI confidence alone determines automation/review | REJECTED | Combine evidence quality, contradiction, risk, source ambiguity, deterministic validation, and model instability. |
| Repeated AI consensus is sufficient proof | REJECTED | Consensus is only one uncertainty signal. |
| User-close means objective completion | REJECTED | Tracking close and external resolution are distinct. |

---

## Required next validation

The next artifact is a canonical scenario matrix built from `SCENARIO-SCHEMA.md`.

The matrix MUST intentionally target counterexamples rather than merely demonstrate happy paths. It should cover at least:

- direct and indirect requests;
- firm/tentative commitments;
- proposal/negotiation/partial acceptance;
- correction/conflict/authority ambiguity;
- quoted/forwarded/reported content;
- multi-party and parallel obligations;
- delegation and hold/cancel;
- temporal ambiguity/timezones/relative time;
- partial completion/reopen/new episode;
- typo/IME/noise and meaning-changing minimal edits;
- prompt injection/high-risk requests;
- stale AI and out-of-order ingestion;
- historical initial sync;
- genuine human disagreement;
- cross-account lookalikes without merge.

Any scenario that breaks a FIXED principle should trigger an explicit decision review and, if necessary, a versioned amendment rather than an ad-hoc exception.
