# Lunowa 現在地 — Human Checkpoint

> **目的:** 5分以内に「今どこまで実装され、何がまだ本物ではなく、次に何を確認すべきか」を復元するための人間向け入口。
>
> これは Product / Design / Responsibility / Architecture / Issue contract の authority ではありません。正確さが重要なときは、リンク先の canonical source と live GitHub state を確認してください。

## Checkpoint metadata

- Last reconciled: **2026-09-03**
- Last accepted **Product/runtime capability boundary** at reconcile: `6a71b79abdc22ea7bc68deafdc925d51b32a8a1b`（G11）
- Framework/security baseline: Next.js **16.3.3**（G00）
- Current `main` SHA: **live GitHubで確認**。このmutable document自身の更新で即staleになるため固定しない
- Live GitHub Issue / PR / CI checked: **yes**
- Mutable snapshot: current Issue / PR / CI stateは変わり得るため、action/review時はlive GitHubを再確認する

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

### Accepted capability baseline

- 最後にProduct/runtime capability boundaryを進めたaccepted change: **G11 / Issue #63 / PR #81**
- accepted merge: `6a71b79abdc22ea7bc68deafdc925d51b32a8a1b`
- G11で、structural Product shell、responsive layout、typed read-model/fixture axes、keyboard/focus/Japanese IME/accessibility harnessが`main`へ入りました。
- exact candidate CIは `Verify` / `E2E Smoke` ともPASSし、desktop/compactの実runtime visual auditもexact candidateに対して完了しました。
- framework/security baselineは引き続き **G00 / Next.js 16.3.3** です。
- 現在の`main` SHA自体はlive GitHubで確認します。docs-only change等までここへ逐次複製しません。

G11は**本物のGmail/DB/domain runtimeを接続したという意味ではありません**。Better Auth production auth、PostgreSQL/Drizzle production persistence、Gmail integration、Responsibility reducer/Temporal、Send、OpenAI runtimeはまだ未activateです。

### Capability status

`Specified` は仕様があること、`Structural` はfake/fixtureを含む構造実装、`Real` は本物のprovider/database/runtime接続、`Verified` はaccepted candidateで必要なacceptance evidenceが通ったことを表します。

| Capability | Specified | Structural | Real | Verified | 現在の意味 |
| --- | --- | --- | --- | --- | --- |
| UI Foundation / G11 | ✅ | ✅ | — | ✅ | structural shell・responsive・IME/accessibility harnessがaccepted mainに入った |
| App Auth / G10 | ✅ | ❌ | ❌ | ❌ | P14 #14のUUID proof待ち |
| Evidence Foundation / G19 | ✅ | ❌ | ❌ | ❌ | P13 #13 + G10待ち |
| Gmail Sync / G20 | ✅ | ❌ | ❌ | ❌ | real Gmail OAuth/watch/history未実装 |
| Source / Search / G21 | ✅ | 🟡 G11 shellのみ | ❌ | ❌ | structural Source surfaceはあるがreal Source/search未接続 |
| Responsibility Persistence / G30 | ✅ | ❌ | ❌ | ❌ | P15 freeze + G19待ち |
| Responsibility Reducer / G31 | ✅ | ❌ | ❌ | ❌ | deterministic accepted-state runtime未実装 |
| Attention / Temporal / G32 | ✅ | ❌ | ❌ | ❌ | durable reconsideration未実装 |
| Product Surfaces / G40 | ✅ | 🟡 G11 shellのみ | ❌ | ❌ | structural surfacesはあるがreal state未接続 |
| Draft / Send Request / G50 | ✅ | 🟡 structural stateのみ | ❌ | ❌ | provider effectを持たないfixture/harness段階 |
| Gmail Send / G51 | ✅ | ❌ | ❌ | ❌ | provider dispatch/reconciliation未実装 |
| Integrity / Recovery / G60 | ✅ | 🟡 structural stateのみ | ❌ | ❌ | degraded表示fixtureはあるがreal recovery未実装 |
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

**G11は完了しました。** 次の実装frontierは、G00後に並列可能だったL2 prerequisite proofです。

1. **P14 / Issue #14 — Better Auth UUID persistence proof**
   - G10 production auth/sessionを直接unblockするため、one-shot runnerでは先に実行する。
   - 2026-09-01のexecution-time再確認でも Better Auth 1.7.2 / PostgreSQL 18.6 / Drizzle ORM stable 0.45.2 の前提は維持。
2. **P13 / Issue #13 — Responsibility PostgreSQL/Drizzle executable proof**
   - P14後に続ける。
   - P13 + G10が揃うとG19 provider-neutral evidence foundationへ進める。
