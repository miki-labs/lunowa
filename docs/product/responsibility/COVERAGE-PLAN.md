# Responsibility Scenario Coverage Plan v0.1

## Status

**Accepted coverage-design baseline for constructing the canonical Responsibility scenario corpus.**

This document defines what the scenario corpus as a whole must cover. `SCENARIO-SCHEMA.md` defines the shape of one scenario; this document defines corpus-level coverage obligations and stopping criteria.

The goal is not to maximize the number of examples. The goal is to construct the smallest practical corpus that exposes the highest-value semantic, safety, temporal, identity, and nondeterminism failures.

---

## 1. Coverage model

Let the mandatory coverage universe be:

```text
U = R ∪ C ∪ I2 ∪ I3 ∪ T ∪ M ∪ MR ∪ H ∪ O
```

where:

- `R` = fixed-rule sentinels;
- `C` = minimal contrast boundaries;
- `I2` = decision-critical two-way interactions;
- `I3` = selected high-risk three-way interactions;
- `T` = event/transition traces;
- `M` = semantic mutants that the corpus must kill;
- `MR` = metamorphic relations;
- `H` = high-harm forbidden-outcome sentinels;
- `O` = ambiguity/human-oracle coverage.

A scenario `s` covers some subset `cover(s) ⊆ U`.

Scenario selection should approximate a constrained set-cover problem:

```text
minimize total scenario construction / annotation cost
subject to every mandatory coverage obligation being covered
and every critical mutant / forbidden outcome being protected.
```

Do not optimize this mechanically before the semantic inventory is stable; the formulation exists to prevent redundant case accumulation.

---

## 2. Corpus counting

Keep these counts separate:

```text
Base semantic oracles
Controlled perturbation variants
Repeated execution trials
Organic / production regression cases
```

A typo, negation, CC, or wording variant of one semantic oracle does not automatically count as an independent semantic concept.

Initial planning range:

```text
Base semantic oracles: approximately 120–180
Controlled variants: added selectively to high-value bases
Total executable inputs: likely 250–400+ before repeated nondeterminism trials
```

These are planning ranges, not quotas. Stop when mandatory coverage is satisfied and additional cases are materially redundant.

---

## 3. Required verification layers

The scenario corpus is a semantic oracle, not a universal testing framework.

The same scenario may drive different verification layers:

| Concern | Primary verification layer |
| --- | --- |
| zoning / communication act / admission | annotation + AI extraction eval |
| matching / identity / reducer semantics | deterministic domain unit/integration tests |
| temporal trigger behavior | scheduler/domain integration tests |
| prompt-injection authority | security/tool-boundary tests |
| stale AI result | concurrency/integration tests |
| out-of-order ingestion | provider/sync integration tests |
| cross-account isolation | authorization/security tests |
| AI-unavailable basic mail behavior | E2E/failure-mode tests |
| UI bucket projection | deterministic projection unit/E2E tests |

Do not claim a semantic golden case alone proves authorization, durability, idempotency, or runtime safety.

---

# 4. R — Fixed-rule sentinels

Every scenario-testable FIXED principle in `DECISIONS.md` must map to at least one sentinel scenario or one explicit non-scenario verification.

Mandatory semantic sentinels:

| ID | Boundary protected |
| --- | --- |
| R01 | original communication remains immutable evidence |
| R02 | Message, Conversation, Responsibility are distinct |
| R03 | Responsibility identity uses the smallest communication-bounded operational outcome |
| R04 | communication-act detection does not imply Responsibility admission |
| R05 | `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` and `No Responsibility` are valid outcomes |
| R06 | public communicative force is annotated without inventing hidden private intent |
| R07 | speaker and obligation bearer are distinct |
| R08 | politeness and obligation strength are distinct |
| R09 | capability / intention / plan / commitment are not silently strengthened |
| R10 | proposal and agreement are distinct |
| R11 | communicated claim and observed fact are distinct |
| R12 | evidence authority is fact/field-specific |
| R13 | canonical state is evidence-relative; off-channel world state may be unknown |
| R14 | semantic similarity retrieves identity candidates but does not authorize merge |
| R15 | ambiguous identity policy prefers avoiding false merge over modest false split |
| R16 | REOPEN means the same operational outcome was never actually satisfied |
| R17 | genuinely closed episode followed by new work normally creates a new Responsibility |
| R18 | multiple simultaneous obligations / expected events can exist |
| R19 | scalar `next_owner` / `BOTH` cannot hide canonical parallel or ambiguous structure |
| R20 | action and constraint are distinct |
| R21 | pause/hold and cancellation are distinct |
| R22 | delegation intent and effective delegation are distinct |
| R23 | source due / expected event / user target / resurface / follow-up time are distinct |
| R24 | temporal precision must not be silently increased |
| R25 | external temporal anchor resolution is derived and can change without rewriting source |
| R26 | material values should remain source-span grounded and deterministically parsed where practical |
| R27 | important facts/state changes preserve provenance |
| R28 | user target/preference cannot overwrite communicated source fact |
| R29 | user correction authority is field-scoped |
| R30 | typo normalization remains derived data |
| R31 | material typo candidates are not silently corrected |
| R32 | harmless-noise invariance and meaning-change sensitivity are both required |
| R33 | accepted interpretation/state is stable across ordinary UI reads; rerun is not implicit authority |
| R34 | stale AI result cannot mutate current evidence revision |
| R35 | repeated/model consensus is an uncertainty signal, not truth authority |
| R36 | tracking a request does not mean compliance/authorization |
| R37 | requested action and safe/recommended next action are distinct |
| R38 | email prompt-injection text remains untrusted communication content |
| R39 | resolution is distinct from successful satisfaction |
| R40 | user tracking-close is distinct from external-world closure |
| R41 | generic acknowledgement/inactivity/read state is weak completion evidence |
| R42 | historical no-observed-closure does not imply live active Responsibility |
| R43 | ingestion order does not define semantic chronology |
| R44 | `My Turn / Waiting / Later / Done / Review` are deterministic projections, not canonical source state |
| R45 | uncertainty is reasoned about by field and cause |
| R46 | uncertain fact does not automatically imply asking the user |
| R47 | oracle may be DETERMINATE / AMBIGUOUS / USER_DEPENDENT |
| R48 | genuine human disagreement is preserved where practical |
| R49 | layered oracle/evaluation is required instead of final-bucket-only truth |
| R50 | cross-account semantic auto-merge is prohibited initially |

Engineering-only sentinels such as AI-unavailable basic reading/reply availability must still be verified, but they do not need artificial semantic examples merely to increase scenario count.

---

# 5. C — Mandatory minimal contrasts

Each contrast should have minimally different inputs whose expected semantic difference is explicit.

| ID | Contrast |
| --- | --- |
| C01 | incoming request ↔ incoming commitment |
| C02 | outgoing request ↔ outgoing commitment |
| C03 | same commitment-like wording inbound ↔ outbound direction |
| C04 | firm commitment ↔ stated plan |
| C05 | plan ↔ intention |
| C06 | intention ↔ tentative intention |
| C07 | capability/feasibility ↔ commitment |
| C08 | proposal ↔ accepted agreement |
| C09 | preference/opinion ↔ decision/acceptance |
| C10 | review/check ↔ approve/authorize |
| C11 | pause/hold ↔ cancellation |
| C12 | delegation intention ↔ effective delegated request |
| C13 | material request ↔ courtesy/pleasantry |
| C14 | direct assignment/To ↔ CC-only presence |
| C15 | current-authored request ↔ quoted historical request |
| C16 | forwarded FYI ↔ forwarded content plus current authored request |
| C17 | source due ↔ expected-event time |
| C18 | source due ↔ user target |
| C19 | explicit correction ↔ unresolved conflicting evidence |
| C20 | REOPEN ↔ genuinely new episode |
| C21 | sequential steps to one operational outcome ↔ independent outcomes |
| C22 | partial completion criteria within one Responsibility ↔ independent Responsibilities |
| C23 | communicated completion claim ↔ provider/external observation |
| C24 | weak acknowledgement ↔ strong explicit closure |
| C25 | declined request ↔ satisfied request |
| C26 | user tracking-close ↔ externally communicated closure |
| C27 | harmless typo/noise ↔ clean equivalent |
| C28 | meaning-changing minimal edit (for example negation insertion) ↔ original |
| C29 | live new communication ↔ historical imported open-loop lookalike |
| C30 | fresh AI interpretation ↔ stale interpretation after evidence revision |
| C31 | same-account lookalike ↔ cross-account lookalike |
| C32 | low-risk direct requested action ↔ high-risk case where safe next action becomes review/verification |

