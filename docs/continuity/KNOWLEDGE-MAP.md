# Knowledge Map — 何をどこで確認するか

このmapは **質問を正しいauthorityへrouteするためのnavigation** です。ここにProduct/domain/implementation truthやcurrent task statusを複製しません。

current main / implementation frontier / blocker / current PR・CIは `CURRENT.md` にだけ置きます。

## Question → Authority

| 知りたいこと | Primary authority | Secondary / context | Freshness rule |
| --- | --- | --- | --- |
| Lunowaは何を解決するProductか / v1 direction / hypothesis | `docs/product/PRODUCT.md` | `PRODUCT-CONTENT.md`, current Product Issue | hypothesisとempirical validationを混同しない |
| v1の詳細behavior / scope / failure / Feature Matrix | `docs/product/PRODUCT-CONTENT.md` | `PRODUCT.md`, design, Responsibility | Product behavior変更時に再読 |
| end-to-endで何が成立すればよいか | `docs/product/GOLDEN-SCENARIO-BANK.md` | Responsibility oracles | semantic truth conflictではResponsibility authorityを確認 |
| UI/UXのcanonical behavior | `docs/design/DESIGN.md`, `INTERACTIONS.md`, `RESPONSIVE.md` | `V1-UI-IMPLEMENTATION-CONTRACT.md` | runtime UIはrendered/browser evidenceも確認 |
| v1 UI implementation contract | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | design trio + Golden Scenarios | accepted contract。current task statusはlive Issue/PRで確認 |
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
| Product Discovery | current Product Discovery Issue | Product authorities + protected/public evidence | implementation progressでは代替不可 |
| durable rationale | `docs/decisions/` の該当ADR | current canonical docs/history | supersessionがmaterialなら記録 |
| external/provider current fact | authoritative primary source | dated local evidence | freshnessがmaterialならlive recheck |
| reusable engineering baseline | upstream Blueprint + `BLUEPRINT-ADOPTION.md` | local docs | Lunowa Product/domain authorityが優先 |

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
