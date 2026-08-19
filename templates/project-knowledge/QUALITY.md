# Quality and Definition of Done

Use this document for project-specific verification rules. Do not copy generic engineering guidance unless this repository needs a concrete local contract.

## Status

Draft / Accepted

## Definition of Done

A change is done only when the accepted behavior is implemented, required verification has passed or limitations are explicitly reported, and affected durable documentation is consistent with the implementation.

Add project-specific completion requirements below.

## Canonical verification

Authoritative command/path:

`<command>`

Humans, agents, and CI SHOULD use the same authoritative path where practical.

## Verification by change type

Define only categories that materially differ. Example:

| Change type | Minimum expected evidence |
|---|---|
| Domain/business logic | Targeted unit/integration tests + canonical verify |
| API/schema change | Contract/integration tests + compatibility/migration check |
| UI interaction | Canonical verify + runtime/browser check of affected flow |
| Data migration | Migration test + data/rollback/recovery consideration |
| Security-sensitive | Relevant authorization/input/security checks + review |

Adapt or remove this table for the project.

## Test strategy

Document the intended boundaries between unit, integration, contract, E2E, snapshot, or other tests. Avoid testing implementation details without value.

## Runtime / browser / device verification

State when actual application behavior must be exercised rather than inferred from tests/build success.

For UI work, define supported viewport/browser/device checks only as broadly as product evidence justifies.

## Security / privacy verification

List project-specific checks for authentication, authorization, sensitive data, secrets, external input, uploads, payment/access changes, or other material risks.

## Reliability / operability verification

State requirements for failure paths, retries/timeouts, idempotency, logs/metrics, recovery, migrations, or deployment behavior where relevant.

## Performance / economic checks

Define thresholds or checks only when latency, throughput, memory, storage, external API usage, AI/token usage, or another variable cost is material.

## Completion evidence

For non-trivial changes, report as relevant:

- summary of behavior changed,
- acceptance criteria and evidence,
- tests/checks run and results,
- runtime/browser/device checks performed,
- documentation updated,
- assumptions/trade-offs,
- known limitations,
- anything not verified.

Do not treat a builder's completion claim as a substitute for evidence.