A contrast is not covered merely because each side appears somewhere in unrelated contexts. Prefer explicit paired construction.

---

# 6. I2 — Mandatory decision-critical two-way interactions

Do not attempt exhaustive pairwise Cartesian coverage. Cover these interactions because their combination changes semantics, safety, or user-visible behavior.

| ID | Interaction |
| --- | --- |
| I201 | direction × communication act |
| I202 | communication act × modality/strength |
| I203 | communication act × admission |
| I204 | communication act × discourse scope (current / quoted / forwarded / reported) |
| I205 | communication act × assignment shape |
| I206 | direction × assignment |
| I207 | communication act × temporal semantic kind |
| I208 | communication act × proposal/agreement state |
| I209 | proposal/agreement state × temporal expression |
| I210 | identity operation × closure evidence |
| I211 | identity operation × object/artifact continuity |
| I212 | claim/observation class × resolution decision |
| I213 | claim/observation class × attachment evidence |
| I214 | message zone × communication act |
| I215 | source noise × material token |
| I216 | source noise × negation/polarity |
| I217 | uncertainty cause × risk |
| I218 | risk × requested/safe action distinction |
| I219 | AI freshness × evidence-set revision |
| I220 | ingestion chronology × correction/supersession |
| I221 | account scope × identity matching |
| I222 | historical/live mode × closure evidence |
| I223 | parallel obligations × UX projection |
| I224 | partial completion × UX projection |
| I225 | user field correction/target × communicated source fact |
| I226 | external temporal anchor × anchor change |
| I227 | completion-evidence strength × risk |
| I228 | ambiguity/uncertainty × user-prompt policy |
| I229 | responsibility multiplicity × conversation-level primary projection |

---

# 7. I3 — Selected mandatory high-risk three-way interactions

These combinations are sufficiently dangerous that pairwise coverage alone is not adequate.

| ID | Interaction |
| --- | --- |
| I301 | material typo × negation/polarity × high-risk action |
| I302 | proposal × relative/event time × timezone/reference-frame ambiguity |
| I303 | quoted/forwarded content × assignment × current-authored text |
| I304 | explicit correction × out-of-order ingestion × stale AI result |
| I305 | parallel obligations × partial completion × projection |
| I306 | cross-account similarity × identity matching × sending/account identity |
| I307 | high-risk request × weak/unverified source trust × safe next action |
| I308 | historical import × no observed closure × live user-action projection |
| I309 | completion/attachment claim × provider contradiction × resolution |
| I310 | indirect/polite request × assignment ambiguity × temporal pressure |
| I311 | delegation wording × recipient/CC evidence × ownership transfer |
| I312 | pending proposal × ambiguous acceptance signal (for example emoji/"了解") × risk |
| I313 | event-relative due × external anchor change × analysis freshness |
| I314 | multiple Responsibilities in one Conversation × one completed item × conversation projection |
| I315 | external source due × user target × snooze/resurface attention behavior |
| I316 | prompt-injection/tool-like text × high-risk requested action × authorization boundary |

---

# 8. T — Mandatory transition/event traces

Static single-message cases cannot validate identity continuity, reopening, ordering, or state evolution.

