# Issue #58 — Implementation Graph Evidence — 2026-08-28

## Status

Dated external/repository evidence for Issue #58. **Evidence/rationale, not timeless Product truth.** Volatile facts must be rechecked when the actual activation/release gate executes.

## 1. Repository implementation fact

Baseline after PR #57: `9869d7cdee2559b00d73203dec40d92bc90f537f`.

Current production dependencies remain bootstrap-only: Next.js / React / next-intl. Better Auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev and OpenAI SDK are not activated. The app remains a bootstrap route/component with bootstrap-focused tests.

```text
accepted docs/ADR
!= installed package
!= configured integration
!= implemented Product behavior
```

## 2. Vendor/platform evidence coverage oracle

Issue #58 may pass only if every changing external dependency explicitly required by its contract has current dated evidence or an explicit bounded deferral.

| Required area | 2026-08-28 evidence | Graph consequence |
|---|---|---|
| Next.js / React runtime | Next 16.3.3 Active-LTS security release; Next 16 uses React 19.2 feature line; React docs latest family 19.2 | G00 security patch; remain on accepted React 19.x |
| Better Auth | latest stable changelog 1.7.2 on 2026-08-26; 1.7 can require schema regeneration; UUID DB strategy documented | P14 rechecks/pins exact current stable and generated schema |
| PostgreSQL / Drizzle | PostgreSQL 18.6 current supported 18 release; Drizzle GitHub Releases latest stable 0.45.2; current defects reinforce generated-SQL/real-DB proof | P13/P14 exact pins + real PostgreSQL 18; no RC/main-branch inference |
| Gmail OAuth / watch / history | watch renewal, offline access, push-as-signal, stale-history 404/full-sync, scope/security requirements | G20 acceptance oracles + R90 public-release separation |
| Trigger.dev | current 4.5 line; managed durable execution with changing runtime/idempotency details | G32 adapter only; DB/domain remains authority |
| OpenAI | Responses + JSON Schema/Structured Outputs available; Responses retention/ZDR behavior is organization/feature dependent | G70 data-control + eval gate; `store:false` != ZDR |
| Web accessibility | WCAG 2.2 remains W3C Recommendation/current target; Focus Not Obscured, Target Size, Accessible Authentication and Status Messages are relevant | G11 / release acceptance baseline |

This table is an audit oracle: a future graph candidate that adds a volatile vendor without current evidence must fail rather than silently inherit an old snapshot.

## 3. Next.js / React

Primary sources:

- https://nextjs.org/blog
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://react.dev/versions

Observed:

- 2026-08-25 Next.js security release directs Active-LTS 16.3 users to `16.3.3` for two Critical-severity fixes;
- repo currently pins Next.js `16.3.0`;
- Next.js 16 documents React 19.2 features in App Router;
- React docs identify 19.2 as the latest documented family; repo declares React/React DOM 19.2.7.

Consequence:

- G00 is a narrow PRE-WAVE serial Next.js security update + exact-head verification before write-heavy fanout;
- no speculative React major change is justified;
- runtime compatibility is reproven by build/E2E after G00.

## 4. Node.js

Primary source:
- https://nodejs.org/en/about/previous-releases

Observed: Node 24 remains LTS.

Consequence: retain Node 24; normal patch/security maintenance applies.

## 5. Better Auth

Primary sources:

- https://better-auth.com/changelog
- https://better-auth.com/blog/1-7
- https://better-auth.com/docs/concepts/database

Observed:

- latest stable changelog is `1.7.2`, released 2026-08-26;
- 1.7 introduced identity/storage changes and instructs affected Drizzle users to regenerate schema;
- current DB docs support UUID generation strategies for PostgreSQL.

Consequence:

- historical v1.6/v1.7.1 snapshots are dated evidence only;
- P14 pins **current stable at execution**, explicitly configures intended UUID behavior and inspects generated schema/real PostgreSQL rather than inferring from docs/types.

## 6. PostgreSQL

Primary source:
- https://www.postgresql.org/docs/release/18.6/

