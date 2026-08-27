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
- Current live critical-path task: GitHub Issue #58.

## Product direction

Lunowa remains an email-centered **Attention Delegation / Open-loop Monitoring Offload** Product.

North Star:

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

v1 remains a **one-provider Minimum Complete Delegation Loop**, not broad provider/full-client parity.

Implementation milestones do not establish ICP, PMF, WTP, retention or real monitoring relinquishment.

## Completed specification work

### Product Content
Canonical Product content and Golden Scenarios are complete enough for the current implementation hypothesis.

### Issue #55 — COMPLETE
PR #57 merged after full cumulative audit + exact-head Verify/E2E Smoke.

Merge baseline:
`9869d7cdee2559b00d73203dec40d92bc90f537f`

Current UI implementation authority:
`docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design files.

Runtime is still bootstrap-level; frozen UI contract != implemented UI.

## Current task — Issue #58

Issue #58 freezes architecture activation boundaries, current vendor evidence, single-writer schema ownership, dependency DAG, safe parallel waves and full-loop acceptance.

Candidate artifacts:
- `docs/product/IMPLEMENTATION-GRAPH.md`;
- reconciled `ARCHITECTURE.md`, `CONTRACTS.md`, `TECH-STACK.md`, `IMPLEMENTATION-PLAN.md`;
- `docs/product/research/issue-58-implementation-graph-evidence-2026-08-28.md`.

Do not launch broad production fanout until #58 itself passes full cumulative audit + exact-head CI.

## Actual implementation state

Current production packages remain essentially bootstrap-only. Better Auth, production Drizzle/PostgreSQL persistence, Gmail integration, Trigger.dev and OpenAI runtime are not activated.

```text
accepted stack != installed capability != implemented Product
```

## Corrected dependency shape

```text
#58 merge
  |
  +-> G00 Next.js patched security baseline
  +-> V01 final visual-reference pass

After G00:
  P13 Responsibility PostgreSQL/Drizzle proof  ----+
  P14 Better Auth UUID proof ----------------------+-> P15 L2 freeze
  G11 structural UI shell/read-model harness

P14 PASS -> G10 app auth/session only
P13 PASS + G10 -> G20 Gmail + Source production persistence/sync -> G21 Source + exact search
P15 PASS -> G30 Responsibility L3 -> G31 deterministic reducer -> G32 attention/Temporal

G20/G21 provider lane || G31/G32 deterministic domain lane || G11/V01 UI lane
                         |
                         v
                       G40 Product surfaces
                         |
                       G50 Draft + contextual immediate Send request
                         |
                       G51 provider Send reconciliation
                         |
                       G60 integrity/recovery

G20 + G31 -> G70 bounded AI interpretation + contextual AI draft (parallel once contracts freeze)

G21 + G31/G32 + G40 + G51 + G60 + G70 -> G80 complete-loop integration
G80 -> R90 public-beta release readiness
```

Exact edges/classes belong to `IMPLEMENTATION-GRAPH.md`.

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
- #15: independent combined freeze.

#16 execution isolation harness is complete. #13/#14 must start from fresh post-#58/G00 base and isolated runtime namespaces.

## Security pre-wave

Current repo pins Next.js 16.3.0. Current Aug-25 2026 security guidance moves accepted Active-LTS 16.3 baseline to 16.3.3 for two Critical fixes.

G00 is the first runtime task after #58.

## Gmail/source boundary

G20 is single writer for ConnectedAccount / ProviderSyncState / Conversation / Message / Attachment production schema after P13 proves current upstream L2 prerequisites.

Current source pattern:

```text
Gmail watch/PubSub signal
-> authenticate + acknowledge quickly
-> durable reconciliation
-> history.list / full-sync recovery
-> normalized Source evidence
```

Push is not truth. Watch renewal, periodic safety reconciliation, duplicate/drop tolerance and 404/full-sync recovery are required.

Before a real Google refresh/access token is durably persisted, store it securely/encrypted at rest/application boundary, never log it, scope lookup to user + ConnectedAccount, and revoke/delete when no longer needed where supported. Plaintext durable token storage is not an accepted interim state.

Public OAuth verification/restricted-scope assessment remains an R90 release gate rather than a blanket local implementation blocker.

## Domain parallelism

G31 deterministic Responsibility work no longer waits for live Gmail. Once G30 exists, it consumes the frozen normalized evidence contract with deterministic fixtures while G20/G21 proceeds independently.

This is intentional safe parallelism; G40 is where real Source and real accepted domain projections integrate.

## Search / AI coverage

Authorized **exact Source search is V1 CORE** and belongs to G21. NL/semantic Q&A remains conditional.

G70 owns two separate bounded AI contracts:
1. Responsibility interpretation candidate;
2. contextual editable AI draft candidate.

AI never owns accepted state, recipients/sender authority, Send permission or provider actions. Manual Source/Reply remains available under AI failure.

`store:false` is not synonymous with Zero Data Retention; production AI use requires current org/project data-control review.

## Send ownership

G50 owns minimal Draft + initial SendOperation request/pending schema for contextual immediate Send.

G51 serially owns provider dispatch/reconciliation transitions.

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

New final visual references are intentionally deferred until #58 textual implementation graph freezes. After #58 merge, V01 may run in parallel with backend proof and should complete before final pixel-sensitive UI fidelity. Textual authority wins over generated imagery.

## Empirical Product Discovery

Issue #36 remains open/deferred in execution order, not passed.

Implementation cannot authorize claims about ICP, market pain, monitoring relinquishment, PMF, WTP, retention or differentiation against users' real current workflows.

## Durable update rule

Update owning GitHub/docs in the same workstream when owner priority, accepted contract, dependency graph, blocker/unblocker, material external evidence or final review/merge disposition changes. Do not commit every tentative conversation turn.

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