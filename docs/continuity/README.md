# Lunowa Knowledge Continuity System

## 目的

この層は、過去chatを読み直さなくても、fresh sessionや人間が **Lunowaの現在地と正しいsource of truthを短時間で復元するためのnavigation / checkpoint infrastructure** です。

ここにProduct・Architecture・Responsibility・Issue backlog・ACP実装を複製しません。会話ログやprivate reasoningも保存しません。

## Authority boundary

| Knowledge class | 役割 | Authority rule |
| --- | --- | --- |
| Lunowa canonical knowledge | Product / design / domain / architecture / contract / decision | `miki-labs/lunowa` のowning artifactがnormative |
| Lunowa live task state | Issue / PR / review / CI / GitHub dependency | current stateはlive query。backlogをdocsへ複製しない |
| ACP execution/recovery | admission / concurrency / model routing / scheduler / recovery / quarantine | `miki-labs/agent-control-plane` のcurrent repo + 必要なhost evidenceがauthority。Product semanticsは所有しない |
| Human checkpoint / navigation | `AGENTS.md`, `CURRENT.md`, `KNOWLEDGE-MAP.md` | routeと要約だけ。canonical/live evidenceに負ける |
| Actual behavior | code / schema / tests / runtime evidence | 実際に何が起きるかを示す。intentとの差はreconcileする |
| Reusable upstream baseline | Blueprint + `BLUEPRINT-ADOPTION.md` | Lunowa固有authorityをoverrideしない |
| Transient context | chats / Codex sessions / routine debugging | material decisionの唯一の保存先にしない |

Authorityは「どの質問に答えるか」で決まります。万能な一列のpriority orderは作りません。

## Fresh-session bootstrap

全部読まず、progressive disclosureを使います。

```text
AGENTS.md
  -> CURRENT.md（人間向けcheckpoint）
  -> KNOWLEDGE-MAP.md（authority routingが必要なとき）
  -> live current Lunowa Issue / PR / CI / blocked_by
  -> decisionに必要なLunowa canonical sourcesだけ
  -> execution/recovery/concurrencyが関係するならcurrent ACP authority
  -> RUNNING/unknown/quarantineが曖昧ならACP manifest / host process evidence
  -> implementation behaviorが必要ならcode/tests/runtime
```

成功条件は、hidden memoryなしのfresh contextでも次を復元できることです。

- Lunowa Product authorityがどこにあるか;
- ACPはexecution/recovery authorityでありProduct authorityではないこと;
- current task/dependency/PR/CIをlive確認すること;
- bounded parallel executionとserial merge/review disciplineを混同しないこと;
- RUNNING/READY labelだけでretryやfree-slotを判断しないこと;
- unknown outcomeをblind replayしないこと。

## Freshness rule

- `CURRENT.md` は **accepted capability boundary / implementation frontier / material blocker / RUN path** が変わった時だけreconcileする。
- exact current `main` SHA、current Issue/PR/CI、installed ACP capacity、quota、host process、RUNNING/READY、open ACP defectはaction時にlive確認する。
- `KNOWLEDGE-MAP.md` はauthorityの場所やroutingが変わった時だけ更新する。
- navigation artifactがstaleならcanonical/live sourceを確認し、routerを修復する。
- stable bootstrapへcurrent Issue番号や一時的host状態をhardcodeしない。

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

## 明示的に作らないもの

実利用で不足が証明されるまでは、以下を追加しません。

- status database
- knowledge graph
- chat archive
- duplicated Issue/PR ledger
- copied ACP handbook / scheduler-state database
- 自動生成wikiを新しいauthorityにする仕組み
- global status enum
- continuity専用service

## Language policy

- `CURRENT.md`、human-facing checkpoint、Issue/PRの短いHuman Summaryは **日本語第一**。
- code identifiers、schema/API名、stable ID、commands、framework/library名は英語を維持。
- canonical technical contractを完全日英二重化しない。driftとcontext増加を避ける。

## Session / phase checkpoint

materialなsessionやphaseの終わりに、次だけ確認します。

- accepted fact/evidenceが変わったか
- durable decision/assumption/hypothesisが変わったか
- blocker/dependency/next decisionが変わったか
- canonical source / execution authority routingが変わったか

まずowning artifactへ反映し、その後 `CURRENT.md` / `KNOWLEDGE-MAP.md` にmaterialな影響がある場合だけ更新します。

## Forbidden duplication

continuity layerを次のものにしてはいけません。

- duplicate Product / Architecture / contract / decision source
- copied ACP handbook or scheduler state database
- manually maintained Issue/PR/CI backlog
- chat/session/reasoning archive
- Responsibility conclusion store
- 自動生成wikiを新しいauthorityにする仕組み
- canonical docsがcontinuity summaryに依存するcircular authority

迷ったら **追加するより削る / linkする / live sourceをqueryする** を優先します。
