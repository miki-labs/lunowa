# Lunowa Initial Technology Stack

## Status

**Accepted initial implementation stack; activation/version evidence refreshed 2026-08-28 for Issue #58.**

This file selects replaceable infrastructure. It is not proof that a dependency is installed or a capability is active. Exact installed versions live in `package.json` / `pnpm-lock.yaml`; current activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

Related:

- `ARCHITECTURE.md`;
- `CONTRACTS.md`;
- `IMPLEMENTATION-PLAN.md`;
- `IMPLEMENTATION-GRAPH.md`;
- ADRs 0004–0009;
- `research/issue-58-implementation-graph-evidence-2026-08-28.md`.

## 1. Current repository fact

At baseline `9869d7cdee2559b00d73203dec40d92bc90f537f`, production dependencies remain bootstrap-only: Next.js, React and next-intl. Better Auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev and OpenAI SDK are not activated.

```text
accepted stack != installed capability != configured integration != implemented Product
```

## 2. Accepted stack

| Concern | Initial choice | Activation rule |
|---|---|---|
| Runtime | Node.js 24 LTS | active bootstrap; stay patched |
| Package manager | pnpm | active |
| Language | strict TypeScript | active |
| Web framework | Next.js 16.x App Router | G00 patches accepted 16.3 security baseline before feature fanout |
| UI | React 19.x | active with chosen Next line |
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
3. Patch versions are dated operational evidence, not Product semantics.
4. Re-check volatile vendor behavior at activation/release gates.
5. Do not infer a stable release from an unreleased repository `main` package version.

### Current dated evidence — 2026-08-28

- Node 24 remains LTS.
- repo Next.js `16.3.0` is below the Aug-25 Active-LTS security baseline `16.3.3`; G00 must patch first.
- React remains on the React 19.x family used by the accepted Next line; repo currently uses 19.2.7.
- Better Auth changelog latest stable is `1.7.2` (2026-08-26); P14 still rechecks/pins current stable at execution.
- PostgreSQL major 18 remains accepted; current point release is 18.6.
- Drizzle GitHub Releases still marks `0.45.2` as latest stable release; a higher package version on repository `main` is not release evidence. Recent open migration/introspection defects reinforce executable proof.
- Trigger.dev current changelog is in the 4.5 line (`4.5.12` on 2026-08-20); it remains execution infrastructure, not Product/domain authority.

Source detail lives in the dated Issue #58 evidence file.

## 4. Web/runtime — G00

Use one Next.js application as the initial modular-monolith web/API runtime.

Before write-heavy production-feature branches fan out:

```text
patch accepted Next 16.3 line
-> update directly coupled resolution only as needed
-> pnpm verify
-> Playwright smoke
-> exact-head CI
```

No unrelated dependency sweep or major framework migration in G00.

Route Handlers/BFF own authenticated server/provider boundaries. Provider credentials never enter browser JavaScript. TypeScript does not replace runtime validation.

## 5. UI implementation

Tailwind defaults are not Lunowa design authority. Repeated Product visual decisions become semantic tokens.

Use shadcn primitives only where they fit the frozen UI contract. No global state framework by default; start with URL/search params, React state/context and selective query/mutation state.

Current composer path is contextual text Reply / Reply All + explicit immediate Send. Any editor choice must pass Japanese IME, email serialization/paste, keyboard/accessibility and maintenance/bundle tests without pulling Forward/Send Later/full Compose into scope.

WCAG 2.2 AA is the implementation baseline owned by the UI contract; relevant current criteria include Focus Not Obscured (Minimum), Target Size (Minimum), Accessible Authentication (Minimum) and Status Messages.

## 6. App auth vs mailbox authorization

```text
Lunowa application session != Connected mailbox authorization
```

Better Auth owns application identity/session after P14 proof. Gmail OAuth/token authority stays in Lunowa ConnectedAccount/provider services, never Better Auth social-account rows.

- G10 owns app-auth User/session schema only.
- G19 owns provider-neutral Source/account persistence after G10 + P13 PASS.
- G20 consumes G19 for live Gmail OAuth/watch/history/sync.

## 7. OAuth/token security

Before the **first durable persistence of a real Google token**:

- store it server-side and encrypted at rest;
- keep cryptographic key/secret separate from ordinary DB/repository data;
- never log token material;
- scope lookup/use by authenticated user + ConnectedAccount ownership;
- handle invalidation/revocation explicitly;
- revoke and permanently delete tokens when no longer needed where supported.

