# Lunowa

Lunowaは、メール中心のcommunicationから生まれる「まだ終わっていないこと」をユーザーの代わりに監視し、**本当に必要になるまで注意から外す**ためのProductです。

> **必要になるまで安心して忘れられ、必要になった瞬間には、最小の理解と操作で終わる。**

中心価値は **Attention Delegation**。単なるInbox整理やAI要約ではなく、unresolved communicationの状態を追い、ユーザーのattentionが必要になった時だけ適切なcontextとともに返すことを目指します。

## まず現在地を知りたい

人間が最初に読むのは **[`docs/continuity/CURRENT.md`](docs/continuity/CURRENT.md)** です。

```text
NOW     今どこまで出来ている？
CHANGE  前回から何が変わった？
MAP     何がどこにある？
RUN     実物をどう確認する？
```

**current main / implementation frontier / blocker / current PR・CIは `CURRENT.md` だけに集約**します。このREADMEにはmutable statusを複製しません。

現在地のsummaryはauthorityではありません。正確さが必要な場合は、そこからcanonical docs / live GitHub Issue・PR・CI / code・testsへ辿ります。

## 現在のv1目標

広いメールクライアント機能を先に作るのではなく、**Gmail-first Minimum Complete Delegation Loop**を一本完成させます。

```text
app session
-> Gmail evidence
-> trusted Responsibility
-> Managed quiet monitoring
-> durable reconsideration
-> Needs You / Review
-> Moment
-> contextual Reply / Reply All
-> manual or bounded AI draft
-> explicit immediate Send
-> Gmail reconciliation
-> Responsibility re-evaluation
-> truthful integrity / recovery
```

Current COREにはauthorized exact Source searchとattachment evidence accessも含みます。

### 今は作らないもの

- Microsoft provider
- broad multi-account / unified-inbox parity
- Person / CRM Product features
- generic fresh Compose / Forward parity
- Send Later / generic Undo
- natural-language Search
- autonomous Send
- generic workflow / rule engine

## Source of truth

| 質問 | Authority |
| --- | --- |
| Productの最高位contract | [`docs/product/PRODUCT.md`](docs/product/PRODUCT.md) |
| v1の詳細behavior / Feature Matrix | [`docs/product/PRODUCT-CONTENT.md`](docs/product/PRODUCT-CONTENT.md) |
| end-to-end acceptance | [`docs/product/GOLDEN-SCENARIO-BANK.md`](docs/product/GOLDEN-SCENARIO-BANK.md) |
| UI/UX | [`docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md`](docs/design/V1-UI-IMPLEMENTATION-CONTRACT.md) + [`docs/design/`](docs/design/) |
| Responsibility semantics | [`docs/product/responsibility/`](docs/product/responsibility/) |
| architecture / data / module contracts | [`ARCHITECTURE.md`](docs/product/ARCHITECTURE.md) / [`DATA-MODEL.md`](docs/product/DATA-MODEL.md) / [`CONTRACTS.md`](docs/product/CONTRACTS.md) |
| exact implementation DAG | [`docs/product/IMPLEMENTATION-GRAPH.md`](docs/product/IMPLEMENTATION-GRAPH.md) + live Issues |
| current candidate / review / CI | live GitHub PR / reviews / checks |
| 実際のbehavior | code / schema / tests / runtime evidence |

完全なroutingは [`docs/continuity/KNOWLEDGE-MAP.md`](docs/continuity/KNOWLEDGE-MAP.md) にあります。

## 重要な分離

```text
Evidence != Interpretation != Accepted State != UI Projection
Message arrival != attention event
Reply / read / silence / send != operational closure
Capability != Permission
Monitoring delegation != Send authority
Mailbox state != Responsibility state
Send request != provider acceptance != operational outcome satisfied
```

Conversationはzero / one / many Responsibilitiesを持てます。`No Responsibility`は正常な状態です。cross-account semantic auto-mergeは初期v1では禁止します。

## Repository navigation

AI agentは `AGENTS.md` をtask routerとして使用します。人間は `CURRENT.md` から開始します。

```text
docs/product/      Product / architecture / implementation authority
docs/design/       UI / UX authority
docs/continuity/   human checkpoint + authority routing
docs/decisions/    durable ADR rationale
```

人間向けcheckpointは **日本語第一・technical English併記**、source code / identifiers / API / stable IDsは英語を維持します。完全な日英二重本文を増やさず、machine truthとhuman mental modelの両方を保ちます。

## Development

Requirements:

- Node.js 24 LTS
- pnpm 11.20.0
- PostgreSQL 18

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL, then apply the
# committed SQL under drizzle/migrations/ to a clean/current database.
pnpm dev
pnpm verify
pnpm test:e2e
```

Lunowa application sign-in uses Better Auth local credentials. Mailbox OAuth,
ConnectedAccount credentials, and monitoring authorization are intentionally a
separate later boundary and are not configured by app sign-in or sign-out.

GitHub Actionsは `Verify` と `E2E Smoke` を独立実行します。accepted integrationにはcurrent candidateにbindされたverification evidenceが必要です。

## Product validationについて

実装が進んでも、ICP / PMF / WTP / retention / real monitoring relinquishmentが証明されたことにはなりません。Issue #36のProduct Discoveryは別のempirical evidence laneとして扱います。