3. **P15 / Issue #15 — independent L2 freeze**
   - P13/P14両方のconcrete evidence後。

P13/P14は理論上parallel execution可能ですが、どちらも`package.json` / `pnpm-lock.yaml`を書き得るため**mergeはserial**です。現在のone-shot runnerでは、不要なbase refreshと再proofを減らすため **P14 → P13** の順で進めます。

---

## CHANGE — 前回のcheckpointから何が変わった？

直近の、実装理解にmaterialな差分だけを記録します。これは履歴台帳ではありません。

### Accepted

- **G11 / Issue #63 / PR #81** がfull acceptance audit PASSでsquash merge。
  - structural Home / Needs You / Managed / Review / Moment / Source shellを導入。
  - responsive stages、compact navigation/focus return、125/150/200% text scaling/reflow、Japanese IME `keyCode === 229` boundaryをbrowser oracle化。
  - monitoring posture / integrity、common mutation / Send lifecycle等のfixture/read-model軸を分離。
  - exact-head `Verify` + `E2E Smoke` PASS。
  - exact candidateを実行したdesktop/compact runtime visual auditも完了。
- **G00 / Issue #60 / PR #80** のNext.js 16.3.3 security baselineは継続してaccepted。
- 日本語第一のHuman Comprehension Layerは引き続きこの`CURRENT.md`を唯一のmutable human checkpointとして使う。
- **Issue #91 candidate** はCloudflare Workers向けのpreview deployment boundaryを追加した。これはProduct capabilityの昇格ではない。candidateのadapter evidenceとaccount-side activationは [`../deployment-preview.md`](../deployment-preview.md) にあり、hosted URLそのものはGitHub/Cloudflareのlive deployment metadataにのみ置く。

### Next

- P14 #14を先に実行し、PASS後にP13 #13へ進む。
- P13/P14の両証拠が揃った後、P15 #15でL2を独立freezeする。
- G10はP14 PASS後、G19はP13 PASS + G10後に進める。

### Still not real

この期間に以下が「本番接続済み」へ昇格したわけではありません。

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
│  ├─ G11  UI Foundation              ✓ accepted
│  └─ G40  Product Surfaces
│
├─ Prerequisite proofs
│  ├─ P14  Better Auth UUID proof     ← 次
│  ├─ P13  PostgreSQL/Drizzle proof   ← その次
│  └─ P15  L2 independent freeze
│
├─ Evidence / メールの事実
│  ├─ G19  Evidence Foundation
│  ├─ G20  Gmail Sync
│  └─ G21  Source + Exact Search
│
├─ Responsibility / 何が未完了か
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

現在のaccepted structural Product shellを触る最短経路:

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

G11はすでに`main`へ入っています。今後のP13/P14はproof harnessであり、Product画面の完成度が直接進むtaskではありません。

### Hosted preview

Initial hosting targetは **Cloudflare Workers** です。Issue #91 candidateは、Next.js applicationの外側に限定したCloudflare deployment boundaryと、supplied URLを検証するPlaywright smokeを用意しています。これはfixture-only shellをhostするためのvisibility infrastructureであり、Product/Provider/Auth/DBのauthorityや実capabilityを変えません。

Cloudflare account/Git integrationはこのworkspaceでは未activateです。activation手順は [`../deployment-preview.md`](../deployment-preview.md) を使います。activation後、accepted `main`を開く場所は **GitHubのlatest deployment status → View deployment** です。PR candidateもPR上の同じlive deployment statusから開き、mutable URLをこのcheckpointや他のdocsへ手で複製しません。

deployed runtime truthはsemantic/capability truthとは別です。GitHub deployment statusからコピーしたlive URLを`PLAYWRIGHT_BASE_URL`へ設定して`pnpm test:e2e:preview`を実行し、hosted URLが応答するかを確認します。capability statusは引き続きこの`CURRENT.md`とcanonical sourceで判断します。

---

## Human checkpoint update rule

このファイルは毎commit更新しません。次のどれかが起きたときだけreconcileします。

- accepted Product/runtime capability boundaryを進めた
- current implementation frontier / blocker / next gateがmaterialに変わった
- 人間向けMAPの大きな境界が変わった
- 実物を確認するRUN pathが変わった

更新時は必ず **canonical docs / live Issue / PR / CI / code/tests** を確認し、ここだけをauthorityにしません。

`CHANGE` は直近のmaterial差分だけを残し、古い履歴はGit/GitHubへ任せます。Issue/PR/CI backlogをこのファイルへ複製しません。
