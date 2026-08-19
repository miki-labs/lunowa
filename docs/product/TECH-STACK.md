# Lunowa Initial Technology Stack

## Status

**Accepted for initial implementation.**

**Last externally verified:** 2026-08-19

This document records the initial implementation stack for Lunowa. It is deliberately conservative: choose mature, legible, replaceable technology for non-differentiating concerns and spend custom engineering on Lunowa's product-specific lifecycle, attention, trust, and communication experience.

This is not permission to install every listed dependency on day one. The **activation phase** for each item matters.

Related sources:

- `ARCHITECTURE.md` — product boundaries and invariants.
- `DATA-MODEL.md` — durable data concepts.
- `CONTRACTS.md` — logical provider/AI/scheduler/search/send contracts.
- `IMPLEMENTATION-PLAN.md` — staged execution.
- `../decisions/0004-web-runtime-and-ui-stack.md`
- `../decisions/0005-auth-and-persistence-stack.md`
- `../decisions/0006-provider-sync-and-background-runtime.md`
- `../decisions/0007-initial-ai-runtime.md`

---

## 1. Accepted stack at a glance

| Concern | Initial choice | Activation |
| --- | --- | --- |
| Runtime | Node.js 24 LTS | Phase 0 |
| Package manager | pnpm | Phase 0 |
| Language | TypeScript, strict mode | Phase 0 |
| Web framework | Next.js 16.x, App Router | Phase 0 |
| UI runtime | React 19.x as supported by the chosen Next.js release | Phase 0 |
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
| Observability | structured server logs first; add error/product tooling only when justified | Phase 3+ |

---

## 2. Version policy

### 2.1 Do not freeze stale patch versions in durable docs

This document records major/support lines rather than a permanent patch version. Bootstrap should install the latest stable, security-patched release inside the accepted line and commit the exact resolution in `pnpm-lock.yaml`.

Examples:

- Node: use **24 LTS**, not Node 26 Current for production bootstrap.
- Next.js: use the current patched **16.x** stable line. Next.js 16.3 was current as of this validation date, but security patches must be followed rather than preserving `16.3.0` forever.
- Better Auth: use the current stable line, not its v1.7 beta line merely because it is newer.

Dependency updates are implementation changes. Security-relevant framework/provider SDK updates should be evaluated promptly.

### 2.2 Runtime compatibility beats novelty

Do not upgrade a major runtime/framework simply because a newer Current/preview release exists. Prefer the supported LTS/stable combination unless a measured product requirement requires otherwise.

---

## 3. Web/runtime decision

### 3.1 Node.js 24 LTS

Use Node.js 24 LTS as the server runtime baseline.

Why:

- production LTS rather than Current;
- fully compatible with the intended Next.js/Vercel/SDK ecosystem;
- avoids introducing Node 26 Current risk without product benefit.

As of 2026-08-19, Node's official release pages identify v24 (`Krypton`) as LTS and v26 as Current.

### 3.2 Next.js 16.x App Router

Use a single Next.js application as the initial modular-monolith web/API runtime.

Why:

- strong fit for Lunowa's responsive, client-interactive workspace plus server routes;
- first-class Vercel deployment path;
- Node-compatible Route Handlers for OAuth/webhooks/provider APIs;
- mature App Router;
- React 19.2 support in the Next 16 line;
- avoids a separate frontend/backend deployment before evidence requires it.

Use Server Components where they reduce work, but do **not** force server rendering into highly interactive mail-workspace state. Keep client boundaries explicit.

### 3.3 TypeScript strict

Use TypeScript with strict checking. Provider payloads, webhook bodies, AI outputs, URL/query inputs, and persistence boundaries are still untrusted at runtime and therefore require runtime validation; TypeScript alone is not validation.

### 3.4 pnpm

Use pnpm and commit `pnpm-lock.yaml`.

Do not introduce a monorepo during Phase 0 unless the real codebase already demonstrates a need for independently versioned packages. One product repository with clear module folders is the simpler default.

---

## 4. UI and design implementation

### 4.1 Tailwind CSS 4

Use Tailwind CSS 4 for implementation of the committed Lunowa visual system.

The design references are authoritative within `docs/design/references/README.md`; default Tailwind colors/spacing are **not** the Lunowa design system. Expose repeated brand/state/spacing decisions through semantic CSS variables/tokens rather than scattering arbitrary values.

### 4.2 shadcn/ui as reusable implementation material

Use shadcn/ui components/primitives where they fit, especially for:

- buttons;
- dialogs/sheets;
- dropdown menus;
- tooltips;
- tabs;
- popovers;
- selects;
- resizable panes;
- scroll areas;
- form controls.

