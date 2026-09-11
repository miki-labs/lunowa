# Knowledge Map — 何をどこで確認するか

このmapは **質問を正しいauthorityへrouteするためのnavigation** です。ここにProduct/domain/implementation truthやcurrent task statusを複製しません。

## Question → Authority

| 知りたいこと | Primary authority | Secondary / context | Freshness rule |
| --- | --- | --- | --- |
| Lunowaは何を解決するProductか / v1 direction / hypothesis | `docs/product/PRODUCT.md` | `docs/product/PRODUCT-CONTENT.md`, current Product Issue | hypothesisとempirical validationを混同しない |
| v1の詳細behavior / scope / failure / Feature Matrix | `docs/product/PRODUCT-CONTENT.md` | `docs/product/PRODUCT.md`, design, Responsibility | Product behavior変更時に再読 |
| end-to-endで何が成立すればよいか | `docs/product/GOLDEN-SCENARIO-BANK.md` | Responsibility oracles | semantic truth conflictではResponsibility authorityを確認 |
| UI/UXのcanonical behavior | `docs/design/DESIGN.md`, `docs/design/INTERACTIONS.md`, `docs/design/RESPONSIVE.md` | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | runtime UIはrendered/browser evidenceも確認 |
| v1 UI implementation contract | `docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md` | design trio + Golden Scenarios | accepted contract。current task statusはlive Issue/PRで確認 |
| visual direction | `docs/design/references/README.md` + active references | textual Product/UI authority | imageはtextual semanticsをoverrideしない |
| Responsibility semantics / eval / persistence proof | `docs/product/responsibility/` | ADRs + executable evidence | static review != executable proof |
| architecture / data / module contract | `docs/product/ARCHITECTURE.md`, `docs/product/DATA-MODEL.md`, `docs/product/CONTRACTS.md` | ADRs, implementation evidence | executable evidenceでstale intentが判明したらreconcile |
| accepted technology / hosting choice | `docs/product/TECH-STACK.md` | official vendor docs | volatile factsはactivation時に再確認 |
| high-level implementation sequence | `docs/product/IMPLEMENTATION-PLAN.md` | `CURRENT.md` | overviewのみ |
| exact dependency / parallelization / writer / FK topology | `docs/product/IMPLEMENTATION-GRAPH.md` | live implementation Issues + GitHub `blocked_by` | current graph + task contract + evidenceで判断 |
| 今のtask contract | live GitHub Issue | owning canonical artifacts | acting前にlive fetch |
| candidate / review / CI | live GitHub PR / reviews / checks | current Issue | exact-head evidence。review-ready != PASS |
| implementation / verification procedure | `docs/implementation-workflow.md`, `docs/coding-agent-harness.md`, `.agents/skills/execute-task/SKILL.md` | user-facing UI: `.agents/skills/product-design/SKILL.md`; accepted visual reference: `.agents/skills/design-qa/SKILL.md` | task type/riskに応じてprogressive disclosure。reference conformanceはsame-state rendered comparison必須 |
| independent acceptance procedure | `.agents/skills/evaluate-change/SKILL.md` + current task contract | UI taskは`product-design`; reference-conformanceは`design-qa`も適用 | full cumulative exact-head candidateをfresh contextで監査。visual PASSをgeneric CIから推測しない |
| active implementation owner / branch / worktree / runtime | explicit task owner/launch authority + actual local Git/worktree/process evidence | PR status | action前にlive確認。同じIssue/worktreeのduplicate concurrent ownership禁止 |
| task-relevant external/tool fact | authoritative CLI/API/MCP/plugin or primary source | dated local evidence | materialなmutable factだけlive query。local deterministic factを優先 |
| 実際のruntime behavior | code / schema / migrations / tests / deployed evidence | intended canonical behavior | mismatchはreconcile。summaryで隠さない |
| 人間向け現在地 | `docs/continuity/CURRENT.md` | canonical + live GitHub | mutable summary。常にcanonical/live sourceに負ける |
| Product Discovery | current Product Discovery Issue | Product authorities + protected/public evidence | implementation progressでは代替不可 |
| acquisition / activation / retention / pricing / WTP / revenue / unit economics | `docs/product/COMMERCIAL-LOOP.md` | `docs/product/PRODUCT.md`, `docs/monetization-engineering.md`, `miki-labs/lunowa-site` live Issues | commercial stageを飛ばさず、HYPOTHESIS / UNKNOWNをevidenceなしで昇格しない |
| durable rationale | `docs/decisions/` の該当ADR | current canonical docs/history | supersessionがmaterialなら記録 |
| external/provider current fact | authoritative primary source | dated local evidence | freshnessがmaterialならlive recheck |
| reusable engineering baseline | upstream Blueprint + `BLUEPRINT-ADOPTION.md` | local docs | Lunowa Product/domain authorityが優先 |

## 重要な境界

### Product authority vs task authority

`miki-labs/lunowa` のowning artifactsがProduct/application authorityです。live GitHub Issue / `blocked_by` はbounded task/dependency authorityであり、execution engineはreplaceableです。Issueはowning Product・Responsibility・UI/UX semanticsをsilent overrideしません。

### Parallel work

parallel implementationにはdistinct unblocked Issues、one active owner per Issue/worktree、isolated worktrees/runtime stateが必要です。同じIssue/worktreeを複数agentで同時に扱いません。

worktree / runtime isolationは **execution isolation** であって **merge independence** ではありません。`package.json` / `pnpm-lock.yaml` 等のshared root assetやdependency-sensitive candidatesはserial mergeし、先行merge後に残りcandidateを再検証します。

### Correction and integration

builder verificationはacceptanceではありません。PR/CI後、independent reviewerがcurrent task contract × full cumulative exact-head candidateを監査します。FAILではmaterial blockersを一括し、同じPR/worktreeで修正します。PASS前にmergeせず、materialなbase movement後はaffected candidatesのdependency/evidenceを再検証します。

### Tool and effect authority

repository files/search/local CLIなどequivalentなdeterministic evidenceを優先し、MCP/plugin/network/specialist skillはtaskにmaterialな最小surfaceだけを選びます。privileged/destructive external writeにはseparate explicit authorityが必要で、ordinary coding-agent capabilityへ常設しません。

### Production FK topology

Responsibilityが外部production entityを参照する場合、production owner/orderは `docs/product/IMPLEMENTATION-GRAPH.md` が決めます。proof-only fixtureはproduction targetになりません。

### AI / provider authority

provider capability、database table、scheduled job、AI outputが存在するだけではProduct behaviorやaccepted domain effectのauthorityになりません。

## Update lifecycle

このmapを更新するのは次だけです。

- authorityの場所が変わった
- question→source routingが変わった
- freshness ruleが変わった

current task/worktree/runtime stateの細部はここに書きません。navigation artifactとcanonical/live evidenceが衝突したら、owning sourceを確認し、stale routerを修復します。
