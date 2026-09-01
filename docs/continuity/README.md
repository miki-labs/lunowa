# Lunowa Knowledge Continuity System

## 目的

この層は、過去chatを読み直さなくても、fresh sessionや人間が **Lunowaの現在地と正しいsource of truthを短時間で復元するためのnavigation / checkpoint infrastructure** です。

ここにProduct・Architecture・Responsibility・Issue backlogを複製しません。会話ログやprivate reasoningも保存しません。

### 人間向けの入口

まず `CURRENT.md` を見ます。

```text
CURRENT.md
  ├─ NOW     今どこまで出来ている？
  ├─ CHANGE  前回から何が変わった？
  ├─ MAP     大きな構造は？
  └─ RUN     実物をどう確認する？
```

より正確なauthority routingが必要なら `KNOWLEDGE-MAP.md`、その後にowning canonical source / live GitHub / code/tests/runtimeへ進みます。

## Language policy — 人間は日本語第一、machine identifiersは維持

高速なAI開発で人間のmental modelが失われないことを優先します。

- `CURRENT.md`、human-facing checkpoint、Issue/PRの短いHuman Summaryは **日本語第一**。
- code identifiers、schema/API名、stable ID（`G11`, `G20`, `P13`等）、commands、framework/library名は英語を維持。
- technical termは必要に応じて `Evidence Foundation（証拠基盤）` のように英語名を併記し、code/searchとの対応を失わない。
- canonical technical contractを無理に日英二重化しない。完全な二重本文はdrift・maintenance・context増加を招くため避ける。
- 将来のnon-trivial Issue/PRは、可能なら先頭に数行の **Human Summary / 人間向け要約** を置き、「何をする / 何をしない / 今どの状態か」を日本語で理解できるようにする。

目的は翻訳ではなく、**machine truthからhuman mental modelを安く復元できること**です。

## Authority boundary

| Knowledge class | 役割 | Authority rule |
| --- | --- | --- |
| Canonical knowledge | Product / design / domain / architecture / contract / decision | owning artifactがnormative |
| Human checkpoint / navigation | `AGENTS.md`, `CURRENT.md`, `KNOWLEDGE-MAP.md` | routeと要約だけ。canonical/live evidenceに負ける |
| Live execution state | GitHub Issues / PRs / reviews / CI | current stateはGitHubをlive query。backlogをdocsへ複製しない |
| Actual behavior | code / schema / tests / runtime evidence | 実際に何が起きるかを示す。intentとの差はreconcileする |
| Reusable upstream baseline | Blueprint + `BLUEPRINT-ADOPTION.md` | Lunowa固有authorityをoverrideしない |
| Transient context | chats / Codex sessions / routine debugging | material decisionの唯一の保存先にしない |

Authorityは「どの質問に答えるか」で決まります。万能な一列のpriority orderは作りません。

## Promotion rule — 必要なものだけdurableにする

```text
transient discussion / research
  -> materialか判定
  -> owning canonical artifactへpromotion
  -> routing/current stateが変わった時だけCURRENT/MAPを更新
```

保存するのは、失うと次のどれかが起きる情報だけです。

- materially wrongなdecision
- costly researchのやり直し
- durable constraint違反
- dependency/orderの誤り
- 必須evidence/rationaleの喪失

brainstorm、捨てた案、routine debugging、recoverable chat detailは残しません。

## Freshness rule

- `CURRENT.md` は小さく保ち、**accepted Product/runtime capability boundary / implementation frontier / material blocker / RUN path** が変わった時だけreconcileする。docs-only merge等の全main SHAを追跡しない。
- exact current `main` SHAが必要なaction/reviewではlive GitHubを確認し、mutable summaryへ固定しない。
- `CHANGE` はchangelogにせず、直近のmaterial deltaだけを残す。古い履歴はGit/GitHubへ任せる。
- `KNOWLEDGE-MAP.md` はauthorityの場所やroutingが変わった時だけ更新する。
- current Issue/PR/CIが重要なら、必ずlive GitHubを確認する。
- navigation artifactがstaleなら、canonical/live sourceを確認して同じaccepted workstreamでrouterを修復する。

### 明示的に作らないもの

実利用で不足が証明されるまでは、以下を追加しません。

- status database
- knowledge graph
- chat archive
- duplicated Issue/PR ledger
- 自動生成wikiを新しいauthorityにする仕組み
- global status enum
- continuity専用service

## Fresh-session bootstrap

全部読まず、progressive disclosureを使います。

```text
AGENTS.md
  -> docs/continuity/CURRENT.md
  -> docs/continuity/KNOWLEDGE-MAP.md（必要なとき）
  -> live current Issue / PR / CI
  -> decisionに必要なcanonical sourcesだけ
  -> implementation stateが必要ならcode/tests/runtime
  -> Blueprint driftがmaterialなときだけBLUEPRINT-ADOPTION.md
```

成功条件は、hidden memoryなしのfresh contextでも、authoritative project state・material blocker・正しいsource・next actionを復元できることです。

## Session / phase checkpoint

materialなsessionやphaseの終わりに、次だけ確認します。

- accepted fact/evidenceが変わったか
- durable decision/assumption/hypothesisが変わったか
- blocker/dependency/next decisionが変わったか
- canonical sourceのfreshness/routingが変わったか

まずowning artifactへ反映し、その後 `CURRENT.md` のNOW/CHANGE/MAP/RUNにmaterialな影響がある場合だけ更新します。

## Forbidden duplication

continuity layerを次のものにしてはいけません。

- duplicate Product / Architecture / contract / decision source
- manually maintained Issue/PR/CI backlog
- chat/session/reasoning archive
- Responsibility conclusion store
- copied Blueprint handbook
- canonical docsがcontinuity summaryに依存するcircular authority

迷ったら **追加するより削る / linkする / live sourceをqueryする** を優先します。
