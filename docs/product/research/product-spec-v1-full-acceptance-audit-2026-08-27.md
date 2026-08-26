# Product Spec v1 Full Acceptance Audit — 2026-08-27

## Status

**Full candidate + canonical-promotion acceptance audit: PASS after batched correction.**

This audit evaluates the **entire consolidated Product candidate and the final canonical promotion candidate**, not only the latest edits, against the current task contract and repository authorities.

Audited Product synthesis:

- `docs/product/PRODUCT-SPEC-V1-CANDIDATE.md`;
- promoted canonical `docs/product/PRODUCT.md`;
- reconciled canonical design/router sources changed in PR #42.

Evidence/reconciliation artifact:

- `docs/product/research/product-spec-v1-consolidation-and-reconciliation-2026-08-27.md`.

Audit authorities / constraints include:

- pre-promotion `docs/product/PRODUCT.md` and historical Product synthesis candidates;
- `docs/product/responsibility/DECISIONS.md` and current Responsibility authority;
- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/design/RESPONSIVE.md`;
- `docs/design/references/README.md`;
- `docs/product/ARCHITECTURE.md`;
- `docs/product/DATA-MODEL.md`;
- `docs/product/CONTRACTS.md`;
- `docs/product/TECH-STACK.md`;
- `docs/product/IMPLEMENTATION-PLAN.md`;
- repository routing sources (`AGENTS.md`, root/product README, continuity routing);
- live GitHub Issue #36.

This PASS is a **documentation/Product-contract acceptance result**, not Product-market validation and not runtime/provider/schema proof.

---

# 1. Acceptance contract

The final candidate must:

1. consolidate Product content developed through 2026-08-27 into one coherent canonical contract;
2. distinguish Product-content completeness from market validation;
3. preserve canonical Responsibility FIXED semantics;
4. avoid silently creating domain aggregates/schema/enums/permissions;
5. keep Issue #36 as the current highest Product-discovery gate;
6. avoid authorizing write-heavy implementation merely because Product/design documentation is more complete;
7. reconcile Product surfaces, daily rhythm, onboarding/trust, retrieval/history/people context, ordinary communication actions, autonomy, closure, and v1 scope;
8. preserve evidence/provenance/account/authority boundaries;
9. preserve empirical uncertainty for ICP, PMF, WTP, attainable reliability, IA validation, Product form, and distribution;
10. reconcile all material canonical routing/design drift that could steer builders toward obsolete Product scope;
11. keep future-capability architecture/contracts distinguishable from current Product implementation scope;
12. leave a durable audit trail of material blockers/corrections before integration.

---

# 2. Material blockers found during full audit

The audit was completed across the whole candidate/authority set before correction. Known material blockers were corrected in batches rather than one-by-one patch loops.

## A-01 — `Provider = communication system of record` was too broad

### Problem

The first consolidated candidate said the provider remained the `communication system of record`.

That could be read as giving provider mailbox state authority over accepted Responsibility state, conflicting with field-specific evidence authority, evidence-relative accepted state, claim vs observation, and mailbox-state orthogonality.

### Correction

Canonical Product wording now states:

> **Provider remains the primary mailbox/source substrate; Lunowa owns accepted Responsibility state and attention behavior under its own canonical domain authority.**

No provider folder/read/archive state becomes Responsibility truth.

## A-02 — Attention Contract / Temporal Contract boundary was under-specified

### Problem

`Attention Contract` Product language could have been misread as authorizing a new persisted object or replacing accepted Temporal Contract authority.

### Correction

The final Product contract states:

- Attention Contract is Product-level language only;
- it does not authorize an `AttentionContract` table/object;
- Temporal Contract remains the accepted durable time/event reconsideration mechanism;
- trigger firing causes current-state re-evaluation, not automatic notification.

## A-03 — accepted security/authority invariants were omitted in early consolidation

### Problem

Two existing FIXED boundaries were not explicit in the first consolidated draft:

- `requested action != safe/recommended next action`;
- prompt/tool-like email/source text remains untrusted data and cannot grant application authority.

### Correction

Both are explicit in canonical Product/design/router text, with deterministic Product/domain/policy mediation between model proposals and privileged effects.

## A-04 — commercial/distribution and switching-cost status was incomplete

### Problem

The first candidate listed pricing/distribution only as loose unknowns and did not preserve the Product distinction between replacement switching cost and delegation/trust cost.

### Correction

Canonical Product now explicitly preserves:

- paid subscription/prosumer pricing as a hypothesis only;
- exact price/package/WTP as unknown;
- distribution/acquisition as unknown;
- replacement switching cost vs delegation/trust cost;
- companion/hybrid as a Product hypothesis rather than validated truth.

## A-05 — canonical Design still encoded broad full-client-first scope

### Problem

Pre-promotion `DESIGN.md` treated Gmail + Outlook, multiple accounts, full fresh compose/forward, broad mailbox administration, Send Later, bulk actions, and other provider-parity features as initial Product scope.

That contradicted the evidence-first Minimum Complete Delegation Loop and could steer implementation toward a broad replacement client before Product evidence.

### Correction

Canonical `DESIGN.md` now:

- makes companion/hybrid + one-provider complete-loop proof the current v1 direction;
- treats contextual Reply/draft/explicit Send as more Product-critical than generic fresh Compose parity;
- defers broad mailbox/provider/client breadth unless evidence requires it;
- preserves the mature visual system, stable shell, Moment, accessibility, and Responsibility semantics.

## A-06 — canonical IA still encoded permanent projection queues

### Problem

Pre-promotion design made `Later` / `Waiting` high-frequency top-level navigation, risking a second monitoring inbox and conflicting with quiet delegated monitoring.

### Correction

Canonical design now centers Home / Needs You / Managed / conditional Review / Source. Waiting/Later remain valid projections but normally become Managed inspection/filter detail rather than permanent daily work queues.

## A-07 — Interaction/Responsive contracts still treated broad native Compose as first-class v1 behavior

### Problem

Pre-promotion `INTERACTIONS.md` / `RESPONSIVE.md` required prominent full new-compose behavior and provider-like breadth as ordinary first-slice interaction acceptance.

### Correction

Canonical interaction/responsive sources now:

- make contextual communication Product-critical;
- make generic fresh Compose optional/provider-fallback for current v1 learning;
- add awareness/integrity/delivery semantics;
- preserve IME, draft safety, source access, send reconciliation, keyboard/accessibility, and responsive continuity.

## A-08 — repository routers still pointed builders toward the obsolete implementation sequence

### Problem

Root `README.md` and `AGENTS.md` still described the first Product phase as a broad high-fidelity desktop mail-client shell followed by persistence/provider/send work.

### Correction

Routers now align with the active evidence sequence:

```text
Issue #36 problem / ICP evidence
-> bounded mechanism experiment
-> longitudinal monitoring-relinquishment proof
-> broaden credible client shell only as evidence requires
-> persistence/provider/send/domain/AI/search under their own gates
```

Product/design completeness does not authorize Issue #28 or production persistence.

## A-09 — visual-reference authority could silently revive old Product behavior

### Problem

`docs/design/references/README.md` still declared a global interaction rule:

```text
normal Conversation-row body -> 会話
status chip -> 今の要点
```

and described full native compose/multi-account references without current Product-scope caveats.

After the Attention-first promotion this could incorrectly override the surface-specific contract (`Needs You item -> Moment`, `Source row -> Conversation`) or revive deferred full-client breadth merely from screenshots.

### Correction

The visual-reference README now:

- routes Product scope to `PRODUCT.md` first;
- distinguishes Needs You / Managed / Source interactions explicitly;
- states there is no one global row-open rule across Product surfaces;
- keeps original Source directly accessible;
- marks compose, Send Later, multi-account, old navigation, and onboarding screenshots as historical/future visual material where current Product scope defers them;
- prevents visual references from authorizing Product breadth.

---

# 3. Responsibility FIXED-semantic audit

## PASS

The final promoted Product/design/router candidate does not materially conflict with the current FIXED ledger.

Verified constraints include:

- `Responsibility` remains the canonical semantic concept;
- no parent `OpenCoordinationLoop` aggregate is introduced;
- Conversation supports zero/one/many Responsibilities;
- `No Responsibility` remains valid;
- `TRACK / DO_NOT_TRACK / NEEDS_REVIEW` remains admission authority;
- pre-admission Review and admitted-field Review remain distinct internally;
- multiple obligation legs/expected events remain supported;
- action / expected event / outcome remain distinct;
- claim / observation remain distinct;
- field-specific evidence authority is not replaced;
- evidence-relative accepted state is preserved;
- semantic similarity is candidate retrieval only;
- source due / expected-event time / user target / resurface / follow-up remain distinct;
- resolution / live tracking / attention remain orthogonal;
- user tracking close != external-world closure;
- silence/read/acknowledgement remain weak completion evidence;
- requested action != safe next action;
- prompt/tool-like source text remains untrusted data;
- send attempt != provider acceptance;
- reconciled send resolves only when sufficient for that Responsibility's closure condition;
- historical no-closure != live Responsibility;
- REOPEN identity rule remains exact;
- genuinely new post-closure work normally creates a new Responsibility;
- no generic workflow engine;
- cross-account semantic merge remains prohibited initially;
- AI failure does not become the source-reading/reply/search availability gate.

---

# 4. Product/doctrine audit

## PASS

The canonical promotion preserves and consolidates:

- Vision / North Star;
- Attention Delegation / monitoring relinquishment;
- Open-loop Monitoring Offload as problem/wedge, not moat;
- Minimum Complete Delegation Loop;
- system-led rather than Ask-AI-led routine use;
- `Eliminate work, not control`;
- source/provenance/account/human authority;
- Responsibility/Moment/Temporal Contract serving the user outcome rather than ontology-driven Product design;
- communication activity as evidence rather than closure;
- message arrival vs attention/delivery separation;
- monitoring autonomy vs consequential action authority separation;
- competitive differentiation as comparative behavioral evidence;
- ICP as unknown / recruitment prior only;
- monitoring failure becoming more consequential as reliance succeeds;
- Product evidence before implementation/client breadth.

---

# 5. Surface / daily / onboarding audit

## PASS

The canonical Product/design contract coherently separates:

- Needs You — actionable USER work;
- Review — material ambiguity/safety subject;
- Managed — delegated monitoring assurance/inspection;
- Moment — minimum temporal context handoff;
- Source — original communication/provenance;
- Awareness — information without work;
- Integrity Alert — system/degraded state, not Responsibility semantics.

It preserves:

- awareness-only != Needs You;
- Review != Needs You;
- trigger firing != notification;
- quiet hours suppress interruption, not monitoring;
- digest must not hide work;
- no mandatory daily opening/shutdown;
- source-first to Attention-first progression is explicit and earned;
- class-scoped monitoring never bypasses admission;
- monitoring autonomy != external-action autonomy;
- Source remains directly accessible;
- Managed does not become an agent-activity console;
- Waiting does not become a required daily queue.

---

# 6. Retrieval / history / people audit

## PASS

The promoted contract preserves:

- exact search alongside natural-language Operational Retrieval;
- evidence-grounded, time-aware current-state answers;
- derived memory as non-authoritative/disposable;
- historical source searchable without live activation;
- retrieval as a read path that cannot silently mutate accepted state;
- authorization-filtered context;
- no cross-account semantic merge;
- people context limited to communication restoration rather than CRM/personality/relationship scoring.

---

# 7. Ordinary communication-action audit

## PASS

The action boundary is coherent:

- native actions are justified by completing the Attention loop;
- contextual Reply/Reply All/draft/explicit Send are stronger Product targets than generic compose parity;
- provider send reconciliation remains mandatory semantic evidence;
- arbitrary new Compose/Forward/Send Later/mailbox hygiene can remain provider fallback, optional future capability, or deferred scope;
- mailbox state remains orthogonal to Responsibility state;
- provider remains mailbox/source substrate, not Responsibility authority;
- full-client replacement remains an empirical later decision.

The v1 action matrix is explicitly Product direction, **not implementation authorization**.

---

# 8. Architecture / data / contracts audit

## PASS with non-blocking future-capability breadth

`ARCHITECTURE.md`, `DATA-MODEL.md`, and `CONTRACTS.md` remain semantically compatible with the promoted Product contract.

They intentionally contain **capability superset** contracts for possible/future operations such as:

- generic new/forward send mode;
- Send Later / scheduled SendOperation;
- Undo-delay send behavior;
- archive/read/trash/spam provider mutations;
- multi-provider adapter capability.

These are **not current v1 implementation requirements** because:

1. `PRODUCT.md` owns Product scope and explicitly defers/optionalizes that breadth;
2. `IMPLEMENTATION-PLAN.md` owns activation/sequence and explicitly says not to build provider/client breadth merely because architecture supports it;
3. the contracts define safe boundaries **if/when** a capability is activated;
4. current task Issues remain required implementation authority.

Therefore the capability superset is not a material blocker and should not be deleted merely to make architecture artificially narrow.

Guardrail:

> **Capability contract != current Product scope != implementation authorization.**

If a future builder or Issue treats those optional modes as mandatory current scope, the task contract is defective and must be reconciled rather than inferred from capability enumeration alone.

---

# 9. Implementation / live-task audit

## PASS

The promotion does not reorder current execution authority:

- Issue #36 remains the highest Product-discovery gate;
- #26 remains downstream mechanism evidence;
- write-heavy #28 is not authorized by Product-content completion;
- #32/PR #34 remains bounded scenario-oracle work rather than Product critical path;
- Responsibility L2 proof remains separate technical evidence;
- production persistence/provider breadth remain gated by accepted implementation plan/ADRs/issues.

`IMPLEMENTATION-PLAN.md` remains compatible with one-provider / evidence-first / client-breadth-later direction.

---

# 10. Router / continuity / visual-authority audit

## PASS

The final candidate now routes consistently:

- `PRODUCT.md` — canonical Product authority;
- historical `*CANDIDATE.md` files — noncanonical rationale/history;
- design Markdown — canonical Product UX behavior;
- Responsibility directory — canonical Responsibility semantics;
- Architecture/Data/Contracts/Tech Stack — engineering/capability authority within Product/implementation scope;
- Implementation Plan + live Issue — execution sequence/current task authority;
- visual references — visual material only under current textual Product/design authority;
- `CURRENT.md` — compact mutable router, not duplicate Product truth.

No material router currently instructs a new builder to restore broad full-client-first implementation before Issue #36 / Product evidence.

---

# 11. Remaining empirical unknowns intentionally preserved

The promotion does **not** freeze or claim:

- exact ICP / first segment;
- Product-market fit;
- prevalence/severity of monitoring burden;
- real incumbent-workflow adequacy;
- production material false-negative / false-positive / Review trade-off;
- reliability threshold at which users truly stop parallel self-checking;
- exact notification/digest/quiet-hours defaults;
- exact class-scoped delegation criteria;
- whether `Attention Contract` remains final Product terminology;
- whether the current surface IA wins real usability/longitudinal use;
- whether companion/hybrid remains superior after mature adoption;
- whether native generic compose/calendar/multi-account later become Product-critical;
- natural-language retrieval depth;
- attachment-content understanding depth;
- exact pricing/WTP/packaging;
- acquisition/distribution;
- retention;
- provider-notification migration acceptance;
- whether Responsibility remains the simplest sufficient mechanism after real data.

These remain evidence targets, not documentation defects.

---

# 12. Final promotion disposition

## PASS — canonical Product promotion is acceptable, subject only to normal exact-head repository CI / merge mechanics

The final PR candidate:

- provides one coherent canonical Product contract;
- reconciles Product scope with canonical Design/Interactions/Responsive behavior;
- preserves Responsibility FIXED semantics;
- prevents historical visual references/routers from silently restoring obsolete scope;
- preserves implementation sequencing and Issue #36 priority;
- keeps future-capability engineering contracts distinct from current v1 scope;
- preserves explicit empirical unknowns rather than manufacturing certainty.

No known material Product/semantic/routing blocker remains after the batched corrections above.

This PASS does **not** mean:

- validated ICP;
- Product-market fit;
- implementation authorization for gated work;
- provider/API feasibility proof;
- executable PostgreSQL/Drizzle/Auth proof;
- validated notification thresholds;
- validated surface IA;
- validated companion/hybrid superiority;
- validated WTP/retention/distribution.

Those remain governed by their own evidence gates.
