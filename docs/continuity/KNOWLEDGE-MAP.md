# Knowledge Map

This map routes questions to authoritative sources. It is navigation, not a substitute for the sources it names.

| Question / knowledge class | Primary authority | Secondary/context | Freshness rule |
|---|---|---|---|
| Product vision / problem / v1 direction / explicit hypotheses | `docs/product/PRODUCT.md` | `PRODUCT-CONTENT.md`, design, current Issue | Keep accepted direction separate from empirical validation |
| Detailed Product behavior / scope / failure / lifecycle / Settings / Feature Matrix | `docs/product/PRODUCT-CONTENT.md` | `PRODUCT.md`, design, Responsibility authority | Re-read when Product behavior changes |
| Product end-to-end consequence | `docs/product/GOLDEN-SCENARIO-BANK.md` | Responsibility oracles | Responsibility authority wins semantic-truth conflicts |
| Canonical UX/design behavior | `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` | `V1-UI-IMPLEMENTATION-CONTRACT.md`, Product authorities | Inspect rendered behavior when runtime UI matters |
| v1 implementation-facing UI contract | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | canonical design + Product Golden Scenarios | Issue #55 / PR #57 completed this contract; do not treat #55 as current task |
| Responsibility semantics/evals/persistence proof | `docs/product/responsibility/` | ADRs 0008/0009, executable evidence | Follow exact freeze/proof level; static review != executable proof |
| Conceptual Product engineering architecture | `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` | ADRs, implementation evidence | Reconcile when executable evidence exposes stale intent |
| Accepted technology choices | `docs/product/TECH-STACK.md` | official vendor/platform docs | Recheck volatile facts at activation |
| High-level implementation sequence | `docs/product/IMPLEMENTATION-PLAN.md` | `CURRENT.md`, Product scope | Living execution sequence only |
| Exact dependency / parallelization / schema writer / FK topology | `docs/product/IMPLEMENTATION-GRAPH.md` **after Issue #58 accepted merge** | live implementation Issues, Issue #58 dated evidence | While #58 is open, graph is candidate; always inspect live #58 state |
| Current task-specific contract | live GitHub Issue | owning canonical artifacts | Fetch live Issue before acting |
| Candidate/review/CI state | GitHub PR/review/checks | current Issue | `agent:review-ready` != PASS; exact-head evidence matters |
| Actual runtime behavior | code/schema/migrations/tests/deployed evidence | canonical intended behavior | Executable behavior establishes what happens; reconcile mismatch rather than silently choosing |
| Current checkpoint | `docs/continuity/CURRENT.md` | canonical sources + live GitHub | Mutable router loses to canonical/live evidence |
| Empirical Product Discovery | current Product Discovery Issue, currently #36 | Product authorities + protected/public evidence | Implementation progress cannot satisfy empirical claims |
| Durable rationale | applicable `docs/decisions/` ADR | current canonical docs/history | Record supersession when needed |
| Current external/provider facts | authoritative current external primary source | dated local evidence | Recheck when freshness materially affects activation/release |
| Reusable engineering baseline | upstream Blueprint + `BLUEPRINT-ADOPTION.md` | local docs | Local Lunowa Product/domain authority wins |

## Current routing checkpoint

- Issue #55 / PR #57: UI/UX implementation-readiness **complete**.
- Issue #58: current implementation-graph gate until full audit + exact-head CI + merge.
- After accepted #58 merge: `IMPLEMENTATION-GRAPH.md` owns exact execution topology; first runtime gate is G00 and V01 may run independently.
- Issues #13/#14/#15 remain the Responsibility L2 executable proof/freeze chain.
- Issue #36 remains open empirical Product Discovery, deferred in current execution order.

## Important authority boundaries

### Production FK topology

The current L2 candidate may reference production entities outside Responsibility-owned tables. `IMPLEMENTATION-GRAPH.md` must explicitly close every such target to a production owner/order. Proof-only fixtures never satisfy production topology.

### Parallel work

Worktree, Docker and database namespace isolation establish execution isolation, not merge isolation. When concurrent tasks touch shared root assets such as `package.json` / `pnpm-lock.yaml`, live graph/task contracts govern serialized merge and re-verification.

### AI/provider authority

A provider capability, database table, scheduled job or AI result does not by itself authorize Product behavior or accepted domain effects.

## Update lifecycle

Update this map only when authority routing, a durable source location or a freshness rule changes. Do not duplicate detailed Product/domain/DAG semantics here.

If a navigation artifact conflicts with owning canonical or live GitHub state, consult the owning source, surface unresolved conflicts, and repair the stale router in the same accepted workstream.
