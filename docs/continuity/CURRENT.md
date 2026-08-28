# Current Project Checkpoint

This is a compact mutable bootstrap/router, not Product/design/domain/architecture/research authority. Query owning canonical artifacts and live GitHub state when precision matters.

## Metadata

- Last reconciled: `2026-08-28`
- Highest-level Product: `docs/product/PRODUCT.md`
- Detailed Product + scope matrix: `docs/product/PRODUCT-CONTENT.md`
- Product acceptance: `docs/product/GOLDEN-SCENARIO-BANK.md`
- Product design: `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md`
- Implementation-facing UI: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`
- Responsibility semantics: `docs/product/responsibility/`
- Execution sequence: `docs/product/IMPLEMENTATION-PLAN.md`
- Current dependency graph candidate: `docs/product/IMPLEMENTATION-GRAPH.md`
- Current live critical-path task: GitHub Issue #58

## Product direction

Lunowa remains an email-centered **Attention Delegation / Open-loop Monitoring Offload** Product.

North Star:

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

v1 remains a **one-provider Minimum Complete Delegation Loop**, not broad provider/full-client parity.

Implementation milestones do not establish ICP, PMF, WTP, retention or real monitoring relinquishment.

## Completed specification work

- Product Content / Golden Scenarios: complete enough for current implementation hypothesis.
- Issue #55 / PR #57: UI/UX implementation-readiness COMPLETE after full audit + exact-head Verify/E2E Smoke.
- Main baseline after #57: `9869d7cdee2559b00d73203dec40d92bc90f537f`.
- UI implementation authority: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files.

Runtime remains bootstrap-level; frozen contracts are not implemented Product behavior.

## Current task — Issue #58

Issue #58 freezes:

- architecture activation boundaries;
- current vendor evidence;
- production FK/topological order;
- single-writer schema ownership;
- dependency DAG and safe parallel waves;
- full-loop acceptance mapping.

Candidate artifacts:

- `docs/product/IMPLEMENTATION-GRAPH.md`;
- reconciled `ARCHITECTURE.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`;
- `docs/product/research/issue-58-implementation-graph-evidence-2026-08-28.md`.

Do not launch broad production fanout until #58 passes full cumulative audit + exact-head CI and merges.

## Actual implementation state

Current production packages remain essentially bootstrap-only. Better Auth, production Drizzle/PostgreSQL persistence, Gmail integration, Trigger.dev and OpenAI runtime are not activated.

```text
accepted stack != installed capability != implemented Product
```

## Current dependency shape

```text
#58 merge
  |
  +-> G00 Next.js patched security baseline
  +-> V01 final visual-reference pass

After G00:
  P13 Responsibility PostgreSQL/Drizzle proof ----+
  P14 Better Auth UUID proof ---------------------+-> P15 L2 freeze
  G11 structural UI shell/read-model harness

P14 PASS -> G10 app auth/session
P13 PASS + G10 -> G19 provider-neutral Source persistence

G19 -> G20 Gmail OAuth/watch/history/sync -> G21 Source + exact search
  |
  +-> P15 PASS -> G30 Responsibility L3 -> G31 reducer -> G32 attention/Temporal

G11 + G21 + G31/G32 -> G40 Product surfaces
G31 + frozen Source contract -> G70 bounded AI lane
G20 + G40 -> G50 Draft + immediate Send request
G31 + G50 -> G51 provider Send reconciliation
G20/G21 + G32 + G40 + G51 -> G60 integrity/recovery

G21 + G31/G32 + G40 + G51 + G60 + G70 -> G80 complete-loop integration
G80 -> R90 public-beta release readiness
```

Exact edges/classes belong to `IMPLEMENTATION-GRAPH.md`.

## Persistence writer / FK order

```text
G10: User/session
  -> G19: ConnectedAccount / ProviderSyncState / Conversation / Message / Attachment
      -> G30: Responsibility after P15
          -> G32: Temporal intent/trigger persistence

