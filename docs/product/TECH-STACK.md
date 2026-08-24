# Lunowa Initial Technology Stack

## Status

**Accepted for initial implementation.**

**Last externally verified:** 2026-08-19

This document records the initial implementation stack for Lunowa. It is deliberately conservative: choose mature, legible, replaceable technology for non-differentiating concerns and spend custom engineering on Lunowa's product-specific **Responsibility interpretation/reduction, attention, trust, and communication experience**.

This is not permission to install every listed dependency on day one. The activation phase for each item matters.

Responsibility semantics are not defined by technology choices. For that scope use `responsibility/` and ADR 0008.

Related sources:

- `ARCHITECTURE.md` — product boundaries and invariants;
- `DATA-MODEL.md` — durable data concepts;
- `CONTRACTS.md` — logical provider/AI/Responsibility/scheduler/search/send contracts;
- `IMPLEMENTATION-PLAN.md` — staged execution;
- `responsibility/README.md` — Responsibility semantic source map;
- `../decisions/0004-web-runtime-and-ui-stack.md`;
- `../decisions/0005-auth-and-persistence-stack.md`;
- `../decisions/0006-provider-sync-and-background-runtime.md`;
- `../decisions/0007-initial-ai-runtime.md`;
- `../decisions/0008-responsibility-state-is-orthogonal.md`.

---

## 1. Accepted stack at a glance

| Concern | Initial choice | Activation |
| --- | --- | --- |
| Runtime | Node.js 24 LTS | Phase 0 |
| Package manager | pnpm | Phase 0 |
| Language | TypeScript, strict mode | Phase 0 |
| Web framework | Next.js 16.x, App Router | Phase 0 |
| UI runtime | React 19.x as supported by chosen Next.js release | Phase 0 |
| Styling | Tailwind CSS 4 | Phase 0/1 |
| Reusable UI | shadcn/ui primitives/components + Lucide icons | Phase 1 |
| Internationalization | next-intl | Phase 0/1 |
| Client server-state | TanStack Query v5, selectively | Phase 1/2 |
| Runtime validation | Zod | Phase 1/2 |
| App authentication/session | Better Auth stable line, initially v1.6 family | Phase 2/3; spike first |
| Database | PostgreSQL 18 | Phase 2 |
| Hosted PostgreSQL | Neon | Phase 2; local Postgres remains supported |
| ORM/query layer | Drizzle ORM | Phase 2 |
| Migrations | Drizzle Kit + committed SQL migrations | Phase 2 |
| Web/API hosting | Vercel | Phase 0/1 preview; production later |
| Durable jobs/scheduling | Trigger.dev Cloud initially | Phase 3; Temporal Contracts in Phase 5 |
| Gmail | Gmail API + Cloud Pub/Sub + `history.list` reconciliation | Phase 3 |
| Microsoft | Microsoft Graph v1.0 + change notifications + delta queries | Phase 8 |
| AI transport | Official OpenAI SDK + Responses API | Phase 6 |
| AI output contract | Structured Outputs / JSON Schema + application validation | Phase 6 |
| Search v1 | PostgreSQL full-text search + `pg_trgm` where useful | Phase 7 |
| Unit/domain tests | Vitest | Phase 0 onward |
| React component tests | React Testing Library | Phase 1 onward |
| Browser/E2E/visual tests | Playwright | Phase 1 onward |
| Observability | structured server logs first; add tooling only when justified | Phase 3+ |

---

## 2. Version policy

### 2.1 Do not freeze stale patch versions in durable docs

Record major/support lines rather than a permanent patch. Bootstrap installs the latest stable, security-patched release inside the accepted line and commits exact resolution in `pnpm-lock.yaml`.

Examples from the 2026-08-19 validation snapshot:

- Node: use **24 LTS**, not Node 26 Current for production bootstrap;
- Next.js: use the current patched **16.x** stable line rather than freezing an old patch;
- Better Auth: use the current stable line rather than a beta merely because it is newer.