| ID | Required trace |
| --- | --- |
| T01 | CREATE → UPDATE → RESOLVE |
| T02 | inbound user obligation → user action/send → waiting on other party → response → resolve |
| T03 | outbound user commitment → user action → provider reconciliation → resolve |
| T04 | waiting → follow-up trigger → user follow-up action → send → waiting/resolve |
| T05 | proposal → counterproposal → acceptance/agreement |
| T06 | proposal → rejection/decline without accidental agreement |
| T07 | open → hold/pause → resume → resolve |
| T08 | open → cancellation → resolved-cancelled |
| T09 | delegation intent → effective delegation → other-party work → resolve |
| T10 | apparent completion → contradictory/failure evidence → REOPEN |
| T11 | genuinely resolved episode → later new work → CREATE new Responsibility |
| T12 | old request → explicit supersession → old resolved/superseded + new Responsibility |
| T13 | conflict → explicit correction → one current fact with preserved history |
| T14 | newer correction processed → older evidence ingested late → corrected state remains current |
| T15 | AI run begins → evidence revision changes → old result rejected → new result may apply |
| T16 | parallel USER + OTHER obligations → user leg completes → Waiting on other → resolve |
| T17 | one completion criterion satisfied → still open → final criterion satisfied → resolve |
| T18 | condition waiting on external event → event occurs → user obligation becomes actionable |
| T19 | event-relative temporal anchor resolves → anchor changes → derived time updates without source rewrite |
| T20 | historical imported apparent open-loop → conservative inactive/review state → explicit user decision to resume or close tracking |

---

# 9. M — Semantic mutants that the suite must kill

These are plausible but wrong implementation shortcuts. A mandatory mutant is considered killed when at least one scenario/test would fail if the mutant rule were implemented.

| ID | Wrong rule to kill |
| --- | --- |
| M01 | one Message always equals one Responsibility |
| M02 | one Conversation owns one authoritative lifecycle state |
| M03 | every detected Request automatically becomes TRACK |
| M04 | `No Responsibility` is not allowed |
| M05 | newest message always wins every fact conflict |
| M06 | last ingested/processed event always wins |
| M07 | CC membership makes the user an obligation bearer |
| M08 | polite/soft wording means OPTIONAL |
| M09 | plan/intention/capability is equivalent to commitment |
| M10 | proposal is equivalent to agreement |
| M11 | quoted historical request is a current request |
| M12 | forwarded request automatically transfers obligation to current user |
| M13 | communicated claim is equivalent to observed external fact |
| M14 | every `tomorrow`/date mention is a user deadline |
| M15 | user target overwrites source due |
| M16 | generic thanks/acknowledgement means completed |
| M17 | read/open state means completed/understood |
| M18 | semantic similarity above threshold authorizes Responsibility merge |
| M19 | cross-account similar thread/request may auto-merge initially |
| M20 | `BOTH` fully represents parallel/shared obligations |
| M21 | user tracking-close means objective satisfaction |
| M22 | AI may silently repair material typo/date/amount/negation |
| M23 | high model confidence authorizes high-risk external action |
| M24 | sender-requested action is always the primary safe CTA |
| M25 | every ambiguity should ask the user a question |
| M26 | historical item with no observed closure is automatically live My Turn |
| M27 | latest AI result returned by wall-clock time always applies |
| M28 | hidden/private intent may be inferred from politeness, hierarchy, or style and treated as fact |
| M29 | scalar `next_owner` is complete canonical state |
| M30 | pause/hold is equivalent to cancellation |
| M31 | stating intent to delegate immediately transfers ownership |
| M32 | broad project goal is always the correct Responsibility identity |
| M33 | explicit correction and independent conflicting claims are handled the same way |
| M34 | vague date/time may be upgraded to an exact conventional time |
| M35 | every group recipient owns the same obligation |
| M36 | opening an attachment proves review/completion |
| M37 | any completion claim automatically resolves the Responsibility |
| M38 | one global evidence-authority ranking works for every fact field |
| M39 | important inferred facts do not require provenance once model confidence is high |
| M40 | repeated AI consensus is sufficient truth authority |

**Required target:** all current mandatory semantic mutants must be killed before calling the initial coverage corpus complete.

---

# 10. MR — Mandatory metamorphic relations

A metamorphic relation states how outputs must change or remain stable under a controlled input transformation.

