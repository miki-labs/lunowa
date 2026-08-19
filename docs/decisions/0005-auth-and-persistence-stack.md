# ADR 0005 — Authentication, mailbox authorization, and persistence stack

## Status

Accepted — 2026-08-19

## Context

Lunowa needs two related but different identity/credential systems:

1. a Lunowa application user/session;
2. one or more connected Google/Microsoft mailboxes, each with independent provider authorization, scopes, refresh lifecycle, sync state, and removal behavior.

The product explicitly supports multiple accounts and optional separation into scopes such as work/personal/university. Collapsing application identity and mailbox authorization would make multi-account ownership, token rotation, reconnect, provider removal, and security behavior harder to reason about.

The domain also requires durable relational invariants across Conversations, Messages, Action Items, Temporal Contracts, Drafts, Send Operations, and provider sync cursors.

## Decision

### Application authentication

Use the current stable Better Auth line as the initial Lunowa session/authentication library, integrated with Next.js and Drizzle/PostgreSQL, subject to a focused bootstrap spike before production dependence.

Better Auth is responsible for **Lunowa application identity/session**, not the authoritative mailbox credential store.

### Mailbox authorization

Keep Gmail/Microsoft mailbox authorization behind Lunowa-owned `ConnectedAccount` credential/provider services.

Mailbox credentials:

- belong to one authenticated Lunowa user and one ConnectedAccount;
- are server-side only;
- are independently revocable/removable;
- support multiple accounts from the same provider;
- are encrypted at the application boundary before durable persistence;
- are never treated as ordinary browser/session data.

Use provider-supported OAuth/auth libraries and authorization-code flows. Request offline access only where Lunowa needs background access.

### Persistence

Use:

- PostgreSQL 18 as the durable relational system of record;
- Neon as the initial hosted PostgreSQL provider;
- ordinary local/Docker PostgreSQL as a supported local-development option;
- Drizzle ORM for TypeScript schema/query work;
- Drizzle Kit with committed SQL migrations for schema evolution.

Do not couple the domain to Neon-specific Auth/Data API semantics.

## Rationale

### App user != connected mailbox

A Lunowa user may connect:

- two Gmail accounts;
- Gmail + Outlook;
- several accounts grouped into one Scope;
- accounts that later reconnect, lose scopes, or are removed.

Those operations must not redefine or destroy the Lunowa login identity.

This separation also follows the provider-specific security reality: mailbox refresh tokens carry materially more authority than a normal app session.

### PostgreSQL fits the actual domain

Lunowa requires strong relational ownership and uniqueness, transactions, state history, idempotency, and later full-text search. PostgreSQL covers these needs without adding specialized stores.

### Drizzle keeps SQL visible

The product will have provider/state/search queries where understanding real SQL and database constraints is valuable. Drizzle keeps the abstraction thin enough for one developer/Codex while still providing typed schemas and migration tooling.

### Neon lowers early operations without changing the data model

Neon provides managed PostgreSQL, pooling, branching, autoscaling/scale-to-zero, and low initial cost. The architecture remains portable because Lunowa uses standard PostgreSQL as the authority.

## Security requirements

Before real-account public beta:

- long-lived mailbox refresh tokens must not be stored plaintext at the application layer;
- token encryption keys must not live in the same database or repository;
- secrets/tokens must never be logged;
- every credential access must re-check authenticated user/ConnectedAccount ownership;
- removing an account must revoke/delete provider credentials where supported and delete Lunowa-owned secret material;
- reconnect must replace credentials safely without silently changing account ownership;
- provider content and retrieved email remain untrusted data.

Better Auth's current documentation explicitly states that OAuth tokens are not encrypted by default. Do not assume the auth library solves mailbox-token protection.

## Important Google launch constraint

Google currently classifies several Gmail scopes required by a full mail client — including `gmail.readonly`, `gmail.compose`, and `gmail.modify` — as restricted scopes. Google's documentation states that server storage/transmission of restricted-scope data can require restricted-scope verification and a security assessment.

Therefore OAuth verification/security-assessment planning is a product launch dependency, not an optional cleanup task.

## Alternatives considered

### Use Better Auth linked social accounts as the mailbox credential model

Rejected as the architectural default. Better Auth is useful for sessions, but Lunowa's mailbox model needs explicit multi-account provider ownership, provider-specific scope state, sync state, reconnect semantics, and stronger credential handling. The domain should not be shaped around an auth library's account table.

### Supabase as combined Auth + Postgres + queues

Not selected. It is viable, but Lunowa currently benefits from keeping application auth, mailbox provider credentials, durable jobs, and standard PostgreSQL boundaries explicit. We do not need enough of Supabase's integrated surface to justify coupling the initial architecture to it.

### Prisma

Viable, but not selected. Drizzle's SQL-visible model and migration approach fit the current domain and Better Auth integration with less abstraction distance. Do not switch merely for popularity; revisit only if real implementation friction appears.

### SQLite

Rejected for the intended synchronized multi-account/server product. PostgreSQL removes an eventual production migration and better matches concurrency/search/integrity needs.

### Redis as session/cache authority

Deferred. No current requirement justifies another data service.

## Required bootstrap spike

Before marking Better Auth production-ready, verify:

- Next.js 16 Route Handler/session integration;
- protected server-side authorization;
- Drizzle/PostgreSQL schema/migrations;
- explicit social account-linking behavior;
- how auth-only provider tokens can be avoided, discarded, or protected after sign-in;
- logout/session revocation behavior.

If the session library fights the architecture, replace only the app-auth layer. Keep the `ConnectedAccount` mailbox-credential boundary intact.

## Evidence checked

- Better Auth Next.js integration: https://better-auth.com/docs/integrations/next
- Better Auth accounts/linking/token storage: https://better-auth.com/docs/concepts/users-accounts
- Better Auth OAuth: https://better-auth.com/docs/concepts/oauth
- Better Auth Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Neon Postgres/version updates: https://neon.com/docs/changelog
- Neon branching: https://neon.com/docs/get-started-with-neon/workflow-primer
- Neon pooling: https://neon.com/docs/connect/connection-pooling
- Google OAuth best practices: https://developers.google.com/identity/protocols/oauth2/resources/best-practices
- Gmail scope classification: https://developers.google.com/workspace/gmail/api/auth/scopes