Security-relevant framework/provider SDK updates should be evaluated promptly.

### 2.2 Runtime compatibility beats novelty

Do not upgrade a major runtime/framework simply because a newer Current/preview release exists. Prefer supported LTS/stable combinations unless a measured product requirement says otherwise.

---

## 3. Web/runtime decision

### 3.1 Node.js 24 LTS

Use Node.js 24 LTS as the server baseline. This was externally validated on 2026-08-19; re-check current support/security status when implementation/release materially depends on it.

### 3.2 Next.js 16.x App Router

Use one Next.js application as the initial modular-monolith web/API runtime.

Why:

- strong fit for responsive interactive workspace + server routes;
- Vercel deployment path;
- Node-compatible Route Handlers for OAuth/webhooks/provider APIs;
- React 19.x support in accepted line;
- avoids separate frontend/backend deployment before evidence requires it.

Use Server Components where they reduce work, but do not force server rendering into highly interactive mail-workspace state.

### 3.3 TypeScript strict

Use strict TypeScript. Provider payloads, webhook bodies, AI outputs, URL/query inputs, and persistence boundaries remain untrusted at runtime and require validation; TypeScript is not runtime validation.

### 3.4 pnpm

Use pnpm and commit `pnpm-lock.yaml`.

Do not introduce a monorepo during Phase 0 without a demonstrated package-boundary need.

---

## 4. UI and design implementation

### 4.1 Tailwind CSS 4

Use Tailwind CSS 4 for implementation of the committed visual system.

Default Tailwind tokens are not Lunowa's design system. Expose repeated brand/projection/spacing decisions through semantic CSS variables/tokens.

### 4.2 shadcn/ui as reusable implementation material

Use shadcn/ui components/primitives where they fit, e.g. buttons, dialogs/sheets, menus, tooltips, tabs, popovers, selects, resizable panes, scroll areas, form controls.

Treat copied components as owned implementation code and adapt to Lunowa design. Do not let default shadcn appearance redefine the product.

Use Lucide-compatible iconography unless a bespoke brand asset is required.

### 4.3 Rich-text composer

Do not build a full rich-text editor from raw `contenteditable` by default.

The exact editor library is a Phase-1 implementation spike. Evaluate a mature option (for example Tiptap or Lexical) against:

- Japanese IME correctness;
- paste from Gmail/Office/web;
- email-suitable HTML serialization;
- selection/keyboard behavior;
- only required formatting;
- accessibility;
- bundle/maintenance cost.

Choose the smallest mature option that passes actual composer tests.

### 4.4 next-intl from the beginning

Use next-intl so Lunowa-owned UI strings are not hard-coded Japanese throughout components.

Do not translate provider/user mail content. Internationalization applies to Lunowa UI copy, formatting, dates, accessibility labels.

### 4.5 TanStack Query selectively

Use TanStack Query where caching, mutation state, invalidation, optimistic interaction, or background refresh materially helps. Do not wrap every server read automatically.

### 4.6 No global-state framework by default

Start with URL/search params, React state/context, and TanStack Query. Add another global store only after concrete cross-tree state pain appears.

### 4.7 Responsibility projection guardrail

UI fixtures/components may represent:

```text
MY_TURN
WAITING
LATER
DONE
REVIEW
NONE
```

but these are deterministic projections. Do not create a client-side canonical seven-state lifecycle just because it is convenient for rendering.

---

## 5. Authentication and mailbox authorization

### 5.1 Separate Lunowa identity from mailbox authorization

Do not collapse:

1. application authentication — who is signed in?;
2. connected mailbox authorization — which mailbox granted which mail capabilities?

Use Better Auth for Lunowa sessions/identity, while Gmail/Microsoft credentials remain in Lunowa-owned `ConnectedAccount`/provider boundaries.

This supports multiple accounts, independent revocation/reconnect, provider-specific sync state, and safer credential handling.

