# ADR 0005 — Authentication, Mailbox Authorization, and Persistence Stack

## Status

Accepted — 2026-08-19
Terminology reconciled with Responsibility v0.1 — 2026-08-23

## Context

Lunowa needs two related but distinct identity/credential systems:

1. Lunowa application user/session;
2. one or more connected Google/Microsoft mailboxes, each with independent provider authorization, scopes, refresh lifecycle, sync state, and removal behavior.

The product supports multiple accounts and optional separation into Scopes such as work/personal/university. Collapsing app identity and mailbox authorization would make multi-account ownership, token rotation, reconnect, provider removal, and security harder to reason about.

The domain also requires durable relational invariants across Conversations, Messages, Responsibilities, provenance/evidence revisions, Temporal Contracts, Drafts, Send Operations, and provider sync cursors.

Responsibility v0.1 adds a critical persistence constraint: the database must preserve orthogonal Responsibility semantics without rebuilding the superseded single lifecycle enum as canonical truth.

## Decision

### Application authentication

Use the current stable Better Auth line as the initial Lunowa session/authentication library, integrated with Next.js and Drizzle/PostgreSQL, subject to a focused spike before production dependence.

Better Auth owns **Lunowa application identity/session**, not authoritative mailbox credentials.

### Mailbox authorization

Keep Gmail/Microsoft mailbox authorization behind Lunowa-owned `ConnectedAccount` credential/provider services.

Mailbox credentials:

- belong to one authenticated Lunowa user and one ConnectedAccount;
- stay server-side;
- are independently revocable/removable;
- support multiple accounts per provider;
- are encrypted at the application boundary before durable persistence;
- are never ordinary browser/session data.

Use provider-supported OAuth/auth libraries and authorization-code flows. Request offline access only when background mailbox access requires it.

### Persistence

Use:

- PostgreSQL 18 as the durable relational system of record;
- Neon as the initial hosted PostgreSQL provider;
- ordinary local/Docker PostgreSQL as supported local development;
- Drizzle ORM for TypeScript schema/query work;
- Drizzle Kit with committed SQL migrations.

Do not couple the domain to Neon-specific Auth/Data API semantics.

### Responsibility schema boundary

This ADR selects the relational persistence stack; it does **not** freeze the physical Responsibility schema.

The first schema must preserve, minimally and only as required by validated scenarios:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
field-level uncertainty/risk
provenance/evidence revision
```

Do not interpret this list as “one table per concept.” Choose the smallest relational representation that satisfies canonical oracles, ownership, queryability, and invariants.

Invalid shortcuts include restoring as complete truth:

```text
one seven-state lifecycle enum
one scalar next_owner / BOTH
one deadline_at
one whole-item user_override_state
```

## Rationale

### App user != connected mailbox

A Lunowa user may connect multiple Gmail/Microsoft accounts grouped differently over time. Mailbox scope/reconnect/removal must not redefine Lunowa login identity.

Mailbox refresh credentials also carry materially more authority than a normal app session.

### PostgreSQL fits the actual domain

Lunowa needs relational ownership/uniqueness, transactions, history/provenance, idempotency, evidence revisions, Temporal Contracts, sends, and later full-text search.

PostgreSQL covers these needs without specialized stores.

### Drizzle keeps SQL visible

Provider/domain/search queries and database constraints matter. Drizzle keeps abstraction distance low while providing typed schema/query and migration tooling.

### Neon reduces early operations without redefining the model

Managed PostgreSQL lowers early operational burden while preserving ordinary PostgreSQL semantics/portability.

## Security requirements

Before real-account public beta:

- long-lived mailbox refresh tokens are not plaintext at the application layer;
- encryption keys do not live in the same database/repository;
- secrets/tokens are never logged;
- credential access re-checks authenticated user + ConnectedAccount ownership;
- removing an account revokes/deletes provider credentials where supported and deletes Lunowa secret material;
- reconnect replaces credentials safely without changing account ownership silently;
- provider/email content remains untrusted data.

Do not assume the app-auth library automatically provides the mailbox-token protection Lunowa requires. Re-check current library/provider behavior at implementation time.

## Google launch constraint

Gmail scopes required by a full server-side mail client may trigger OAuth verification/security-assessment requirements. This is a product-launch dependency, not post-launch cleanup.

Current official Google scope/verification requirements must be rechecked before public beta because they are time-sensitive.

## Alternatives considered

### Better Auth linked social accounts as the mailbox credential model

Rejected as the architectural default. Lunowa needs explicit multi-account mailbox ownership, provider-specific scopes/sync/reconnect, and stronger credential boundaries.

### Supabase as combined Auth + Postgres + queues

Not selected. Keeping app auth, mailbox credentials, durable jobs, and standard PostgreSQL boundaries explicit is currently cleaner.

### Prisma

Viable but not selected. Drizzle's SQL-visible approach fits the current domain and migration needs. Revisit only on concrete implementation friction.

### SQLite

Rejected for the intended synchronized multi-account/server product. PostgreSQL better matches concurrency/search/integrity and avoids a later production-store migration.

### Redis as session/cache authority

Deferred. No current requirement justifies another data service.

### Generic workflow/EAV persistence for Responsibility flexibility

Rejected initially. Responsibility complexity should be represented only where canonical scenarios prove it is required. A generic workflow schema would add accidental complexity and weaken constraints.

## Required implementation spike/gate

Before production dependence on the auth/session stack, verify:

- Next.js session/protected server integration;
- Drizzle/PostgreSQL schema/migrations;
- explicit account linking behavior;
- treatment of auth-only provider tokens;
- logout/session revocation.

Before the first Responsibility migration is accepted, separately verify:

- proposed schema maps every fixed semantic dimension it claims to support;
- parallel/conditional obligation scenarios are representable;
- historical OPEN vs live activation is representable;
- partial completion criteria are representable without artificial splitting;
- source due/user target/resurface are not collapsed;
- field-scoped correction/provenance is possible;
- one event can produce effects across multiple Responsibilities;
- the design remains simpler than a generic workflow engine.

If the session library fights the architecture, replace only the app-auth layer. Keep the ConnectedAccount credential boundary intact.

## Consequences

Positive:

- app identity/mailbox authority remain explicit;
- relational constraints match the domain;
- SQL/migrations remain reviewable;
- Responsibility physical design can evolve without changing database technology;
- one database can support early full-text search and durable state.

Costs/risks:

- mailbox-token encryption/key management still needs explicit implementation;
- schema design must resist both over-normalization and one-enum oversimplification;
- hosted provider/auth-library behavior and pricing can change;
- public Gmail requirements may impose non-code launch work/cost.

## Evidence checked when originally accepted

Primary references included Better Auth, Drizzle, Neon, Google OAuth/Gmail scope documentation.

These external facts are time-sensitive. Re-check current official documentation when the relevant implementation/release gate is reached rather than treating the 2026-08-19 snapshot as permanent.
