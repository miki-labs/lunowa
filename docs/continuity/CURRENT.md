# Lunowa 現在地 — Human Checkpoint

> **目的:** 5分以内に「何がaccepted済みか、今どの層を作っているか、どこをlive確認すべきか」を復元するための人間向けcheckpoint。
>
> これは Product / Design / Responsibility / Architecture / Issue / ACP のauthorityではありません。正確さが重要なactionでは、owning canonical sourceとlive stateを確認してください。

## Checkpoint metadata

- Last reconciled: **2026-09-05**
- Current `main` SHA: **live GitHubで確認**。このmutable document自身の更新で即staleになるため固定しない
- Accepted Product/application base at this reconcile includes **G00 / G11 / G10 / G19 / G30**
- Current Issue / PR / CI / GitHub dependency / ACP host state: **必ずlive確認**

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
- **G30** — frozen Responsibility L2 production persistence + interpretation provenance foundation
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

現在のProduct frontierは **G20 Gmail provider** と **G31 deterministic Responsibility reducer** の2本です。

- G20: real Gmail authorization / watch / history reconciliation / attachment evidence
- G31: probabilistic candidateからtrusted accepted Responsibility stateへ入るdeterministic admission/reducer boundary

この2本のcurrent Issue / PR / exact head / CI / review dispositionは変動するため、このfileの番号やheadをexecution authorityにしません。**live GitHubを読むこと。**

G20がacceptedされるとG21 Source/Searchへ、G31がacceptedされるとG32 Attention/Temporalへ進むのがimplementation graph上の主経路です。正確なdependencyは `docs/product/IMPLEMENTATION-GRAPH.md` + live GitHub `blocked_by` がauthorityです。

## EXECUTION — ACPをどう扱う？

### Authority separation

```text
miki-labs/lunowa
  = Product/application/task-contract authority

miki-labs/agent-control-plane
  = execution/admission/concurrency/recovery/model-routing authority
```

ACPはLunowa Product semanticsを決めません。

### Stable execution invariants

- ACPはbounded parallel model executionをサポートし、hard maximumは2 active model executions。
- 実際のinstalled capacityとfree slotはlive host factであり、固定値としてこのfileへ保存しない。
- lane 2はdistinct execution identity + current unblocked dependency + explicit model authority + explicit parallel authority + free slotが必要。
- same Issue/execution identityを2 laneで実行しない。
- parallel execution != parallel merge。
- one GitHub-authorized admission => max one automatic model execution for that identity。
- scheduler restart/repetitionはretry authorityではない。
- unknown outcome / quarantineはfail closed。blind replay禁止。
- `agent:running` / `agent:ready` labelだけでは、実processの存在・free slot・retry safetyを証明しない。
- recovery判断が曖昧ならACP manifest / host process stateまで確認する。
- model routingはcurrent ACP authorityをlive-readする。

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
| ACP execution / recovery / model routing | current `miki-labs/agent-control-plane` + host evidence when needed |
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

provider / database / deployment / scheduler / security / Sendなどworker sandboxやmockで証明できないclaimは、task contractに従ってexact-head trusted CI / host / provider evidenceで閉じます。

## Fresh-session rule

新しいChatGPT/Codex sessionは、過去chatの状態を前提にせず次の順で復元します。

```text
AGENTS.md
-> continuity navigation/checkpoint
-> live Lunowa Issue / PR / CI / blocked_by
-> relevant canonical Product/domain docs
-> execution/recoveryが関係するならlive ACP authority
-> ambiguityがあるならmanifest/process evidence
```

**CURRENT.mdがstaleならlive/canonical sourceが常に優先です。**