Observed: PostgreSQL 18.6 released 2026-08-13 and major 18 remains current/supported.

Consequence: executable Responsibility/Auth/Source proof stays on real PostgreSQL 18 and records exact server version.

## 7. Drizzle ORM / Kit

Evidence:

- https://github.com/drizzle-team/drizzle-orm/releases
- current issue evidence around migration/introspection behavior.

Observed:

- GitHub Releases still identifies `0.45.2` as latest stable release;
- repository `main` may contain a higher package version and is **not** release evidence;
- current defects reinforce that ORM/API intent is not database proof.

Consequence:

- no automatic RC/unreleased-main adoption;
- P13/P14 pin exact stable ORM/Kit/driver versions, inspect generated SQL and execute against real PostgreSQL 18;
- production changes use committed migrations rather than `push` as final process.

## 8. Responsibility L2 upstream Source prerequisites

Repository source:
- `responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` v0.4.

Current candidate requires upstream production invariants including:

```sql
connected_accounts UNIQUE (id, user_id)
conversations UNIQUE (id, connected_account_id)
messages UNIQUE (id, connected_account_id)
```

plus monotonic non-negative `Conversation.semantic_evidence_revision`.

Consequence:

- P13 proves these prerequisites in its isolated executable harness;
- G10 creates the real app-auth User/session target;
- **G19**, not G20, is the single writer for provider-neutral production ConnectedAccount/ProviderSyncState/Conversation/Message/Attachment persistence conforming to proven prerequisites;
- G20 consumes G19 for live Gmail integration;
- P15 still gates Responsibility-owned production tables;
- G30 may reference only accepted G19 production FK targets, never P13 proof fixtures.

## 9. Gmail push / history reconciliation

Primary sources:

- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list

Observed:

- Gmail says `watch` must be renewed at least every 7 days and recommends once per day;
- notifications may be delayed/dropped and provider limits apply;
- stale/invalid `startHistoryId` typically yields HTTP 404 and requires full sync;
- watch response exposes `historyId` and `expiration`.

Consequence:

- push = reconciliation signal, not truth;
- G20 proves renewal, periodic safety reconciliation, cursor commit ordering, duplicate/drop tolerance and 404/full-sync recovery.

## 10. Google OAuth offline access / token handling

Primary sources checked 2026-08-28:

- https://developers.google.com/identity/protocols/oauth2
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- https://developers.google.com/identity/protocols/oauth2/policies

Observed:

- background access beyond access-token lifetime uses refresh-token/offline authorization;
- Google requires secure token handling and states server-side stored tokens should be encrypted at rest;
- current OAuth policy requires encrypted-at-rest storage and revocation/deletion when no longer needed.

Consequence:

- secure token-at-rest handling is required **before first durable persistence of a real token**, not merely before public beta;
- a bounded non-persistent protocol spike can avoid long-lived token storage;
- ownership-scoped lookup, no token logging and revoke/delete behavior are part of G20 minimum security;
- R90 owns broader production key-rotation/recovery hardening.

## 11. OAuth scope minimization / public verification

Observed from current Google OAuth/Gmail guidance:

- request the narrowest scopes required by implemented capabilities;
- partial grant means unsupported capabilities remain disabled;
- sensitive/restricted scopes can require public verification/security assessment depending on actual use/deployment.

Consequence:

- minimum scopes in G20;
- local/private complete-loop proof and public-beta compliance remain separate gates;
- R90 owns actual public verification/security work where required.

## 12. Cloud Pub/Sub authenticated push

Primary source:
- https://cloud.google.com/pubsub/docs/authenticate-push-subscriptions

Consequence:

- production push ingress authenticates/validates expected audience/identity as applicable;
- valid requests are acknowledged quickly and non-trivial work deferred;
- notification payload never directly mutates Responsibility.

## 13. Trigger.dev

Primary sources:

- https://trigger.dev/changelog
- https://trigger.dev/docs/idempotency

Observed:

