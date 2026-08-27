# Issue #58 — Implementation Graph Evidence — 2026-08-28

## Status

Dated external/repository evidence for Issue #58. This file is **evidence and rationale, not timeless Product truth**. Re-check volatile vendor facts at the activation/release gate that depends on them.

## Repository implementation fact

Baseline inspected after PR #57 merge: `9869d7cdee2559b00d73203dec40d92bc90f537f`.

Current production dependencies are still the bootstrap set: Next.js / React / next-intl. Better Auth, Drizzle/PostgreSQL driver, Trigger.dev, Gmail provider libraries and OpenAI SDK are not yet activated. The app remains a bootstrap route/component with bootstrap-focused tests. Therefore package/ADR presence must never be reported as an implemented Product capability.

## Current external evidence

### Next.js

Checked: 2026-08-28.

Primary source:
- https://nextjs.org/blog

Observed:
- Next.js published its August 2026 security release on 2026-08-25.
- Active-LTS 16.3 users are directed to upgrade to `16.3.3` for two Critical-severity vulnerabilities.
- Repository baseline currently pins `next@16.3.0`.

Decision consequence:
- Issue #58 does not mix a dependency update into a planning candidate.
- A **PRE-WAVE SERIAL security-baseline task** must update the patched 16.3 line and rerun the full bootstrap CI before production-feature branches fan out.

### Node.js

Checked: 2026-08-28.

Primary source:
- https://nodejs.org/en/about/previous-releases

Observed:
- Node.js 24 remains an LTS line.

Decision consequence:
- retain Node 24 baseline; normal security/patch refresh still applies.

### Better Auth

Checked: 2026-08-28.

Primary sources:
- https://better-auth.com/changelog
- https://better-auth.com/blog/1-7
- https://better-auth.com/docs/concepts/database

Observed:
- current stable release is `1.7.1` (2026-08-18);
- 1.7 includes storage/identity changes that can require regenerated schema;
- current database docs explicitly support `advanced.database.generateId: "uuid"`; PostgreSQL can use a UUID database column/generation path.

Decision consequence:
- the old 1.6-family validation snapshot is stale evidence;
- Issue #14 must pin an exact current stable Better Auth version and prove actual PostgreSQL UUID behavior + generated schema, not infer it from TypeScript/docs.

### PostgreSQL

Checked: 2026-08-28.

Primary source:
- https://www.postgresql.org/docs/18/

Observed:
- PostgreSQL 18 remains the accepted major line; current supported point release is 18.6.

Decision consequence:
- retain PostgreSQL 18 as the executable Responsibility proof target;
- exact server version must be recorded in proof evidence.

### Drizzle ORM / Drizzle Kit

Checked: 2026-08-28.

Primary/near-primary evidence:
- https://github.com/drizzle-team/drizzle-orm/releases
- https://github.com/drizzle-team/drizzle-orm/issues/6114
- https://github.com/drizzle-team/drizzle-orm/issues/6079
- https://github.com/drizzle-team/drizzle-orm/issues/6166

Observed:
- stable `latest` remains on the 0.45.x line; `drizzle-orm 0.45.2` is current stable evidence while 1.0 remains RC/pre-release;
- recent open issues include node-postgres transaction/client handling and migration/introspection defects across stable/RC paths.

Decision consequence:
- do not adopt the RC merely because it is newer;
- Issues #13/#14 must pin exact ORM/Kit/driver versions, inspect generated SQL, and exercise real PostgreSQL 18 behavior;
- committed SQL migrations remain the production path; no production `push` shortcut.

### Gmail API — push / reconciliation

Checked: 2026-08-28.

Primary sources:
- https://developers.google.com/workspace/gmail/api/guides/push
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/watch
- https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.history/list

