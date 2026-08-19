# Implementation Workflow

This workflow begins after a product/feature requirement is sufficiently real to justify implementation. It is intentionally risk-scaled rather than a rigid waterfall.

## Overview

`Frame → Discover → Decide → Design → Ready → Plan → Implement → Verify → Review → Integrate → Release → Runtime Verify → Improve`

Security, privacy, reliability, operability, commercial correctness, and AI-runtime constraints are cross-cutting only when the change makes them relevant.

## 1. Frame

Clarify:

- goal and desired observable behavior,
- user/actor,
- scope and non-goals,
- constraints,
- acceptance criteria,
- material security/privacy/reliability/platform/commercial/AI requirements.

Do not begin by selecting tools or architecture.

## 2. Discover

Inspect what already exists before inventing anything.

For brownfield work, inspect the relevant subset of current code, architecture, schemas/contracts, tests, conventions, dependencies, durable docs, CI, security rules, and deployment model.

For greenfield work, inspect platform/framework capabilities, official SDKs/APIs, trusted templates, mature dependencies/services, deployment constraints, and current external/provider requirements that can materially change the design.

Use `repository-knowledge.md` to identify which artifact is authoritative for the question being answered. Do not load every document into context merely because it exists.

## 3. Decide: reuse, adapt, buy, spike, or build

Evaluate credible alternatives before substantial custom implementation.

A dependency/service decision SHOULD consider:

- requirement fit,
- maturity/maintenance,
- security/supply-chain exposure,
- transitive dependencies,
- license,
- integration complexity,
- privacy/data handling,
- reliability/performance,
- operational and monetary cost,
- platform compatibility,
- lock-in/data portability,
- replacement cost.

If the largest uncertainty is technical feasibility, run a narrow spike/PoC rather than implementing the full feature speculatively.

## 4. Design to the risk

Address only the concerns that can materially change correctness, security, cost, operability, or reversibility, such as:

- boundaries/responsibilities,
- state/data ownership,
- APIs/events/contracts,
- persistence/migration,
- concurrency/idempotency,
- failure/retry/degradation,
- authentication/authorization/trust boundaries,
- sensitive data/secrets,
- observability/repair,
- deployment/rollback,
- performance/economic bounds,
- AI tools/retrieval/evals when AI runtime is material.

Do not force every concern into every design.

For normal non-trivial work, use the optional design sections in `templates/task-contract.md`. Escalate to `templates/design-doc.md` only when the smaller artifact cannot safely capture the architecture/security/data/reversibility risk.

## 5. Readiness

Before substantial implementation, a non-trivial change SHOULD answer the relevant subset:

- What behavior are we changing?
- What are we not changing?
- Which sources are authoritative for this question?
- What existing solution/capability was considered?
- What are the important boundaries/contracts/state owners?
- What can fail or become inconsistent?
- Are trust/sensitive/commercial/AI boundaries changing?
- What are the acceptance criteria?
- How will behavior be verified?
- What unresolved uncertainty can still invalidate the approach?

If unresolved uncertainty can invalidate the design, return to discovery or run a spike.

## Risk scaling

Use this as a heuristic, not a bureaucracy:

- **R0 — trivial/local:** text, small styling, obvious local cleanup. Minimal planning.
- **R1 — small:** local UI/logic with limited blast radius. Goal + acceptance criteria + targeted verification.
- **R2 — normal feature:** API/data/cross-component/external-integration work with bounded risk. Task contract with lightweight design notes + review/plan only as needed.
- **R3 — high risk:** authentication/authorization/recovery, payments/entitlements, sensitive data, multi-tenancy, public attack surface, irreversible migration, major architecture change, privileged AI/tool actions, or materially expensive failure. Full design and stronger threat/risk/rollback/verification as applicable.

## 6. Plan and slice

Translate the accepted design into small dependency-aware changes when the work is complex enough to benefit from an explicit plan.

Good slices are independently understandable and verifiable. Avoid mixing broad refactoring with product behavior unless separation creates more risk than it removes.

Do not create a standalone plan for a narrow change whose order is obvious from the task contract.

## 7. Implement

Follow existing repository patterns unless there is a documented reason to introduce a new one.

Do not expand scope because generation is cheap. Do not add abstractions, dependencies, infrastructure, platforms, or agent machinery that the accepted behavior does not justify.

## 8. Verify

Select verification from the actual failure modes. See `verification-review.md`.

Evidence may include:

- format/lint/static/type/compiler checks,
- unit/integration/contract/E2E tests,
- database migration checks,
- build/package verification,
- browser/runtime/device interaction,
- authorization/security/adversarial checks,
- logs/error/repair behavior,
- performance/economic measurements,
- AI evals when model behavior is part of the product.

Passing one generic command is not proof that every relevant behavior was verified.

## 9. Review

Review design and behavior, not just syntax. Check correctness, complexity, readability, tests, security/privacy, data integrity, operational/repair impact, dependencies, migration/rollback, platform claims, and unnecessary scope.

For non-trivial agent-generated changes, use an independent/fresh reviewer context when the expected risk reduction exceeds the cost.

## 10. Integrate

Prefer short-lived branches/PRs and frequent integration. Keep the integration branch healthy through the canonical automated verification appropriate to repository risk.

AI-assisted delivery strengthens rather than weakens the case for small batches.

## 11. Release and runtime verification

Deployment/submission is not the same as success. When production can fail differently from tests:

- smoke-check critical behavior,
- inspect relevant errors/health/provider signals,
- verify migration/job state,
- verify critical user/commercial/AI paths where material,
- confirm containment/rollback/forward-recovery remains available.

Use the stage gate in `production-readiness.md` before material public/paid releases.

## 12. Improve the engineering system

When defects, incidents, support pain, or recurring human/agent mistakes occur, ask:

1. What evidence, interface, guardrail, or recovery capability was missing?
2. Could the failure be prevented or detected mechanically?
3. What is the cheapest durable layer for the fix: schema/type/test/lint/CI/script/tool/doc/architecture/permission/observability/runbook/harness?
4. Is the failure general and recurring enough to justify the maintenance/context cost?
5. Can an existing rule/document be simplified or deleted at the same time?

Avoid permanently growing process for one-off anomalies unless the underlying failure mode is independently material.
