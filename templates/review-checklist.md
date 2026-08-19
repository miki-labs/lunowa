# Review Checklist

Use as a review aid for non-trivial changes, not a universal box-ticking ritual. Skip anything irrelevant to the actual failure modes.

## Behavior / scope

- [ ] Does the change satisfy the accepted observable behavior and acceptance criteria?
- [ ] Is scope controlled, without unrelated refactor/feature/infrastructure expansion?
- [ ] Are material assumptions or unresolved source-of-truth conflicts explicit?

## Design / dependencies

- [ ] Are responsibilities, state ownership, contracts, and dependency direction coherent where relevant?
- [ ] Is the solution simpler than credible alternatives?
- [ ] Was existing repository/framework/platform/official capability checked before substantial custom code or dependency addition?
- [ ] Are new dependencies/services justified by lifecycle/security/privacy/operational/replacement cost?

## Failure / data / operations

- [ ] Are material timeout/retry/idempotency/concurrency/partial-failure cases handled?
- [ ] Is dangerous work bounded: retries, queues, fan-out, concurrency, payloads, external APIs, AI/tool execution, or variable cost?
- [ ] Can a material stuck/inconsistent state be diagnosed and safely recovered/repaired?
- [ ] Are rollout/migration/rollback or forward-recovery concerns handled when required?

## Security / privacy / commercial

- [ ] Are authentication, authorization, trust boundaries, secrets, sensitive data, and untrusted input handled at trusted boundaries?
- [ ] Is least privilege used for users/services/CI/coding agents/tools?
- [ ] Was a threat model required by the change risk?
- [ ] For money/access-changing behavior, are authority, idempotency, stale/out-of-order events, reconciliation, repair, and observable failure correct?
- [ ] For user-facing AI, are tool/data permissions, output validation, eval evidence, and hard economic/execution bounds appropriate?

## Verification

- [ ] Does the evidence verify observable behavior rather than only implementation details?
- [ ] Does canonical verification pass?
- [ ] Were the targeted runtime/browser/device/security/migration/performance/AI-eval checks required by this change actually run?
- [ ] Is anything material unverified clearly reported rather than implied complete?

## Maintainability / knowledge

- [ ] Is the code/repository easier or at least no harder to understand after the change?
- [ ] Are speculative abstractions, dead code, duplicate sources of truth, or obsolete compatibility work avoided?
- [ ] Were durable specs/architecture/decisions updated only when accepted behavior or constraints actually changed?
- [ ] Is a recurring failure better prevented mechanically than by another prose rule?

## Independent-agent review

For non-trivial AI-generated changes, use a fresh reviewer context when the expected risk reduction justifies it. Review the actual repository/diff and accepted goal; do not rely only on the builder's completion summary.

## Decision

Approve when the change is sufficiently correct, secure, maintainable, verified, and operable for its actual risk. Do not block solely for preference or theoretical perfection.
