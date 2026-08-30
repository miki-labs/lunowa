# Lunowa Initial Technology Stack

## Status

**Accepted initial implementation stack; activation/version evidence refreshed 2026-08-28 for Issue #58; UI reuse and hosting policy amended 2026-08-31.**

This file selects replaceable infrastructure. It is not proof that a dependency is installed or a capability is active. Exact installed versions live in `package.json` / `pnpm-lock.yaml`; activation/dependency authority is `IMPLEMENTATION-GRAPH.md` + live GitHub Issues.

Responsibility semantics remain owned by `responsibility/`.

## 1. Current repository fact

At baseline `9869d7cdee2559b00d73203dec40d92bc90f537f`, the runtime remains bootstrap-level. Next.js/React/next-intl/Tailwind/test tooling exist, but Better Auth production auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev runtime and OpenAI runtime are not activated.

```text
accepted stack != installed capability != configured integration != implemented Product
```

## 2. Accepted stack

| Concern | Initial choice | Activation rule |
|---|---|---|
| Runtime | Node.js 24 LTS | active bootstrap; stay patched |
| Package manager | pnpm | active |
| Language | strict TypeScript | active |
| Web framework | Next.js 16.x App Router | G00 patches accepted 16.3 security baseline first |
| UI | React 19.x | stay on accepted Next-compatible line |
| Styling | Tailwind CSS 4 | active; Lunowa semantic tokens in G11 |
| UI primitives | shadcn/ui current components/registry + maintained underlying primitives + Lucide | reuse-first; custom generic primitives are exceptional |
| i18n | next-intl | active |
| Client server state | TanStack Query v5 selectively | only from concrete need |
| Runtime validation | Zod or equivalent | untrusted boundaries; task-scoped activation |
| App auth/session | Better Auth current stable | P14 proof -> G10 |
| Database | PostgreSQL 18 | real proof + production foundation |
| Hosted PostgreSQL | Neon initially | hosted env only; ordinary PostgreSQL semantics |
| ORM/query | Drizzle ORM stable line | exact versions pinned/proven |
| Migrations | Drizzle Kit + committed SQL | no production `push` shortcut |
| Hosting | Cloudflare Workers | prove current Next.js compatibility before deployment freeze; hosting does not block UI-only implementation |
| Durable jobs | Trigger.dev Cloud | execution substrate only |
| First provider | Gmail API + Cloud Pub/Sub + `history.list` | one-provider v1 |
| Second provider | Microsoft Graph | not current critical path |
| AI | official OpenAI SDK + Responses API | bounded G70 lane |
| AI output | Structured Outputs / JSON Schema + app validation | candidates only |
| Search | PostgreSQL exact/full-text + `pg_trgm` if useful | exact Source search CORE |
| Unit/domain | Vitest | active |
| Component | React Testing Library | active |
| Browser/E2E | Playwright | active |
| Observability | structured logs first | expand from measured need |

## 3. Version policy

1. Prefer supported stable/LTS lines over preview/RC novelty.
2. Security patches inside the accepted line are prerequisites for production feature fanout.
3. Patch versions are dated operational evidence, not Product semantics.
4. Recheck volatile vendor behavior at activation/release gates.
5. Do not infer a stable release from an unreleased repository `main` package version.

Current dated evidence, 2026-08-28:

- Node 24 remains LTS.
- repo Next.js `16.3.0` is below the Aug-25 Active-LTS security baseline `16.3.3`; G00 patches first.
- repo React/React DOM remain 19.2.7; no speculative major change is justified.
- Better Auth changelog latest stable is `1.7.2` (2026-08-26); P14 rechecks execution-time stable.
- PostgreSQL major 18 remains accepted.
- Drizzle GitHub Releases latest stable evidence remains `0.45.2`; unreleased main is not release evidence.
- Trigger.dev current changelog is in v4.5 (`4.5.12` on 2026-08-20); exact behavior is rechecked when activated.

Detailed dated rationale lives in `research/issue-58-implementation-graph-evidence-2026-08-28.md`.

## 4. Web/runtime — G00

Use one Next.js application as the initial modular-monolith web/API runtime.

Before write-heavy feature fanout:

```text
patch accepted Next 16.3 line
-> update directly coupled resolution only as needed
-> pnpm verify
-> Playwright smoke
-> exact-head CI
```

