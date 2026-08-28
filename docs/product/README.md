# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable Product and Product-engineering knowledge. It is an authority router, not a duplicate specification.

Do not treat raw chat history, generated screenshots, historical candidate files, or an implementation branch as Product truth when a current owning artifact exists.

## 1. Product authorities

### `PRODUCT.md`

Highest-level Product authority: North Star, Attention Delegation, jurisdiction/anti-scope, v1 direction, surfaces, monitoring/Temporal relationship, autonomy/security/failure principles and explicit empirical unknowns.

Canonical does not mean market-proven.

### `PRODUCT-CONTENT.md`

Detailed Product operating authority for control/correction/escalation, degraded/recovery behavior, account lifecycle, Settings, communication edge cases, Managed/Review/zero states and final Feature Matrix.

### `GOLDEN-SCENARIO-BANK.md`

Product-level end-to-end acceptance bank. Responsibility semantic oracles remain authoritative for Responsibility truth.

Historical `*CANDIDATE.md` files remain rationale/history only.

## 2. Product-design authorities

- `../design/DESIGN.md` — canonical IA/visual/Product-design guardrails.
- `../design/INTERACTIONS.md` — detailed surface and interaction behavior.
- `../design/RESPONSIVE.md` — same Product ontology across viewports.
- `../design/V1-UI-IMPLEMENTATION-CONTRACT.md` — accepted implementation-facing contract completed by Issue #55 / PR #57.
- `../design/references/` — visual references only; textual Product/UI authority wins.

Issue #55 is **complete**, not the current execution gate.

## 3. Responsibility authority

`responsibility/` is primary authority for canonical Responsibility semantics, evals, L1 persistence boundary, current exact L2 candidate and executable proof gate.

Current freeze state:

```text
L0 semantics                              FROZEN v0.1
L1 logical persistence                    FROZEN v0.1
L2 PostgreSQL/Drizzle candidate            v0.4 STATIC REVIEW COMPLETE
L2 executable proof                       PENDING (#13/#14)
L2 final freeze                           BLOCKED (#15)
L3 production Responsibility runtime      NOT AUTHORIZED
```

Product/UI vocabulary does not create new persistence aggregates/enums/permissions.

## 4. Engineering authorities

### `ARCHITECTURE.md`

Intended modular-monolith, provider, domain, AI, Temporal, send/search/security/failure boundaries.

### `DATA-MODEL.md`

Conceptual durable entities/relationships. Exact Responsibility L2 representation remains governed by `responsibility/` proof/freeze artifacts.

### `CONTRACTS.md`

Logical module/API contracts and authority boundaries.

### `TECH-STACK.md`

Accepted replaceable technology choices and activation policy. Selection does not prove installation/behavior.

### `IMPLEMENTATION-PLAN.md`

High-level owner-directed execution sequence.

### `IMPLEMENTATION-GRAPH.md`

**Issue #58 candidate; after accepted merge it becomes the exact dependency/parallelization/single-writer/FK-topology authority together with live GitHub Issues.**

Until #58 merges, treat it as candidate and check live Issue #58 state.

## 5. Current execution routing

Issue #55 / PR #57 completed UI/UX implementation-readiness.

Current gate:

```text
Issue #58 implementation graph
-> full cumulative audit
-> exact-head CI
-> merge
```

After accepted #58 merge:

```text
G00 framework security baseline
+ V01 final visual-reference pass (parallel-safe)
-> proof/auth/evidence/UI waves according to IMPLEMENTATION-GRAPH.md
-> one-provider Minimum Complete Delegation Loop
-> R90 public-beta readiness
```

Do not duplicate the detailed DAG here.

The core implementation doctrine is:

> **Build one complete trustworthy delegation loop before broad provider/client parity.**

## 6. Persistence / proof routing

Current bounded proof gates:

- Issue #13 — real PostgreSQL 18 / Drizzle L2 executable proof;
- Issue #14 — Better Auth UUID persistence proof;
- Issue #15 — independent combined review/freeze.

Current production dependency principles:

- proof fixture != production FK target;
- every frozen L2 external FK target needs explicit production ownership/order;
- `ParticipantIdentity` belongs to the provider-neutral evidence foundation, not CRM scope;
- minimal `AIInterpretationRun` production prerequisite may exist before AI runtime; table existence != model authority;
- production Responsibility tables remain blocked until P15 PASS/FREEZE.

Exact writer/order authority belongs to `IMPLEMENTATION-GRAPH.md`.

## 7. Product Discovery boundary

Issue #36 remains open empirical Product Discovery, deferred in current execution order.

Implementation may proceed against accepted hypotheses, but implementation completion cannot establish:

- ICP;
- problem prevalence/severity;
- monitoring relinquishment;
- PMF;
- WTP;
- retention;
- comparative market differentiation.

Issue #28 remains its bounded comparative fake-data experiment unless explicitly reconciled.

## 8. High-value routing invariants

Read Product/Responsibility sources for complete wording. Key constraints include:

- Message arrival != attention event.
- Communication activity != closure.
- Needs You = current user work, not important mail.
- Managed = quiet inspectable stewardship.
- Material surfaced Review is not healthy Managed reassurance.
- true zero requires trustworthy coverage.
- Source remains directly accessible.
- capability != permission.
- AI output != accepted state/Send authority.
- provider/mailbox state != Responsibility state.
- search/retrieval cannot silently mutate accepted state.
- cross-account semantic merge is prohibited initially.
- ambiguous Send requires reconciliation.
- offline consequential effects are not silently queued.
- proof fixture != production FK target.
- parallel worktree/runtime isolation != parallel merge safety.
- implementation completion != Product validation.

## 9. Durable update rule

Use the live Issue for task-specific Goal/Scope/Acceptance/Verification. Update the owning repository artifact in the same workstream when accepted Product/UX/domain/architecture behavior, dependency order, blocker/unblocker, authority routing or completion evidence materially changes.

Do not create repository churn for tentative brainstorming. Future agents should be able to recover the correct state without chat-only context.