A bounded non-persistent OAuth protocol spike may avoid durable token storage. Plaintext durable token storage is never an accepted intermediate phase.

R90 owns broader production key-rotation/recovery/release hardening, not permission to defer minimum secure storage.

## 8. Persistence / Drizzle

Use PostgreSQL 18 as durable application store and Drizzle ORM + Drizzle Kit with:

- exact stable ORM/Kit/driver versions pinned by each proof/activation task;
- generated SQL inspection;
- committed SQL migrations;
- database constraints for ownership/uniqueness/FKs;
- transactions where invariants require;
- no production Responsibility migration before P15 L2 freeze.

Single-writer / FK order:

```text
P14 -> G10 auth User/session schema
P13 PASS + G10 -> G19 provider-neutral Source schema
P15 PASS + G19 -> G30 Responsibility schema
G31 -> G32 Temporal persistence/runtime
G20 + G40 -> G50 Draft/initial SendOperation request schema
G50 + G31 -> G51 provider dispatch/reconciliation transitions
```

A production migration may not reference proof-only fixture tables. No Redis at bootstrap.

## 9. Durable jobs / Trigger.dev

Trigger.dev is initial managed execution infrastructure when required, not authority.

PostgreSQL/domain owns:

- provider-message uniqueness/cursor truth;
- Responsibility application idempotency;
- Temporal contract/trigger version/currentness;
- accepted evidence revision/state;
- SendOperation duplicate prevention/reconciliation.

Trigger.dev facilities/defaults can change. Any vendor idempotency key therefore has explicit composition/scope/TTL and remains secondary to DB/domain currentness. Current 4.x behavior around idempotency scope/retention/failed runs is an implementation oracle, not a timeless Product semantic.

## 10. Gmail first-provider stack

Use Gmail API rather than IMAP for the first vertical slice.

G19 provides provider-neutral Source repositories/schema. G20 provides live Gmail integration:

```text
OAuth ConnectedAccount
-> bounded initial sync
-> users.watch / PubSub signal
-> authenticate + acknowledge quickly
-> durable reconciliation
-> history.list from current cursor
-> normalized idempotent Source commit through G19
-> cursor advance after required durability
```

Provider oracles:

- renew `watch` before returned expiration; current guidance requires renewal at least every 7 days and recommends daily;
- notifications may be delayed/dropped, so periodic safety reconciliation remains required;
- stale `startHistoryId` / HTTP 404 enters full-sync recovery;
- background access requires offline OAuth/refresh-token handling;
- push payload never directly changes Responsibility state;
- request the narrowest scopes consistent with implemented capability.

OAuth verification/restricted-scope security assessment is R90 release work where actual deployment/scopes require it. It is not a blanket blocker to local/private complete-loop implementation.

## 11. AI runtime

Use official OpenAI SDK + Responses API + Structured Outputs for two bounded candidate paths after trusted contracts exist:

1. Responsibility interpretation candidate;
2. contextual AI reply-draft candidate.

Structured `json_schema` output constrains syntax; it does not grant semantic authority. Runtime/source/currentness validation remains mandatory.

The model never owns authentication, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, sender/recipient authority or Send permission.

### Data-control activation gate

`store: false` is not synonymous with Zero Data Retention.

Before production email AI use:

- re-read current OpenAI data controls;
- record actual org/project retention mode;
- use minimum authorized context;
- use `store:false` where appropriate;
- avoid raw mail/prompt/output logging by default;
- verify ZDR eligibility/settings/feature compatibility if ZDR is required;
- record model/config/data-control basis in evidence.

Interpretation and drafting use separate schemas/evals. Manual Source/Reply remains available if AI fails.

## 12. Search / attachments

Authorized **exact Source search is V1 CORE** and belongs to G21. Start with PostgreSQL indexing/full-text plus `pg_trgm` where useful. No vector DB initially.

Natural-language/semantic retrieval remains conditional and must not be advertised until activated. Similarity is never Responsibility identity authority.

Authorized attachment evidence access/open/download/provider fallback is CORE. Rich native preview is not.

## 13. Testing / verification

Tasks select appropriate evidence from:

- Vitest;
- React Testing Library;
- Playwright;
- real PostgreSQL 18 integration/concurrency tests;
- generated SQL inspection;
- real provider contract/integration evidence;
- exact-head CI.

Async/external effects test request, pending, accepted, failure, ambiguity and reconciliation—not only happy path. Visual references remain subordinate to textual Product/UI authority.
