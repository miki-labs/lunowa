# Lunowa 現在地 — Human Checkpoint

> **目的:** 5分以内に「今どこまで実装され、何がまだ本物ではなく、次に何を確認すべきか」を復元するための人間向け入口。
>
> これは Product / Design / Responsibility / Architecture / Issue contract の authority ではありません。正確さが重要なときは、リンク先の canonical source と live GitHub state を確認してください。

## Checkpoint metadata

- Last reconciled: **2026-09-01**
- Accepted `main` at reconcile: `a6c07763bc05b20755d3e424364c2c5a3d2b9e7e`
- Live GitHub Issue / PR / CI checked: **yes**
- Mutable snapshot: current PR/CI stateは変わり得るため、action/review時はlive GitHubを再確認する

## 0. 読み方

このファイルは **NOW / CHANGE / MAP / RUN** の4つだけを扱います。

- **NOW** — 今、実際にどこまで出来ているか
- **CHANGE** — 前回の人間向けcheckpointから何が変わったか
- **MAP** — 実装の大きな構造と、詳細を読む場所
- **RUN** — 実物・tests・CIをどう確認するか

人間向け説明は **日本語第一**、コード・stable ID・API・技術用語は検索性を保つため **英語名を併記/維持**します。

---

## NOW — 今どこまで出来ている？

### Productの一言

Lunowaは、メール中心の **Attention Delegation / Open-loop Monitoring Offload** Productです。

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

現在のv1目標は、広いメールクライアント機能ではなく、**Gmail 1 providerで Minimum Complete Delegation Loop を一本完成させること**です。

### Current accepted `main`

- `main`: `a6c07763bc05b20755d3e424364c2c5a3d2b9e7e`
- 直近accepted change: **G00 / Issue #60 — Next.js security baseline 16.3.3**
- `main`上では、Better Auth production auth、PostgreSQL/Drizzle production persistence、Gmail integration、Trigger.dev runtime、OpenAI runtimeはまだ未activateです。

### Capability status

`Specified` は仕様があること、`Structural` はfake/fixtureを含む構造実装、`Real` は本物のprovider/database/runtime接続、`Verified` はcurrent exact candidateで必要なacceptance evidenceが通ったことを表します。

| Capability | Specified | Structural | Real | Verified | 現在の意味 |
| --- | --- | --- | --- | --- | --- |
| UI Foundation / G11 | ✅ | 🟡 PR #81 | — | ❌ | shell・responsive・IME/accessibility harnessを実装中。まだaccepted mainではない |
| App Auth / G10 | ✅ | ❌ | ❌ | ❌ | P14 #14のUUID proof待ち |
| Evidence Foundation / G19 | ✅ | ❌ | ❌ | ❌ | P13 #13 + G10待ち |
| Gmail Sync / G20 | ✅ | ❌ | ❌ | ❌ | real Gmail OAuth/watch/history未実装 |
| Source / Search / G21 | ✅ | ❌ | ❌ | ❌ | real Source/search未実装 |
| Responsibility Persistence / G30 | ✅ | ❌ | ❌ | ❌ | P15 freeze + G19待ち |
| Responsibility Reducer / G31 | ✅ | ❌ | ❌ | ❌ | deterministic accepted-state runtime未実装 |
| Attention / Temporal / G32 | ✅ | ❌ | ❌ | ❌ | durable reconsideration未実装 |
| Product Surfaces / G40 | ✅ | ❌ | ❌ | ❌ | real state接続前 |
| Draft / Send Request / G50 | ✅ | ❌ | ❌ | ❌ | contextual Draft/Send request未実装 |
| Gmail Send / G51 | ✅ | ❌ | ❌ | ❌ | provider dispatch/reconciliation未実装 |
| Integrity / Recovery / G60 | ✅ | ❌ | ❌ | ❌ | reconnect/degraded recovery未実装 |
| Bounded AI / G70 | ✅ | ❌ | ❌ | ❌ | model runtime未実装 |
| Complete Loop / G80 | ✅ | ❌ | ❌ | ❌ | vertical loop未完成 |

**重要:** `仕様がある` / `packageが入っている` / `fixtureが動く` / `本番capabilityがある` は別です。

```text
accepted contract
!= installed dependency
!= structural fixture
!= real integration
!= verified Product capability
```

### Current implementation frontier

今の最前線は **G11 / Issue #63 / PR #81** です。

PR #81 はACP correction後に HEAD `b2eb1d67667905e05087c9745d1850bd59d4d575` へ更新されました。

- `Verify`: **PASS**
- `E2E Smoke`: **FAIL**
- current browser blockers:
  1. `<720px` のresponsive oracleで grid column countが期待 `1` に対して `4`
  2. reflow testで compact navigation pathが考慮されず `会話を表示` button待ちでtimeout

