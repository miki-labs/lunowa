# Lunowa 現在地 — Human Checkpoint

> **目的:** 5分以内に「何がaccepted済みか、今どの層を作っているか、どこをlive確認すべきか」を復元するための人間向けcheckpoint。
>
> これは Product / Design / Responsibility / Architecture / Issue のauthorityではありません。正確さが重要なactionでは、owning canonical sourceとlive stateを確認してください。

## Checkpoint metadata

- Last reconciled: **2026-09-06**
- Current `main` SHA: **live GitHubで確認**。このmutable document自身の更新で即staleになるため固定しない
- Accepted Product/application base at this reconcile includes **G00 / G11 / G10 / G19 / G20 / G30 / G31**
- Current Issue / PR / CI / GitHub dependency / worktree/runtime state: **必ずlive確認**

## NOW — 今どこまで出来ている？

### Productの一言

Lunowaは、メール中心の **Attention Delegation / Open-loop Monitoring Offload** Productです。

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

v1は広いメールクライアント機能を先に揃えるのではなく、Gmail 1 providerで一本のcomplete delegation loopを完成させます。

### Accepted capability boundary

現在accepted `main`には少なくとも次が入っています。

- **G00** — Next.js/runtime/security foundation
- **G11** — Product shell / responsive / accessibility / IME / fixture-read-model UI foundation
- **G10** — Better Auth + PostgreSQL app auth / UUID persistence proof
- **G19** — provider-neutral Source/evidence production persistence
- **G20** — Gmail authorization / watch / history reconciliation / attachment evidence
- **G30** — frozen Responsibility L2 production persistence + interpretation provenance foundation
- **G31** — deterministic Responsibility admission / reducer / accepted-state boundary
- Cloudflare preview foundation — developer visibility infrastructure。Product authorityではない

重要な区別:

```text
specified
!= structural fixture
!= accepted production persistence
!= real provider integration
!= verified complete Product loop
```

### Current implementation frontier

現在のProduct frontierは **G21 Source** と **G32 Attention / Temporal** の2本です。

- G21: real Source list/detail / authorized exact search / attachment evidence access
- G32: Needs You / Managed / Review等のattention projectionとdurable Temporal reconsideration

この2本のcurrent Issue / PR / exact head / CI / review dispositionは変動するため、このfileの番号やheadをexecution authorityにしません。**live GitHubを読むこと。**

G21とG32がacceptedされると、accepted済みのG11/G31と合わせてG40 Product surfacesのdependencyが満たされます。正確なdependencyは `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub `blocked_by` がauthorityです。

## EXECUTION — direct coding agent workflow

GitHub Issue / `blocked_by` がdurable task/dependency authorityであり、execution engineはreplaceableです。通常のnon-trivial implementationは次のpathを使います。

```text
live Issue contract + blocked_by
-> dedicated branch/worktree
-> direct coding agent + task-relevant tools/skills only
-> targeted + canonical verification
-> PR / CI
-> independent exact-head cumulative review
-> same PR/worktree correction on FAIL
-> merge only on PASS
-> materialなbase movement後にaffected candidatesを再検証
```

### Stable execution invariants

- one active implementationがone Issue/worktreeを所有する。同じIssue/worktreeへduplicate agentを同時実行しない。
- parallel implementationはdistinct unblocked Issues + isolated worktrees + isolated runtime stateがある場合だけ。parallel implementation != parallel merge。
- local files/search/CLIなどdeterministicで安価なevidenceを優先し、MCP/plugin/network/specialist skillはtaskにmaterialなものだけ選ぶ。
- mutable external factがsolutionまたはacceptance evidenceを変え得る時だけlive queryする。
- privileged/destructive external writeにはseparate explicit authorityが必要で、ordinary coding agentのambient capabilityにしない。
- automatic retry/replayやreplacement orchestratorをdefault workflowへ追加しない。必要性が実測された時だけsmallest mechanismを別contractで判断する。
- mechanical invariantはpracticalな範囲でtests/CI/scripts/schema/typeへ置き、proseはjudgment/rationaleを所有する。

## REVIEW — 受入の基本

Independent reviewは、latest patchだけでなく

```text
current task contract
× entire final cumulative exact-head candidate
```

を監査します。

- green CIはevidenceであってautomatic PASSではない。
- FAIL時はmaterial blockers/correctionsを一括記録する。
- one-bug-at-a-time correction loopを避ける。
- repeated correction failureではspecification / oracle / architecture / task decomposition / verification gapを分析してから次patchへ進む。
- exact-head PASS後だけmergeし、先行merge後は残りcandidateのbase/dependency/evidenceを再確認する。

## MAP — 何をどこで読む？

| 知りたいこと | Authority |
| --- | --- |
| Lunowaは何を作る？ | `docs/product/PRODUCT.md` |
| v1 behavior / scope | `docs/product/PRODUCT-CONTENT.md` |
| end-to-end acceptance | `docs/product/GOLDEN-SCENARIO-BANK.md` |
| Responsibility semantics | `docs/product/responsibility/` |
| architecture / data / contracts | `docs/product/ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` |
| exact implementation DAG / parallelization / writer topology | `docs/product/IMPLEMENTATION-GRAPH.md` + live Issues / `blocked_by` |
| current task / candidate / CI | live GitHub Issue / PR / reviews / checks |
| implementation / verification / review workflow | `docs/implementation-workflow.md`, `docs/coding-agent-harness.md`, repository-local `execute-task` / `evaluate-change` skills |
| current execution ownership / state | explicit task owner/launch authority + actual branch/worktree/runtime evidence |
| 実際のbehavior | code / schema / migrations / tests / deployed evidence |

詳細routingは `KNOWLEDGE-MAP.md` を見ます。

## RUN — 実物をどう確認する？

```bash
pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

必要に応じて:

```bash
pnpm test
pnpm test:e2e
pnpm build
```

provider / database / deployment / scheduler / security / Sendなどlocal checksやmockで証明できないclaimは、task contractに従ってexact-head trusted CI / host / provider evidenceで閉じます。

## Fresh-session rule

新しいChatGPT/Codex sessionは、過去chatの状態を前提にせず次の順で復元します。

```text
AGENTS.md
-> continuity navigation/checkpoint
-> live Lunowa Issue / PR / CI / blocked_by
-> relevant canonical Product/domain docs
-> dedicated branch/worktreeのowner・base・status
-> task-relevant skill/toolとcode/tests/runtime evidence
```

**CURRENT.mdがstaleならlive/canonical sourceが常に優先です。**
