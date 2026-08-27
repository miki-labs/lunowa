# Current Project Checkpoint

This is a compact mutable bootstrap/router. It is **not** Product, design, domain, architecture, research, or live-execution authority. Query the owning canonical artifact and live GitHub state when those questions matter.

## Checkpoint metadata

- Last reconciled: `2026-08-28`
- Continuity schema version: `0.1`
- Canonical highest-level Product authority: `docs/product/PRODUCT.md`
- Canonical detailed Product operating contract: `docs/product/PRODUCT-CONTENT.md`
- Canonical Product-level acceptance bank: `docs/product/GOLDEN-SCENARIO-BANK.md`
- Canonical Product design: `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md`
- Canonical implementation-facing UI contract: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`
- Canonical Responsibility semantics: `docs/product/responsibility/`
- Active execution sequence: `docs/product/IMPLEMENTATION-PLAN.md`
- Current dependency/parallelization authority candidate: `docs/product/IMPLEMENTATION-GRAPH.md` + GitHub Issue #58
- Current owner-directed live planning task: GitHub Issue #58.

## Product direction

Lunowa remains centered on **Attention Delegation / Open-loop Monitoring Offload**.

Target behavior:

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

v1 remains the **one-provider Minimum Complete Delegation Loop**, not broad provider/full-client parity.

Product Content COMPLETE / UI contract frozen are specification milestones only. They do not establish ICP, PMF, WTP, retention or real monitoring relinquishment.

## Completed critical-path work

### Product Content

Canonical Product content and Product Golden Scenarios are complete enough for current implementation.

### Issue #55 — UI/UX implementation readiness — COMPLETE

PR #57 merged after full cumulative acceptance audit and exact-head Verify + E2E Smoke.

Merge baseline:
- `9869d7cdee2559b00d73203dec40d92bc90f537f`

Current UI implementation authority:
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`;
- canonical `DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md`.

The runtime itself is still bootstrap-level; frozen UI contract != implemented UI.

## Current task — Issue #58 Implementation Graph

GitHub **Issue #58 — `[Planning]: Freeze the implementation graph for the Minimum Complete Delegation Loop`** is the current critical-path task.

Its job is to prevent two failure modes before broad coding:
1. over-serializing independent work and losing speed;
2. parallelizing shared authority/schema/provider/send work and losing correctness.

Current candidate artifacts:
- `docs/product/IMPLEMENTATION-GRAPH.md`;
- `docs/product/research/issue-58-implementation-graph-evidence-2026-08-28.md`;
- reconciled `ARCHITECTURE.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`.

No broad production implementation fan-out should begin until #58 itself receives a full cumulative audit and exact-head CI.

## Current implementation fact

Repository production dependencies are still essentially bootstrap-only. Better Auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev and OpenAI interpretation are not activated yet.

Therefore:

```text
accepted stack choice
!= installed dependency
!= configured integration
!= implemented Product behavior
```

## Current dependency shape

The accepted candidate graph is roughly:

```text
Issue #58 graph freeze
    |
    +-> G00 patched Next.js security baseline
    |
    +-> P13 Responsibility PostgreSQL/Drizzle proof --+
    |                                                   +-> P15 L2 freeze
    +-> P14 Better Auth UUID proof --------------------+
    |
    +-> V01 final visual-reference pass

G00 + P14 -> app auth/base persistence -> Gmail Source path
P15       -> Responsibility L3 -> reducer -> attention/Temporal
UI shell + Source + domain projections -> Product surfaces
Product surfaces + Gmail -> contextual immediate Send -> reconciliation
-> integrity/recovery -> complete-loop integration
-> public-beta release gates
```

Exact edges/classes belong to `IMPLEMENTATION-GRAPH.md`.

## Immediate post-#58 gates

### G00 — framework security baseline

Current repository pins Next.js 16.3.0. Current 2026-08-25 Next.js security guidance moves the accepted Active-LTS 16.3 baseline to 16.3.3 for two Critical fixes.

The first runtime implementation task must patch the framework baseline and rerun exact-head verification before write-heavy production feature branches fan out.

