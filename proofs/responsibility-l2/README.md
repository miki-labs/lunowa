# Responsibility L2 PostgreSQL / Drizzle proof

This directory is an isolated proof harness for Issue #13. The eight
`responsibility_*` tables are the v0.4 candidate under test. The six
`p13_fixture_*` tables only supply the external key/index prerequisites needed
to instantiate that candidate; they are not production schema or migration
ownership.

The generated SQL in `migrations/` is committed so it can be reviewed against
`docs/product/responsibility/POSTGRESQL-DRIZZLE-DDL-DESIGN.md`. Run:

```text
pnpm proof:responsibility-l2:schema
```

The runtime suite requires an explicit isolated PostgreSQL URL and never uses
a fallback or a mock:

```text
P13_DATABASE_URL=postgresql://... pnpm test:responsibility-l2
```

The suite requires `server_version_num = 180006` and emits machine-readable
results for owned acceptance IDs 01–46 and 50–60. It uses two or more real
database connections for required race cases.

Drizzle 0.45.2 can express `SET NULL` as an action, but not PostgreSQL's
column-list form (`SET NULL (interpretation_run_id)`). The candidate therefore
uses the explicitly permitted `NO ACTION` fallback for optional AI-run links;
the runtime proof verifies that explicit retention cleanup removes references
before pruning the AI fixture while preserving tenant ownership columns.

This is evidence infrastructure only. It does not authorize L2 freeze,
production migrations, repositories, routes, provider sync, or AI calls.
