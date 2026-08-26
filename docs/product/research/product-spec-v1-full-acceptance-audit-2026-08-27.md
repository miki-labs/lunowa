# Product Spec v1 Full Acceptance Audit — 2026-08-27

## Status

**Candidate-level full acceptance audit: PASS after batched correction.**

This audit evaluates the **entire consolidated candidate**, not only its latest edits, against the current task contract and repository authorities.

Audited candidate:

- `docs/product/PRODUCT-SPEC-V1-CANDIDATE.md`

Evidence/reconciliation artifact:

- `docs/product/research/product-spec-v1-consolidation-and-reconciliation-2026-08-27.md`

Audit authorities:

- `docs/product/PRODUCT.md`;
- `docs/product/PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `docs/product/V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `docs/product/ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- `docs/product/responsibility/DECISIONS.md` and current Responsibility authority;
- `docs/design/DESIGN.md`;
- `docs/design/INTERACTIONS.md`;
- `docs/product/IMPLEMENTATION-PLAN.md`;
- GitHub Issue #36.

---

# 1. Acceptance contract

The candidate must:

1. consolidate the Product content developed through 2026-08-27 into one coherent contract;
2. distinguish Product completeness from market validation;
3. preserve canonical Responsibility FIXED semantics;
4. avoid silently creating domain aggregates/schema/enums/permissions;
5. keep Issue #36 as the current highest Product-discovery gate;
6. avoid authorizing write-heavy implementation merely because Product design is more complete;
7. reconcile Product surfaces, daily rhythm, onboarding/trust, retrieval/history/people context, ordinary communication actions, autonomy, closure, and v1 scope;
8. preserve evidence/provenance/account/authority boundaries;
9. preserve empirical uncertainty for ICP, PMF, WTP, attainable reliability, IA validation, and Product form;
10. identify canonical-document drift before promotion rather than hiding it.

---

# 2. Material blockers found during full audit

The initial consolidated candidate failed full acceptance on four material points. The audit was completed before correction; all known material blockers were corrected together.

## A-01 — `Provider = communication system of record` was too broad

### Problem

The first candidate said the provider remained the `communication system of record`.

That wording could be read as giving provider mailbox state authority over accepted Responsibility state, conflicting with:

- field-specific evidence authority;
- evidence-relative accepted state;
- claim vs observation;
- mailbox state being orthogonal to Responsibility semantics.

### Correction

The candidate now states:

> **Provider remains the primary mailbox/source substrate; Lunowa owns accepted Responsibility state and attention behavior under its own canonical domain authority.**

No provider folder/read/archive state becomes Responsibility truth.

## A-02 — Product-level Attention Contract was referenced without a strict Temporal Contract boundary

### Problem

The candidate used `Attention Contract` language without explicitly preserving that it is Product-level framing only, creating risk that implementation could infer a new persisted object or replace accepted Temporal Contract authority.

### Correction

The final candidate explicitly states:

- Attention Contract is Product-level language only;
- it does not authorize an `AttentionContract` table/object;
- Temporal Contract remains the accepted durable time/event reconsideration mechanism;
- trigger firing causes re-evaluation, not automatic notification.

## A-03 — accepted security/authority invariants were omitted from the consolidated spec

### Problem

The first candidate's autonomy section did not explicitly carry forward two existing accepted principles:

- `requested action != safe/recommended next action`;
- prompt/tool-like email/source text remains untrusted data and cannot grant authority.

A document claiming Product-content completeness cannot omit these boundaries.

### Correction

The final candidate now explicitly states both invariants and retains deterministic Product/domain/policy mediation between model proposals and privileged effects.

## A-04 — Product-content completion omitted explicit commercial/distribution status and replacement/trust switching-cost distinction

### Problem

The first candidate listed pricing/distribution only in unknowns and did not preserve the current Product distinction between:

- replacement switching cost;
- delegation/trust cost.

This left the full-client/companion rationale and Product-commercial completeness under-specified.

### Correction

The final candidate now explicitly preserves:

- paid subscription/prosumer pricing as a hypothesis only;
- price/package/WTP as unknown;
- distribution/acquisition as unknown;
- replacement switching cost vs delegation/trust cost;
- companion/hybrid as a Product hypothesis, not validated truth.

---

# 3. Responsibility FIXED-semantic audit

## PASS

The corrected candidate does not conflict materially with the current FIXED ledger.

Verified constraints include:

- `Responsibility` remains canonical semantic concept;
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

The final candidate preserves and consolidates:

- Vision / North Star;
- Attention Delegation / monitoring relinquishment;
- Open-loop Monitoring Offload as problem/wedge, not moat;
- system-led rather than Ask-AI-led routine use;
- `Eliminate work, not control`;
- source/provenance/account/human authority;
- Responsibility/Moment/Temporal Contract serving the user outcome rather than ontology-driven Product design;
- competitive differentiation as comparative behavioral evidence;
- ICP as unknown / recruitment prior only;
- monitoring failure becoming more consequential as reliance succeeds;
- Product evidence before implementation/client breadth.

---

# 5. Surface / daily / onboarding audit

## PASS at candidate level; canonical design reconciliation required before promotion

The candidate coherently separates:

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
- monitoring autonomy != external-action autonomy.

Current canonical `DESIGN.md` / `INTERACTIONS.md` remain materially broader/staler in several areas, so canonical promotion requires simultaneous reconciliation rather than pretending no drift exists.

---

# 6. Retrieval/history/people audit

## PASS

The candidate preserves:

- exact search alongside natural-language retrieval;
- evidence-grounded, time-aware operational answers;
- derived memory as non-authoritative/disposable;
- historical source searchable without live activation;
- retrieval as a read path that cannot silently mutate accepted state;
- authorization-filtered context;
- no cross-account semantic merge;
- people context limited to communication restoration rather than CRM/personality/relationship scoring.

---

# 7. Ordinary communication-action audit

## PASS at Product-candidate level

The action boundary is coherent:

- native actions are justified by completing the Attention loop;
- contextual Reply/Reply All/draft/explicit Send are stronger Product targets than generic compose parity;
- provider send reconciliation remains mandatory semantic evidence;
- arbitrary new Compose/Forward/Send Later/mailbox hygiene can remain provider fallback or deferred;
- mailbox state is explicitly orthogonal to Responsibility state;
- provider remains mailbox/source substrate, not Responsibility authority;
- full-client replacement remains an empirical later decision.

The v1 action matrix is explicitly marked **Product target, not implementation authorization**.

---

# 8. Implementation / live-task audit

## PASS

The candidate does not reorder current execution authority:

- Issue #36 remains the highest Product-discovery gate;
- #26 remains downstream mechanism evidence;
- write-heavy #28 is not authorized by Product-content completion;
- Responsibility L2 proof remains separate technical evidence;
- production persistence/provider breadth remain gated by accepted implementation plan/ADRs/issues.

`IMPLEMENTATION-PLAN.md` is already substantially compatible with one-provider / evidence-first / client-breadth-later direction.

---

# 9. Known canonical drift requiring promotion reconciliation

These are not failures of the corrected candidate, but they block **silent** canonical promotion:

1. `DESIGN.md` still lists broad initial full-client capabilities (Gmail+Outlook, multiple accounts, full compose/forward, mailbox folders/actions, Send Later, bulk actions, etc.).
2. `DESIGN.md` still recommends high-frequency top-level `Later` / `Waiting` navigation rather than Managed-first candidate IA.
3. `INTERACTIONS.md` still treats prominent native new compose/full compose fields as accepted first-class behavior rather than provider-fallback/optional v1 breadth.
4. `INTERACTIONS.md` does not yet express the consolidated awareness/integrity/daily delivery contract.
5. `PRODUCT.md` contains the correct thesis/evidence discipline but does not yet consolidate the now-completed Product surface/daily/onboarding/retrieval/action decisions.
6. `README.md` still routes Product authority solely through the older Product/Design descriptions.

Canonical promotion should correct these together and then undergo another full acceptance audit.

---

# 10. Candidate-level disposition

**PASS.**

The corrected `PRODUCT-SPEC-V1-CANDIDATE.md` is internally coherent, preserves current semantic/safety/evidence gates, and is complete enough to serve as the basis for canonical Product reconciliation.

This PASS does **not** mean:

- validated ICP;
- Product-market fit;
- implementation authorization;
- provider/API feasibility proof;
- validated notification thresholds;
- validated five-surface IA;
- validated companion/hybrid superiority;
- validated WTP/retention.

Those remain explicit empirical gates/unknowns.
