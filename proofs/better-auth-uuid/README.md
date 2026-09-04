# Better Auth UUID proof

This is a proof-only Better Auth 1.7.2 configuration. It is not an application
auth module, production schema, migration, provider integration, or OAuth
fixture.

The Better Auth CLI generates `auth-schema.ts`; Drizzle Kit generates the
committed SQL under `migrations/`. The generated auth user primary key and the
proof-only domain owner foreign key must both remain PostgreSQL `uuid`.

The runtime proof requires `P14_DATABASE_URL` and refuses to use a fallback
database. It records the raw `server_version` and `version()` strings and
requires the machine-readable PostgreSQL 18.6 value
`server_version_num == "180006"`, then applies the committed migration. It
performs a Better Auth 1.7.2 local email/password user and session roundtrip
and checks the released local
credential relationship: `providerId = "credential"`,
`issuer = createLocalAccountIssuer("credential")`, and `accountId`/`userId`
equal the created user ID. It also inserts a proof-only domain row through its
UUID foreign key. It does not configure social providers or use OAuth
credentials.

Run the builder-owned generation check with:

```text
pnpm proof:auth-uuid:schema
```

Run the runtime proof with a real PostgreSQL 18.6 database using:

```text
P14_DATABASE_URL=postgresql://... pnpm test:auth-uuid
```

The committed `candidate-evidence.json` is a not-yet-verified manifest. It
does not claim trusted host evidence or independent-review PASS.
