# Lunowa 現在地 — Human Checkpoint

> **目的:** 5分以内に「今どこまで実装され、何がまだ本物ではなく、次に何を確認すべきか」を復元するための人間向け入口。
>
> これは Product / Design / Responsibility / Architecture / Issue contract の authority ではありません。正確さが重要なときは、リンク先の canonical source と live GitHub state を確認してください。

## Checkpoint metadata

- Last reconciled: **2026-09-03**
- Last accepted **Product/runtime capability boundary**: `6a71b79abdc22ea7bc68deafdc925d51b32a8a1b`（G11）
- Latest accepted **preview/developer-visibility boundary** at reconcile: Issue #91 / PR #92, merge `5e390371c7ad8f5fe829b627051a169c8ee25e99`
- Framework/security baseline: Next.js **16.3.3**（G00）
- Current `main` SHA: **live GitHubで確認**。このmutable document自身の更新で即staleになるため固定しない
- ACP code basis checked at reconcile: `dfb207b75c71617f13e903a01a2219213b468cff`（Luna-first / Sol-only critical escalation / one-shot admission）
- Live GitHub Issue / PR / CI checked: **yes**
- Mutable snapshot: current Issue / PR / CI / ACP host deployment stateは変わり得るため、action/review時はlive stateを再確認する

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
- **Issue #91 / PR #92** はCloudflare Workers向けpreview/deployment foundationをaccepted `main`へ追加しました。これはdeveloper visibility infrastructureであり、Product capabilityの昇格ではありません。
- Cloudflare account-side activationも外部で完了し、fixture-only accepted shellをhosted previewで確認できる状態です。preview URLそのものはGitHub/Cloudflareのlive deployment metadataをauthorityとし、このmutable checkpointへ固定コピーしません。
- 現在の`main` SHA自体はlive GitHubで確認します。docs/control-plane changeまでここへ逐次複製しません。

G11/preview foundationは**本物のGmail/DB/domain runtimeを接続したという意味ではありません**。Better Auth production auth、PostgreSQL/Drizzle production persistence、Gmail integration、Responsibility reducer/Temporal、Send、OpenAI runtimeはまだ未activateです。

### Capability status

`Specified` は仕様があること、`Structural` はfake/fixtureを含む構造実装、`Real` は本物のprovider/database/runtime接続、`Verified` はaccepted candidateで必要なacceptance evidenceが通ったことを表します。

| Capability | Specified | Structural | Real | Verified | 現在の意味 |
| --- | --- | --- | --- | --- | --- |
| UI Foundation / G11 | ✅ | ✅ | — | ✅ | structural shell・responsive・IME/accessibility harnessがaccepted mainに入った |
| Preview / Human Preview Layer | ✅ | ✅ | ✅ hosted main fixture + PR/branch deployment | ✅ main hosted smoke + PR preview deployment | accepted mainのhosted preview smokeは実証済み。PR #97ではCloudflareのCommit Preview URL / Branch Preview URL deploymentも実際にexercise済み。PR preview URLに対するPlaywright `test:e2e:preview` smokeまでは未実施であり、そこは未証明として扱う。Product capability authorityではない |
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

**重要:** `仕様がある` / `packageが入っている` / `fixtureが動く` / `hosted previewがある` / `本番capabilityがある` は別です。

```text
accepted contract
!= installed dependency
!= structural fixture
!= hosted preview
!= real integration
!= verified Product capability
```

### Current implementation frontier

**G00 / G11 / preview foundationは完了しています。** 次の実装frontierはL2 prerequisite proofです。

1. **P14 / Issue #14 — Better Auth UUID persistence proof**
   - 2026-09-03にcurrent ACP向けtask contractをfresh化済み。
   - stale failed PR #86は再利用しない。次はcurrent accepted `main`から`model-fresh`。
   - trusted `P14 Auth UUID Proof` + `P14 Trusted Evidence Packaging` workflowはaccepted `main`に存在。
   - current pre-admission vendor basisは Better Auth/CLI 1.7.2、Drizzle ORM 0.45.2、Kit 0.31.10、pg 8.23.0、PostgreSQL 18.6。
2. **P13 / Issue #13 — Responsibility PostgreSQL/Drizzle executable proof**
   - 2026-09-03にcurrent ACP workerとreal-PostgreSQL evidenceの境界をfresh化済み。
   - P14後に実行し、root dependency/lock refreshを減らす。
3. **P15 / Issue #15 — independent L2 freeze**
   - P13/P14両方のfinal concrete evidence後。
   - builder/model self-approval taskではなく、独立full acceptance audit gate。

### ACP compatibility gate

Issue #95で、pre-created implementation DAG × current ACP code/one-shot contractのfull compatibility auditをdurable化しました。

現在の重要ルール:

- pre-created Issueは**planning inventory**であり、そのまま実行権限ではない;
- fresh model taskは `agent:action:model-fresh` + `agent:ready` が必要;
- current ACPはIssue本文のprose prerequisiteではなくGitHub native `blocked_by`をmachine dependencyとして読む;
- downstream #15/#62/#64–#75のprose dependenciesは設計上妥当だが、2026-09-03監査時点ではmachine `blocked_by`が未materializeだったため、ready化前に修正が必要;
- ACP workerはgeneral web/GitHub/provider/private-registry accessを持たない。public-pnpm network exceptionはnpm registryに限定され、qualified trust boundaryでは任意のcontroller/host-local/private destinationへ到達できないことを要求する。`allow_local_binding = false`を「local listener作成が必ず不可能」という意味には使わない;
- volatile vendor researchはready化前にtrusted planner/reviewerがrefreshしてIssueへbindする;
- real DB/browser/Gmail/provider/deployment等は、必要に応じてpublication後のexact-head trusted CI/host/provider evidenceで閉じる;
- current model routingは Luna-first、security/high-impact external-effectだけSol critical escalation。

**Issue #95のcontrol-plane reconciliationが完了するまでP14へ`agent:ready`を付けない。**

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
- **Issue #91 / PR #92** のpreview foundationがaccepted mainへmerge。外部Cloudflare account-side activationも完了し、fixture-only shellのhosted smokeを実行可能。
- ACP #83のreal-host restart qualificationはPASSし、ACP `main`にはLuna-first routingとvolatile-cache recovery修正版がmerge済み。**現在のWindows Task Schedulerが実際にEnabled/Disabledのどちらかはmutable host stateなので、GitHubだけから再有効化済みとは断定しない。**
- **Issue #95** でpre-created implementation Issuesとcurrent ACP one-shot admissionのcompatibility auditを開始し、P13/P14 task contractをcurrent execution modelへreconcile。
- P13/P14に`agent:model:complex`、downstream taskにも現行Luna/Sol基準のmodel classを付与。model labelはexecution authorityではない。

### Next

- #95のmachine dependency / router reconciliationを完了する。
- その後P14 #14だけをfresh `model-fresh`としてready化する。
- P14 PASS/merge後、P13 #13をcurrent mainへrefreshしてready化する。
- P13/P14両証拠が揃った後、P15 #15でL2を独立freezeする。
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
│  ├─ P14  Better Auth UUID proof     ← #95完了後の次task
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
| 実装順・依存関係は？ | `docs/product/IMPLEMENTATION-GRAPH.md` + live Issues + GitHub `blocked_by` |
| ACPで今実行可能？ | current Issue labels/blocked_by + Issue #95 activation rules |
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

実装中candidateを見るときは、**Issue contract → PR summary/diff → exact-head CI/external evidence → independent full audit** の順で確認します。

G11はすでに`main`へ入っています。今後のP13/P14はproof harnessであり、Product画面の完成度が直接進むtaskではありません。

ACP builderが実行できないreal DB/provider/browser claimは、Issueが要求するexact-head GitHub Actions / trusted host / provider evidenceで確認します。builderがローカルで実行できなかったこととacceptance requirementを削除することは同義ではありません。

### Hosted preview

Initial hosting targetは **Cloudflare Workers** です。Issue #91 / PR #92で、Next.js applicationの外側に限定したCloudflare deployment boundaryと、supplied URLを検証するPlaywright smokeがaccepted mainへ入りました。これはfixture-only shellをhostするためのvisibility infrastructureであり、Product/Provider/Auth/DBのauthorityや実capabilityを変えません。

Cloudflare account/Git integrationは外部でactivate済みです。accepted `main`はCloudflareの`lunowa-preview` Workerのactive deployment / workers.dev URLから確認できます。PR #97ではCloudflareがCommit Preview URL / Branch Preview URLのdeployment成功を投稿しており、PR/branch preview deployment pathは直接exercise済みです。ただし、そのPR preview URLを`PLAYWRIGHT_BASE_URL`へ指定した`pnpm test:e2e:preview`の実行証拠はまだないため、PR-preview-specific smoke PASSとは記録しません。mutable URLをこのcheckpointや複数docsへ手で複製しません。

deployed runtime truthはsemantic/capability truthとは別です。Cloudflare/GitHubのlive deployment metadataから得たURLを`PLAYWRIGHT_BASE_URL`へ設定して`pnpm test:e2e:preview`を実行し、hosted URLが応答するかを確認します。capability statusは引き続きこの`CURRENT.md`とcanonical sourceで判断します。

---

## Human checkpoint update rule

このファイルは毎commit更新しません。次のどれかが起きたときだけreconcileします。

- accepted Product/runtime capability boundaryを進めた
- current implementation frontier / blocker / next gateがmaterialに変わった
- 人間向けMAPの大きな境界が変わった
- 実物を確認するRUN pathが変わった

更新時は必ず **canonical docs / live Issue / PR / CI / code/tests** を確認し、ここだけをauthorityにしません。

`CHANGE` は直近のmaterial差分だけを残し、古い履歴はGit/GitHubへ任せます。Issue/PR/CI backlogをこのファイルへ複製しません。