Observed:
- `users.watch` must be renewed at least every 7 days; Google recommends daily renewal;
- each watched Gmail user has a max notification rate of one event/second and excess notifications may be dropped;
- notifications can be delayed/dropped, and Google recommends fallback reconciliation such as `history.list`;
- stale/invalid `startHistoryId` typically returns HTTP 404 and requires full sync;
- a watch response includes `historyId` and `expiration`.

Decision consequence:
- Gmail push is a reconciliation **signal**, never mailbox/domain truth;
- the provider task must prove watch renewal, periodic safety reconciliation, cursor durability ordering and 404/full-sync recovery.

### Google OAuth — offline access / scope minimization

Checked: 2026-08-28.

Primary sources:
- https://developers.google.com/identity/protocols/oauth2/web-server
- https://developers.google.com/identity/protocols/oauth2/scopes
- https://support.google.com/cloud/answer/13464321?hl=en
- https://support.google.com/cloud/answer/13465431?hl=en

Observed:
- server/background access needs offline authorization/refresh-token handling;
- Google explicitly requires the narrowest scopes needed by implemented behavior;
- restricted-scope apps face additional verification/security-assessment requirements, including annual assessment/re-verification requirements where applicable.

Decision consequence:
- request only scopes required by the accepted one-provider vertical slice;
- keep **local/private Product proof** separate from **public-beta OAuth/security compliance readiness** so compliance is neither ignored nor made a blocker to all local implementation.

### Cloud Pub/Sub push authentication

Checked: 2026-08-28.

Primary source:
- https://cloud.google.com/pubsub/docs/authenticate-push-subscriptions

Decision consequence:
- production push ingress must authenticate the push request and validate its expected audience/identity claims as applicable;
- webhook receipt must acknowledge quickly and move non-trivial reconciliation to durable work;
- notification body never directly mutates Responsibility state.

### Trigger.dev

Checked: 2026-08-28.

Primary sources:
- https://trigger.dev/docs/idempotency
- https://trigger.dev/docs/triggering
- https://trigger.dev/product

Observed:
- Trigger.dev provides durable/checkpointed execution and idempotency keys;
- raw-string idempotency keys default to `run` scope starting in v4.3.1 (previously global);
- even `global` keys remain task/environment scoped;
- idempotency keys expire by default after 30 days unless configured otherwise;
- a failed run automatically clears its idempotency key.

Decision consequence:
- Trigger.dev remains an execution substrate, not semantic/external-effect authority;
- PostgreSQL/domain invariants must own provider-message uniqueness, Responsibility application idempotency, Temporal-trigger currentness, and SendOperation duplicate prevention;
- any Trigger key used for efficiency must have explicit scope/key/version/TTL semantics and must not be the only durable promise.

### OpenAI Responses API / data controls

Checked: 2026-08-28.

Primary source:
- https://platform.openai.com/docs/models/default-usage-policies-by-endpoint

Observed:
- API data is not used for model training by default unless the customer opts in;
- abuse-monitoring logs are generally retained up to 30 days by default;
- eligible organizations can receive Modified Abuse Monitoring / Zero Data Retention controls;
- `/v1/responses` is ZDR-eligible, but `store: false` is not itself proof that an organization has ZDR;
- Responses application-state/data-retention behavior has feature-specific exceptions (for example background mode).

Decision consequence:
- AI activation requires a current data-control review, minimum authorized context, no raw mail logging by default, `store: false` where appropriate, and explicit understanding of the project/org retention mode;
- AI stays downstream of trusted source/domain contracts and is not required for initial Source/Auth/UI foundation.

## Architecture conclusions supported by evidence

The evidence does **not** require a new Product architecture. It reinforces the existing durable boundaries:

```text
External notification != source truth
Provider fact != Responsibility truth
AI output != accepted state
Task-run idempotency != domain idempotency
Send request != provider acceptance != Responsibility closure
```

The material correction is execution/dependency freshness: current Product/UI scope and current vendor behavior must be propagated into a dependency DAG before production-feature tasks multiply.