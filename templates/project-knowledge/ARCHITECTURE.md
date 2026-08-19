# Architecture

## Status

Draft / Accepted

## System overview

Describe the current system at the level needed to reason about changes. Prefer a small diagram or explicit component list over vague prose when useful.

## Components and ownership

For each major component/module/service, state its responsibility and owned data/behavior.

## Dependency direction

Document important allowed/forbidden dependency directions and layering rules.

## Data flow and persistence

Describe material data flows, persistence boundaries, consistency expectations, and ownership.

## APIs and contracts

List public/internal contracts that are important to preserve, including schemas, events, queues, files, or protocol boundaries.

## Authentication and authorization

Document identity/session/authorization boundaries when relevant. Link deeper security design or threat models rather than duplicating them.

## External integrations

List material external services/APIs and the boundary around each integration, including failure/rate-limit/idempotency expectations where relevant.

## Trust and security boundaries

Identify boundaries where untrusted or sensitive data enters, leaves, or changes privilege.

## Architectural invariants

State only durable, high-value constraints. Prefer rules that can be mechanically enforced later.

Examples:

- UI code must not access persistence directly.
- External payloads are validated at the boundary.
- Secrets never enter client-delivered bundles.

## Technology choices

Document current stack choices that materially constrain implementation. Put non-obvious or costly-to-reverse rationale in a decision record.

## Known constraints

Record platform, performance, compatibility, cost, operational, migration, or deployment constraints that future changes must respect.

## Related decisions

Link relevant records created from `templates/decision-record.md`.