No unrelated dependency sweep or framework-major migration in G00.

Route Handlers/BFF own authenticated server/provider boundaries. Provider credentials never enter browser JavaScript. TypeScript does not replace runtime validation.

### Cloudflare Workers hosting boundary

Cloudflare Workers is the initial hosting target. The exact Next.js-on-Workers adapter is an execution-time choice, not Product/domain authority.

Before the first deployment path is treated as accepted infrastructure:

- recheck current official Cloudflare Next.js guidance;
- run the current compatibility/check tooling against the actual Lunowa candidate;
- exercise App Router, route handlers/BFF, cookies/session behavior, `next-intl`, environment/secrets and the Neon/PostgreSQL connection path that Lunowa actually uses;
- run browser smoke against the deployed candidate;
- prefer the smallest supported adapter path that preserves the accepted Next.js application contract;
- keep Cloudflare-specific runtime details at the deployment boundary rather than leaking them into Product/domain modules.

A deployment-adapter gap does not block fixture/UI-only G11 implementation. It becomes a blocker before Lunowa depends on an unproven deployed server/runtime behavior.

Do not switch databases to D1, jobs to Cloudflare-specific orchestration, or Product architecture merely because hosting uses Cloudflare. Those changes require independent evidence and an accepted task.

## 5. UI implementation — G11

Tailwind defaults are not Lunowa design authority. Repeated Product visual decisions become semantic tokens.

### UI primitive reuse invariant

Lunowa-specific information hierarchy, Moment behavior, Responsibility projections and Product compositions are custom Product work. Generic interaction/accessibility infrastructure is not.

For a generic UI primitive or behavior, use this order:

```text
existing Lunowa component
-> current shadcn/ui component or registry implementation
-> the maintained underlying primitive/library used by or compatible with shadcn
-> another mature maintained OSS implementation
-> custom implementation only for a concrete unmet accepted requirement
```

This applies especially to dialog, menu, popover, tooltip, sheet/drawer, tabs, select/combobox, focus management, keyboard navigation, resize/split panes, scrolling/virtualization and similar non-differentiating infrastructure.

A custom generic primitive requires a concrete requirement gap recorded in the task/PR and evidence that the preferred maintained options cannot satisfy the accepted Lunowa contract without a worse material trade-off. Do not hand-roll accessibility/focus/keyboard behavior merely because custom code is easy to generate.

Using an OSS primitive never makes that library the Product/design authority. Adapt styling and compose primitives under `docs/design/` and Responsibility semantics. Avoid importing broad component suites or feature breadth that Lunowa does not need.

No global state framework by default; start with URL/search params, React state/context and selective query/mutation state.

Current composer path is contextual text Reply / Reply All + explicit immediate Send. Any editor choice must pass Japanese IME, serialization/paste, keyboard/accessibility and maintenance/bundle tests without pulling Forward/Send Later/full Compose into scope.

WCAG 2.2 AA is the implementation baseline. Material criteria include Focus Not Obscured, Target Size, Accessible Authentication and Status Messages.

## 6. Application auth vs mailbox authorization

```text
Lunowa application session != Connected mailbox authorization
```

Better Auth owns application identity/session after P14 proof. Gmail OAuth/token authority stays in Lunowa ConnectedAccount/provider services, never Better Auth social-account rows.

- G10: app-auth User/session schema only.
- G19: provider-neutral evidence/account persistence after G10 + P13 PASS.
- G20: live Gmail OAuth/watch/history/sync consuming G19.

## 7. OAuth/token security

Before the **first durable persistence of a real Google token**:

- store server-side and encrypted at rest;
- keep cryptographic key/secret separate from ordinary DB/repository data;
- never log token material;
- scope lookup/use by authenticated user + ConnectedAccount ownership;
- handle invalidation/revocation explicitly;
- revoke and permanently delete when no longer needed where supported.

A bounded non-persistent OAuth spike may avoid durable token storage. Plaintext durable token storage is never accepted.

R90 owns broader production key rotation/recovery/release hardening, not permission to defer minimum secure storage.

## 8. Persistence / Drizzle

Use PostgreSQL 18 as durable store and Drizzle ORM + Drizzle Kit with:

