# P14 — Better Auth UUID proof

This proof owns acceptance IDs 47–49 only. Its schema and fixture are isolated
evidence, not production auth or migration ownership.

## Isolated PostgreSQL 18 namespace

```bash
docker compose -p lunowa-issue-14 -f proofs/better-auth-uuid/docker-compose.yml up -d
P14_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55414/lunowa_issue_14 pnpm test:auth-uuid
docker compose -p lunowa-issue-14 -f proofs/better-auth-uuid/docker-compose.yml down --volumes
```

The test rejects any URL that is not the reserved `55414` / `lunowa_issue_14`
namespace, rejects a non-18.x server, applies the committed Drizzle SQL, and
then checks catalog, Better Auth local credential-account, session, and domain
FK roundtrips. It uses no OAuth provider, mailbox, or production credential.

Regenerate and inspect the schema SQL with:

```bash
pnpm proof:auth-uuid:schema
```

## Better Auth 1.7.2 account semantics exercised

The local email/password flow creates the closest supported local account row:
`provider_id = credential`, `issuer = local:credential`, and `account_id =
user.id`. Better Auth 1.7 selects account identity by the unique pair
`(issuer, accountId)`, not by `providerId` alone. Literal social account
linking is intentionally outside this proof because it requires a real OAuth
provider flow and is forbidden by the task contract.
