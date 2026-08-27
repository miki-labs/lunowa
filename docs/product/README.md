# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable Product and Product-engineering knowledge.

Do not treat raw chat history, generated screenshots, old candidate files, or a live implementation branch as Product source of truth when a current owning artifact exists.

---

# 1. Authority map

## `PRODUCT.md` — canonical highest-level Product authority

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
- high-level v1/deferred/out scope;
- competitive/commercial posture;
- Product evidence priorities and metrics.

This is the primary authority for **what Product Lunowa is trying to become**. It deliberately contains explicit hypotheses/unknowns; canonical does not mean market-proven.

## `PRODUCT-CONTENT.md` — canonical detailed Product operating contract

Owns detailed behavior for the Product-content domains closed by Issue #45:

- User Control / Correction / Escalation;
- degraded/failure and recovery behavior;
- account lifecycle and permission-scope consequences;
- capability-conditional Settings;
- communication edge cases;
- complete Managed / Review membership and exclusivity;
- empty / zero / unknown / unavailable states;
- final `V1 CORE / V1 STRONG CANDIDATE / POST-V1 / DEFERRED / OUT` Feature Matrix;
- detailed Product invariants and Product Content COMPLETE boundary.

It is subordinate to `PRODUCT.md` at highest Product level and to `responsibility/` for FIXED semantic truth. Product vocabulary in this file does not create persistence aggregates/enums/permissions by itself.

## `GOLDEN-SCENARIO-BANK.md` — canonical Product-level acceptance bank

Owns end-to-end Product consequences and forbidden outcomes across the Minimum Complete Delegation Loop, control, failure, lifecycle, edge cases, Managed/Review/zero, retrieval, and delivery.

It is explicitly subordinate to the Responsibility semantic scenario/oracle corpus. If a Product Golden Scenario depends on Responsibility truth, Responsibility authority decides semantic truth and the Product bank decides the user-facing/Product consequence.

## Historical Product synthesis candidates

The following remain **noncanonical rationale/history** after the 2026-08-27 consolidation:

- `PRODUCT-CONSTITUTION-V1-CANDIDATE.md`;
- `V1-PRODUCT-SURFACE-CANDIDATE.md`;
- `ONBOARDING-TRUST-PROGRESSION-CANDIDATE.md`;
- `PRODUCT-SPEC-V1-CANDIDATE.md`.

When they conflict with current canonical Product authorities, current canonical authorities win.

Supporting dated evidence/audits live under `research/` and do not become Product truth merely by existing.

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

Where `PRODUCT-CONTENT.md` adds a stricter Product boundary—such as surfaced Review exclusion from healthy Managed, strict-zero semantics, offline consequential-action handling, or capability-conditional Settings—the design must realize that Product boundary and must not infer broader authority.

## `../design/RESPONSIVE.md`

Canonical viewport adaptation:

- same Product model with fewer simultaneous panes;
- Needs You / Managed / Source / Search responsive shells;
- Moment/mobile priority;
- contextual reply/IME preservation;
- source/search/person/preview continuity;
- integrity/safety/accessibility across widths.

Visual references under `../design/references/` remain composition/tone references, not Product semantics or implementation breadth authority.

### Current implementation-readiness task