### Responsibility proof

Current technical state:

```text
L0 semantic model                         FROZEN v0.1
L1 logical persistence boundary           FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate      v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 production Responsibility runtime       NOT AUTHORIZED
```

- Issue #13: PostgreSQL/Drizzle executable proof;
- Issue #14: Better Auth UUID persistence proof;
- Issue #15: independent combined freeze decision.

Issue #16 isolation harness is complete, so #13/#14 are no longer blocked by #16; they must still be refreshed from current post-security baseline and current dependency versions before execution.

## Current v1 activation boundaries

Current critical path includes:
- one Gmail provider;
- Source read/sync;
- attachment evidence access;
- Responsibility/attention/Temporal loop;
- Home/Needs You/Managed/Review/Moment/Source;
- contextual Reply/Reply All;
- explicit immediate Send + reconciliation;
- integrity/reconnect/recovery;
- bounded AI later behind trusted contracts.

Not current critical-path prerequisites:
- Microsoft provider;
- broad multi-account Scope UX;
- Person/CRM;
- Pin;
- generic full Compose/Forward parity;
- Send Later;
- generic Undo/recall;
- rich native attachment preview;
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## Visual sequencing

New final visual references were intentionally deferred until textual Product/UI/architecture implementation contracts were sufficiently frozen.

After Issue #58 passes, the final visual-reference pass may run **in parallel with backend proof work** and should finish before pixel-sensitive UI styling. Generated images remain subordinate to textual Product/UI authority.

## Gmail/provider gate

Current architecture remains:

```text
Gmail watch/PubSub signal
-> authenticated quick acknowledgement
-> durable reconciliation
-> history.list / full-sync recovery
-> normalized Source evidence
```

Push is not truth. Current provider behavior requires watch renewal, periodic reconciliation, tolerance for dropped/delayed notifications, and 404/full-sync recovery for stale history cursors.

Public OAuth verification/restricted-scope security assessment is a **public-release gate**, not a blocker to all local/private Product implementation.

## Background execution gate

Trigger.dev remains viable as execution infrastructure, not authority. Current v4 idempotency scope/TTL/failure semantics require PostgreSQL/domain currentness/idempotency for provider sync, Temporal effects and Send.

## AI gate

OpenAI Responses + Structured Outputs remains a viable bounded interpretation layer.

`store: false` must not be treated as synonymous with Zero Data Retention. Production activation requires current organization/project data-control review, minimum authorized context, no indiscriminate raw mail logging and layered eval/holdout evidence.

## Empirical Product Discovery

Issue #36 remains open and deferred in execution order, not passed.

Implementation may proceed against accepted Product hypotheses, but implementation completion does not authorize claims about:
- exact ICP;
- problem prevalence/severity;
- monitoring relinquishment;
- PMF;
- WTP/pricing;
- retention;
- superiority to real current workflows.

If later evidence falsifies the current wedge, the Product plan must change even if code already exists.

## Repository update rule

Update durable GitHub state when owner priority, accepted contract, dependency graph, blocker/unblocker, material external evidence, or final review/merge disposition changes.

Do not create commits for every discussion or tentative idea.

## Deep links

- `docs/product/PRODUCT.md`
- `docs/product/PRODUCT-CONTENT.md`
- `docs/product/GOLDEN-SCENARIO-BANK.md`
- `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`
- `docs/product/ARCHITECTURE.md`
- `docs/product/CONTRACTS.md`
- `docs/product/TECH-STACK.md`
- `docs/product/IMPLEMENTATION-PLAN.md`
- `docs/product/IMPLEMENTATION-GRAPH.md`
- `docs/product/responsibility/L2-EXECUTABLE-PROOF-GATE.md`
- Issue #58 — current implementation-graph gate
- Issues #13/#14/#15 — Responsibility executable/freeze lane
- Issue #36 — open empirical Product Discovery

If this checkpoint conflicts with canonical Product/design/domain sources, executable evidence, merged implementation graph, or live GitHub state, the authoritative/current source wins. Repair this router rather than treating stale prose as authority.