### 5.2 Better Auth usage

Use the current stable Better Auth line with Drizzle, subject to a focused spike before production dependence.

Required behavior includes server-side session validation, explicit account-linking semantics, avoiding unnecessary provider-token persistence for auth-only flows, and never using the auth library's provider-account table as authoritative mailbox credential state.

The 2026-08-19 validation found Better Auth's then-current docs did not imply mailbox-token encryption should be assumed. Re-check current official behavior at implementation time.

### 5.3 Mailbox OAuth flow

Provider mailbox authorization is server-side/application-owned behind provider/credential services.

Google/Microsoft flows should use provider-supported authorization libraries/flows; request background/offline access only when product capability requires it.

### 5.4 OAuth token protection

Before real-account beta:

- refresh tokens never exposed to browser JS;
- long-lived token material encrypted at application boundary before DB persistence;
- encryption key separate from DB/repo;
- key/version metadata supports rotation;
- removal revokes/deletes credentials where supported;
- no token logging;
- token lookup scoped by authenticated user + ConnectedAccount ownership.

### 5.5 Google restricted-scope launch risk

The 2026-08-19 validation identified Gmail restricted-scope verification/security-assessment planning as a material launch dependency for a server-side full mail client.

Re-check current official Google requirements, timelines, test-user rules, and costs before public beta. Request the smallest scopes consistent with validated product needs.

---

## 6. Persistence

### 6.1 PostgreSQL 18

Use PostgreSQL as Lunowa's durable system of record.

Strong fit for:

- user/account/scope ownership;
- provider identifiers/uniqueness;
- Conversation/Message/Responsibility relationships;
- Responsibility transition/provenance/evidence-revision state;
- transactional changes;
- Temporal Contracts;
- draft/send idempotency;
- initial full-text search.

Use PostgreSQL 18 for new environments under the accepted stack; re-check managed-host support when provisioning.

### 6.2 Neon as initial hosted PostgreSQL

Use Neon for managed development/preview/initial hosted environments while preserving ordinary PostgreSQL portability and local/Docker Postgres support.

Do not couple Lunowa to Neon Auth or proprietary data-model semantics.

### 6.3 Drizzle ORM + Drizzle Kit

Use Drizzle as TypeScript SQL/query/schema layer and Drizzle Kit for migrations.

Rules:

- committed migrations for production schema changes;
- no ad-hoc `push` as production migration process;
- database constraints for real uniqueness/referential invariants;
- transactions for justified multi-row invariants;
- ORM calls remain behind appropriate repository/domain boundaries.

Responsibility schema design must follow ADR 0008 and canonical oracles. Drizzle convenience is not permission to collapse the model to one enum/owner/deadline.

### 6.4 No Redis at bootstrap

Use PostgreSQL + existing framework/session/runtime primitives first. Add Redis only after measured coordination/cache/rate-limit needs justify another data service.

---

## 7. Hosting and deployment

### 7.1 Vercel for web/API

Use Vercel initially for Next.js web/API and provider/webhook HTTP endpoints.

Keep durable/long-running orchestration outside request-bound Functions; function duration is not Temporal Contract reliability.

### 7.2 Region/data locality

Choose web/database regions intentionally when real data activates. Do not hard-code a region before current provider availability and target-user latency/privacy needs are checked.

### 7.3 Cost posture

Early hosted costs can begin low, but free tiers/pricing are not permanent architecture facts. Re-check Vercel/Neon/Trigger.dev plans before launch or any decision dependent on a limit/price.

---

## 8. Durable jobs and Temporal Contracts

### 8.1 Trigger.dev initial choice

Use Trigger.dev Cloud as the initial durable job runtime when background work activates.

Activation:

- Phase 1 fake UI: absent;
- Phase 3 Gmail: bounded sync/reconciliation where beneficial;
- Phase 5: durable waits/scheduling for Temporal Contracts.