| ID | Relation |
| --- | --- |
| MR01 | harmless typo/IME noise preserves decision-critical semantics when meaning remains stable |
| MR02 | punctuation/casing/spacing variation preserves decision-critical semantics |
| MR03 | politeness/honorific rewrite that preserves communicative force preserves Responsibility semantics |
| MR04 | meaning-preserving Japanese/English code-switch preserves critical semantics |
| MR05 | cosmetic subject-line variation does not create a new Responsibility by itself |
| MR06 | inbound ↔ outbound direction changes bearer/expected-event semantics where appropriate while preserving action object |
| MR07 | direct addressee/To ↔ CC-only transformation may change assignment/admission and must not be ignored |
| MR08 | negation insertion/removal changes polarity/action semantics while preserving unrelated context fields |
| MR09 | date-digit change updates the relevant temporal fact and should not arbitrarily change owner/outcome |
| MR10 | amount-digit change updates amount and triggers material sensitivity without unrelated semantic drift |
| MR11 | proposal wording → explicit acceptance changes pending proposal/agreed-fact state |
| MR12 | firm → tentative wording changes modality/strength but preserves topic/object when otherwise unchanged |
| MR13 | changing user target preserves external source due |
| MR14 | adding an irrelevant FYI message does not mutate an unrelated existing Responsibility |
| MR15 | duplicate provider ingestion is semantically idempotent |
| MR16 | changing ingestion arrival order while preserving semantic chronology yields the same final canonical state |
| MR17 | repeated model execution on an unchanged accepted revision does not automatically rewrite persisted product state |
| MR18 | external calendar/event anchor change updates derived resolution while preserving original temporal expression/provenance |
| MR19 | adding quoted historical content alone does not create a new current Responsibility |
| MR20 | adding current authored "これお願いします" to the same forwarded content may create a current request; zoning change must matter |

For each relation, record `must_preserve_fields` and `must_change_fields` where practical.

---

# 11. H — High-harm forbidden-outcome sentinels

At least one high-quality scenario/test must explicitly forbid each of these failures.

| ID | Forbidden outcome class |
| --- | --- |
| H01 | material USER obligation becomes hidden/Done without adequate closure |
| H02 | fake completion/resolution from weak evidence |
| H03 | USER ↔ OTHER/EXTERNAL owner reversal on material obligation |
| H04 | fabricated exact deadline or incorrect temporal kind |
| H05 | fabricated or silently modified material amount/value |
| H06 | wrong connected account / recipient identity / send identity |
| H07 | false Responsibility merge hides an independent obligation |
| H08 | high-risk requested action becomes executable/recommended without required trusted authorization/verification |
| H09 | prompt-injection text gains system/tool/state-mutation authority |
| H10 | material negation typo/noise reverses an action without review/safe handling |
| H11 | stale model result or late old event rolls state backward |
| H12 | unresolved conflicting evidence is silently collapsed to one fact without basis |
| H13 | cross-account context leaks into extraction/identity/projection |
| H14 | proposal/pending term is surfaced as agreed fact/deadline |
| H15 | over-conservative design asks the user for non-decision-critical uncertainty at scale, defeating decision reduction |

For CRITICAL/HIGH scenarios, forbidden-outcome occurrence should be measured directly rather than hidden inside aggregate accuracy.

---

# 12. O — Ambiguity and human-oracle coverage

The corpus must contain cases where uncertainty is genuinely part of the correct answer.

| ID | Required ambiguity family |
| --- | --- |
| O01 | source wording genuinely permits more than one obligation interpretation |
| O02 | optionality/materiality is user/relationship dependent |
| O03 | social hierarchy/politeness provides context but does not establish business authority |
| O04 | sarcasm/non-literal reading changes a decision-critical interpretation |
| O05 | emoji / "了解です" / short acknowledgement has context-dependent acceptance force |
| O06 | group/"誰か" assignment does not establish a unique bearer |
| O07 | pronoun/referent depends on missing prior context |
| O08 | conflicting instructions from actors with unresolved authority |
| O09 | timezone/reference frame is insufficient to resolve a material relative time exactly |
| O10 | off-channel completion may have happened but is not observable to Lunowa |