- exact stable ORM/Kit/driver versions pinned per proof/activation task;
- generated SQL inspection;
- committed SQL migrations;
- database constraints for ownership/uniqueness/FKs;
- transactions where invariants require;
- no production Responsibility migration before P15 L2 freeze.

Current production writer/FK order:

```text
P14 PASS -> G10 User/session
P13 PASS + G10 -> G19 evidence foundation
P15 PASS + G19 -> G30 minimal AIInterpretationRun prerequisite
                  -> G30 frozen Responsibility tables
G31 -> G32 Temporal persistence/runtime
G20 + G40 -> G50 Draft/initial SendOperation request schema
G50 + G31 -> G51 provider dispatch/reconciliation transitions
```

G19 includes current L2 upstream production prerequisites for ConnectedAccount, Conversation, Message and ParticipantIdentity plus `Conversation.semantic_evidence_revision`.

G30 creates minimal `AIInterpretationRun` prerequisite before Responsibility tables that reference it. Table existence does not activate AI; G70 owns model runtime.

A production migration may not reference proof-only fixture tables. No Redis at bootstrap.

## 9. Parallel dependency changes

`package.json` and `pnpm-lock.yaml` are serialized merge assets.

Concurrent tasks may execute in isolated worktrees/runtime namespaces, but PRs touching these files merge one at a time. Every later PR refreshes onto current accepted main, regenerates the lockfile with pnpm, reruns repository verification, and reruns task proof materially affected by dependency/version changes.

## 10. Durable jobs / Trigger.dev

Trigger.dev is managed execution infrastructure when required, not authority.

PostgreSQL/domain owns provider-message uniqueness/cursor truth, Responsibility application idempotency, Temporal currentness, accepted evidence revision/state and Send duplicate prevention/reconciliation.

Trigger.dev behavior changes over time. Any vendor key therefore has explicit composition/scope/TTL and remains secondary to DB/domain currentness.

## 11. Gmail first-provider stack

Use Gmail API rather than IMAP for the first vertical slice.

```text
G19 provider-neutral evidence repositories
-> G20 OAuth ConnectedAccount
-> bounded initial sync
-> users.watch / Pub/Sub signal
-> authenticate + acknowledge quickly
-> durable reconciliation
-> history.list
-> normalized idempotent commit through G19
-> cursor advance after required durability
```

Provider oracles:

- renew `watch` before returned expiration;
- notifications are not sole truth; periodic safety reconciliation remains required;
- stale `startHistoryId` / HTTP 404 enters full-sync recovery;
- background access requires offline OAuth/refresh-token handling;
- push payload never directly changes Responsibility state;
- request the narrowest scopes consistent with implemented capability.

OAuth verification/restricted-scope assessment is R90 release work where actual deployment/scopes require it, not a blanket local-proof blocker.

## 12. AI runtime — G70

Use official OpenAI SDK + Responses API + Structured Outputs for two bounded candidate paths after trusted contracts exist:

1. Responsibility interpretation candidate;
2. contextual editable reply-draft candidate.

Structured output constrains syntax; it does not grant semantic authority. Runtime/source/currentness validation remains mandatory.

AI never owns authentication, provider facts, Responsibility admission/identity/effects, tracking/defer, Temporal effects, sender/recipient authority or Send permission.

`store:false` is not synonymous with Zero Data Retention. Before production email AI use, re-read current data controls, record actual org/project retention mode, minimize authorized context, avoid raw logging, and verify ZDR eligibility/settings/feature compatibility if required.

Interpretation and drafting use separate schemas/evals. Manual Source/Reply remains available if AI fails.

## 13. Search / attachments

Authorized exact Source search is V1 CORE and belongs to G21. Start with PostgreSQL indexing/full-text plus `pg_trgm` where useful. No vector DB initially.

Natural-language/semantic retrieval remains conditional; similarity is never Responsibility identity authority.

Authorized attachment evidence access/open/download/provider fallback is CORE. Rich native preview is not.

## 14. Testing / verification

Use evidence appropriate to the claim:

- Vitest;
- React Testing Library;
- Playwright;
- real PostgreSQL 18 integration/concurrency tests;
- generated SQL inspection;
- real provider evidence;
- exact-head CI.

Async/external effects test request, pending, accepted, failure, ambiguity and reconciliation—not only happy path. Visual references remain subordinate to textual Product/UI authority.
