# ADR 0010 — Responsibility L2 Exact PostgreSQL/Drizzle Schema Is Frozen at DDL v0.4

## Status

Accepted — 2026-09-04

## Context

ADR 0008 fixed the semantic requirement that Responsibility state is orthogonal rather than one lifecycle enum. ADR 0009 then froze the hybrid L1 logical persistence boundary while deliberately leaving exact PostgreSQL/Drizzle representation to executable proof.

The independent Issue #15 audit reviewed the complete cumulative candidates and evidence from Issues #13 and #14. It found one material exact-DDL blocker: seven canonical mixed-order timestamp indexes had lost their timestamp `DESC` directions. Issue #102 / PR #103 corrected those directions and strengthened the deterministic index oracle without reopening L0 or L1 semantics.

## Decision

Responsibility exact PostgreSQL/Drizzle schema **passes and is frozen at DDL v0.4**.

The freeze levels are:

```text
L0 semantic model                         FROZEN v0.1 baseline
L1 logical persistence boundary           FROZEN v0.1 baseline
L2 exact PostgreSQL/Drizzle schema        FROZEN — DDL v0.4
L3 migrations/runtime                     NOT AUTHORIZED by this freeze
```

The exact table/column/FK/check/unique/index/partial-index/typed-details representation in [`POSTGRESQL-DRIZZLE-DDL-DESIGN.md`](../product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md) is the versioned physical-schema authority for the Responsibility v0.1 implementation basis. This is an L2 physical-schema decision only; it does not activate production migrations, the Responsibility reducer, runtime behavior, AI calls, or any other L3 implementation.

## Accepted evidence chain

- [Issue #13](https://github.com/miki-labs/lunowa/issues/13) / [PR #100](https://github.com/miki-labs/lunowa/pull/100) final accepted head `b8ec0e28780e1439eb1152dc80db8933f16969f0`, merge commit `c91ae14882f4be63fde726d0b7c5f723fb623aa4`: real PostgreSQL 18.6 P13 proof; acceptance IDs 01–46 and 50–60 are 57/57 PASS. This includes Responsibility-owned exact Drizzle/generated-SQL proof, external-FK prerequisite fixtures, and concurrency, idempotency, privacy, and tenant evidence.
- [Issue #14](https://github.com/miki-labs/lunowa/issues/14) / [PR #99](https://github.com/miki-labs/lunowa/pull/99) final accepted head `5e96f4334b07a7274d03f93a237eb813c35b58a8`, merge commit `a0fbf2619fa00fac28a141392983a9dd32e59f1a`: Better Auth 1.7.2 UUID/PostgreSQL proof; acceptance IDs 47–49 are 3/3 PASS.
- [Issue #102](https://github.com/miki-labs/lunowa/issues/102) / [PR #103](https://github.com/miki-labs/lunowa/pull/103) final accepted head `4ae650199fb66d9d309a67fcfc7185ec1ca9bff8`, merge commit `a589179a04f9b2020e9063e2be238b81844ca102`: corrected all seven canonical mixed-order `DESC` indexes and strengthened the deterministic oracle to verify all 27 canonical Responsibility indexes for target table, uniqueness, ordered key expressions/directions, and predicates. Exact-head `P13 Responsibility L2 PostgreSQL Proof` run `33852869699` passed on real PostgreSQL 18.6, with ordinary CI passing.
- [Issue #15](https://github.com/miki-labs/lunowa/issues/15) supplied the independent full acceptance audit: it reviewed the #13 + #14 cumulative candidates/evidence, identified the seven lost `DESC` directions as the material blocker, and accepted #102/#103 as resolving it.
- [Issue #104](https://github.com/miki-labs/lunowa/issues/104) records this durable L2 PASS/FREEZE decision.

Pinned evidence versions:

```text
PostgreSQL 18.6 (server_version_num=180006)
Better Auth 1.7.2
auth CLI 1.7.2
drizzle-orm 0.45.2
drizzle-kit 0.31.10
pg 8.23.0
```

## Exact-schema reconciliations preserved by the freeze

### Mixed-order index directions

DDL v0.4 remains canonical with timestamp keys `DESC` for all seven mixed-order timestamp indexes. PR #103 brought generated Drizzle SQL into alignment. Drizzle 0.45.2 emits `DESC NULLS LAST` for `.desc()`. Under the accepted constraints this does not change the frozen semantics: six timestamp keys are `NOT NULL`, and `responsibilities_live_done_user_idx` is partial on `resolution_status='RESOLVED'`, whose consistency constraint requires `resolved_at IS NOT NULL`.

### Optional AI-run links

Optional `AIInterpretationRun` composite tenant links use the already-reviewed fallback of `ON DELETE NO ACTION` plus explicit retention/privacy cleanup. The pinned Drizzle representation does not cleanly emit PostgreSQL column-list `SET NULL` without risking nulling `user_id`. This is an accepted v0.4 implementation reconciliation, not a new semantic decision.

### Proof-fixture boundary

`p13_fixture_*` tables and the P14 proof-only domain table are evidence scaffolding only. They are not production migration targets and must never be treated as production FK topology. Later implementation tasks must supply production ownership/prerequisite tables and satisfy the proven external-FK/index contracts before creating dependent production tables.

## Consequences

- DDL v0.4 is the exact physical-schema authority; changes require an explicit superseding decision and the appropriate re-proof.
- The earlier L1 freeze remains unchanged. This ADR does not reopen ADR 0008 or ADR 0009 and adds no table, column, state, or semantic behavior.
- L2 PASS/FREEZE does not authorize production migrations or runtime activation. L3 remains blocked until a separate explicitly authorized implementation task exists.
- Proof-only fixtures remain bounded evidence infrastructure, not a shortcut around production ownership/order.
- The intentional `NO ACTION` plus explicit cleanup fallback must preserve tenant ownership and privacy behavior; pruning an AI run must never null `user_id` as an incidental effect.

## Verification and related authority

The executable acceptance contract and versioned DDL are maintained in:

- [`L2-EXECUTABLE-PROOF-GATE.md`](../product/responsibility/L2-EXECUTABLE-PROOF-GATE.md)
- [`PHYSICAL-SCHEMA-FREEZE-REVIEW.md`](../product/responsibility/PHYSICAL-SCHEMA-FREEZE-REVIEW.md)
- [`POSTGRESQL-DRIZZLE-DDL-DESIGN.md`](../product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md)

The independent audit is the acceptance authority for this decision. A later exact-DDL defect, production-topology contradiction, or stronger evidence may supersede DDL v0.4 only through a new versioned decision; it does not implicitly authorize L3.