The 2026-08-19 selection was based on durable waits/idempotency/TypeScript fit and avoiding a custom queue/scheduler. Re-check current product/runtime/pricing behavior before production activation.

### 8.2 Trigger.dev is execution, not authority

The database/trusted domain remains authoritative for:

- current Temporal Contract/trigger state;
- current evidence revision;
- accepted Responsibility state;
- supersession/cancellation;
- attention/resurfacing evidence.

A Trigger.dev run is an execution attempt. Before effects it reloads/re-authorizes/revalidates current state and rejects stale work.

Do not model `lifecycle state` as a job-system-owned field.

### 8.3 Reconciliation remains required

Periodically reconcile:

- overdue Temporal Contracts;
- provider sync gaps;
- expired/missing provider watches/subscriptions;
- ambiguous/failed send operations where relevant.

Durable execution does not remove reconciliation.

---

## 9. Provider integrations

### 9.1 Gmail first

Use Gmail API, not IMAP, for the first real-provider vertical slice.

Pattern:

```text
Gmail mailbox
 -> users.watch / Pub/Sub signal
 -> webhook acknowledge
 -> durable sync
 -> history.list from stored cursor
 -> normalize/upsert idempotently
 -> persist evidence + new sync cursor
```

Notifications are reconciliation signals, not authoritative Responsibility events.

The 2026-08-19 snapshot recorded watch/history/offline-access constraints. Re-check current official Google guidance at implementation time.

### 9.2 Microsoft Graph second

Use Microsoft Graph production APIs behind the same provider contract.

Pattern:

```text
Microsoft mailbox
 -> change notification
 -> webhook validate/ack
 -> durable sync
 -> delta query using saved token
 -> normalize idempotently
 -> persist evidence + delta state
```

Use current lifecycle/missed-notification recovery mechanisms where supported. Here “lifecycle notification” is Microsoft subscription terminology, not Lunowa Responsibility lifecycle semantics.

### 9.3 Provider SDK policy

Use current official/provider-supported SDKs where they reduce protocol/auth/error work. Keep SDK types inside adapters.

---

## 10. AI runtime

### 10.1 Initial provider/runtime

Use official OpenAI SDK + Responses API for the initial AI interpretation runtime under ADR 0007.

Do not add a generic multi-provider AI framework during Phase 6. A thin application-owned interpretation interface is sufficient.

### 10.2 Structured Outputs

Use Structured Outputs / JSON Schema for the bounded candidate interpretation contract in `CONTRACTS.md`, followed by trusted application/source/provenance validation.

Schema-conformant output is not accepted Responsibility state.

### 10.3 Model selection is eval-driven

Do not hard-code a permanent model name into architecture.

At Phase 6:

1. choose a small set of current viable cost/quality candidates;
2. run canonical Responsibility extraction/interpretation evals + holdout;
3. select the lowest-cost candidate satisfying accepted quality/safety/latency gates;
4. keep model/config identifiers observable/configurable;
5. rerun relevant evals before material model/prompt/schema changes.

The eval target is not an old `extraction/lifecycle` label set. Use layered canonical views such as zoning, acts/claims, obligation-bearer, temporal extraction, provenance, uncertainty, robustness, then downstream admission/identity/safety/projection tests at their owning layer.

### 10.4 Sensitive email data / retention

The accepted initial ADR uses `store: false` for interpretation requests where supported/appropriate. Provider data-control behavior is time-sensitive: verify current official OpenAI retention/data-control documentation immediately before production activation and do not rely permanently on the 2026-08-19 snapshot.

Lunowa-owned accepted state/provenance remains product source of truth.

### 10.5 AI authority remains bounded

The model does not own:

- authentication/authorization;
- mailbox/account scope;
- provider-observed facts;
- accepted Responsibility admission/identity/effects;
- live tracking/defer/hiding;
- Temporal Contract firing;
- send permission;
- destructive/high-impact provider actions.