- current changelog is in the v4.5 line (`4.5.12` on 2026-08-20);
- managed durable execution/idempotency facilities exist;
- idempotency scope/retention/failure behavior has changed across v4 releases.

Consequence:

- Trigger.dev remains execution infrastructure only;
- PostgreSQL/domain owns provider uniqueness, Responsibility application idempotency, Temporal currentness and Send duplicate prevention;
- any Trigger key has explicit composition/scope/TTL and cannot be the only durable promise;
- actual current behavior is rechecked when G32 activates the adapter.

## 14. OpenAI Responses / Structured Outputs / data controls

Primary sources:

- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint
- current Responses API / Structured Outputs documentation.

Observed:

- `/v1/responses` supports structured JSON-schema output patterns;
- Responses application-state retention is distinct from abuse-monitoring controls;
- Zero Data Retention is an eligible organization/project control and changes endpoint behavior;
- `store:false` by itself is not evidence that the organization has ZDR;
- some features, including background operation, have additional retention/ZDR implications.

Consequence:

- Responses + Structured Outputs remains viable for bounded candidate generation;
- production email AI activation requires current org/project data-control review, minimum context, appropriate `store:false`, no indiscriminate raw logging and separate layered eval/holdout;
- AI remains outside accepted-state and Send authority.

## 15. WCAG 2.2

Primary source:
- https://www.w3.org/TR/WCAG22/

Observed:

- WCAG 2.2 remains a W3C Recommendation and W3C recommends it as the current conformance target;
- relevant AA criteria include Focus Not Obscured (Minimum), Target Size (Minimum), Accessible Authentication (Minimum) and Status Messages.

Consequence:

- G11 keeps WCAG 2.2 AA as the implementation baseline already fixed by the UI contract;
- responsive/focus/async-status/auth behavior is tested rather than accepted by visual inspection alone.

## 16. Product Feature Matrix coverage oracle

Canonical `PRODUCT-CONTENT.md` current V1 CORE / CORE-target capabilities map as follows:

| Capability | Owner |
|---|---|
| one-provider authorized Source read | G19/G20/G21 |
| ingestion/reconciliation | G19/G20 |
| Responsibility admission/update / No Responsibility | G30/G31 |
| Needs You / Managed / Review / Moment / Source | G40 + G21 |
| temporal monitoring / Later / return conditions | G32 |
| field correction / Return Attention / Stop Tracking | G31/G32/G40 |
| integrity / reconnect | G60 |
| intentional disconnect / lifecycle controls | G60 / R90 boundary |
| Product-account deletion boundary / release commitments | G60 routing + R90 |
| minimal Settings | G40/G60 |
| contextual Reply / Reply All | G50 |
| bounded contextual AI draft | G70 with manual G50 fallback |
| explicit immediate Send | G50 |
| send reconciliation | G51 |
| exact Source search | G21 |
| operational retrieval sufficient for accepted cases | G21 + G40 |
| attachment evidence access | G20/G21 |

This mapping is a full-scope oracle: a future graph candidate that leaves a current CORE/CORE-target capability without an owner must fail.

## 17. Persistence topological-order oracle

```text
G10 auth User/session
 -> G19 provider-neutral Source/account tables
    -> G30 Responsibility after P15
       -> G32 Temporal persistence

G50 Draft + initial SendOperation request schema
 -> G51 provider dispatch/reconciliation transitions
```

A production FK/reference target must already exist as an accepted production table. Proof fixtures cannot satisfy production dependency order.

## 18. Architecture conclusions

No new Product architecture is required. Current evidence strengthens these boundaries:

```text
notification != source truth
provider fact != Responsibility truth
AI output != accepted state or Send authority
task-run idempotency != domain idempotency
Send request != provider acceptance != operational closure
frozen interface availability != live adapter completion
proof fixture != production FK target
```

The central Issue #58 correction is dependency ownership: parallelize against frozen interfaces, serialize only actual shared security/schema/semantic/external-effect collision zones, and validate the graph against production FK topology plus explicit vendor-evidence coverage.
