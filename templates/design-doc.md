# Design Document

Use for architecture-affecting, security-sensitive, data-critical, expensive-to-reverse, or otherwise high-risk work. Prefer the lighter design notes inside `task-contract.md` when this depth is unnecessary.

## Status

Draft / Under Review / Accepted / Superseded / Rejected

## Summary

One-paragraph description of the proposed change and why it exists.

## Problem / goal

What problem or required behavior are we addressing?

## Non-goals

What adjacent problems are deliberately excluded?

## Requirements and constraints

Functional and relevant non-functional requirements: security, privacy, reliability, performance, compatibility, operational, cost, legal/provider constraints.

## Current state

Relevant architecture/data flows and why the current state is insufficient.

## Proposed design

Describe:

- components/modules and responsibilities,
- dependency direction,
- data model/state ownership,
- API/event contracts,
- persistence,
- external integrations,
- major control flow.

Use diagrams when they improve understanding.

## Reuse / build decision

What existing repository code, platform features, official SDKs/APIs, OSS, services, or templates were evaluated? Why is the selected approach the best lifecycle trade-off?

## Alternatives considered

Include only credible alternatives and why they were not selected.

## Failure and reliability design

Address as applicable:

- timeout/retry/backoff,
- idempotency/duplicates,
- rate limiting/backpressure,
- partial failure,
- concurrency/ordering,
- degradation,
- data integrity.

## Security and privacy

Describe:

- actors/trust boundaries,
- authentication/authorization,
- sensitive data and retention,
- secrets,
- untrusted inputs,
- third parties/data sharing,
- abuse controls.

Link `threat-model.md` when required.

## Observability / operations

How will we know the system is healthy? How will failures be diagnosed? What logs/metrics/traces/health signals are required?

## Migration / rollout

Deployment ordering, schema/data migration, compatibility, staged rollout, feature flags if justified.

## Rollback / recovery

How is failure contained or reversed? What irreversible steps exist?

## Verification strategy

How will correctness, security, migration, runtime behavior and performance be demonstrated?

## Cost / operational impact

Only when material: provider spend, maintenance burden, new on-call/operational responsibility, scaling implications.

## Open questions

Unresolved items and owners/evidence needed.

## Decision and review

- Decision:
- Reviewer(s):
- Date:
- Follow-up decisions / ADRs:
