# Current Project Checkpoint

This is a compact mutable bootstrap/router, not Product/design/domain/architecture/research authority. Query owning canonical artifacts and live GitHub state when precision matters.

## Metadata

- Last reconciled: `2026-08-29`
- Current accepted `main`: `9f7209928578c8b84a09649ea8112b4c6c2a8c9f` or later accepted main
- Highest-level Product: `docs/product/PRODUCT.md`
- Detailed Product scope: `docs/product/PRODUCT-CONTENT.md`
- Product acceptance: `docs/product/GOLDEN-SCENARIO-BANK.md`
- UI implementation authority: `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` + canonical design trio
- Responsibility authority: `docs/product/responsibility/`
- High-level execution: `docs/product/IMPLEMENTATION-PLAN.md`
- Exact dependency/parallelization authority: `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub Issues
- Current live runtime gate: GitHub Issue #60 / `G00`

## Product direction

Lunowa remains an email-centered **Attention Delegation / Open-loop Monitoring Offload** Product.

> 必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。

v1 remains a one-provider **Minimum Complete Delegation Loop**, not broad provider/full-client parity.

Implementation does not establish ICP, PMF, WTP, retention or real monitoring relinquishment.

## Completed specification/design gates

- Product Content / Golden Scenarios: complete enough for the current implementation hypothesis.
- Issue #55 / PR #57: implementation-facing UI/UX contract **COMPLETE** after full cumulative audit + exact-head Verify/E2E.
- Issue #58 / PR #59: implementation graph / architecture activation topology **COMPLETE** after repeated full cumulative audit + exact-head CI.
- Issue #61 / PR #76: minimal canonical visual-reference freeze **COMPLETE**; five active references are canonical visual guidance and textual authority still wins.
- Current accepted main after PR #76: `9f7209928578c8b84a09649ea8112b4c6c2a8c9f`.
- Runtime remains bootstrap-level; frozen contracts != implemented Product.

## Current runtime gate — G00 / Issue #60

G00 is the first runtime `SERIAL_GATE` after the graph/visual freezes.

Current repo still pins:

```text
next                16.3.0
eslint-config-next  16.3.0
```

Execution-time evidence was rechecked on `2026-08-29`:

- Next.js official August 25, 2026 security release identifies `16.3.3` as the current Active LTS security baseline for the accepted 16.3 line;
- official `v16.3.3` fixes two Critical unauthenticated RCE advisories (`GHSA-p293-qw3h-jr36` and `GHSA-2xp9-vwfh-vxw4`);
- npm currently exposes `16.3.3` as the `latest` stable tag; 16.4 is pre-release/canary at this checkpoint.

Therefore G00 remains a narrow security patch to `16.3.3`, with directly coupled `eslint-config-next` / lock resolution only as required. No framework-major/minor migration or unrelated dependency sweep is justified by current evidence.

G00 acceptance remains:

```text
latest accepted main
-> narrow Next.js security patch
-> clean pnpm install --frozen-lockfile
-> pnpm verify
-> Playwright E2E smoke
-> exact-head GitHub CI
-> full cumulative acceptance audit
-> merge only on PASS
```

Do not launch the first write-heavy production fanout before G00 PASS/merge.

## First execution wave after G00

The first safe parallel execution wave is:

```text
P13 / Issue #13  Responsibility PostgreSQL/Drizzle executable proof
P14 / Issue #14  Better Auth UUID persistence proof
G11 / Issue #63  structural Product UI shell/read-model/accessibility harness
```

They may execute concurrently in isolated worktrees/runtime namespaces, but:

```text
parallel execution != parallel merge
```

`package.json` and `pnpm-lock.yaml` are serialized merge assets. Later concurrent PRs touching them refresh onto latest accepted main, regenerate the lockfile with pnpm, rerun repository verification, and rerun any proof materially affected by the changed dependency/version basis.

## Actual implementation state

Production capability is still mostly bootstrap-only. Better Auth production auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev runtime and OpenAI runtime are not activated.

```text
accepted stack != installed capability != configured integration != implemented Product
```

## Current dependency shape

```text
G00 security baseline
 |
 +-> P13 Drizzle/PostgreSQL proof ----+
 +-> P14 Better Auth UUID proof ------+-> P15 L2 independent freeze
 +-> G11 structural UI harness

P14 PASS -> G10 app User/session
P13 PASS + G10 -> G19 provider-neutral evidence foundation

G19 -> G20 Gmail -> G21 Source/exact search
  |
  +-> P15 PASS -> G30 production persistence -> G31 reducer -> G32 attention/Temporal

G11 + G21 + G31 + G32 -> G40 Product surfaces
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
