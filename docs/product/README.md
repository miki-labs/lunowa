# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable Product and Product-engineering knowledge.

Do not treat raw chat history, generated screenshots, old candidate files, or a live implementation branch as Product source of truth when a current owning artifact exists.

---

# 1. Authority map

## `PRODUCT.md` — canonical Product authority

Owns:

- Vision / North Star;
- Attention Delegation / Open-loop Monitoring Offload;
- Product jurisdiction / anti-scope;
- ICP/recruitment status and explicit unknowns;
- current v1 Product direction;
- Attention/Temporal Contract relationship;
- Minimum Complete Delegation Loop;
- Daily Operating Model / delivery lanes;
- Home / Needs You / Moment / Managed / Review / Source Product surfaces;
- onboarding / trust progression;
- closure/reopen Product rules;
- Operational Retrieval / history / people-context boundary;
- ordinary communication-action / provider ownership boundary;
- autonomy/security/failure-recovery principles;
- v1 core/deferred/out scope;
- competitive/commercial posture;
- Product evidence sequence and metrics.

This is the primary authority for **what Product Lunowa is trying to become**. It deliberately contains explicit hypotheses/unknowns; canonical does not mean market-proven.

## Historical Product synthesis candidates

The following remain **noncanonical rationale/history** after the 2026-08-27 consolidation:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- `PRODUCT-SPEC-V1-CANDIDATE.md`.

When they conflict with `PRODUCT.md`, `PRODUCT.md` wins at Product level.

Supporting dated evidence/audits live under `research/`.

---

# 2. Product-design authorities

## `../design/DESIGN.md`

Canonical high-level design authority:

- Attention-first Product IA;
- stable shell / adaptive content;
- Home / Needs You / Managed / Review / Source / Moment hierarchy;
- contextual communication rather than full-provider-parity requirement;
- Operational Retrieval / people / attachment design;
- trust/integrity/error/accessibility/visual system;
- provider mailbox state remains orthogonal to Responsibility state.

## `../design/INTERACTIONS.md`

Canonical detailed interaction behavior:

- surface navigation;
- Moment projection interactions;
- multiple Responsibilities/obligation legs;
- contextual reply/send + reconciliation UX;
- Temporal Contract triggers vs delivery;
- Managed/integrity behavior;
- search/retrieval;
- onboarding / class-scoped delegation;
- provider fallback/mailbox convenience boundary;
- system/error/offline/accessibility behavior.

## `../design/RESPONSIVE.md`

Canonical viewport adaptation:

- same Product model with fewer simultaneous panes;
- Needs You / Managed / Source / Search responsive shells;
- Moment/mobile priority;
- contextual reply/IME preservation;
- source/search/person/preview continuity;
- integrity/safety/accessibility across widths.

Visual references under `../design/references/` remain composition/tone references, not Product semantics or implementation breadth authority.

---

# 3. Responsibility authority

## `responsibility/`

Primary authority for canonical Responsibility semantics, annotation/evaluation behavior, accepted L1 persistence boundary, current L2 candidate, and executable proof gate.

Recommended reading order:

1. `responsibility/README.md` — scope/status/freeze levels;
2. `responsibility/DECISIONS.md` — FIXED/OPEN/SUPERSEDED decisions;
3. `responsibility/CONSISTENCY-AUDIT.md` — reconciliation/errata;
4. annotation/scenario/transition/coverage/oracle artifacts;
5. physical-model audits/freeze review;
6. `POSTGRESQL-DRIZZLE-DDL-DESIGN.md` — exact current L2 candidate;
7. `L2-EXECUTABLE-PROOF-GATE.md` — required evidence before final freeze.

