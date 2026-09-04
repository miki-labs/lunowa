# Production migrations

`migrations/` is the ordered production PostgreSQL migration set. The first
migration is owned by G10 and creates only the Better Auth application
identity/session schema proven by P14. It does not create ConnectedAccount,
Gmail, Source, Responsibility, Temporal, Draft, or Send state.

Generate a migration after an authorized schema change with `pnpm db:generate`.
Production and CI apply the committed SQL; they do not use a schema `push`.