Treat copied shadcn components as owned source code that must be adapted to Lunowa's visual references. Do not let the default shadcn appearance redefine the product.

Use Lucide-compatible iconography unless a reference requires a bespoke brand asset.

### 4.3 Rich-text composer

Do **not** build a full rich-text editor from raw `contenteditable` primitives by default.

The exact editor library is a **Phase 1 implementation spike**, not an architectural decision. Evaluate a mature maintained editor (for example Tiptap or Lexical) against:

- Japanese IME correctness;
- paste behavior from Gmail/Office/web pages;
- HTML serialization suitable for email;
- selection/keyboard behavior;
- basic formatting only;
- accessibility;
- bundle/maintenance cost.

Choose the smallest mature option that passes the actual composer tests.

### 4.4 next-intl from the beginning

Use next-intl so user-facing product strings do not become hard-coded Japanese throughout components.

Initial implementation can ship Japanese first, but code should support later English/Spanish localization without restructuring routes/components.

Do not translate provider/user email content. Internationalization applies to Lunowa-owned UI copy, formatting, dates, and accessibility labels.

### 4.5 TanStack Query selectively

Use TanStack Query v5 for client-side server state where caching, mutation state, invalidation, optimistic interaction, or background refresh materially helps.

Do not wrap every server read in TanStack Query automatically. Server Components/Route Handlers and ordinary React state are sufficient for many paths. The mail workspace is interactive enough that a client server-state layer is useful, but it should remain purposeful.

### 4.6 No global-state framework by default

Start with:

- URL/search params for navigation state that should survive/share history;
- React state/context for local interaction state;
- TanStack Query for remote/server state.

Add Zustand or another global client store only after concrete cross-tree state pain appears.

---

## 5. Authentication and mailbox authorization

### 5.1 Separate Lunowa identity from mailbox authorization

This is a critical boundary.

Two concepts must not be collapsed:

1. **Application authentication** — who is signed into Lunowa?
2. **Connected mailbox authorization** — which Google/Microsoft mailbox has granted Lunowa which mail scopes?

Use Better Auth for Lunowa sessions/identity, but keep Gmail/Microsoft mailbox credentials in Lunowa's own `ConnectedAccount`/credential boundary and provider adapters.

Why:

- one Lunowa user can connect multiple Google accounts and multiple Microsoft accounts;
- mailbox access scopes/refresh lifecycle differ from basic sign-in identity;
- provider credentials have high sensitivity and must be revocable independently;
- a user must be able to remove one mailbox without destroying the Lunowa account;
- scope changes/reverification should not redefine user identity;
- provider-specific sync state belongs to the mailbox connection, not the auth session.

### 5.2 Better Auth usage

Use the current stable Better Auth line for application sessions, with its Drizzle adapter, **subject to a small Phase 0/2 spike before production dependence**.

Required configuration/behavior:

- validate sessions server-side at protected data/action boundaries;
- do not rely on cookie existence as authorization;
- disable accidental/implicit account merging where product behavior would surprise the user;
- if social sign-in is used, explicitly test token persistence behavior and strip/secure provider tokens that are not required after application authentication;
- do not use Better Auth's provider account table as the authoritative mailbox credential store.

Better Auth's current docs state that OAuth tokens are not encrypted by default. Therefore Lunowa must **not assume auth-library token encryption exists**.

### 5.3 Mailbox OAuth flow

Provider mailbox authorization is server-side and application-owned behind `ProviderAdapter`/credential services.

For Google:

- authorization code flow;
- request offline access when background mailbox access is required;
- request scopes incrementally and as narrowly as product capability allows;
- persist refresh credentials encrypted at rest;
- handle revocation/expiration explicitly.

For Microsoft:

- authorization code flow with PKCE where applicable;
- request `offline_access` when refresh tokens are required;
- use Microsoft-supported auth/client libraries rather than hand-building protocol details without need.

### 5.4 OAuth token protection

Provider tokens are secrets.

Requirements before real-account beta:

- never expose refresh tokens to browser JavaScript;
- encrypt refresh/access token material at the application boundary before database persistence;
- encryption key is separate from the database and source repository;
- support key/version metadata so rotation is possible;
- revoke/delete credentials when a connected mailbox is removed;
- never log token material;
- scope every token lookup by authenticated Lunowa user + ConnectedAccount ownership.

The exact KMS/key-management implementation may be staged, but plaintext long-lived mailbox refresh tokens are not an acceptable public-beta design.

### 5.5 Google restricted-scope launch risk

This is a material business/engineering constraint, not a minor integration detail.