> **AI understands; trusted rules decide accepted Responsibility state.**

---

## 11. Search

### 11.1 Start with PostgreSQL

Initial search uses authorized PostgreSQL data with ordinary indexes, full-text search, `pg_trgm` where useful, and explicit user/account/scope predicates.

Result types remain product-shaped: Conversation, Message, Person, File, and intentionally designed Responsibility/action results when needed.

### 11.2 No vector database initially

Do not add vector/search-cluster infrastructure before real queries demonstrate a gap.

If semantic retrieval later proves useful, `pgvector` is the first low-operations candidate when performance/scale suffices. Embeddings are retrieval indexes, not Responsibility identity authority or source of truth.

---

## 12. Testing and visual verification

### 12.1 Vitest

Use Vitest for fast unit/domain tests, especially:

- Responsibility admission/identity/effect reducer;
- deterministic Conversation projection;
- obligation/actionability/partial-completion rules;
- Temporal Contract guards;
- provider normalization/semantic chronology helpers;
- AI schema/source validation;
- send idempotency/reconciliation helpers.

Canonical truth comes from `docs/product/responsibility/` scenarios/transitions, not from a hand-written old lifecycle state machine.

### 12.2 React Testing Library

Use component tests when behavior is clearer below browser level. Avoid overspecifying implementation details.

### 12.3 Playwright

Use Playwright for core browser flows, responsive interaction, compose/draft preservation, row vs status-chip behavior, projection-specific Moment flows, search/context/preview, keyboard/accessibility, and approved visual regression baselines.

Generated design images are design input, not pixel-perfect semantic goldens.

### 12.4 Canonical verification path

```text
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm verify
```

Recommended `verify`: typecheck + lint + unit/component tests + production build. Keep targeted browser/E2E/visual verification explicit based on runtime cost and change type.

---

## 13. Validation dependencies before expensive implementation

### 13.1 Auth spike

Before production Better Auth dependence, verify current Next.js/session behavior, Drizzle integration, account linking/token persistence, logout/revocation, protected server authorization.

Do not contort mailbox authorization/domain ownership to fit the session library.

### 13.2 Phase-1 rich-text/IME spike

Verify Japanese IME, paste, formatting, serialization, keyboard behavior before committing to an editor dependency.

### 13.3 Google public-beta verification plan

Before public beta uses Gmail restricted scopes, verify current OAuth verification/security-assessment requirements, timeline, test-user limits, privacy/domain requirements, expected cost.

### 13.4 Phase-2 Responsibility schema gate

Before migrations:

- read ADR 0008 + Responsibility decisions/audit/oracles;
- map the proposed schema to fixed semantic dimensions;
- prove parallel/conditional/historical/partial-completion cases;
- prove source due vs user target/resurface separation;
- prove stale evidence and composite effects can be represented;
- reject designs that recreate the old single lifecycle model or generic workflow engine.

---

## 14. Deliberately rejected/deferred choices

| Choice | Current decision |
| --- | --- |
| Microservices | Reject initially; modular monolith is cheaper/sufficient. |
| Separate Node API service | Reject initially; Next.js handles HTTP boundaries until evidence requires separation. |
| Node Current release as production baseline | Reject; use accepted LTS line. |
| Preview/experimental ORM track | Reject without need. |
| Supabase as all-in-one platform | Not selected; current explicit auth/jobs/provider boundaries are cleaner. |
| Supabase Queues/Cron as Temporal Contract runtime | Deferred; selected durable runtime currently fits better. |
| Redis | Deferred until measured need. |
| Elasticsearch/OpenSearch/Algolia | Deferred until PostgreSQL search is insufficient. |
| Vector DB | Deferred until semantic search is validated. |
| Multi-provider AI abstraction/fallback | Deferred until reliability/cost evidence justifies it. |
| Native mobile app | Deferred; responsive web first. |
| Custom OAuth protocol implementation without provider libraries | Reject where official libraries fit. |
| Custom queue/scheduler | Reject initially; Temporal Contract reliability is too important for ad-hoc timers. |
| Generic Responsibility/workflow engine | Reject; scenario-driven minimal domain representation only. |