Where practical retain raw independent annotations and adjudication rationale rather than erasing disagreement.

---

# 13. Required coverage hierarchy

Construct the corpus in this order:

```text
Level 1 — FIXED principle sentinels
Level 2 — minimal contrast pairs
Level 3 — mandatory two-way interactions
Level 4 — selected high-risk three-way interactions
Level 5 — transition/event traces
Level 6 — metamorphic variants and organic regressions
```

Do not advance by case-count quota. Advance when the relevant level's mandatory obligations are mapped and no known critical hole is being masked by redundant examples.

---

# 14. Suggested base-corpus tiers

Planning guidance only:

| Tier | Purpose | Approximate base-case range |
| --- | --- | ---: |
| Tier 0 | invariant sentinels / minimal contrasts | 30–40 |
| Tier 1 | core semantic two-way interactions | 40–60 |
| Tier 2 | adversarial high-risk compounds | 20–30 |
| Tier 3 | event/transition traces | 20–30 |

A single well-designed case may satisfy several coverage IDs. Do not create one case per inventory row mechanically.

---

# 15. Scenario admission rule

A new base scenario should normally satisfy at least one of:

```text
protects a FIXED principle
kills a mandatory semantic mutant
forms a required minimal contrast
covers a mandatory interaction
covers a mandatory transition
protects a high-harm forbidden outcome
creates a useful metamorphic family
captures an organic / historical / production failure
```

If it covers none of these, it is likely low-value redundancy.

Surface-language diversity that does not add semantic coverage should normally be represented as perturbation variants, not new independent base oracles.

---

# 16. Deduplication rule

Two scenarios are semantic duplicates when they protect the same rules, kill the same mutants, cover the same interactions/transitions, have the same risk shape, and differ only cosmetically.

Prefer:

```text
semantic duplicate → remove / merge
surface diversity → perturbation family
new semantic interaction or risk → independent base scenario
```

---

# 17. Dataset partitions

When the corpus becomes executable against AI/runtime behavior, separate at least:

```text
Specification/Core — visible canonical examples used to explain semantics
Development Eval — may be used during prompt/model iteration
Sealed Holdout — not used to tune the current implementation
Regression — organic/historical failures added after discovery
```

Holdout selection should be family-stratified, not purely random. Important semantic families and high-risk patterns must remain represented in holdout.

Do not tune on all golden cases and then report performance on the same cases as if it were independent generalization evidence.

---

# 18. Coverage scorecard

Do not reduce corpus health to one accuracy number. Track at least:

```text
Fixed-rule coverage
Minimal-contrast coverage
Mandatory I2 coverage
Mandatory I3 coverage
Transition coverage
Semantic-mutant kill coverage
Metamorphic-relation coverage
High-harm forbidden-outcome coverage
Ambiguity/oracle coverage
Organic regression coverage
```

Also keep model/runtime metrics separate:

```text
correctness
same-input run stability
meaning-equivalent robustness
semantic sensitivity
provenance coverage
forbidden-outcome count
```

Consensus is not correctness; stability and correctness must be reported separately.

---

# 19. Completion gate for the initial coverage design

Before declaring the initial scenario corpus structurally complete:

1. every scenario-testable FIXED principle has an explicit mapping;
2. every mandatory minimal contrast is represented;
3. every mandatory I2 and I3 interaction has at least one meaningful case;
4. every mandatory transition trace exists;
5. all mandatory semantic mutants are killed;
6. every high-harm forbidden outcome has an explicit sentinel;
7. all metamorphic relations selected for v0.1 have base cases capable of generating variants;
8. ambiguity/user-dependent cases exist and are not forced into false certainty;
9. semantic duplicates are removed or converted into perturbation variants;
10. remaining known gaps are documented as OPEN rather than silently ignored.

Passing this gate means the **coverage design is complete enough to support implementation/evaluation**. It does not mean AI accuracy or product quality has been proven.