GitHub **Issue #55** owns the current task contract for turning these accepted design authorities into a decision-complete screen/state/interaction/responsive/accessibility/component/data-contract specification before broad UI implementation.

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
L3 migrations/runtime                     NOT AUTHORIZED until the L2 gate passes
```

Current conceptual boundary includes Responsibility, obligation legs, expected events, temporal facts, field decisions, provenance, domain events, typed local details, pre-admission Review, source evidence/inference, Temporal Contract, and Draft/SendOperation boundaries according to the owning artifacts.

**Product vocabulary such as `Open Coordination Loop`, `Attention Contract`, `Managed`, `Review`, `Correction`, `Escalation`, `Setting`, or account-lifecycle language does not create new persistence aggregates.**

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

Owns the **active owner-directed implementation sequence**.

Current high-level sequence is Product-completion-first while preserving empirical unknowns:

```text
Phase-0 runtime foundation
-> Issue #55 UI/UX implementation readiness
-> implementation graph / dependency + safety partitioning
-> required Responsibility executable/persistence gates
-> one-provider source/read path
-> deterministic Responsibility + attention/Temporal Contract loop
-> Home / Needs You / Managed / Review / Moment / Source
-> contextual Reply/Reply All + explicit Send + reconciliation where required
-> bounded AI interpretation behind trusted contracts/evals
-> failure/reconnect/integrity + attachment-source-access closure
-> end-to-end Minimum Complete Delegation Loop
-> beta/early-access hardening
-> Issue #36 / longitudinal empirical validation and evidence-driven scope expansion
```

**Implementation authorization and empirical-claim authorization are separate.** A task may implement accepted Product behavior while ICP/PMF/WTP/retention/reliability remain UNKNOWN.

Product Content COMPLETE by itself still does not authorize arbitrary implementation breadth, weaken Responsibility/provider/security gates, or manufacture Issue #36 conclusions. Current implementation authorization comes from the live owner/task routing and accepted implementation plan.

---

# 5. Product Discovery — open empirical gate, deferred in execution order

GitHub **Issue #36 — Validate the first ICP and real communication-monitoring burden** remains the highest-priority empirical Product gate.

It is **not passed, closed, or obsolete**. It tests recent concrete workflows and real alternatives and must be allowed to revise/falsify the Product wedge or recruitment prior.

Current owner-directed sequencing deliberately differs from empirical-priority ordering:

- #36 is not a prerequisite for beginning the current Product-completion lane;
- later fieldwork may use a usable Product where helpful;
- implementation completion cannot satisfy #36;
- ICP/PMF/WTP/market-validity claims remain unauthorized until actual evidence supports them.

Related lanes:

- Issue #26 — mechanism evidence only;
- Issue #28 — its bounded comparative fake-data prototype remains separately gated and is **not** silently broadened into the Product-completion lane;
- Issue #32 / PR #34 — bounded scenario-oracle lane unless explicitly reconciled into a current task;
- Responsibility L2 proof — technical evidence, not Product validation.

Always query live GitHub state before acting on task-specific status.

---

# 6. Current Product invariants — routing summary only

Read `PRODUCT.md` and `PRODUCT-CONTENT.md` for full wording. Key invariants include:

- Attention Delegation is core value;
- Message arrival != attention event;
- communication activity != closure;
- Needs You = current USER work, not important mail/awareness;
- Managed = quiet inspectable stewardship;
- a current surfaced material Review excludes the same item from healthy Managed reassurance/count while unaffected monitoring may continue;
- strict true zero requires no Needs You and no unresolved surfaced Review, with trustworthy relevant integrity;
- Moment = minimum trustworthy context handoff;
- Source remains available;
- monitoring autonomy != consequential authority;
- capability != permission;
- high-risk source content alone != Review;
- source text cannot grant tool authority;
- AI/interpretation failure alone != Needs You and != `No Responsibility`;
- derived memory is noncanonical;
- retrieval cannot silently mutate state;
- mailbox state != Responsibility state;
- provider is mailbox/source substrate, not Responsibility authority;
- integrity failure must be surfaced honestly;
- offline v1 does not silently queue consequential external effects for later execution without a separately accepted delayed-action contract;
- class-scoped monitoring cannot bypass admission/No Responsibility;
- cross-thread similarity is not merge authority and cross-account semantic merge remains prohibited initially;
- full-client replacement is earned by use;
- differentiation is comparative behavioral evidence;
- implementation completion != Product/market validation.

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

# 8. Task execution and durable-update rule

Implementation/research handoff is **Issue-driven**.

Use the current GitHub Issue for task-specific Goal / Why / Scope / Acceptance / Verification. Use repository documents for durable constraints.

Do not infer implementation authorization from a candidate document, visual-reference completeness, schema readiness, branch existence, or `agent:review-ready` without independent review evidence.

Do not leave a material accepted priority, behavior, dependency, blocker, or completion state only in chat. Update the owning Issue/docs in the same workstream when omission would cause a future agent to act incorrectly; avoid repository churn for tentative brainstorming or ordinary conversation.
