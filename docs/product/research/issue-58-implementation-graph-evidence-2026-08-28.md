# Issue #58 — Implementation Graph Evidence — 2026-08-28

## Status

Dated external/repository evidence for Issue #58. **Evidence/rationale, not timeless Product truth.** Volatile facts must be rechecked when the activation/release gate actually executes.

## 1. Repository implementation fact

Baseline after PR #57: `9869d7cdee2559b00d73203dec40d92bc90f537f`.

Current production dependencies remain bootstrap-only: Next.js / React / next-intl. Better Auth, Drizzle/PostgreSQL production persistence, Gmail integration, Trigger.dev and OpenAI SDK are not activated. The app is still a bootstrap route/component with bootstrap-focused tests.

Therefore:

```text
accepted docs/ADR
!= installed package
!= configured integration
!= implemented Product behavior
```

## 2. Next.js

Checked 2026-08-28.

Primary source:
- https://nextjs.org/blog

Observed:
- 2026-08-25 security release;
- Active-LTS 16.3 users directed to `16.3.3` for two Critical-severity fixes;
- repo currently pins `16.3.0`.

Consequence:
- G00 is a narrow PRE-WAVE serial security update + existing verification before write-heavy production-feature fanout.
- #58 planning branch does not mix in the dependency patch itself.

## 3. Node.js

Primary source:
- https://nodejs.org/en/about/previous-releases

Observed:
- Node 24 remains LTS.

Consequence:
- retain Node 24, normal patch/security maintenance applies.

## 4. Better Auth

Primary sources:
- https://better-auth.com/changelog
- https://better-auth.com/blog/1-7
- https://better-auth.com/docs/concepts/database

Observed:
- stable `1.7.1` released 2026-08-18;
- 1.7 includes storage/identity changes that can require regenerated schema;
- current DB docs support `advanced.database.generateId: "uuid"` and PostgreSQL UUID handling.

Consequence:
- historical v1.6 validation is stale evidence;
- P14 pins current stable at execution, explicitly configures UUID, inspects generated schema/real PostgreSQL rather than inferring from docs/types.

## 5. PostgreSQL

Primary source:
- https://www.postgresql.org/docs/18/

Observed:
- major 18 remains supported/accepted; current point-release evidence is 18.6.

Consequence:
- executable Responsibility/Auth proof stays on real PostgreSQL 18 and records exact server version.

## 6. Drizzle ORM / Kit

Evidence:
- https://github.com/drizzle-team/drizzle-orm/releases
- recent issue evidence including transaction/migration/introspection defects.

Observed:
- stable evidence remains 0.45.x (`0.45.2`); 1.0 remains RC/pre-release;
- current issues reinforce that ORM/API intent is not DB proof.

Consequence:
- no automatic RC adoption;
- P13/P14 pin exact stable ORM/Kit/driver, inspect generated SQL and execute against real PostgreSQL 18;
- production changes use committed migrations, not `push` as final process.

## 7. Responsibility L2 upstream prerequisites

Repository source:
- `responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md` v0.4.

Current candidate explicitly requires broader Source schema invariants including:

```sql
connected_accounts UNIQUE (id, user_id)
conversations UNIQUE (id, connected_account_id)
messages UNIQUE (id, connected_account_id)
```

and a monotonic non-negative `Conversation.semantic_evidence_revision`.

Consequence:
- G10 must not independently freeze Source production schema before this prerequisite proof;
- P13 proves current prerequisite behavior;
- after P13 PASS, G20 is the single writer for production ConnectedAccount/ProviderSyncState/Conversation/Message/Attachment schema conforming to those prerequisites;
- P15 still gates Responsibility-owned production tables.

## 8. Gmail push / history reconciliation

Primary sources:
- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list

Observed:
- `users.watch` must be renewed at least every 7 days; Google recommends daily;
- watched user notification limit is one event/sec/user and excess may be dropped;
- notifications may be delayed/dropped, so fallback reconciliation is required;
- stale/invalid `startHistoryId` typically yields HTTP 404 and requires full sync;
- watch response includes `historyId` and `expiration`.

Consequence:
- push = reconciliation signal, not truth;
- G20 must prove renewal, periodic safety reconciliation, cursor commit ordering, duplicate/drop tolerance and 404/full-sync recovery.

