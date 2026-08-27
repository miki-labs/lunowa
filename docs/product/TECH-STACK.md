# Lunowa Initial Technology Stack

## Status

**Accepted initial implementation stack; activation/version evidence refreshed 2026-08-28 for Issue #58.**

This file selects replaceable infrastructure. It is not proof a dependency is installed or a capability is active. Exact installed versions live in `package.json` / `pnpm-lock.yaml`; current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

Related:
- `ARCHITECTURE.md`;
- `CONTRACTS.md`;
- `IMPLEMENTATION-PLAN.md`;
- `IMPLEMENTATION-GRAPH.md`;
- ADRs 0004–0009;
- `research/issue-58-implementation-graph-evidence-2026-08-28.md`.

## 1. Current repository fact

At baseline `9869d7cdee2559b00d73203dec40d92bc90f537f`, production dependencies remain bootstrap-only: Next.js, React and next-intl. Better Auth, Drizzle/PostgreSQL driver, Gmail provider libraries, Trigger.dev and OpenAI SDK are not activated.

Accepted stack != installed capability != configured integration != implemented Product behavior.

## 2. Accepted stack

| Concern | Initial choice | Activation rule |
|---|---|---|
| Runtime | Node.js 24 LTS | active bootstrap; stay patched |
| Package manager | pnpm | active |
| Language | strict TypeScript | active |
| Web framework | Next.js 16.x App Router | G00 patches accepted 16.3 security baseline before feature fanout |
| UI | React 19.x | active with Next line |
| Styling | Tailwind CSS 4 | active; Lunowa semantic tokens during UI implementation |
| UI primitives | shadcn/ui + Lucide where useful | only for accepted components |
| i18n | next-intl | active |
| Client server state | TanStack Query v5 selectively | only from concrete async/cache need |
| Runtime validation | Zod or equivalent | untrusted boundaries; exact package task-scoped |
| App auth/session | Better Auth current stable | P14 proof -> G10 |
| Database | PostgreSQL 18 | proof + production foundation |
| Hosted PostgreSQL | Neon initially | hosted env only; ordinary PostgreSQL semantics |
| ORM/query | Drizzle ORM stable line | exact versions pinned/proven |
| Migrations | Drizzle Kit + committed SQL | no production `push` shortcut |
| Hosting | Vercel initially | preview early; production later |
| Durable jobs | Trigger.dev Cloud | execution substrate only |
| First provider | Gmail API + Cloud Pub/Sub + `history.list` | one-provider v1 |
| Second provider | Microsoft Graph | not current v1 critical path |
| AI | official OpenAI SDK + Responses API | bounded downstream lane |
| AI output | Structured Outputs / JSON Schema + app validation | candidates only |
| Search | PostgreSQL exact/full-text + `pg_trgm` if useful | exact Source search CORE; NL search conditional |
| Unit/domain | Vitest | active |
| Component | React Testing Library | active |
| Browser/E2E | Playwright | active |
| Observability | structured logs first | add tooling only from concrete need |

## 3. Version policy

1. Prefer supported stable/LTS lines over preview/RC novelty.
2. Security patches inside the accepted line are prerequisites for production-feature work.
3. Patch versions are operational evidence, not Product semantics.
4. Re-check volatile vendor behavior at activation/release gates.

### Current dated evidence

As of 2026-08-28:
- Node 24 remains LTS.
- repo Next.js `16.3.0` is below the Aug-25 patched Active-LTS baseline `16.3.3`; G00 must patch first.
- Better Auth stable evidence is `1.7.1`; the historical v1.6 snapshot is not proof.
- PostgreSQL major 18 remains accepted; current point-release evidence is 18.6.
- Drizzle stable evidence remains 0.45.x (`0.45.2`); 1.0 remains RC/pre-release. Current defects reinforce executable proof rather than automatic RC adoption.

Source detail lives in the dated Issue #58 evidence file.

## 4. Web/runtime

Use one Next.js application as the initial modular-monolith web/API runtime.

Rules:
- server components where useful, not dogmatically;
- Route Handlers/BFF own authenticated server/provider boundaries;
- provider secrets never enter browser JS;
- TypeScript is not runtime validation.

### G00 security pre-wave

Before write-heavy production feature branches fan out:

```text
patch accepted Next 16.3 line
-> update directly coupled resolution only as needed
-> pnpm verify
-> Playwright smoke
-> exact-head CI
```

## 5. UI implementation

Tailwind defaults are not Lunowa design authority. Repeated visual choices become semantic tokens.

Use shadcn primitives only where they fit the frozen UI contract.

No global state framework by default. Start with URL/search params, React state/context and selective query/mutation state.

### Composer

Current v1 path is contextual text Reply / Reply All + explicit immediate Send.

Any editor choice must pass Japanese IME, email serialization/paste, keyboard/accessibility and maintenance/bundle tests. Editor selection must not pull Forward/Send Later/full Compose into scope.

## 6. Authentication vs mailbox authorization

Keep:

```text
Lunowa application session
!=
Connected mailbox authorization
```