G50: Draft + initial SendOperation request schema
G51: provider dispatch/reconciliation transitions
```

Production migrations may not reference proof-only fixture tables.

## Responsibility proof state

```text
L0 semantics                               FROZEN v0.1
L1 logical persistence                     FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate       v0.4 STATIC REVIEW COMPLETE
L2 executable proof                        PENDING
L2 final freeze                            BLOCKED
L3 Responsibility production runtime       NOT AUTHORIZED
```

- #13: PostgreSQL/Drizzle proof;
- #14: Better Auth UUID proof;
- #15: independent combined freeze;
- #16 execution-isolation harness: COMPLETE.

#13/#14 must execute from fresh post-#58/G00 base with isolated runtime namespaces and current exact stable dependencies.

## Security pre-wave

Current repo pins Next.js 16.3.0. Official Aug-25 2026 guidance moves the Active-LTS 16.3 baseline to 16.3.3 for two Critical fixes. G00 is the first runtime task after #58.

## Source / Gmail boundary

**G19** is the single writer for provider-neutral Source production persistence after G10 + P13 PASS.

**G20** consumes that schema and owns live Gmail OAuth/watch/history/sync behavior.

```text
Gmail watch/PubSub signal
-> authenticate + acknowledge quickly
-> durable reconciliation
-> history.list / full-sync recovery
-> normalized Source commit through G19
```

Push is not truth. Watch renewal, periodic safety reconciliation, duplicate/drop tolerance and stale-history 404/full-sync recovery are required.

Before a real Google token is durably persisted, store it securely/encrypted at rest, never log it, scope lookup to user + ConnectedAccount, and revoke/delete when no longer needed where supported. Plaintext durable token storage is not an accepted interim state.

Public OAuth verification/restricted-scope assessment remains R90 release work rather than a blanket local implementation blocker.

## Safe parallelism

After G19 + P15:

```text
provider lane:       G20 -> G21
Responsibility lane: G30 -> G31 -> G32
UI lane:             G11 + V01
```

G31 consumes frozen normalized Source fixtures and does not wait for live Gmail. G40 integrates real Source + real accepted domain projections.

## Search / AI coverage

Authorized **exact Source search is V1 CORE** and belongs to G21. Natural-language/semantic Q&A remains conditional.

G70 owns two distinct bounded model contracts:

1. Responsibility interpretation candidate;
2. contextual editable AI draft candidate.

AI never owns accepted state, sender/recipient authority, Send permission or provider actions. Manual Source/Reply remains usable under AI failure.

`store:false` is not synonymous with Zero Data Retention; production email AI requires current org/project data-control review.

## Send ownership

G50 owns minimal Draft + initial SendOperation request/pending schema for contextual immediate Send. G51 serially owns provider dispatch/reconciliation transitions.

```text
Send request != provider acceptance != operational closure
```

Forward, Send Later, generic Undo/recall and silent offline queued Send are not current gates.

## Current v1 exclusions

Not current critical-path prerequisites:

- Microsoft;
- broad multi-account Scope UX;
- Person/CRM;
- Pin;
- generic full Compose/Forward;
- Send Later / generic Undo;
- rich native attachment preview;
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## Visual sequencing

Final visual references remain deferred until #58 textual graph freezes. After #58 merge, V01 may run in parallel with backend proof and must complete before final pixel-sensitive fidelity. Textual authority wins over generated imagery.

## Empirical Product Discovery

Issue #36 remains open/deferred in execution order, not passed. Implementation cannot authorize claims about ICP, market pain, monitoring relinquishment, PMF, WTP, retention or differentiation against real workflows.

## Durable update rule

Update owning GitHub/docs in the same workstream when owner priority, accepted contract, dependency graph, blocker/unblocker, material external evidence or final review/merge disposition changes. Do not commit every tentative discussion turn.

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
- Issue #58 — current graph gate
- Issues #13/#14/#15 — L2 proof/freeze
- Issue #36 — open Product Discovery

If this router conflicts with canonical sources, merged implementation graph, executable evidence or live GitHub state, the authoritative/current source wins. Repair this router rather than treating stale checkpoint prose as authority.
