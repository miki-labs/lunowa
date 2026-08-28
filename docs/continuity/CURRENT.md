# Current Project Checkpoint

This is a compact mutable bootstrap/router, not Product/design/domain/architecture/research authority. Query owning canonical artifacts and live GitHub state when precision matters.

## Metadata

- Last reconciled: `2026-08-28`
- Highest-level Product: `docs/product/PRODUCT.md`
- Detailed Product scope: `docs/product/PRODUCT-CONTENT.md`
- Product acceptance: `docs/product/GOLDEN-SCENARIO-BANK.md`
- UI implementation authority: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design trio
- Responsibility authority: `docs/product/responsibility/`
- High-level execution: `docs/product/IMPLEMENTATION-PLAN.md`
- Exact graph candidate: `docs/product/IMPLEMENTATION-GRAPH.md`
- Current live gate until merge: GitHub Issue #58

## Product direction

Lunowa remains an email-centered **Attention Delegation / Open-loop Monitoring Offload** Product.

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

v1 remains a one-provider **Minimum Complete Delegation Loop**, not broad provider/full-client parity.

Implementation does not establish ICP, PMF, WTP, retention or real monitoring relinquishment.

## Completed specification work

- Product Content / Golden Scenarios: complete enough for current implementation hypothesis.
- Issue #55 / PR #57: implementation-facing UI/UX contract **COMPLETE** after full cumulative audit + exact-head Verify/E2E.
- Main baseline after PR #57: `9869d7cdee2559b00d73203dec40d92bc90f537f`.
- Runtime remains bootstrap-level; frozen contracts != implemented Product.

## Current gate — Issue #58

Issue #58 freezes:

- implementation-state reconstruction;
- current volatile vendor evidence;
- architecture activation boundaries;
- exhaustive production FK topology;
- single-writer collision zones;
- parallel execution vs serialized merge rules;
- implementation DAG;
- Product/Responsibility/UI/provider acceptance mapping.

Do not launch broad production fanout until #58 passes full cumulative audit + exact-head CI and merges.

If live GitHub shows #58 already merged/closed, this checkpoint's transition is:

```text
next runtime gate = G00 patched framework security baseline
parallel-safe visual lane = V01 final visual-reference pass
exact downstream order = IMPLEMENTATION-GRAPH.md + live Issues
```

## Actual implementation state

Production capability is still mostly bootstrap-only. Better Auth production auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev runtime and OpenAI runtime are not activated.

```text
accepted stack != installed capability != configured integration != implemented Product
```

Current repo still pins Next.js 16.3.0; official Aug-25 2026 security guidance moves the accepted Active-LTS 16.3 baseline to 16.3.3. G00 owns that update after #58.

## Corrected dependency shape

```text
#58 merge
  |
  +-> G00 security baseline
  +-> V01 visual-reference pass

After G00:
  P13 Drizzle/PostgreSQL proof ----+
  P14 Better Auth UUID proof ------+-> P15 L2 independent freeze
  G11 structural UI harness

P14 PASS -> G10 app User/session
P13 PASS + G10 -> G19 provider-neutral evidence foundation

G19 -> G20 Gmail -> G21 Source/exact search
  |
  +-> P15 PASS -> G30 production persistence -> G31 reducer -> G32 attention/Temporal

G11 + G21 + G31/G32 -> G40 Product surfaces
G31 + frozen evidence contract -> G70 bounded AI
G20 + G40 -> G50 contextual Draft/immediate Send request
G31 + G50 -> G51 provider Send reconciliation
G20/G21 + G32 + G40 + G51 -> G60 integrity/recovery

G21 + G31/G32 + G40 + G51 + G60 + G70 -> G80 complete loop
G80 -> R90 public-beta readiness
```

## Exhaustive production FK closure

Current Responsibility L2 v0.4 requires production targets for:

```text
User
connected_accounts
conversations
participant_identities
messages
ai_interpretation_runs
```

Ownership/order:

- G10: User/session;
- G19: ConnectedAccount, Conversation, Message, ParticipantIdentity, ProviderSyncState, Attachment metadata and evidence revision;
- G30 prelude: minimal AIInterpretationRun prerequisite before Responsibility tables;
- G30 after P15: frozen Responsibility-owned tables.

Creating ParticipantIdentity does not activate CRM/Person Product scope. Creating AIInterpretationRun does not activate model execution; G70 owns AI runtime.

Proof fixture != production FK target.

## Parallelism correction

P13/P14/G11 can execute concurrently after G00 in isolated worktrees/runtime namespaces, but:

```text
parallel execution != parallel merge
```

`package.json` and `pnpm-lock.yaml` are serialized merge assets. Later concurrent PRs touching them refresh onto latest accepted main, regenerate the lockfile with pnpm, rerun repository verification, and rerun materially dependency-sensitive proof.

## Responsibility proof state

```text
L0 semantics                          FROZEN v0.1
L1 logical persistence                FROZEN v0.1
L2 exact PostgreSQL/Drizzle candidate v0.4 STATIC REVIEW COMPLETE
L2 executable proof                   PENDING (#13/#14)
L2 final freeze                       BLOCKED (#15)
L3 production Responsibility runtime  NOT AUTHORIZED
```

## Provider / security boundary

G20 consumes G19 persistence for live Gmail OAuth/watch/history/sync.

```text
watch/PubSub signal
-> authenticated quick acknowledgement
-> durable reconciliation
-> history.list / full-sync recovery
-> normalized Source commit
```

Push is not truth. Stale `historyId`/404 requires full sync. Before first durable real Google token persistence, store encrypted at rest, keep key material separate, never log it, scope use by user+ConnectedAccount, and revoke/delete when intentionally no longer needed where supported.

Public OAuth verification/restricted-scope assessment remains R90 release work where required.

## AI / search / send boundaries

- exact authorized Source search = V1 CORE, G21;
- attachment evidence access = V1 CORE, G20/G21;
- G70 owns separate bounded Responsibility-interpretation and contextual-draft schemas/evals;
- AI never owns accepted state, sender/recipient authority, Send permission or provider actions;
- `store:false` != proof of Zero Data Retention;
- G50 owns Draft + initial immediate SendOperation request;
- G51 owns dispatch/reconciliation;
- Send request != provider acceptance != operational closure.

## Current exclusions

Not current critical-path prerequisites:

- Microsoft;
- broad multi-account Scope UX;
- Person/CRM Product features;
- Pin;
- generic fresh Compose/Forward;
- Send Later/generic Undo;
- rich native attachment preview;
- natural-language Search;
- autonomous Send;
- generic workflow/rule engine.

## Empirical Product Discovery

Issue #36 remains open/deferred in execution order, not passed. Implementation cannot authorize claims about ICP, market pain, monitoring relinquishment, PMF, WTP, retention or differentiation against real workflows.

## Durable update rule

Update owning GitHub/docs in the same workstream when owner priority, accepted contract, dependency graph, blocker/unblocker, material external evidence, authority routing or final review/merge disposition changes. Do not record every tentative discussion turn.

If this router conflicts with canonical sources, executable evidence or live GitHub state, the authoritative/current source wins and this router should be repaired.