Gmail scopes required for a real server-side mail client can be **restricted scopes**. Google's current Gmail scope documentation classifies scopes including `gmail.readonly`, `gmail.compose`, and `gmail.modify` as restricted; if restricted-scope data is stored on or transmitted through servers, Google states that a security assessment is required in addition to OAuth verification.

Consequences:

- Phase 3 development/test-user integration can proceed under Google's allowed test setup;
- public launch planning must include OAuth verification/security-assessment lead time and cost;
- request the smallest scope set consistent with the validated product;
- do not postpone this launch dependency until the week before release.

---

## 6. Persistence

### 6.1 PostgreSQL 18

Use PostgreSQL as Lunowa's durable system of record.

PostgreSQL is a strong fit for:

- relational user/account/scope ownership;
- provider identifiers and uniqueness constraints;
- conversation/message/action-item relationships;
- lifecycle transitions and audit evidence;
- transactional state changes;
- Temporal Contract records;
- draft/send idempotency;
- initial full-text search.

Use PostgreSQL 18 for new environments. Neon documented production support for PostgreSQL 18.x in 2026.

### 6.2 Neon as initial hosted Postgres

Use Neon for managed development/preview/initial hosted environments.

Reasons:

- standard PostgreSQL semantics;
- autoscaling/scale-to-zero helps a low-traffic early product;
- connection pooling supports serverless/web-function access patterns;
- database branches are useful for isolated preview/Codex development;
- low initial cost;
- portability remains materially better than adopting a proprietary data model.

Do not make Lunowa depend on Neon Auth or Neon-specific Data API semantics. Treat Neon as the managed Postgres host.

Local development should remain possible against ordinary local/Docker PostgreSQL.

### 6.3 Drizzle ORM + Drizzle Kit

Use Drizzle as the TypeScript SQL/query/schema layer and Drizzle Kit for migrations.

Reasons:

- keeps SQL concepts visible;
- works well with PostgreSQL-specific capabilities and constraints;
- lower abstraction distance for lifecycle/search queries;
- Better Auth has an official/current Drizzle adapter;
- migration SQL can remain committed and reviewable.

Rules:

- production schema changes use committed migrations;
- do not use ad-hoc `push` as the production migration process;
- use database constraints for real uniqueness/referential invariants;
- transactions own multi-row invariants where needed;
- repository/domain boundaries still matter — ORM calls must not spread arbitrarily through UI code.

### 6.4 No Redis at bootstrap

Do not add Redis merely for caching/session/queue convention.

Use PostgreSQL + framework/session primitives first. Add Redis only after a measured need such as cross-instance ephemeral coordination, rate limiting, or cache pressure cannot be solved cleanly by existing platform primitives.

---

## 7. Hosting and deployment

### 7.1 Vercel for web/API

Use Vercel initially for the Next.js application and provider/webhook HTTP endpoints.

Why:

- first-class Next.js deployment path;
- preview deployments;
- Node.js Functions with full Node API coverage;
- low operational burden for one developer.

Keep durable/long-running background orchestration outside request-bound Vercel Functions. Vercel Function duration is not the Temporal Contract reliability model.

### 7.2 Region/data locality

When real data is enabled, choose web-function and database regions intentionally to avoid unnecessary latency and cross-region traffic. Do not hard-code a region choice in architecture until the deployed Neon/Vercel availability and target-user needs are checked.

### 7.3 Cost posture

Current early-stage hosted cost can remain low:

- Vercel Hobby provides a free personal-project tier with included function usage;
- Neon Free currently includes 100 CU-hours and 0.5 GB per project and scales idle compute to zero;
- Trigger.dev Free currently provides monthly credits and limited concurrency.

Do not treat free tiers as production SLAs or permanent pricing. Re-check provider plans before launch and before architecture decisions that assume a limit/price.

---

## 8. Durable jobs and Temporal Contracts

### 8.1 Trigger.dev initial choice

Use Trigger.dev Cloud as the initial durable job runtime once real provider sync/background work begins.

Activation:

- **Phase 1 fake UI:** do not install it merely for completeness.
- **Phase 3 Gmail:** use it for bounded sync/reconciliation/background processing when beneficial.
- **Phase 5:** use durable waits/scheduling for Temporal Contract execution.

Why:

- durable `wait.until` / `wait.for` semantics;
- waiting work is checkpointed instead of consuming compute continuously;
- task-level idempotency support;
- TypeScript fit;
- avoids building a custom queue worker/scheduler system prematurely;
- self-host/open-source escape path exists if later economics/requirements justify it.

### 8.2 Trigger.dev is execution, not authority

The database remains authoritative for:

- current Temporal Contract;
- trigger status;
- lifecycle state;
- supersession/cancellation;
- resurfacing evidence.

A Trigger.dev run is an execution attempt. Before performing a state transition, it must re-read authoritative state and reject stale/superseded work.

### 8.3 Reconciliation remains required

Durable scheduling does not remove reconciliation requirements.

Implement periodic checks for:

- overdue Temporal Contracts;
- provider sync gaps;
- expired/missing provider watches/subscriptions;
- ambiguous/failed send operations where relevant.

---

## 9. Provider integrations

### 9.1 Gmail first

Use the Gmail API, not IMAP, for the first real-provider vertical slice.

Near-real-time sync design:

```text
Gmail mailbox
   -> users.watch / Cloud Pub/Sub notification
   -> webhook acknowledges quickly
   -> enqueue/signal sync work
   -> Gmail history.list from stored historyId
   -> normalize changes idempotently
   -> persist new sync cursor/state
```

Important provider facts from current Google documentation:

- `watch` responses include `historyId` and expiration;
- a watch must be renewed at least every seven days; Google recommends daily renewal;
- notification payloads are signals, not the full authoritative mailbox state;
- offline OAuth access is required when Lunowa must refresh tokens while the user is absent.

Provider notifications must be treated as **hints to reconcile**, not as the sole source of truth.

### 9.2 Microsoft Graph second

Use Microsoft Graph **v1.0** for production-facing behavior. Do not build initial product behavior on Graph beta APIs when v1.0 exists.

Sync design:

```text
Microsoft mailbox
   -> Graph change notification
   -> webhook validates/acknowledges
   -> enqueue/signal sync
   -> message delta query using saved state token
   -> normalize idempotently
   -> persist new delta state
```

Use lifecycle notifications to recover from subscription removal/missed-notification cases where supported. Microsoft explicitly recommends resynchronization/delta query after missed notification conditions.

### 9.3 Provider SDK policy

Use official/current provider SDKs where they reduce protocol/error/auth work:

- Google official Node.js API/auth libraries;
- Microsoft-supported authentication and Microsoft Graph SDKs.

Keep SDK types inside provider adapters. Lunowa domain/UI contracts must not become Google- or Graph-shaped.

---

## 10. AI runtime

### 10.1 Initial provider/runtime

Use the official OpenAI SDK and the Responses API for the initial AI interpretation implementation.

Do not add a generic multi-provider AI framework at Phase 6. A thin application-owned interface around the interpretation contract is enough to preserve testability/replacement.

### 10.2 Structured Outputs

AI interpretation must return a strict structured schema corresponding to `CONTRACTS.md` rather than free-form prose that application code parses heuristically.

Use Structured Outputs / JSON Schema for supported models, then still validate the returned application shape at the trusted boundary.

### 10.3 Model selection is eval-driven, not architecture

Do not hard-code a specific model name into durable architecture.

At Phase 6:

1. choose 1–2 current cost/quality candidates;
2. run the representative email extraction/lifecycle eval set;
3. select the cheapest model that satisfies the accepted error/latency thresholds;
4. keep the model/config identifier observable and configurable;
5. rerun relevant evals before material model/prompt/schema changes.

### 10.4 Sensitive email data / retention

Email bodies are sensitive. Use `store: false` for Responses requests by default unless a separately reviewed feature requires provider-side application-state persistence.

OpenAI's current data-control documentation states that the Responses API otherwise has application-state retention by default. Lunowa-owned persistence/provenance should remain the product source of truth.

### 10.5 AI authority remains bounded

The model does not own:

- authentication/authorization;
- mailbox scope;
- lifecycle state;
- Temporal Contract firing;
- send permission;
- destructive provider actions.

`AI understands; rules decide state` remains the invariant.

---

## 11. Search

### 11.1 Start with PostgreSQL

Initial search uses authorized PostgreSQL data with:

- ordinary indexes;
- PostgreSQL full-text search;
- `pg_trgm` for useful fuzzy matching;
- explicit scope/user/account predicates before results leave the data boundary.

Search result types remain product-shaped: Conversation, Message, Person, File.

### 11.2 No vector database initially

Do not add a vector database, Elasticsearch/OpenSearch, or hosted search service before real search queries demonstrate a gap.

If semantic retrieval later creates enough user value, prefer adding `pgvector` to the existing PostgreSQL boundary first when its performance/scale is sufficient. Embeddings are a retrieval index, not a source of truth.

---

## 12. Testing and visual verification

### 12.1 Vitest

Use Vitest for fast unit/domain tests, especially:

- lifecycle reducer;
- aggregation rules;
- Temporal Contract guard logic;
- provider normalization;
- schema validation;
- send idempotency helpers.

