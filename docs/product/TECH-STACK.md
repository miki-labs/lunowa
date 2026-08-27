# Lunowa Initial Technology Stack

## Status

**Accepted initial implementation stack; activation/version evidence refreshed 2026-08-28 for Issue #58.**

This document selects replaceable infrastructure for Lunowa. It is **not** proof that a dependency is installed or a capability is active. Exact installed versions live in `package.json` / `pnpm-lock.yaml`; current activation order lives in `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

Related:
- `ARCHITECTURE.md`;
- `CONTRACTS.md`;
- `IMPLEMENTATION-PLAN.md`;
- `IMPLEMENTATION-GRAPH.md`;
- ADRs 0004–0009;
- `research/issue-58-implementation-graph-evidence-2026-08-28.md`.

## 1. Current repository fact

As of baseline `9869d7cdee2559b00d73203dec40d92bc90f537f`, production dependencies are still bootstrap-only: Next.js, React and next-intl. Better Auth, Drizzle/PostgreSQL driver, Gmail provider libraries, Trigger.dev and OpenAI SDK are **not activated yet**.

Do not report accepted stack choices as implemented Product capability.

## 2. Accepted stack at a glance

| Concern | Initial choice | Current activation rule |
| --- | --- | --- |
| Runtime | Node.js 24 LTS | active bootstrap; keep patched |
| Package manager | pnpm | active bootstrap |
| Language | strict TypeScript | active bootstrap |
| Web framework | Next.js 16.x App Router | active; patched 16.3 security baseline required before feature fan-out |
| UI | React 19.x | active with Next line |
| Styling | Tailwind CSS 4 | active bootstrap; semantic Lunowa tokens in UI implementation |
| UI primitives | shadcn/ui + Lucide where useful | activate only for accepted UI components |
| i18n | next-intl | active bootstrap |
| Client server-state | TanStack Query v5 selectively | activate when real async mutations/cache justify it |
| Runtime validation | Zod or equivalent | activate at untrusted boundaries; exact choice task-scoped |
| App session/auth | Better Auth current stable | P14 proof first; then G10 |
| Database | PostgreSQL 18 | executable proof + production foundation |
| Hosted DB | Neon initially | hosted environments only; standard PostgreSQL semantics |
| ORM/query | Drizzle ORM stable line | exact version pinned/proven before production use |
| Migrations | Drizzle Kit + committed SQL | no production `push` shortcut |
| Web/API hosting | Vercel initially | preview early; production later |
| Durable jobs | Trigger.dev Cloud | execution substrate only; activate when sync/Temporal work needs it |
| First provider | Gmail API + Cloud Pub/Sub + `history.list` | one-provider v1 path |
| Second provider | Microsoft Graph | **not current v1 critical path** |
| AI | official OpenAI SDK + Responses API | downstream bounded interpretation only |
| AI output | Structured Outputs / JSON Schema + app validation | candidate interpretation only |
| Search | PostgreSQL exact/full-text + `pg_trgm` as needed | exact Source search first; NL search conditional |
| Unit/domain tests | Vitest | active |
| Component tests | React Testing Library | active |
| Browser/E2E | Playwright | active |
| Observability | structured logs first | add tooling from concrete need |

## 3. Version policy

1. Prefer supported stable/LTS lines over Current/preview/RC novelty.
2. Security patches in the accepted line are preconditions for production-feature work.
3. Do not freeze vendor patch versions into Product semantics; exact resolutions belong in lockfiles/evidence.
4. Re-check time-sensitive provider/library behavior at activation/release gates.

### 3.1 Current dated evidence — 2026-08-28

- **Node 24** remains LTS.
- **Next.js:** repository pins 16.3.0, but the 2026-08-25 security release directs Active-LTS 16.3 users to **16.3.3** for two Critical-severity fixes. G00 must patch the base before write-heavy production fan-out.
- **Better Auth:** current stable evidence is **1.7.1**. The old v1.6 snapshot is no longer proof. P14 must pin the then-current stable version and inspect actual generated PostgreSQL schema.
- **PostgreSQL:** retain major 18; current point-release evidence is 18.6.
- **Drizzle:** stable evidence remains 0.45.x (`0.45.2`); 1.0 remains RC/pre-release. Do not adopt RC merely because newer examples use it.

Dated source detail lives in the Issue #58 evidence artifact.

## 4. Web/runtime

Use one Next.js application as the initial modular-monolith web/API runtime.

Rules:
- server components where useful, not dogmatically;
- interactive mail workspace may use client state where required;
- Route Handlers/BFF own server authorization/provider boundaries;
- provider credentials never move to browser JS;
- strict TypeScript is not runtime validation.

### Security pre-wave

Before any production-feature branch fans out:

```text
patch accepted Next 16.3 line
-> update directly coupled package resolution as needed
-> pnpm verify
-> Playwright smoke
-> exact-head CI
```

No unrelated upgrade sweep belongs in that gate.

## 5. UI implementation

Tailwind default tokens are not Lunowa design authority. Repeated choices become semantic CSS/design tokens.

Use shadcn/ui primitives only where they fit the accepted design; copied components are owned code and must be adapted.

Do not add a global state library by default. Start with URL/search params, React state/context and selective query/mutation state.

### Composer

The current v1 CORE path is contextual text Reply / Reply All + explicit immediate Send.

Any rich-text editor choice is a focused implementation spike and must pass:
- Japanese IME behavior;
- email-appropriate serialization/paste;
- keyboard/accessibility;
- minimal necessary formatting;
- maintenance/bundle cost.

Do not let editor selection pull Forward/Send Later/full Compose parity into scope.

## 6. Authentication and mailbox authorization

Keep two systems separate:

```text
Lunowa application session
!=
Connected mailbox authorization
```

Use Better Auth for application identity/session only after P14 proves the current UUID/PostgreSQL contract.

Mailbox credentials belong to Lunowa `ConnectedAccount` provider/credential services, not to Better Auth's social-account table as provider-sync authority.

Before real-account beta:
- refresh tokens server-side only;
- encrypt long-lived token material at the application boundary before durable storage;
- keys separated from DB/repository;
- credential version/rotation path;
- no token logging;
- user + ConnectedAccount ownership rechecked for lookup/use;
- reconnect/revoke/delete semantics explicit.

## 7. Persistence

Use PostgreSQL 18 as the durable application store.

Use Drizzle ORM + Drizzle Kit with these rules:
- exact ORM/Kit/driver versions pinned by the task;
- inspect generated SQL;
- committed SQL migrations for production;
- real DB constraints for ownership/uniqueness/referential integrity;
- transactions where invariants require them;
- production Responsibility migrations blocked until P15 L2 freeze.

Recent Drizzle defects reinforce executable proof; they do not by themselves require abandoning Drizzle.

No Redis at bootstrap. Add another store only from measured need.

## 8. Durable jobs / Trigger.dev

Trigger.dev remains the initial managed durable execution runtime when required.

It owns **execution attempts**, not Product/domain truth.

PostgreSQL/domain owns:
- provider-message uniqueness and sync cursor truth;
- Responsibility application idempotency;
- Temporal Contract/trigger current version and cancellation;
- accepted state/evidence revision;
- SendOperation duplicate prevention/reconciliation.

Current Trigger.dev v4 evidence matters:
- raw string idempotency keys default to `run` scope from v4.3.1;
- `global` keys are still task/environment scoped;
- keys expire by default after 30 days unless configured;
- failed runs clear their idempotency key.

Therefore an idempotency key is optimization/execution coordination, not the only durable promise. Any use must specify key composition, scope, TTL and stale/current validation.

## 9. Gmail first-provider stack

Use Gmail API rather than IMAP for the first vertical slice.

Pattern:

```text
OAuth ConnectedAccount
-> bounded initial sync
-> users.watch / Cloud Pub/Sub signal
-> authenticate + acknowledge push quickly
-> durable reconciliation
-> history.list from persisted current cursor
-> normalize/upsert idempotently
-> commit evidence
-> advance cursor only after required local durability
```

Current provider oracles:
- renew `watch` before expiration; Google requires at least every 7 days and recommends daily;
- notifications may be delayed/dropped and have a one-event/second/user max rate;
- periodic safety reconciliation is mandatory;
- stale `startHistoryId` / HTTP 404 enters full-sync recovery;
- background access requires offline OAuth/refresh-token handling;
- push payload is never direct Responsibility authority.

Request only the narrowest scopes required by implemented behavior.

### Public release boundary

Google OAuth verification/restricted-scope security assessment is a **release gate**, not a reason to block local/private complete-loop implementation. It must still be completed before public release where the actual chosen scopes/deployment require it.

## 10. Microsoft

Microsoft Graph remains a future provider boundary. It is not a current Minimum Complete Delegation Loop prerequisite and must not enter the initial implementation graph without a separate scope decision.

## 11. AI runtime

Use official OpenAI SDK + Responses API + Structured Outputs for bounded candidate interpretation after deterministic source/reducer contracts exist.

Rules:
- one provider initially;
- current model selected by eval evidence, not architecture permanence;
- minimum authorized context;
- application/source/provenance/evidence-revision validation after structured output;
- model output never owns auth, provider facts, admission, identity/effects, tracking/defer, send permission or Temporal effects;
- Source/manual communication works when AI is unavailable.

### Data control activation gate

`store: false` is not equivalent to Zero Data Retention.

Before production email interpretation:
- re-read current OpenAI data controls;
- know the organization/project retention mode;
- use `store: false` where appropriate;
- avoid raw mail/prompt/output logging by default;
- avoid ZDR-incompatible features if ZDR is required;
- record exact model/config/data-control basis in evidence.

## 12. Search

Start with authorized PostgreSQL exact/full-text search and `pg_trgm` where useful.

No vector database initially. Semantic retrieval, if later justified, remains retrieval only and never Responsibility identity authority.

Exact Source search is current CORE. Natural-language Q&A/search remains conditional until separately activated.

## 13. Testing / release verification

Every implementation task should choose from:
- Vitest unit/domain;
- React Testing Library;
- Playwright browser/E2E;
- real PostgreSQL 18 integration tests;
- provider contract/integration evidence;
- generated SQL inspection;
- exact-head CI.

For user-visible async operations, test request/pending/accepted/failure/ambiguous/reconciliation states rather than only happy-path outputs.

Visual references remain subordinate to textual Product/UI authority.