### Current freeze state

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle DDL            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 migrations/runtime                     NOT AUTHORIZED
```

Current conceptual boundary includes Responsibility, obligation legs, expected events, temporal facts, field decisions, provenance, domain events, typed local details, pre-admission Review, source evidence/inference, Temporal Contract, and Draft/SendOperation boundaries according to the owning artifacts.

**Product vocabulary such as `Open Coordination Loop` or `Attention Contract` does not create new persistence aggregates.**

---

# 4. Engineering authorities

## `ARCHITECTURE.md`

Owns product-specific architecture, including modular-monolith boundaries, provider/sync, Responsibility authority, AI boundary, Temporal Contract reliability, send/search/security/failure architecture.

## `DATA-MODEL.md`

Owns conceptual durable data model and accepted Responsibility persistence boundary status.

## `CONTRACTS.md`

Owns module/API logical contracts: provider, sync/ingestion, AI interpretation, Responsibility reduction, Temporal Contract, attention, drafts/send, search/context, background jobs, error/versioning/testing semantics.

## `TECH-STACK.md`

Owns accepted implementation stack/activation policy. Current choices include Node/TypeScript/Next/React/PostgreSQL/Drizzle/Better Auth/Trigger.dev, Gmail-first provider direction, OpenAI structured runtime, and verification stack.

A technology choice does not itself authorize implementation breadth.

## `IMPLEMENTATION-PLAN.md`

Owns active evidence/implementation sequence.

Current high-level sequence remains evidence-first:

```text
Bootstrap
-> Issue #36 problem / ICP evidence
-> bounded fake-data mechanism experiment
-> longitudinal monitoring-relinquishment proof
-> only then broaden credible client shell as evidence requires
-> Responsibility persistence when justified and executable gate passes
-> one real provider read path
-> real contextual send path when justified
-> deterministic Responsibility / Temporal Contract runtime
-> AI behind validated contracts/evals
-> search/context quality
-> second provider
-> beta hardening
```

The canonical Product contract becoming more complete does **not** authorize Issue #28, L3 migrations, broad provider integration, or full-client parity.

---

# 5. Current Product-discovery authority

GitHub **Issue #36 — Validate the first ICP and real communication-monitoring burden** remains the highest-priority Product gate.

It tests recent concrete workflows and real alternatives. It must be allowed to revise/falsify the Product wedge or recruitment prior.

Downstream:

- Issue #26 — mechanism evidence only;
- Issue #28 — write-heavy prototype remains gated;
- Issue #32 / PR #34 — bounded scenario-oracle lane, not Product critical path;
- Responsibility L2 proof — technical evidence, not Product validation.

Always query live GitHub state before acting on task-specific status.

---

# 6. Current Product invariants — routing summary only

Read `PRODUCT.md` for full wording. Key invariants include:

- Attention Delegation is core value;
- Message arrival != attention event;
- communication activity != closure;
- Needs You = current USER work, not important mail/awareness;
- Managed = quiet inspectable stewardship;
- Moment = minimum trustworthy context handoff;
- Source remains available;
- monitoring autonomy != consequential authority;
- capability != permission;
- source text cannot grant tool authority;
- derived memory is noncanonical;
- retrieval cannot silently mutate state;
- mailbox state != Responsibility state;
- provider is mailbox/source substrate, not Responsibility authority;
- integrity failure must be surfaced honestly;
- class-scoped monitoring cannot bypass admission/No Responsibility;
- full-client replacement is earned by use;
- differentiation is comparative behavioral evidence.

This README is a router, not a substitute for the owning Product/design/domain documents.

---

# 7. Durable architecture decisions

High-value ADRs include:

- `0001-modular-monolith-default.md`;
- `0002-ai-understands-rules-decide-state.md`;
- `0003-temporal-contracts-use-durable-scheduling.md`;
- `0004-web-runtime-and-ui-stack.md`;
- `0005-auth-and-persistence-stack.md`;
- `0006-provider-sync-and-background-runtime.md`;
- `0007-initial-ai-runtime.md`;
- `0008-responsibility-state-is-orthogonal.md`;
- `0009-responsibility-persistence-boundary.md`.

A decision may be superseded by stronger evidence, but rationale/consequences should be durable and owning artifacts updated together when authority changes.

---

# 8. Task execution rule

Implementation/research handoff is **Issue-driven**.

Use the current GitHub Issue for task-specific Goal / Why / Scope / Acceptance / Verification. Use repository documents for durable constraints.

Do not infer implementation authorization from:

- Product completeness;
- a candidate document;
- visual reference completeness;
- technical schema readiness;
- branch existence;
- `agent:review-ready` without independent review evidence.