### 12.2 React Testing Library

Use React Testing Library where component behavior is clearer to verify below full-browser level.

Do not over-test implementation details that Playwright/user-visible checks cover better.

### 12.3 Playwright

Use Playwright for:

- core browser flows;
- responsive interaction;
- compose/draft preservation;
- row vs status-chip behavior;
- search/context/preview flows;
- accessibility-relevant keyboard behavior;
- critical visual regression screenshots.

Playwright supports `toHaveScreenshot()` and version-controlled reference screenshots. Generated design images under `docs/design/references/` are **design input**, not pixel-perfect golden files. Establish golden screenshots from the implemented app in a controlled environment after the UI is approved.

### 12.4 Canonical verification path

Bootstrap should create scripts along these lines:

```text
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm verify
```

Recommended `pnpm verify` baseline:

```text
typecheck + lint + unit/component tests + production build
```

Run targeted Playwright/E2E/visual tests in CI or explicitly for UI-affecting changes. Whether all E2E runs are included in the local `verify` command should be decided from actual runtime cost after bootstrap.

---

## 13. Validation dependencies before expensive implementation

### 13.1 Phase 0 auth spike

Before relying on Better Auth for production sessions, verify:

- Next.js 16 route/proxy/session behavior;
- Drizzle/Postgres schema integration;
- explicit account-linking behavior;
- whether auth-only social sign-in can avoid unnecessary long-lived provider-token persistence cleanly;
- logout/session revocation;
- protected Route Handler authorization.

If Better Auth creates awkward coupling between app identity and mailbox OAuth, keep the mailbox OAuth custom as specified and replace only the application-session layer. Do not contort the domain to fit an auth library.

### 13.2 Phase 1 rich-text/IME spike

Before committing to an editor dependency, verify Japanese IME, paste, formatting, serialization, and keyboard behavior.

### 13.3 Phase 3 Google verification plan

Before a public beta depends on Gmail restricted scopes, verify current Google OAuth verification and security-assessment requirements, timeline, test-user limits, privacy-policy/domain requirements, and expected cost.

This is a launch dependency and should be tracked as such.

---

## 14. Deliberately rejected/deferred choices

| Choice | Current decision |
| --- | --- |
| Microservices | Reject initially; modular monolith is cheaper and sufficient. |
| Separate Node API service | Reject initially; Next.js Node runtime handles product HTTP boundaries until evidence requires separation. |
| Node 26 Current | Reject for bootstrap production baseline; use Node 24 LTS. |
| Prisma preview/next-generation track | Reject; no need to take preview ORM risk. |
| Supabase as all-in-one platform | Not selected; we do not currently need its combined Auth/Storage/Realtime surface, and keeping auth/jobs/provider boundaries explicit is cleaner. |
| Supabase Queues/Cron as Temporal Contract runtime | Deferred; current Trigger.dev fit reduces custom consumer/scheduler work. |
| Redis | Deferred until measured need. |
| Elasticsearch/OpenSearch/Algolia | Deferred until PostgreSQL search is demonstrably insufficient. |
| Vector DB | Deferred until semantic search is validated. |
| Multi-provider AI abstraction/fallback | Deferred until reliability/cost evidence justifies operating multiple evaluated providers. |
| Native mobile app | Deferred; responsive web first. |
| Custom OAuth protocol implementation without provider libraries | Reject where official libraries cover the need. Lunowa still owns the mailbox authorization/domain boundary. |
| Custom queue/scheduler | Reject initially; Temporal Contracts are too important to base on ad-hoc process timers. |

---

## 15. Current cost/operational envelope

The stack is intentionally capable of starting cheaply while leaving production escape paths:

- web preview/early hosting can begin on Vercel's included tiers;
- Neon can start on its free tier and scale by usage;
- Trigger.dev can be absent during Phase 1 and activated on its free/low-cost tier later;
- OpenAI cost does not exist until Phase 6 and must be measured per interpreted conversation/task before pricing decisions;
- Gmail OAuth verification/security assessment may become a **larger non-code launch cost/risk than the hosting stack** and must be planned early.

Do not optimize pennies of infrastructure while ignoring OAuth/compliance, trust, distribution, or product-validation risk.

---

## 16. Primary external sources checked

These links are evidence for time-sensitive external facts. Re-check them when they materially affect implementation or release.

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

Change this stack when stronger product/runtime evidence justifies it, not to chase fashion.

A stack change should state:

- what requirement/failure changed;
- why the current option is insufficient;
- migration/operational cost;
- security/privacy impact;
- whether a smaller adapter/configuration change would solve the problem first.