## 9. Google OAuth offline access / token handling

Primary sources checked 2026-08-28:
- https://developers.google.com/identity/protocols/oauth2
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- https://developers.google.com/identity/protocols/oauth2/policies

Observed:
- background access beyond an access-token lifetime uses refresh-token/offline authorization;
- Google says refresh tokens belong in secure long-term/persistent storage;
- OAuth best practices require secure token storage and no plaintext transmission;
- server-side apps storing user tokens should encrypt them at rest;
- OAuth policy (last modified 2026-08-05) says tokens should always be stored encrypted at rest and revoked/deleted when no longer needed.

Consequence:
- secure token-at-rest handling is required **before first durable persistence of a real token**, not merely before public beta;
- a bounded non-persistent local protocol spike can avoid storing a long-lived token;
- ownership-scoped lookup, no token logging and revoke/delete behavior are part of G20 minimum security;
- R90 owns further production key rotation/operational hardening.

## 10. OAuth scope minimization / public verification

Primary sources:
- Google OAuth web-server/scopes/verification/security-assessment guidance.

Observed:
- request narrowest scopes needed by implemented features;
- users may grant only a subset and corresponding unsupported capabilities must stay disabled;
- sensitive/restricted scopes can require OAuth verification; server-side restricted-data use can require security assessment/reverification depending on actual deployment/scope.

Consequence:
- minimum scopes in G20;
- local/private complete-loop proof and public-beta compliance are separate gates;
- R90 owns actual public-release verification/security work where required.

## 11. Cloud Pub/Sub authenticated push

Primary source:
- https://cloud.google.com/pubsub/docs/authenticate-push-subscriptions

Consequence:
- production push ingress authenticates/validates expected audience/identity as applicable;
- valid request acknowledged quickly and non-trivial work deferred;
- notification payload never directly mutates Responsibility.

## 12. Trigger.dev

Primary sources:
- https://trigger.dev/docs/idempotency
- https://trigger.dev/docs/triggering
- https://trigger.dev/product

Observed:
- durable/checkpointed execution and idempotency facilities exist;
- raw string idempotency defaults to `run` scope from v4.3.1 (previously global);
- global remains task/environment scoped;
- default key retention/TTL is finite (30-day current evidence);
- failed runs clear their idempotency key.

Consequence:
- Trigger.dev remains execution infrastructure;
- PostgreSQL/domain owns provider uniqueness, Responsibility application idempotency, Temporal currentness and Send duplicate prevention;
- Trigger keys require explicit composition/scope/TTL and cannot be the only durable promise.

## 13. OpenAI Responses / data controls

Primary source:
- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

Observed:
- API data is not used for training by default unless opted in;
- abuse-monitoring logs are generally retained up to 30 days by default;
- eligible organizations can use Modified Abuse Monitoring / Zero Data Retention;
- `/v1/responses` is ZDR-eligible, but `store:false` is not itself proof that the organization has ZDR;
- Responses/data-retention behavior has feature-specific exceptions.

Consequence:
- Responses + Structured Outputs remains viable for bounded candidate generation;
- production AI activation requires current org/project data-control review, minimum context, appropriate `store:false`, no indiscriminate raw logging and separate layered eval/holdout.

## 14. Product Feature Matrix coverage findings

Canonical `PRODUCT-CONTENT.md` marks as V1 CORE / CORE target:
- exact Source search;
- contextual Reply/Reply All;
- bounded contextual AI draft;
- explicit user Send;
- send reconciliation;
- source attachment evidence access;
- Responsibility/attention/Temporal/Integrity surfaces.

Consequence:
- exact Source search is mandatory G21 scope, not optional;
- contextual AI draft must have an owning AI contract/node distinct from manual composer and distinct from Responsibility interpretation;
- manual composer remains mandatory AI-unavailable fallback.

## 15. Architecture conclusions

No new Product architecture is required. Current evidence strengthens these boundaries:

```text
notification != source truth
provider fact != Responsibility truth
AI output != accepted state or Send authority
task-run idempotency != domain idempotency
Send request != provider acceptance != operational closure
frozen interface availability != live adapter completion
```

The key Issue #58 correction is dependency ownership: parallelize against frozen interfaces, serialize only actual shared authority/schema/external-effect collision zones.