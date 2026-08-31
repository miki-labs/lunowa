# Knowledge Map — 何をどこで確認するか

このmapは **質問を正しいauthorityへrouteするためのnavigation** です。ここにProduct/domain/implementation truthを複製しません。

## Question → Authority

| 知りたいこと | Primary authority | Secondary / context | Freshness rule |
| --- | --- | --- | --- |
| Lunowaは何を解決するProductか / v1 direction / hypothesis | `docs/product/PRODUCT.md` | `PRODUCT-CONTENT.md`, current Product Issue | hypothesisとempirical validationを混同しない |
| v1の詳細behavior / scope / failure / Feature Matrix | `docs/product/PRODUCT-CONTENT.md` | `PRODUCT.md`, design, Responsibility | Product behavior変更時に再読 |
| end-to-endで何が成立すればよいか | `docs/product/GOLDEN-SCENARIO-BANK.md` | Responsibility oracles | semantic truth conflictではResponsibility authorityを確認 |
| UI/UXのcanonical behavior | `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` | `V1-UI-IMPLEMENTATION-CONTRACT.md` | runtime UIはrendered/browser evidenceも確認 |
| v1 UI implementation contract | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | design trio + Golden Scenarios | #55/#57は完了済み。current taskとして扱わない |
| visual direction | `docs/design/references/README.md` + five active references | textual Product/UI authority | imageはtextual semanticsをoverrideしない |
| Responsibility semantics / eval / persistence proof | `docs/product/responsibility/` | ADR 0008/0009, executable evidence | static review != executable proof |
| architecture / data / module contract | `ARCHITECTURE.md`, `DATA-MODEL.md`, `CONTRACTS.md` | ADRs, implementation evidence | executable evidenceでstale intentが判明したらreconcile |
| accepted technology / hosting choice | `docs/product/TECH-STACK.md` | official vendor docs | volatile factsはactivation時に再確認 |
| high-level implementation sequence | `docs/product/IMPLEMENTATION-PLAN.md` | `CURRENT.md` | overviewのみ |
| exact dependency / parallelization / writer / FK topology | `docs/product/IMPLEMENTATION-GRAPH.md` | live implementation Issues | graph + current task contract + current evidenceで判断 |
| 今のtask contract | live GitHub Issue | owning canonical artifacts | acting前にlive fetch |
| candidate / review / CI | live GitHub PR / reviews / checks | current Issue | exact-head evidence。review-ready != PASS |
| 実際のruntime behavior | code / schema / migrations / tests / deployed evidence | intended canonical behavior | mismatchはreconcile。summaryで隠さない |
| 人間向け現在地 | `docs/continuity/CURRENT.md` | canonical + live GitHub | mutable summary。常にcanonical/live sourceに負ける |
| Product Discovery | Issue #36 + protected/public evidence | Product authorities | implementation progressでは代替不可 |
| durable rationale | `docs/decisions/` の該当ADR | current canonical docs/history | supersessionがmaterialなら記録 |
| external/provider current fact | authoritative primary source | dated local evidence | freshnessがmaterialならlive recheck |
| reusable engineering baseline | upstream Blueprint + `BLUEPRINT-ADOPTION.md` | local docs | Lunowa Product/domain authorityが優先 |

## Current routing checkpoint — 2026-09-01

人間向けの詳細statusは `CURRENT.md` のNOW/CHANGEを見ます。ここではroutingに必要な事実だけを残します。

- #55 / PR #57: UI/UX implementation contract **COMPLETE**。
- #58 / PR #59: implementation graph / architecture topology **COMPLETE**。
- #61 / PR #76: five-reference visual freeze **COMPLETE**。
- #60 / PR #80: G00 security baseline **PASS / merged**。current accepted `main` は `a6c07763bc05b20755d3e424364c2c5a3d2b9e7e`。
- G00後のfirst execution waveは P13 / #13、P14 / #14、G11 / #63。
- G11 / #63 / PR #81 はcurrent implementation frontier。ACP correction後candidateはまだE2E failureがあり **not accepted**。
- #13/#14/#15 はResponsibility L2 executable proof/freeze chainのまま。
- #36 Product Discoveryはopenで、implementation completionでは満たせない。

## 重要な境界

### Production FK topology

Responsibility L2が外部production entityを参照する場合、production owner/orderは `IMPLEMENTATION-GRAPH.md` が決めます。proof-only fixtureはproduction targetになりません。

### Parallel work

worktree / Docker / DB namespace isolationは **execution isolation** であって **merge independence** ではありません。`package.json` / `pnpm-lock.yaml` 等のshared root assetはgraph/current task contractに従ってserial mergeします。

### AI / provider authority

provider capability、database table、scheduled job、AI outputが存在するだけではProduct behaviorやaccepted domain effectのauthorityになりません。

## Update lifecycle

このmapを更新するのは次だけです。

- authorityの場所が変わった
- question→source routingが変わった
- freshness ruleが変わった

current task statusの細部やchangelogはここに書きません。navigation artifactとcanonical/live evidenceが衝突したら、owning sourceを確認し、stale routerを同じaccepted workstreamで修復します。
