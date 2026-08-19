# Verification and Review

Verification answers whether the change actually satisfies its required behavior and quality constraints. Review answers whether the change is healthy enough to become part of the codebase.

## Canonical verification

Each product repository SHOULD expose a documented canonical verification entry point that humans, agents, and CI can run consistently.

Depending on the stack, it may aggregate:

- formatting check,
- lint/static analysis,
- typecheck/compiler checks,
- unit tests,
- integration/contract tests,
- build/package verification,
- migration checks,
- security scans.

The exact command is stack-specific; the invariant is that the repository has one obvious path to validate the expected baseline.

## Verify behavior, not implementation ceremony

Passing a unit test suite is not equivalent to satisfying the specification.

Verification SHOULD be selected from the actual failure modes of the change. Examples:

- algorithm/domain logic → focused tests,
- API/schema boundary → contract/integration tests,
- persistence/migration → database integration/migration verification,
- user-critical web flow → browser/E2E/smoke test,
- authorization → negative cross-user/cross-tenant tests,
- visual behavior → rendered/browser inspection or screenshot comparison where justified,
- performance-sensitive change → benchmark/latency/resource measurement,
- dependency change → relevant regression suite + vulnerability/license review,
- deployment change → staging/runtime smoke verification.

## Test strategy

Use the cheapest test that gives trustworthy coverage of the behavior while preserving a smaller number of end-to-end tests for critical cross-system journeys.

Do not enforce fixed percentages of unit/integration/E2E tests across every system.

### Test observable behavior

Prefer tests against public/module contracts and user-visible behavior rather than private implementation details. Refactoring that preserves behavior should not unnecessarily destroy large portions of the suite.

### Avoid brittle tests

A brittle test fails because incidental implementation details changed rather than because behavior regressed.

Avoid unnecessary coupling to:

- private methods,
- exact internal call counts/order unless contractually important,
- irrelevant DOM/layout details,
- broad snapshots without meaningful assertions,
- real external dependencies for ordinary deterministic tests.

### Tests should be readable

A failing test should make the scenario and intended behavior easy to understand.

Prefer Arrange/Act/Assert or an equivalent clear structure. DAMP is acceptable when helper abstraction would hide important setup or expectations.

### Determinism and flakes

Flaky tests reduce trust in CI and encourage bypassing gates.

Control time, randomness, concurrency, network boundaries, and external services when practical. Fix systemic flakes instead of normalizing repeated reruns as the permanent workflow.

## Static enforcement

Prefer mechanical guardrails for stable invariants.

Examples:

- type constraints,
- schema validation,
- architecture/dependency rules,
- lint/static-analysis rules,
- generated contracts,
- CI policy checks.

Do not encode subjective or rapidly changing design judgment as brittle automated policy merely because it is possible.

## CI baseline

For production-oriented repositories, CI SHOULD run automatically on proposed changes and protect the primary branch with required checks appropriate to repository risk.

CI should be:

- reproducible,
- reasonably fast,
- deterministic enough to trust,
- least-privilege,
- based on versioned build/dependency inputs,
- explicit about failure.

A broken primary branch should be treated as a priority because it degrades every subsequent change.

## Small changes and integration

Prefer small, short-lived branches/PRs and frequent integration.

Small changes improve:

- reviewability,
- testability,
- rollback,
- root-cause isolation,
- ability to change direction early.

Do not combine unrelated cleanup simply because the agent can modify many files at low generation cost.

## Design review vs code review

These are separate questions.

### Design review

For non-trivial/high-risk work, review before expensive implementation:

- problem/requirements understanding,
- alternatives and reuse decisions,
- boundaries/contracts,
- failure and data-integrity behavior,
- security/privacy/trust boundaries,
- migration/deployment/rollback,
- verification strategy.

### Code/change review

Review the resulting change for:

- correctness/functionality,
- overall design and consistency with accepted design,
- unnecessary complexity,
- readability/naming,
- tests and failure coverage,
- security/privacy,
- concurrency/data integrity,
- dependencies and supply chain,
- configuration/deployment impact,
- docs/runbooks where needed,
- dead or speculative code.

## Agent review

For non-trivial AI-generated changes, a fresh reviewer context SHOULD be used where practical rather than relying only on builder self-evaluation.

The reviewer should receive the goal, acceptance criteria, constraints, and diff/current repository state, not the builder's hidden reasoning.

Human review remains important for judgment-heavy or high-impact decisions such as security architecture, irreversible migrations, sensitive data handling, payments, and major product trade-offs.

## Definition of Done

A change is done when the required behavior and relevant quality constraints are demonstrated, not merely when code exists.

For a normal non-trivial change, confirm as applicable:

- acceptance criteria satisfied,
- relevant tests added/updated and passing,
- canonical verification passing,
- build/type/lint/static checks passing,
- failure/error behavior verified,
- security/privacy requirements verified,
- no unjustified dependency/architecture expansion,
- migrations/configuration validated,
- browser/runtime behavior inspected when relevant,
- observability/logging added where operationally necessary,
- rollback/compatibility understood for risky changes,
- durable decisions/docs updated,
- diff reviewed.

Do not force irrelevant checklist items onto trivial changes.

## Review philosophy

Do not demand theoretical perfection before integration. The standard is that the change is safe enough, sufficiently verified, and leaves the codebase at least as healthy as before.

Blocking feedback should correspond to material correctness, security, maintainability, operability, or agreed standards. Minor preferences should not create unnecessary delivery latency.
