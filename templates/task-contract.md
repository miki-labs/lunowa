# Task Contract

Use for non-trivial implementation work. Delete sections that are irrelevant rather than filling them with ceremony.

For normal feature work, this template can carry the small amount of design reasoning that used to require a separate mini-design document. Use `design-doc.md` only when architecture/security/data/reversibility risk justifies deeper design.

## Goal

What observable outcome must be achieved?

## Why

Why does this change matter to the product/system?

## Relevant source of truth

List only the repository specs/docs, APIs, schemas, tests, decisions, or authoritative external constraints that materially govern the task.

## Current behavior

What happens now?

## Desired behavior

What should happen after the change?

## Scope

What is included?

## Non-goals

What adjacent work must not be expanded into this task?

## Constraints

Architecture, compatibility, security/privacy, reliability, performance, operational, cost, or platform constraints that actually affect the solution.

## Reuse requirements

What existing repository implementations, framework/platform capabilities, official SDKs/APIs, components, OSS, templates, or managed services must be checked before custom implementation?

If a specific dependency/service/template is required, state it explicitly.

## Design notes — only when needed

For a normal non-trivial change, capture only the design facts necessary to prevent guessing.

### Boundaries / responsibilities

Which components/modules own the changed behavior or state?

### Data / API / state contract

Important inputs, outputs, schemas, persistence, events, state transitions, or compatibility concerns.

### Failure / concurrency behavior

Relevant timeout, retry, idempotency, ordering, duplicate, conflict, degraded, partial-failure, or recovery behavior.

### Security / privacy

Relevant authentication/authorization, trust boundaries, sensitive data, secrets, external input, third parties, or threat-model trigger.

### Deployment / migration / rollback

Only when the change can fail differently during rollout, changes persistent state, or is expensive to reverse.

### Options / decision

Include credible alternatives only when the choice is not obvious and the rationale may affect review or future maintenance.

If these design notes become long, uncertain, cross-cutting, security-critical, data-critical, or difficult to reverse, stop using the task contract as the design document and create `design-doc.md` instead.

## Acceptance criteria

Write observable/testable conditions for completion.

- [ ]

## Verification

Specify evidence appropriate to the failure modes, for example:

- targeted tests,
- canonical verification command,
- build/type/lint/static checks,
- integration/contract/E2E,
- browser/runtime/device checks,
- authorization/security/adversarial checks,
- migration/rollback checks,
- logs/metrics/repair evidence,
- performance/economic checks,
- AI evals when AI product behavior is material.

## Deliverables

List expected code/tests/docs/migrations/configuration only when clarifying the output helps. Do not prescribe files that should be discovered from the repository.

## Stop / escalation conditions

Stop and report rather than guess when, for example:

- material source-of-truth artifacts conflict and the correct authority cannot be determined,
- a required dependency/service/template cannot be used,
- implementation requires a material architecture or security change not covered by the task,
- an unresolved assumption can invalidate the design,
- required verification cannot be performed with available tools/environments,
- scope must materially expand,
- the proposed change would require unsafe production access or an irreversible operation without an accepted recovery plan.

## Completion report

At completion, report:

- behavior changed,
- acceptance evidence,
- checks actually run and results,
- anything not verified,
- material assumptions/trade-offs,
- durable documentation changed when required,
- follow-up work only when genuinely necessary.