---

## 15. Current cost/operational envelope

The stack is intended to start cheaply while preserving escape paths.

Do not optimize pennies of infrastructure while ignoring OAuth/compliance, trust, distribution, or product-validation risk.

Free-tier/pricing/provider-retention claims are time-sensitive. Re-check them before a decision depends on them.

---

## 16. Primary external sources checked

These were evidence for the 2026-08-19 stack snapshot and must be rechecked when they materially affect implementation/release.

### Runtime / web / UI

- Node.js releases: https://nodejs.org/en/about/previous-releases
- Node.js v24 archive/LTS: https://nodejs.org/en/download/archive/v24
- Next.js blog/releases/security: https://nextjs.org/blog
- shadcn/ui Next.js installation: https://ui.shadcn.com/docs/installation/next
- Tailwind CSS docs: https://tailwindcss.com/docs/installation
- TanStack Query v5: https://tanstack.com/query/v5/docs/framework/react/overview
- next-intl App Router setup: https://next-intl.dev/docs/getting-started/app-router

### Authentication / persistence / jobs

- Better Auth Next.js integration: https://better-auth.com/docs/integrations/next
- Better Auth users/accounts/token storage/linking: https://better-auth.com/docs/concepts/users-accounts
- Better Auth OAuth: https://better-auth.com/docs/concepts/oauth
- Better Auth Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Drizzle Kit migrations: https://orm.drizzle.team/docs/kit-overview
- Neon pricing: https://neon.com/pricing
- Neon branching: https://neon.com/docs/get-started-with-neon/workflow-primer
- Neon connection pooling: https://neon.com/docs/connect/connection-pooling
- Neon changelog / Postgres support: https://neon.com/docs/changelog
- Trigger.dev wait-until: https://trigger.dev/docs/wait-until
- Trigger.dev idempotency: https://trigger.dev/docs/idempotency
- Trigger.dev pricing: https://trigger.dev/pricing

### Gmail / Microsoft

- Google OAuth web-server flow/offline access: https://developers.google.com/identity/protocols/oauth2/web-server
- Google OAuth best practices: https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- Gmail scopes: https://developers.google.com/workspace/gmail/api/auth/scopes
- Gmail push notifications/watch: https://developers.google.com/workspace/gmail/api/guides/push
- Microsoft OAuth authorization-code flow: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
- Microsoft scopes / `offline_access`: https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc
- Microsoft Graph change notifications: https://learn.microsoft.com/en-us/graph/change-notifications-overview
- Microsoft Graph message delta: https://learn.microsoft.com/en-us/graph/api/message-delta?view=graph-rest-1.0
- Microsoft Graph lifecycle notifications: https://learn.microsoft.com/en-us/graph/change-notifications-lifecycle-events

### AI / testing / hosting

- OpenAI API quickstart / Responses: https://platform.openai.com/docs/quickstart
- OpenAI data controls: https://platform.openai.com/docs/models/default-usage-policies-by-endpoint
- OpenAI API model/Structured Outputs docs: https://developers.openai.com/api/docs/models
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Vercel Node.js runtime: https://vercel.com/docs/functions/runtimes/node-js
- Vercel Function limits: https://vercel.com/docs/functions/limitations
- Vercel plans/pricing: https://vercel.com/docs/plans

---

## 17. Rule for future changes

Change the stack only when stronger product/runtime evidence justifies it.

A stack change states:

- what requirement/failure changed;
- why current option is insufficient;
- migration/operational cost;
- security/privacy impact;
- whether a smaller adapter/configuration change solves it first.

A Responsibility semantic change is **not** a technology-stack change; update the Responsibility source/ADR first, then adapt implementation technology if necessary.