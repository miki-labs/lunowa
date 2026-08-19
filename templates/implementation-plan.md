# Implementation Plan

Use for complex, multi-step, cross-component, risky, or long-running changes. Keep it current as evidence changes.

## Goal

What outcome is this plan intended to deliver?

## Preconditions / source of truth

Relevant specs, accepted design, decisions, threat model, schemas, APIs, or repository constraints.

## Current state

Summarize only what matters for implementation.

## Target state

What will be true when the plan is complete?

## Constraints

Security, compatibility, availability, migration, performance, cost, or platform constraints.

## Reuse decisions

What existing code/platform/SDK/OSS/service will be reused? What custom implementation remains and why?

## Change slices

Each slice should be coherent and independently verifiable where practical.

### Slice 1 —

- Goal:
- Files/components:
- Dependencies on earlier work:
- Verification:
- Rollback/reversibility:

### Slice 2 —

- Goal:
- Files/components:
- Dependencies on earlier work:
- Verification:
- Rollback/reversibility:

## Migration / compatibility sequence

When relevant, describe ordering between schema, code, workers, APIs, clients, provider configuration, and cleanup.

## Risk checkpoints

At what points should implementation stop for design/security/human review before continuing?

## Verification plan

List the evidence required at the end:

- targeted tests,
- canonical verify,
- integration/contract/E2E,
- runtime/browser evidence,
- security checks,
- migration validation,
- performance/observability checks.

## Rollback / recovery

How can the change be reverted or contained if verification or rollout fails?

## Open questions

Unresolved uncertainty that may change the plan.

## Progress log

Update when important assumptions, decisions, blockers, or verification results change. Do not turn this into a verbose activity diary.
