# Codex-first Software Factory

この文書は、Lunowa の開発タスクをローカルで運用するための簡潔な手引きです。Product の仕様や backlog は複製せず、詳細な実装規約は [`AGENTS.md`](../AGENTS.md)、[`coding-agent-harness.md`](coding-agent-harness.md)、[`implementation-workflow.md`](implementation-workflow.md) を参照してください。

## Execution flow

GitHub Issues のうち **`symphony:ready` label が付いた Issue が実行 queue** です。Issue と live `blocked_by` が task/dependency contract を所有し、Symphony は実行可能な Issue を dispatch します。

```text
GitHub Issue (`symphony:ready`) + blocked_by
-> Symphony dispatch
-> Issue 専用 branch / isolated workspace
-> Codex が repository authority を読み、実装・検証
-> review-ready PR
-> GitHub CI + 必要な review
-> human/operator が merge を判断
```

同じ Issue/workspace に複数の実装 owner を置きません。並行作業は、互いに独立して unblocked な Issue を別々の workspace と runtime state に隔離できる場合だけ行います。Codex は current Issue、checked-in docs、code/tests を source of truth として、変更を小さく保ち、対象に応じた local checks を実行します。

## Unattended worker isolation

unattended Factory worker は専用の `CODEX_HOME` で実行します。interactive Codex の `CODEX_HOME`、MCP server 設定、plugin 設定を継承せず、gstack skill surface も Factory が curated した skill だけに限定します。

unattended Issue worker は Issue ごとの Docker Sandboxes microVM 内で clone mode により実行します。agent から host workspace は read-only であり、変更は microVM 内の private clone にのみ加えられます。

この分離により、個人の interactive environment にある OAuth 状態、MCP の起動・接続失敗、不要な tool context が unattended run に入り込まなくなります。worker ごとの実行環境が予測可能になり、認証 prompt に応答できない background execution の安定性を高めます。

gstack は一律の checklist ではなく、変更リスクに応じて選択します。

- non-trivial code change: `gstack-review`
- browser / user-flow change: `gstack-qa`
- auth、security、data isolation、secret、migration change: `gstack-cso`
- substantial UI / UX change: `gstack-design-review`

documentation-only の変更では、内容確認と relevant local checks で十分なら specialist pass は省略します。

## Pull request and gates

Codex は通常、Issue branch から `main` 向けの non-draft PR を作成または更新し、CI と actionable review feedback を追います。`main` の branch protection が必須とする check は次の 2 つです。

- `Verify`
- `E2E Smoke`

必要な check が green でも自動的には merge しません。**auto-merge と production deployment は default では有効化されておらず**、merge / landing は human/operator gate です。human/operator が明示的に `/land` を実行するまで、Factory worker は PR を merge しません。production 操作には別途明示的な承認と、その変更に必要な検証が要ります。

## Local operator commands

```bash
codex-factory status
codex-factory watch
codex-factory pause
codex-factory resume
```

- `status`: factory の現在状態を一度確認する。
- `watch`: 状態を継続表示する。
- `pause`: factory の運転を一時停止する。
- `resume`: 一時停止した factory の運転を再開する。

障害時は自動 retry や merge を前提にせず、Issue、workspace、Codex run、PR head、CI の live state を確認してから再開します。