Better Auth owns application identity/session after P14 proof. Mailbox OAuth/token authority stays in Lunowa `ConnectedAccount` provider/credential services, never Better Auth social-account rows.

G10 owns auth/session schema only. G20 owns production ConnectedAccount/Source persistence after P13 proves current upstream L2 prerequisites.

## 7. OAuth/token security

For Google/Gmail user tokens, follow current Google policy/best practice.

Before the **first durable persistence of a real refresh/access token**:
- use secure server-side storage;
- encrypt token material at rest/application boundary appropriate to the server architecture;
- keep encryption keys/secrets outside the same repository/data store;
- never log token material;
- scope token lookup/use by authenticated user + ConnectedAccount ownership;
- handle invalidation/revocation;
- revoke and permanently delete tokens when no longer needed where supported.

A bounded local OAuth protocol spike may keep credentials non-persistent. Plaintext durable token storage is not an accepted intermediate phase.

R90 later owns operational key rotation, production recovery and release hardening, not permission to defer basic secure token storage.

## 8. Persistence / Drizzle

Use PostgreSQL 18 as durable application store.

Use Drizzle ORM + Drizzle Kit with:
- exact stable ORM/Kit/driver versions pinned by each proof/activation task;
- generated SQL inspection;
- committed SQL migrations;
- database constraints for ownership/uniqueness/FKs;
- transactions where invariants require;
- no production Responsibility migration before P15 L2 freeze.

Single-writer sequencing:
- P14 -> G10 auth schema;
- P13 PASS + G10 -> G20 Source schema;
- P15 -> G30 Responsibility schema;
- G32 Temporal schema;
- G50 Draft/initial SendOperation schema;
- G51 dispatch/reconciliation transitions.

No Redis at bootstrap.

## 9. Durable jobs / Trigger.dev

Trigger.dev is initial managed execution infrastructure when required, not authority.

PostgreSQL/domain owns:
- provider-message uniqueness/cursor truth;
- Responsibility application idempotency;
- Temporal contract/trigger version/currentness;
- accepted evidence revision/state;
- SendOperation duplicate prevention/reconciliation.

Current v4 evidence:
- raw-string idempotency defaults to `run` scope from v4.3.1;
- `global` is still task/environment scoped;
- default key TTL is finite (30 days current evidence);
- failed runs clear their idempotency key.

Any Trigger key therefore specifies key composition/scope/TTL and remains secondary to DB/domain currentness.

## 10. Gmail first-provider stack

Use Gmail API rather than IMAP for first vertical slice.

```text
OAuth ConnectedAccount
-> bounded initial sync
-> users.watch / PubSub signal
-> authenticate + acknowledge quickly
-> durable reconciliation
-> history.list from current cursor
-> normalized idempotent Source commit
-> cursor advance after required durability
```

Provider oracles:
- renew watch before expiration; current Google docs require at least every 7 days and recommend daily;
- notifications may be delayed/dropped and are capped at one event/sec/user;
- periodic safety reconciliation remains required;
- stale `startHistoryId` / 404 enters full-sync recovery;
- background access requires offline OAuth/refresh-token handling;
- push payload never directly changes Responsibility state.

Request narrowest scopes consistent with implemented behavior.

### Public-release boundary

OAuth verification/restricted-scope security assessment is R90 release work where actual scopes/deployment require it. It is not a blanket blocker to local/private complete-loop implementation.

## 11. Microsoft

Microsoft Graph remains a future provider boundary and is not a current Minimum Complete Delegation Loop prerequisite.

## 12. AI runtime

Use official OpenAI SDK + Responses API + Structured Outputs for two bounded candidate paths after trusted contracts exist:

1. Responsibility interpretation candidate;
2. contextual AI draft candidate inside an authorized current Reply context.

The model never owns authentication, provider facts, admission/identity/effects, live tracking/defer, Temporal effects or Send permission.

### Data-control activation gate

`store: false` is not synonymous with Zero Data Retention.

Before production email AI use:
- re-read current OpenAI data controls;
- know actual org/project retention mode;
- use minimum authorized context;
- use `store:false` where appropriate;
- avoid raw mail/prompt/output logging by default;
- avoid incompatible features if ZDR is a requirement;
- record model/config/data-control basis in evidence.

### Eval gate

Interpretation and drafting have separate schemas/evals. Use layered correctness, high-harm/prompt-injection tests and family-stratified holdout. Manual Source/Reply remains available if AI fails.

## 13. Search

Authorized **exact Source search is V1 CORE** and belongs to the G21 Source path.

Start with PostgreSQL indexes/full-text and `pg_trgm` where useful. No vector DB initially.

Natural-language/semantic retrieval remains conditional and must not be advertised until activated. Search similarity is never Responsibility identity authority.

## 14. Testing / verification

Tasks select appropriate evidence from:
- Vitest;
- React Testing Library;
- Playwright;
- real PostgreSQL 18 integration/concurrency tests;
- generated SQL inspection;
- real provider contract/integration evidence;
- exact-head CI.

Async/external effects test request, pending, accepted, failure, ambiguity and reconciliation—not only happy-path output.

Visual references remain subordinate to textual Product/UI authority.