したがって **G11はまだPASS/mergeしていません**。PR #81のcorrected candidateをaccepted capabilityとして扱わないでください。

---

## CHANGE — 前回のcheckpointから何が変わった？

前回のcontinuity checkpoint（2026-08-29）以降の、実装理解にmaterialな差分だけを記録します。これは履歴台帳ではありません。

### Accepted

- **G00 / Issue #60 / PR #80** がPASS/merge。
  - Next.js / `eslint-config-next` を accepted 16.3 lineのsecurity baseline **16.3.3** に更新。
  - current accepted `main` は `a6c07763...`。

### In progress

- **G11 / Issue #63 / PR #81** が最初のstructural Product UI candidateを作成。
- 最初のfull acceptance auditは7 material blockersでFAIL。
- ACPのbounded correction pathが実戦で動き、同じPR #81へ correction commit `b2eb1d676...` をpublish。
- correction後のCIでは `Verify` PASS、`E2E Smoke` FAIL。したがって再correction / fresh acceptanceが必要。

### Still not real

この期間に以下が「実装済み」へ昇格したわけではありません。

- production auth/session
- production PostgreSQL/Drizzle persistence
- real Gmail OAuth/sync
- real Responsibility reducer/Temporal monitoring
- real Send
- OpenAI runtime
- complete delegation loop

---

## MAP — 何がどこにある？

詳細DAGのauthorityは `docs/product/IMPLEMENTATION-GRAPH.md` です。ここでは人間が覚えるべき大きな地図だけを示します。

```text
Lunowa
│
├─ UI / 人間が見る面
│  ├─ G11  UI Foundation              ← 今ここ
│  └─ G40  Product Surfaces
│
├─ Evidence / メールの事実
│  ├─ G19  Evidence Foundation
│  ├─ G20  Gmail Sync
│  └─ G21  Source + Exact Search
│
├─ Responsibility / 何が未完了か
│  ├─ P13/P14/P15  L2 executable proof/freeze
│  ├─ G30  Persistence
│  ├─ G31  Deterministic Reducer
│  └─ G32  Attention / Temporal
│
├─ Effects / 外部へ作用する面
│  ├─ G50  Draft + Send Request
│  └─ G51  Gmail Send + Reconciliation
│
├─ Reliability
│  └─ G60  Integrity / Recovery
│
├─ AI
│  └─ G70  Bounded AI
│
└─ Integration
   └─ G80  Complete Delegation Loop
```

### 「何について知りたい？」→読む場所

| 知りたいこと | まず読む |
| --- | --- |
| Lunowaは何を作る？ | `docs/product/PRODUCT.md` |
| v1で何をする/しない？ | `docs/product/PRODUCT-CONTENT.md` |
| 最終的に何が出来ればPASS？ | `docs/product/GOLDEN-SCENARIO-BANK.md` |
| UI/UXはどう振る舞う？ | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` + design trio |
| Responsibilityの意味は？ | `docs/product/responsibility/` |
| 実装順・依存関係は？ | `docs/product/IMPLEMENTATION-GRAPH.md` + live Issues |
| 今のcandidate/CIは？ | live GitHub PR / reviews / checks |
| 実際のコードは何をしてる？ | code / tests / runtime evidence |

より完全なauthority routingは `docs/continuity/KNOWLEDGE-MAP.md` を使います。

---

## RUN — 実物をどう確認する？

### Local runtime

現在のProduct runtimeを触る最短経路:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

repository-wide verification:

```bash
pnpm verify
pnpm test:e2e
```

### PR / CI

実装中candidateを見るときは、**Issue contract → PR summary/diff → exact-head CI** の順で確認します。

現在は PR #81 がG11 candidateです。`main`ではなくPR candidateなので、UI Foundationをcurrent accepted Productと混同しないでください。

### Hosted preview

Initial hosting targetは **Cloudflare Workers** です。現時点ではhosting adapter/deploymentはaccepted runtime capabilityではなく、G11を理解するためだけに新しいpreview platformを追加しません。

Hosted previewが人間のProduct把握に継続的な価値を持つことが実測されたら、accepted hosting pathのactivation時に **PR/commitから直接開けるpreview** を追加します。今はlocal runtime + GitHub CI/browser evidenceを使います。

---

## Human checkpoint update rule

このファイルは毎commit更新しません。次のどれかが起きたときだけreconcileします。

- accepted `main` がProduct capability boundaryを進めた
- current implementation frontier / blocker / next gateがmaterialに変わった
- 人間向けMAPの大きな境界が変わった
- 実物を確認するRUN pathが変わった

更新時は必ず **canonical docs / live Issue / PR / CI / code/tests** を確認し、ここだけをauthorityにしません。

`CHANGE` は直近のmaterial差分だけを残し、古い履歴はGit/GitHubへ任せます。Issue/PR/CI backlogをこのファイルへ複製しません。
