# Knowledge Map — 何をどこで確認するか

このmapは **質問を正しいauthorityへrouteするためのnavigation** です。ここにProduct/domain/implementation truthやcurrent task statusを複製しません。

## Question → Authority

| 知りたいこと | Primary authority | Secondary / context | Freshness rule |
| --- | --- | --- | --- |
| Lunowaは何を解決するProductか / v1 direction / hypothesis | `docs/product/PRODUCT.md` | `docs/product/PRODUCT-CONTENT.md`, current Product Issue | hypothesisとempirical validationを混同しない |
| v1の詳細behavior / scope / failure / Feature Matrix | `docs/product/PRODUCT-CONTENT.md` | `docs/product/PRODUCT.md`, design, Responsibility | Product behavior変更時に再読 |
| end-to-endで何が成立すればよいか | `docs/product/GOLDEN-SCENARIO-BANK.md` | Responsibility oracles | semantic truth conflictではResponsibility authorityを確認 |
| UI/UXのcanonical behavior | `docs/design/DESIGN.md`, `docs/design/INTERACTIONS.md`, `docs/design/RESPONSIVE.md` | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | runtime UIはrendered/browser evidenceも確認 |
| visual direction | `docs/design/references/README.md` + active references | textual Product/UI authority | imageはtextual semanticsをoverrideしない |
| Responsibility semantics / eval / persistence proof | `docs/product/responsibility/` | ADRs + executable evidence | static review != executable proof |
| architecture / data / module contract | `docs/product/ARCHITECTURE.md`, `docs/product/DATA-MODEL.md`, `docs/product/CONTRACTS.md` | ADRs, implementation evidence | executable evidenceでstale intentが判明したらreconcile |
| accepted technology / hosting choice | `docs/product/TECH-STACK.md` | official vendor docs | volatile factsはactivation時に再確認 |
| high-level implementation sequence | `docs/product/IMPLEMENTATION-PLAN.md` | `CURRENT.md` | overviewのみ |
| exact dependency / parallelization / writer / FK topology | `docs/product/IMPLEMENTATION-GRAPH.md` | live implementation Issues + GitHub `blocked_by` | current graph + task contract + evidenceで判断 |
| 今のtask contract | live GitHub Issue | owning canonical artifacts | acting前にlive fetch |
| candidate / review / CI | live GitHub PR / reviews / checks | current Issue | exact-head evidence。review-ready != PASS |
| ACP admission / model routing / concurrency / scheduler / recovery | `miki-labs/agent-control-plane` current repo + current ACP Issues | Lunowa Issue metadata only as caller intent | execution時にlive-read。Lunowa docsはACP implementation authorityではない |
| RUNNING/READYが本当に実行中か / free slotか / retry可能か | ACP manifest + host process state + current GitHub authority | ACP scheduler/controller logs | labelsだけで判断しない。unknown/quarantineはfail closed |
| 実際のruntime behavior | code / schema / migrations / tests / deployed evidence | intended canonical behavior | mismatchはreconcile。summaryで隠さない |
| 人間向け現在地 | `docs/continuity/CURRENT.md` | canonical + live GitHub | mutable summary。常にcanonical/live sourceに負ける |
| Product Discovery | current Product Discovery Issue | Product authorities + protected/public evidence | implementation progressでは代替不可 |
| durable rationale | `docs/decisions/` の該当ADR | current canonical docs/history | supersessionがmaterialなら記録 |
| external/provider current fact | authoritative primary source | dated local evidence | freshnessがmaterialならlive recheck |

## 重要な境界

### Product authority vs execution authority

`miki-labs/lunowa` がLunowa Product/application authorityです。`miki-labs/agent-control-plane` はexecution/recovery infrastructureであり、Product semantics・Responsibility semantics・UI/UX・task contractを上書きしません。

### Parallel work

ACPはbounded parallel model executionをサポートしますが、parallel executionにはdistinct execution identity、current unblocked dependency、explicit authority、free slotが必要です。同じIssueを2 laneで走らせません。

worktree / runtime isolationは **execution isolation** であって **merge independence** ではありません。`package.json` / `pnpm-lock.yaml` 等のshared root assetやdependency-sensitive candidatesはserial mergeし、先行merge後に残りcandidateを再検証します。

### Recovery

`agent:running` / `agent:ready` はGitHub authorityの一部ですが、unknown outcomeやquarantine時のrecovery判断には不十分です。manifest/process evidenceを確認し、scheduler restartや繰り返しをretry authorityとして扱いません。

### Production FK topology

Responsibilityが外部production entityを参照する場合、production owner/orderは `docs/product/IMPLEMENTATION-GRAPH.md` が決めます。proof-only fixtureはproduction targetになりません。

### AI / provider authority

provider capability、database table、scheduled job、AI outputが存在するだけではProduct behaviorやaccepted domain effectのauthorityになりません。

## Update lifecycle

このmapを更新するのは次だけです。

- authorityの場所が変わった
- question→source routingが変わった
- freshness ruleが変わった

current task statusやACP host stateの細部はここに書きません。navigation artifactとcanonical/live evidenceが衝突したら、owning sourceを確認し、stale routerを修復します。
