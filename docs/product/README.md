# Lunowa Product Engineering Map

## Status

This directory contains Lunowa-specific durable product-engineering knowledge.

It complements the reusable engineering baseline in `docs/*.md` and the visual/interaction design sources in `docs/design/`.

Do not treat raw chat history as product source of truth when a current repository artifact exists.

---

## Documents

### `ARCHITECTURE.md`

Current product-specific architecture:

- modular-monolith default;
- module ownership;
- provider boundaries;
- sync/async architecture;
- Responsibility/domain authority;
- AI boundary;
- Temporal Contract reliability;
- send/search/security/failure architecture;
- architectural invariants.

The Responsibility-related architecture is reconciled to v0.1 semantics.

### `DATA-MODEL.md`

Conceptual durable model:

- User / Scope / ConnectedAccount;
- Conversation / Message / Attachment;
- Responsibility and the semantic concepts required by current scenarios;
- provenance / user field corrections;
- TemporalContract / TemporalTrigger;
- Draft / SendOperation;
- derived search/audit projections;
- concurrency/versioning invariants.

Physical Responsibility tables/enums remain deliberately open.

### `CONTRACTS.md`

Logical contracts between modules:

- provider adapter;
- sync/ingestion;
- AI structured interpretation;
- Responsibility reduction/effects;
- conversation aggregate projection;
- Temporal Contract scheduler;
- attention/resurfacing;
- drafts/send;
- search/context/preview;
- background jobs;
- error/versioning/testing semantics.

### `responsibility/`

Primary authority for canonical Responsibility semantics and annotation/evaluation behavior.

Recommended reading order:

1. `responsibility/README.md` — scope/status/current implementation gate;
2. `responsibility/DECISIONS.md` — FIXED/OPEN/SUPERSEDED decisions;
3. `responsibility/CONSISTENCY-AUDIT.md` — reconciliation findings/errata/remaining gates;
4. `responsibility/ANNOTATION-GUIDELINES.md` — evidence/communication/admission/identity semantics;
5. `responsibility/SCENARIO-SCHEMA.md` — canonical focal-event oracle contract;
6. `responsibility/TRANSITION-SCHEMA.md` — multi-event trace contract;
7. `responsibility/COVERAGE-PLAN.md` — mandatory corpus coverage inventory;
8. `responsibility/TIER-0-SCENARIO-MATRIX.md` — base-oracle assignments/variants;
9. `responsibility/TIER-0-CRITICAL-ORACLES.md` — first detailed critical oracles;
10. `responsibility/TRANSITION-ORACLES.md` — all 20 mandatory transition traces.

### Responsibility source-of-truth reconciliation

The prior conflict between Responsibility v0.1 and older lifecycle-specific text is now reconciled across:

```text
docs/product/ARCHITECTURE.md
docs/product/DATA-MODEL.md
docs/product/CONTRACTS.md
docs/design/INTERACTIONS.md
```

Current semantic direction is orthogonal across:

```text
resolution status/reason
live tracking activation
attention/defer
obligation legs/actionability/conditions
expected events
completion criteria
constraints
pending proposals/agreed facts
temporal facts
uncertainty/risk
provenance
```

The former single lifecycle enum, scalar `next_owner/BOTH`, one `deadline_at`, and follow-up-as-lifecycle model are not canonical truth.

### `TECH-STACK.md`

Accepted initial implementation stack and activation policy:

- Node.js 24 LTS / pnpm / TypeScript strict;
- Next.js 16.x App Router / React 19.x;
- Tailwind CSS 4 / shadcn/ui / next-intl;
- PostgreSQL 18 / Neon / Drizzle;
- Better Auth for Lunowa application sessions, separated from mailbox authorization;
- Trigger.dev for durable background execution once real sync/scheduling begins;
- Gmail API first, Microsoft Graph second;
- OpenAI Responses API + Structured Outputs for initial AI runtime;
- PostgreSQL full-text search first;
- Vitest / React Testing Library / Playwright verification stack.

Re-check current official provider/runtime facts whenever they materially affect implementation/release.

### `IMPLEMENTATION-PLAN.md`

Active staged execution plan:

- bootstrap;
- fake-data high-fidelity UI;
- domain/persistence;
- Gmail read slice;
- real send;
- deterministic Responsibility/Temporal Contract behavior;
- AI interpretation;
- search/context;
- Microsoft adapter;
- beta hardening.

This is a living plan, not permanent product semantics.

### Active execution plan

- `../plans/active/phase-0-bootstrap.md` — current Codex-ready bootstrap task contract.

---

## Durable architecture decisions

Material choices that should not silently change during ordinary implementation live under `docs/decisions/`.

Current high-value ADRs include:

- `0001-modular-monolith-default.md`;
- `0002-ai-understands-rules-decide-state.md`;
- `0003-temporal-contracts-use-durable-scheduling.md`;
- `0004-web-runtime-and-ui-stack.md`;
- `0005-auth-and-persistence-stack.md`;
- `0006-provider-sync-and-background-runtime.md`;
- `0007-initial-ai-runtime.md`.

A decision may be superseded by stronger evidence, but rationale/consequences should be recorded.

---

## Related product/UX sources

- `../design/DESIGN.md`;
- `../design/INTERACTIONS.md`;
- `../design/RESPONSIVE.md`;
- visual references under `../design/references/`.

`INTERACTIONS.md` is reconciled with Responsibility v0.1: `My Turn / Waiting / Later / Done / Review` are interaction projections, not the old canonical lifecycle enum.

---

## Reusable engineering sources

Read when relevant:

- `../core-principles.md`;
- `../implementation-workflow.md`;
- `../greenfield-bootstrap.md`;
- `../architecture-design.md`;
- `../reuse-dependencies.md`;
- `../reliability-operability.md`;
- `../security-privacy.md`;
- `../verification-review.md`;
- `../platform-development.md`;
- `../production-readiness.md`;
- `../product-operations.md`;
- `../monetization-engineering.md`;
- `../ai-product-runtime.md`;
- `../coding-agent-harness.md`;
- `../repository-knowledge.md`;
- `../references.md`.

---

## Authority by question

| Question | Primary authority |
| --- | --- |
| Canonical Responsibility semantics / annotation/eval rules? | `docs/product/responsibility/*` |
| Product-level Responsibility architecture/module boundary? | `ARCHITECTURE.md` + relevant responsibility decisions |
| Conceptual Responsibility persistence/ownership? | `DATA-MODEL.md` + responsibility semantic baseline |
| Module/API/job Responsibility semantics? | `CONTRACTS.md` + responsibility semantic baseline |
| User-facing Responsibility interaction/projection behavior? | `docs/design/INTERACTIONS.md` + `docs/design/DESIGN.md` |
| Other product-specific technical boundary/invariant? | `ARCHITECTURE.md` + accepted relevant ADR |
| Technology/runtime choice? | `TECH-STACK.md` + relevant ADR |
| Current implementation sequence? | `IMPLEMENTATION-PLAN.md` + current `docs/plans/active/` artifact |
| What is actually implemented now? | current code/schema/migrations/tests/runtime evidence |
| Generic engineering rule? | relevant reusable `docs/*.md` baseline |
| Current Gmail/Microsoft/AI/platform fact? | current official provider documentation at implementation time |

If sources materially conflict again, do not silently guess. Treat the contradiction as a spec defect and reconcile it before durable implementation.

---

## High-value product invariants

1. Normal row click opens `会話`; Responsibility/status chip opens `今の要点`.
2. Conversation can contain multiple Responsibilities; Conversation is not one workflow-state owner.
3. One Moment generally presents one primary current question/action.
4. Evidence, interpretation, accepted Responsibility state, safe action, and UI projection are distinct.
5. AI interprets; trusted product/domain logic owns accepted Responsibility state and privileged effects.
6. Resolution, live tracking activation, and attention/defer are orthogonal.
7. Parallel/contingent work may require multiple obligation legs; scalar `BOTH` is not canonical truth.
8. Temporal facts remain distinct: source due, expected-event time, user target, resurface, follow-up.
9. Temporal Contracts are durable/reconcilable promises.
10. Provider observations and Lunowa domain facts have field-scoped authorities.
11. Send attempt is not provider-reconciled acceptance; reconciliation closes only the appropriate operational outcome.
12. Core reading/composing remains usable when AI is unavailable.
13. Scope/account boundaries apply before search/retrieval/AI context exposure.
14. Cross-account semantic similarity does not authorize Responsibility merge.
15. Pin is independent of Responsibility semantics.
16. App auth and connected-mailbox authorization are separate boundaries.
17. Prompt-injection/tool-like text inside email has no application authority.
18. Do not optimize feature count; reduce Communication Management Burden while preserving control/trust.

---

## Current implementation gate

Documentation-level Responsibility reconciliation is complete.

The next implementation question is **not** whether to use the old lifecycle model. It is:

> what is the smallest physical representation that satisfies the validated semantic vector, scenarios, and transition invariants without building a generic workflow engine?

Before schema freeze, continue remaining Tier-0 detailed-oracle expansion and normalize legacy oracle aliases/errata into executable fixtures.

---

## Change discipline

Update durable documents only when accepted knowledge changes.

Prefer code/tests for local mechanics, active plans for current execution, and decision records for costly-to-reverse rationale.

When stronger scenarios, production failures, or external facts change a prior decision, update the durable source and record why rather than preserving stale consistency.